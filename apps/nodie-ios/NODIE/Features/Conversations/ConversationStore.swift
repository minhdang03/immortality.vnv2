import Foundation
import Supabase
import UIKit   // UIImage — ảnh xem trước của đính kèm đang gửi (xem `PendingMedia.preview`)

/// Nguồn dữ liệu Hội thoại — đọc/ghi Supabase qua RLS (0017), Realtime bật ở 0023.
/// Cùng khuôn `QAStore`: @Observable, DTO snake_case, mutate lạc quan, `ErrorText.localized`.
@Observable
final class ConversationStore {
    private(set) var channels: [ChannelRow] = []
    private(set) var isLoading = false
    var errorMessage: String?

    /// Đính kèm chưa lên tới nơi, khoá theo id của tin.
    ///
    /// Đây là thứ cho phép bong bóng hiện trước khi upload xong: `MessageRow` trong
    /// `messagesByChannel` chỉ có metadata (path rỗng), còn bytes thật nằm ở đây. View tra
    /// vào đây để biết vẽ ảnh trong máy hay tải từ bucket, và để biết tin đang lên hay đã hỏng.
    private(set) var pendingMedia: [UUID: PendingMedia] = [:]

    /// Đang upload dở, khoá theo id tin. Không suy từ `PendingMedia.phase` được: `phase` là
    /// thứ VIEW đọc để vẽ, còn đây là khoá chống chạy chồng. Bấm "Gửi lại" hai lần trong một
    /// khung hình sẽ đẻ ra hai lượt upload cùng một tin → hai tệp, một INSERT trùng khoá,
    /// và bong bóng kẹt "hỏng" vĩnh viễn cho một tin ĐÃ gửi được.
    private var uploadsInFlight: Set<UUID> = []

