import Foundation
import Supabase

/// Nguồn dữ liệu Hội thoại — đọc/ghi Supabase qua RLS (0017), Realtime bật ở 0023.
/// Cùng khuôn `QAStore`: @Observable, DTO snake_case, mutate lạc quan, `ErrorText.localized`.
@Observable
final class ConversationStore {
    private(set) var channels: [ChannelRow] = []
    private(set) var isLoading = false
    /// Đang đưa ảnh/thoại lên — view khoá nút gửi và hiện tiến trình.
    private(set) var isUploading = false
    var errorMessage: String?

    /// Không `private(set)`: `private` trong Swift bó theo FILE, mà ConversationStoreRealtime.swift
    /// (extension ở file khác) phải append tin mới vào đây. Cùng lý do với `errorMessage` ở QAStore.
    var messagesByChannel: [UUID: [MessageRow]] = [:]
    private(set) var unreadByChannel: [UUID: Int] = [:]

    /// Người mình đã chặn — lọc ở accessor, giống QAStore.
    var blockedUserIds: Set<UUID> = []

    let client = SupabaseClientProvider.shared
    private var uid: UUID? { client.auth.currentUser?.id }
    var currentUserId: UUID? { uid }

    private static let channelSelect =
        "id,slug,title,kind,is_broadcast,last_message_at,emoji,avatar_hex,badge_hex,channel_members(role,last_read_at,muted_until)"
    /// Không `private`: ConversationStoreRealtime.swift (file khác) phải dựng CÙNG shape khi
    /// nạp lại tin Realtime vừa đẩy về. Hai bản select lệch nhau là decode nổ — cùng lý do
    /// với `QAStore.questionSelect`.
    ///
    /// `!messages_user_id_fkey` là BẮT BUỘC, không phải cho đẹp: từ lúc nhúng thêm
    /// `message_reactions`, có HAI đường từ `messages` sang `public_profiles` —
    /// `messages.user_id` (tác giả) và đường vòng qua `message_reactions.user_id` (người thả).
    /// PostgREST không đoán, nó trả PGRST201 và toàn bộ tin nhắn không tải được.
    /// Nêu đích danh FK để nói rõ: tác giả, không phải người thả.
    static let messageSelect =
        "id,channel_id,user_id,parent_id,body,created_at,edited_at,author:public_profiles!messages_user_id_fkey(display_name),reactions:message_reactions(kind,user_id)"

    /// Realtime subscription đang mở, khoá theo kênh — để `unsubscribe` đúng cái cần đóng.
    /// Không `private`: ConversationStoreRealtime.swift (file khác) quản vòng đời của chúng.
    var liveChannels: [UUID: RealtimeChannelV2] = [:]
    var liveTasks: [UUID: Task<Void, Never>] = [:]

    // MARK: - Đọc