    struct PendingMedia {
        enum Phase { case uploading, failed }
        var phase: Phase
        /// Bytes gốc — giữ để "Gửi lại" không bắt chọn ảnh lần nữa. Chỉ sống trong bộ nhớ:
        /// đóng app lúc đang gửi thì mất, và mất là đúng — chưa có tin nào trên server cả.
        let data: Data
        /// Ảnh đã giải mã sẵn (nil với tệp/thoại).
        ///
        /// Giải mã MỘT LẦN lúc xếp hàng, không phải mỗi lần vẽ: `UIImage(data:)` trên ảnh
        /// 2048px tốn ~30ms, mà thân view chạy lại mỗi khi có tin mới / thả cảm xúc / Realtime
        /// ho một tiếng. Sáu ảnh đang gửi × mỗi lần vẽ = giật main thread thấy rõ.
        let preview: UIImage?
        let ext: String
        let contentType: String
        /// Metadata đã dựng sẵn, chỉ thiếu `path` (điền sau khi upload xong).
        let media: MessageMedia
        let channelId: UUID
        let caption: String
        let parentId: UUID?
        /// Chính bong bóng lạc quan. Giữ ở đây để dựng lại được sau khi `loadMessages` quét
        /// sạch mảng tin (nó thay bằng dữ liệu server, mà tin này chưa lên server).
        let row: MessageRow
    }

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
    // `metadata` PHẢI có mặt: `MessageRow.metadata` là optional nên thiếu cột này thì decode
    // vẫn "thành công" — ảnh/thoại chỉ sống qua Realtime, mở lại chat là thành bong bóng rỗng.
    // Bug im lặng tuyệt đối, đã dính một lần (17/07).
    static let messageSelect =
        "id,channel_id,user_id,parent_id,body,created_at,edited_at,metadata,author:public_profiles!messages_user_id_fkey(display_name),reactions:message_reactions(kind,user_id)"

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
                // Trang đầu THAY cả mảng → nuốt luôn bong bóng đang upload. Trả chúng về.
                // Trang cũ hơn (`before != nil`) chỉ chèn vào đầu nên không đụng tới.
                reattachPendingRows(in: channelId)
            } else {
                messagesByChannel[channelId] = older + (messagesByChannel[channelId] ?? [])
            }
        } catch { errorMessage = ErrorText.localized(error) }
    }

    func messages(for channelId: UUID) -> [MessageRow] {
        (messagesByChannel[channelId] ?? []).filter { !isBlocked($0.userId) }
    }

    func channel(id: UUID) -> ChannelRow? { channels.first { $0.id == id } }

    /// Một thành viên của kênh, kèm tên hiển thị — cho "Xem hồ sơ" (DM) và Thông tin nhóm.
    struct ChannelMember: Identifiable, Hashable {
        let id: UUID
        let displayName: String
    }

    /// Thành viên của kênh. RLS `members_read` cho mọi thành viên thấy nhau trong kênh
    /// của mình. Embed qua `channel_members_user_id_fkey` — FK phải trỏ `profiles` (0039),
    /// trỏ `auth.users` là PostgREST không lần được sang view `public_profiles`.
    func members(of channelId: UUID) async -> [ChannelMember] {
        struct Row: Decodable {
            let userId: UUID
            let member: Name?
            struct Name: Decodable {
                let displayName: String?
                enum CodingKeys: String, CodingKey { case displayName = "display_name" }
            }
            enum CodingKeys: String, CodingKey {
                case member
                case userId = "user_id"
            }
        }
        do {
            let rows: [Row] = try await client.from("channel_members")
                .select("user_id,member:public_profiles!channel_members_user_id_fkey(display_name)")
                .eq("channel_id", value: channelId)
                .execute().value
            return rows.map {
                ChannelMember(id: $0.userId,
                              displayName: $0.member?.displayName ?? String(localized: "Ẩn danh"))
            }
        } catch {
            errorMessage = String(localized: "Không tải được danh sách thành viên.")
            return []
        }
    }
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
        // của mình (so `userId` với `currentUserId`) nên không cần tên. Lần mở màn sau sẽ
        // nạp bản server có tên đầy đủ.
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

    /// Gửi ảnh/tệp/thoại — bong bóng hiện NGAY từ dữ liệu trong máy, upload chạy nền.
    ///
    /// Vẫn giữ thứ tự upload-rồi-mới-ghi-tin ở tầng mạng: ghi tin trước rồi upload hỏng sẽ để
    /// lại một tin trỏ vào file không tồn tại, nằm đó vĩnh viễn. Ngược lại (upload xong mà ghi
    /// tin hỏng) chỉ để lại một file mồ côi, không ai thấy, dọn được sau.
    ///
    /// Điều ĐỔI so với bản trước: không bắt người gửi ngồi nhìn spinner vài giây rồi mới thấy
    /// bong bóng. Ảnh xuất hiện tức thì (vẽ từ `Data` local), upload chạy sau lưng — đúng cách
    /// IG/WhatsApp làm. Hỏng thì bong bóng Ở LẠI với trạng thái lỗi + nút Gửi lại, chứ không
    /// biến mất: bản trước gỡ luôn tin ra và người dùng mất cả ảnh vừa chọn.
    ///
    /// KHÔNG `async`: hàm này chỉ xếp hàng rồi trả về ngay, upload chạy trong Task nền. Nếu
    /// nó `await` cho tới lúc upload xong thì chỗ gọi phải chờ vài giây mới biết có nên xoá
    /// băng "Đang trả lời" hay không — mà bong bóng thì đã hiện từ mili-giây đầu. Trả về
    /// `false` = KHÔNG có bong bóng nào được tạo (chưa đăng nhập / quá cỡ), không phải "upload hỏng".
    @discardableResult
    func sendMedia(
        channelId: UUID,
        data: Data,
        kind: MessageMedia.Kind,
        ext: String,
        contentType: String,
        preview: UIImage? = nil,
        duration: Double? = nil,
        width: Int? = nil,
        height: Int? = nil,
        size: Int? = nil,
        name: String? = nil,
        waveform: [Float]? = nil,
        caption: String = "",
        parentId: UUID? = nil
    ) -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }

        // Chặn quá cỡ TRƯỚC khi dựng bong bóng: hiện một tin rồi báo nó hỏng vì lý do biết
        // trước từ đầu là dắt người dùng đi một vòng vô ích.
        guard data.count <= ChatMediaStorage.maxBytes else {
            errorMessage = ChatMediaStorage.UploadError.tooLarge(data.count).localizedDescription
            return false
        }

        let id = UUID()
        // `path` rỗng: chưa upload nên chưa có. View biết tin này còn ở trong `pendingMedia`
        // thì vẽ từ `Data` local, không đụng tới path.
        let draft = MessageMedia(kind: kind, path: "", duration: duration, width: width,
                                 height: height, size: size, name: name, waveform: waveform)
        let optimistic = MessageRow(id: id, channelId: channelId, userId: uid,
                                    parentId: parentId, body: caption, createdAt: Date(),
                                    editedAt: nil, author: nil,
                                    metadata: MessageMetadata(media: draft), reactions: [])
        messagesByChannel[channelId, default: []].append(optimistic)
        pendingMedia[id] = PendingMedia(phase: .uploading, data: data, preview: preview, ext: ext,
                                        contentType: contentType, media: draft,
                                        channelId: channelId, caption: caption,
                                        parentId: parentId, row: optimistic)
        Task { await uploadPending(messageId: id) }
        return true
    }

    /// Trả lại những bong bóng đang gửi mà `loadMessages` vừa quét mất.
    ///
    /// `loadMessages` thay CẢ mảng bằng dữ liệu server (đúng — nó là nguồn sự thật), nhưng tin
    /// đang upload thì theo định nghĩa CHƯA có trên server. Không trả lại thì: mở chat → gửi
    /// ảnh → thoát ra → vào lại, bong bóng biến mất trong khi `pendingMedia` vẫn giữ bytes.
    /// Upload xong thì `firstIndex` không thấy dòng nào để gắn path; upload hỏng thì không còn
    /// bong bóng nào để bấm "Gửi lại" — ảnh mất im lặng và bytes kẹt lại tới khi thoát app.
    private func reattachPendingRows(in channelId: UUID) {
        let existing = Set((messagesByChannel[channelId] ?? []).map(\.id))
        let orphans = pendingMedia.values
            .filter { $0.channelId == channelId && !existing.contains($0.row.id) }
            .map(\.row)
            .sorted { $0.createdAt < $1.createdAt }
        guard !orphans.isEmpty else { return }
        messagesByChannel[channelId, default: []] += orphans
    }

    /// Đưa một `PendingMedia` lên: upload → INSERT → gắn path thật vào bong bóng.
    /// Dùng chung cho lần gửi đầu và cho "Gửi lại", nên retry đi đúng một đường với gửi mới.
    ///
    /// `@MainActor` là BẮT BUỘC, không phải cho gọn: chọn 6 ảnh là 6 Task chạy song song, và
    /// vì `ConversationStore` không gắn actor nào nên chúng rơi xuống executor chung. Sáu
    /// luồng cùng ghi `messagesByChannel` (mảng, copy-on-write) và `pendingMedia` (từ điển)
    /// trong khi main thread đang đọc để vẽ = hỏng bộ nhớ thật sự, không phải "hơi race".
    /// Ghim phần THAY ĐỔI TRẠNG THÁI vào main; phần chờ mạng (`await`) vẫn nhả main như thường.
    @MainActor
    @discardableResult
    private func uploadPending(messageId: UUID) async -> Bool {
        guard let uid, let pending = pendingMedia[messageId] else { return false }
        guard !uploadsInFlight.contains(messageId) else { return false }
        uploadsInFlight.insert(messageId)
        defer { uploadsInFlight.remove(messageId) }

        var working = pending
        working.phase = .uploading
        pendingMedia[messageId] = working

        do {
            let path = try await ChatMediaStorage.upload(
                pending.data, channelId: pending.channelId, userId: uid,
                ext: pending.ext, contentType: pending.contentType, client: client
            )
            let media = pending.media.replacingPath(path)
            let payload = NewMessage(id: messageId, channelId: pending.channelId, userId: uid,
                                     body: pending.caption, parentId: pending.parentId,
                                     metadata: MessageMetadata(media: media))
            do {
                try await client.from("messages").insert(payload).execute()
            } catch {
                // Trùng khoá chính = tin NÀY đã nằm trên server rồi: lần trước INSERT xong
                // nhưng phản hồi lạc mất giữa đường, nên ta tưởng hỏng. Báo hỏng lần nữa là
                // dồn người dùng vào ngõ cụt — bấm Gửi lại bao nhiêu lần cũng trùng khoá,
                // bong bóng kẹt "hỏng" mãi cho một tin người kia ĐÃ nhận được.
                // `id` do client sinh nên trùng khoá chỉ có đúng một nghĩa đó.
                guard Self.isDuplicateKey(error) else { throw error }
            }

            // Gắn path thật vào chính bong bóng đang hiện, rồi mới bỏ khỏi `pendingMedia`:
            // làm ngược lại thì có một khoảnh khắc view không còn `Data` local mà cũng chưa
            // có path — bong bóng chớp thành khung trống.
            if let i = messagesByChannel[pending.channelId]?.firstIndex(where: { $0.id == messageId }) {
                messagesByChannel[pending.channelId]![i] =
                    messagesByChannel[pending.channelId]![i].replacingMedia(media)
            }
            pendingMedia[messageId] = nil
            return true
        } catch {
            // KHÔNG gỡ tin ra và KHÔNG bắn `errorMessage`: lỗi thuộc về đúng một bong bóng,
            // nó tự hiện trạng thái hỏng + nút Gửi lại. Alert ở gốc màn cho một ảnh lỗi là
            // đúng thứ audit gọi là error UX tệ.
            working.phase = .failed
            pendingMedia[messageId] = working
            return false
        }
    }

    /// 23505 = unique_violation của Postgres. Khớp cả mã lẫn lời vì supabase-swift gói lỗi
    /// PostgREST vào nhiều kiểu và không lộ mã ổn định cho mọi đường.
    private static func isDuplicateKey(_ error: Error) -> Bool {
        let raw = "\(error)".lowercased()
        return raw.contains("23505") || raw.contains("duplicate key")
    }

    /// Gửi lại một đính kèm hỏng — `Data` gốc còn nằm trong `pendingMedia` nên không phải
    /// chọn ảnh lần nữa.
    func retryMedia(messageId: UUID) async {
        await uploadPending(messageId: messageId)
    }

    /// Bỏ hẳn một đính kèm hỏng: gỡ bong bóng + quên `Data`.
    func discardMedia(messageId: UUID) {
        guard let pending = pendingMedia[messageId] else { return }
        messagesByChannel[pending.channelId]?.removeAll { $0.id == messageId }
        pendingMedia[messageId] = nil
    }

    /// Ảnh/thoại đang gửi được vẽ từ đây, không phải từ bucket.
    func pending(for messageId: UUID) -> PendingMedia? { pendingMedia[messageId] }

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
            // Bỏ luôn đính kèm đang gửi của kênh vừa rời: policy Storage đòi còn là thành viên,
            // nên upload của chúng chắc chắn hỏng từ đây. Không dọn thì chúng nằm lại giữ
            // `Data` (tới 25MB/tệp) mà không còn màn nào hiện ra để bấm bỏ.
            pendingMedia = pendingMedia.filter { $0.value.channelId != channelId }
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