    /// Kênh mình đọc được (RLS lo: public/feed cho mọi người đã đăng nhập, group/dm chỉ thành viên).
    ///
    /// `channel_members` nhúng bị lọc về ĐÚNG HÀNG CỦA MÌNH bằng `eq("channel_members.user_id")`.
    /// Không lọc thì nhúng trả về mọi thành viên của kênh → `me` vớ phải `last_read_at` của
    /// người lạ và unread sai bét.
    func loadChannels() async {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return }
        isLoading = true; errorMessage = nil
        do {
            let rows: [ChannelRow] = try await client.from("channels")
                .select(Self.channelSelect)
                .eq("channel_members.user_id", value: uid)
                .order("last_message_at", ascending: false, nullsFirst: false)
                .execute().value
            channels = rows
            await loadUnreadCounts()
        } catch { errorMessage = ErrorText.localized(error) }
        isLoading = false
    }

    /// Đếm chưa đọc = `messages` mới hơn `last_read_at` (quy tắc scale #4: không bảng
    /// read-state per-message).
    ///
    /// Mỗi kênh một query — chấp nhận ở v1 vì user chỉ có dăm kênh, và `count(head:)` không
    /// kéo dòng nào về. Khi nào nhiều kênh thì gộp thành RPC `unread_counts()` trả một lượt;
    /// chưa cần nên chưa làm.
    private func loadUnreadCounts() async {
        for channel in channels {
            guard let lastRead = channel.me?.lastReadAt else { continue }
            do {
                let count = try await client.from("messages")
                    .select("id", head: true, count: .exact)
                    .eq("channel_id", value: channel.id)
                    .gt("created_at", value: lastRead)
                    .is("deleted_at", value: nil)
                    .execute().count
                unreadByChannel[channel.id] = count ?? 0
            } catch { /* thiếu badge không làm hỏng danh sách — lần refresh sau đếm lại */ }
        }
    }

    /// 50 tin mới nhất, hoặc 50 tin trước `before` (keyset — KHÔNG offset, quy tắc scale #2).
    /// Trả về theo thứ tự cũ→mới để view append thẳng.
    func loadMessages(channelId: UUID, before: Date? = nil) async {
        do {
            var query = client.from("messages")
                .select(Self.messageSelect)
                .eq("channel_id", value: channelId)
                .is("deleted_at", value: nil)
            if let before { query = query.lt("created_at", value: before) }

            let page: [MessageRow] = try await query
                .order("created_at", ascending: false)   // mới nhất trước để LIMIT cắt đúng đầu
                .limit(50)
                .execute().value

            let older = page.reversed().filter { !isBlocked($0.userId) }
            if before == nil {
                messagesByChannel[channelId] = older
            } else {
                messagesByChannel[channelId] = older + (messagesByChannel[channelId] ?? [])
            }
        } catch { errorMessage = ErrorText.localized(error) }
    }

    func messages(for channelId: UUID) -> [MessageRow] {
        (messagesByChannel[channelId] ?? []).filter { !isBlocked($0.userId) }
    }

    func channel(id: UUID) -> ChannelRow? { channels.first { $0.id == id } }
    func unread(for channelId: UUID) -> Int { unreadByChannel[channelId] ?? 0 }

    /// Tổng chưa đọc cho badge tab Chat. Kênh đã tắt thông báo KHÔNG tính — user đã nói
    /// "đừng réo tôi về chỗ này" thì badge cũng phải im.
    var totalUnread: Int {
        channels.filter { !$0.isMuted }.reduce(0) { $0 + unread(for: $1.id) }
    }
    func isBlocked(_ userId: UUID?) -> Bool { userId.map(blockedUserIds.contains) ?? false }

    /// Tin cũ nhất đang giữ — con trỏ để nạp trang trước đó.
    func oldestLoaded(in channelId: UUID) -> Date? { messagesByChannel[channelId]?.first?.createdAt }

    // MARK: - Ghi

    /// Gửi tin. Hiện ngay (lạc quan) rồi mới đợi server; hỏng thì gỡ ra và báo lỗi.
    /// `id` sinh ở client để bản lạc quan và bản server là MỘT — Realtime đẩy về sẽ khử trùng
    /// đúng, không hiện hai lần.
    @discardableResult
    func send(channelId: UUID, body: String, parentId: UUID? = nil) async -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }
        let text = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return false }

        let payload = NewMessage(id: UUID(), channelId: channelId, userId: uid,
                                 body: text, parentId: parentId)
        // Tác giả của bản lạc quan là CHÍNH MÌNH, nhưng để `author: nil` — view tự biết tin
        // của mình (so `userId` với `currentUserId`) nên không cần tên, và fetchAfterSend/
        // Realtime sẽ thay bằng bản server có tên đầy đủ.
        let optimistic = MessageRow(id: payload.id, channelId: channelId, userId: uid,
                                    parentId: parentId, body: text, createdAt: Date(),
                                    editedAt: nil, author: nil, metadata: nil, reactions: [])
        messagesByChannel[channelId, default: []].append(optimistic)

        do {
            try await client.from("messages").insert(payload).execute()
            return true
        } catch {
            // Trigger slow-mode (2s/tin) cũng rơi vào đây — ErrorText dịch sẵn thành
            // "Chậm lại chút…", không phải lỗi kỹ thuật khó hiểu.
            messagesByChannel[channelId]?.removeAll { $0.id == payload.id }
            errorMessage = ErrorText.localized(error)
            return false
        }
    }

    /// Gửi ảnh/tệp/thoại: upload lên Storage TRƯỚC, có đường dẫn rồi mới ghi tin.
    ///
    /// Thứ tự này quan trọng — ghi tin trước rồi upload thì upload hỏng sẽ để lại một tin
    /// trỏ vào file không tồn tại, và nó nằm đó vĩnh viễn. Ngược lại (upload xong mà ghi tin
    /// hỏng) chỉ để lại một file mồ côi, không ai thấy, dọn được sau.
    ///
    /// Không mutate lạc quan như tin chữ: upload mất vài giây, hiện bong bóng trước rồi
    /// gỡ ra khi hỏng thì nhấp nháy khó chịu hơn là chờ. `isUploading` cho view hiện tiến trình.
    @discardableResult
    func sendMedia(
        channelId: UUID,
        data: Data,
        kind: MessageMedia.Kind,
        ext: String,
        contentType: String,
        duration: Double? = nil,
        caption: String = "",
        parentId: UUID? = nil
    ) async -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }
        isUploading = true
        defer { isUploading = false }

        do {
            let path = try await ChatMediaStorage.upload(
                data, channelId: channelId, userId: uid,
                ext: ext, contentType: contentType, client: client
            )
            let media = MessageMedia(kind: kind, path: path, duration: duration)
            let payload = NewMessage(id: UUID(), channelId: channelId, userId: uid,
                                     body: caption, parentId: parentId,
                                     metadata: MessageMetadata(media: media))
            try await client.from("messages").insert(payload).execute()

            // Không tự append: Realtime sẽ đẩy tin này về kèm tên tác giả đầy đủ.
            // Tự append rồi Realtime đẩy nữa là hai bong bóng cho một tin.
            await fetchAfterSend(channelId: channelId)
            return true
        } catch {
            errorMessage = ErrorText.localized(error)
            return false
        }
    }

    /// Nạp ngay phần đuôi sau khi gửi — không đợi Realtime, để bong bóng hiện tức thì
    /// kể cả khi subscription chưa kịp mở hoặc mạng chậm.
    private func fetchAfterSend(channelId: UUID) async {
        let after = messagesByChannel[channelId]?.last?.createdAt
        do {
            var query = client.from("messages")
                .select(Self.messageSelect)
                .eq("channel_id", value: channelId)
                .is("deleted_at", value: nil)
            if let after { query = query.gt("created_at", value: after) }
            let rows: [MessageRow] = try await query
                .order("created_at", ascending: true).limit(20).execute().value
            let existing = Set((messagesByChannel[channelId] ?? []).map(\.id))
            messagesByChannel[channelId, default: []] += rows.filter { !existing.contains($0.id) }
        } catch { /* Realtime sẽ bù; không bắn lỗi vì tin đã gửi thành công rồi */ }
    }

    /// Thả/gỡ một loại trên tin (`message_reactions`, 0027). Bật-tắt: đang có thì gỡ.
    ///
    /// Mutate lạc quan rồi mới đợi server — thả reaction phải phản hồi tức thì, đợi round-trip
    /// thì cảm giác như app đơ. Hỏng thì trả lại đúng trạng thái cũ và báo lỗi.
    func toggleReaction(messageId: UUID, channelId: UUID, kind: ReactionKind) async {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return }
        guard let index = messagesByChannel[channelId]?.firstIndex(where: { $0.id == messageId })
        else { return }

        let before = messagesByChannel[channelId]![index]
        let mine = before.myReactions(uid: uid).contains(kind)
        var rows = before.reactions ?? []
        if mine {
            rows.removeAll { $0.userId == uid && $0.kind == kind.rawValue }
        } else {
            rows.append(MessageRow.ReactionRow(kind: kind.rawValue, userId: uid))
        }
        messagesByChannel[channelId]![index] = before.replacingReactions(rows)

        do {
            if mine {
                try await client.from("message_reactions").delete()
                    .eq("message_id", value: messageId)
                    .eq("user_id", value: uid)
                    .eq("kind", value: kind.rawValue)
                    .execute()
            } else {
                struct NewReaction: Encodable {
                    let messageId: UUID
                    let userId: UUID
                    let kind: String
                    enum CodingKeys: String, CodingKey {
                        case kind
                        case messageId = "message_id"
                        case userId = "user_id"
                    }
                }
                try await client.from("message_reactions")
                    .insert(NewReaction(messageId: messageId, userId: uid, kind: kind.rawValue))
                    .execute()
            }
        } catch {
            // Trả lại nguyên trạng thái CŨ, không tự suy ngược: suy ngược sẽ sai nếu trong lúc
            // chờ có người khác cũng thả lên tin này.
            if let i = messagesByChannel[channelId]?.firstIndex(where: { $0.id == messageId }) {
                messagesByChannel[channelId]![i] = before
            }
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Sửa tin của mình (`messages.edited_at`). RLS `messages_update_own` (0017) mới là thứ chặn thật.
    func edit(messageId: UUID, channelId: UUID, body: String) async {
        let text = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        struct EditPayload: Encodable {
            let body: String
            let editedAt: Date
            enum CodingKeys: String, CodingKey {
                case body
                case editedAt = "edited_at"
            }
        }
        do {
            try await client.from("messages")
                .update(EditPayload(body: text, editedAt: Date()))
                .eq("id", value: messageId)
                .execute()
            await loadMessages(channelId: channelId)
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Xoá mềm tin của mình (`messages.deleted_at`) — mọi query đọc đã lọc `deleted_at is null`.
    /// Xoá mềm chứ không xoá cứng: tin bị trả lời/trích dẫn mà biến mất hẳn thì trích dẫn
    /// trỏ vào hư không.
    func deleteMessage(messageId: UUID, channelId: UUID) async {
        struct SoftDelete: Encodable {
            let deletedAt: Date
            enum CodingKeys: String, CodingKey { case deletedAt = "deleted_at" }
        }
        let backup = messagesByChannel[channelId]
        messagesByChannel[channelId]?.removeAll { $0.id == messageId }
        do {
            try await client.from("messages")
                .update(SoftDelete(deletedAt: Date()))
                .eq("id", value: messageId)
                .execute()
        } catch {
            messagesByChannel[channelId] = backup
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Đánh dấu đã đọc — badge về 0 ngay, DB cập nhật sau.
    func markRead(channelId: UUID) async {
        guard let uid else { return }
        unreadByChannel[channelId] = 0
        struct ReadUpdate: Encodable {
            let lastReadAt: Date
            enum CodingKeys: String, CodingKey { case lastReadAt = "last_read_at" }
        }
        do {
            try await client.from("channel_members")
                .update(ReadUpdate(lastReadAt: Date()))
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
        } catch { /* badge cục bộ đã về 0; lần mở sau server sẽ đúng */ }
    }

    /// Tắt thông báo tới `until` (nil = bật lại).
    func setMuted(channelId: UUID, until: Date?) async {
        guard let uid else { return }
        struct MuteUpdate: Encodable {
            let mutedUntil: Date?
            enum CodingKeys: String, CodingKey { case mutedUntil = "muted_until" }
        }
        do {
            try await client.from("channel_members")
                .update(MuteUpdate(mutedUntil: until))
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
            await loadChannels()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Rời kênh — xoá hàng `channel_members` của mình (RLS `members_self_leave`).
    func leave(channelId: UUID) async {
        guard let uid else { return }
        do {
            try await client.from("channel_members").delete()
                .eq("channel_id", value: channelId).eq("user_id", value: uid)
                .execute()
            channels.removeAll { $0.id == channelId }
            messagesByChannel[channelId] = nil
            unreadByChannel[channelId] = nil
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Mở DM 1-1 với một người — trả `channelId` để view điều hướng vào.
    ///
    /// Gọi RPC `create_dm` (0030) chứ KHÔNG tự lắp bằng 3 request từ client. Không phải cho
    /// gọn: bằng RLS thì client KHÔNG lắp nổi. `channels_read` giấu kênh dm khỏi người chưa
    /// là thành viên, mà `members_self_join` lại phải đọc được kênh mới cho chèn — vào DM
    /// phải thấy DM, thấy DM phải đã ở trong DM. RPC (security definer) là đường ra duy nhất,
    /// và nó lo luôn dồn trùng + chặn block + nguyên tử. Xem đầu file 0030.
    func openOrCreateDM(with userId: UUID) async -> UUID? {
        guard uid != nil else { errorMessage = String(localized: "Cần đăng nhập."); return nil }
        struct Params: Encodable {
            let otherId: UUID
            enum CodingKeys: String, CodingKey { case otherId = "other_id" }
        }
        do {
            let channelId: UUID = try await client
                .rpc("create_dm", params: Params(otherId: userId))
                .execute().value
            await loadChannels()
            return channelId
        } catch {
            errorMessage = ErrorText.localized(error)
            return nil
        }
    }

    /// Tham gia kênh public (RLS `members_self_join` chỉ cho public/dm).
    func join(channelId: UUID) async {
        guard let uid else { return }
        struct NewMember: Encodable {
            let channelId: UUID
            let userId: UUID
            enum CodingKeys: String, CodingKey {
                case channelId = "channel_id"
                case userId = "user_id"
            }
        }
        do {
            try await client.from("channel_members")
                .insert(NewMember(channelId: channelId, userId: uid)).execute()
            await loadChannels()
        } catch { errorMessage = ErrorText.localized(error) }
    }

    func clearError() { errorMessage = nil }
}
