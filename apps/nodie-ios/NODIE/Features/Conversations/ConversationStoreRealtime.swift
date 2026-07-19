import Foundation
import Supabase

/// Tin mới tự hiện ra ở MỌI NƠI trong app — MỘT subscription cấp store cho cả bảng
/// `messages`, không phải mỗi khung chat một cái như bản đầu. Bản per-channel có hệ quả
/// người dùng thấy rõ: đứng ở danh sách Chat hay tab khác thì tin mới "không tồn tại" —
/// badge không nhảy, kênh không nổi lên đầu, phải kéo-refresh mới biết.
///
/// Không filter phía server: `postgres_changes` + WALRUS kiểm RLS cho từng subscriber trên
/// từng sự kiện, nên mình chỉ nhận tin của kênh mình ĐỌC ĐƯỢC — đúng phạm vi `channels_read`.
///
/// **Sự kiện chỉ là TIẾNG CHUÔNG, không phải dữ liệu.** Payload chỉ có dòng `messages` thô,
/// không có tác giả nhúng (Realtime không chạy join) — decode thẳng là mọi tin thành
/// "Ẩn danh". Nhận tín hiệu xong gọi PostgREST nạp phần đuôi: có tên tác giả, đúng RLS.
/// Giá: thêm một round-trip mỗi tin. Chấp nhận ở v1 — kênh cộng đồng nhỏ.
///
/// Giới hạn cần biết: `postgres_changes` không gánh nổi quá vài trăm subscriber đồng thời.
/// Khi đông thì chuyển sang Realtime Broadcast — đổi ở đây, không đụng schema.
extension ConversationStore {

    /// Mở subscription toàn cục — gọi khi app vào RootTabView. Gọi lại là no-op.
    ///
    /// `@MainActor` cho cả cụm start/stop/resume/handle: guard-rồi-gán phải là MỘT nhịp không
    /// ai chen được. Bản đầu gán `globalRealtimeChannel` SAU `await subscribe()` — hai đường
    /// vào lúc cold start (`.task` + scenePhase) cùng lọt qua guard trong lúc chờ mạng, ra
    /// HAI subscription sống song song: mỗi tin xử lý hai lần, unread nhảy 2 nấc một.
    @MainActor
    func startRealtime() async {
        guard globalRealtimeChannel == nil else { return }

        let realtime = client.channel("room:messages")
        // Chốt cửa TRƯỚC await — từ đây guard ở trên chặn mọi người đến sau.
        globalRealtimeChannel = realtime
        // Khai đủ các stream TRƯỚC subscribe — khai sau là lỡ event.
        let inserts = realtime.postgresChange(
            InsertAction.self, schema: "public", table: "messages")
        let updates = realtime.postgresChange(
            UpdateAction.self, schema: "public", table: "messages")
        let reactionAdds = realtime.postgresChange(
            InsertAction.self, schema: "public", table: "message_reactions")
        // DELETE chỉ chở old_record = các cột PK — may là PK của bảng này composite
        // (message_id, user_id, kind) nên đủ dựng lại thao tác, không cần round-trip.
        let reactionRemovals = realtime.postgresChange(
            DeleteAction.self, schema: "public", table: "message_reactions")
        // `channel_members` vào publication ở 0041 — cho nhãn "Đã xem" đổi live khi người
        // kia mở chat. RLS members_read lo chuyện không lộ cho người ngoài kênh.
        let memberUpdates = realtime.postgresChange(
            UpdateAction.self, schema: "public", table: "channel_members")
        await realtime.subscribe()
        // Trong lúc chờ subscribe, stopRealtime có thể đã dọn mình đi (xuống nền ngay lúc
        // đang mở). Không phải kênh đương nhiệm nữa thì tự đóng, đừng dựng task mồ côi.
        guard globalRealtimeChannel === realtime else {
            await realtime.unsubscribe()
            return
        }

        globalRealtimeTasks = [
            Task { [weak self] in
                for await event in inserts {
                    guard let self, !Task.isCancelled else { return }
                    await self.handleIncoming(event.record)
                }
            },
            Task { [weak self] in
                for await event in updates {
                    guard let self, !Task.isCancelled else { return }
                    await self.handleMessageUpdate(event.record)
                }
            },
            Task { [weak self] in
                for await event in reactionAdds {
                    guard let self, !Task.isCancelled else { return }
                    await self.handleReaction(event.record, added: true)
                }
            },
            Task { [weak self] in
                for await event in reactionRemovals {
                    guard let self, !Task.isCancelled else { return }
                    await self.handleReaction(event.oldRecord, added: false)
                }
            },
            Task { [weak self] in
                for await event in memberUpdates {
                    guard let self, !Task.isCancelled else { return }
                    await self.handleMemberUpdate(event.record)
                }
            },
        ]
    }

    /// Đóng subscription — app xuống nền hoặc đăng xuất.
    @MainActor
    func stopRealtime() async {
        globalRealtimeTasks.forEach { $0.cancel() }
        globalRealtimeTasks = []
        if let realtime = globalRealtimeChannel {
            globalRealtimeChannel = nil
            await realtime.unsubscribe()
        }
    }

    /// App quay lại từ nền: socket cũ coi như đã chết — đập đi mở lại chứ không tin
    /// auto-reconnect, rồi fetch bù những gì đến trong lúc vắng mặt (danh sách kênh +
    /// unread + tin của chat đang mở). Lần mở app ĐẦU thì thôi phần fetch:
    /// ConversationListView tự lo cú sync đầu tiên.
    @MainActor
    func resumeFromForeground() async {
        await stopRealtime()
        await startRealtime()
        // Topic typing cũng chết theo socket — mở lại cho chat đang trên màn (nếu có).
        if let visible = visibleChannelId {
            await stopTyping()
            await startTyping(in: visible)
        }
        // Về foreground là một cơ hội gửi hàng đợi: transition offline→online của NWPath
        // KHÔNG phải trigger duy nhất đáng tin — lỗi timeout/cannotConnectToHost cũng xếp
        // loại .offline mà path thì vẫn satisfied, chỉ chờ onChange là kẹt vô hạn.
        await flushQueued()
        guard hasSyncedChannels else { return }
        await loadChannels()
        if let visible = visibleChannelId {
            await fetchNewMessages(channelId: visible)
        }
    }

    /// Một tin vừa INSERT ở đâu đó trong phạm vi mình đọc được.
    ///
    /// Tra kênh theo ID, KHÔNG giữ index qua sort/await: sort đảo vị trí ngay dòng sau, và
    /// trong lúc `await` thì `loadChannels` đồng thời có thể thay cả mảng — index cũ khi đó
    /// trỏ vào kênh khác (badge sai) hoặc ra ngoài mảng (crash).
    @MainActor
    private func handleIncoming(_ record: [String: AnyJSON]) async {
        guard let rawChannel = record["channel_id"]?.stringValue,
              let channelId = UUID(uuidString: rawChannel) else { return }
        let senderId = record["user_id"]?.stringValue.flatMap { UUID(uuidString: $0) }
        let isMine = senderId != nil && senderId == currentUserId

        // Người mình đã chặn: không tin nào của họ được đổi bất kỳ thứ gì trên màn — bump
        // badge/nổi kênh cho một tin sẽ bị lọc là dắt người dùng mở một chat "không có gì mới".
        if let senderId, isBlocked(senderId) { return }

        // Kênh chưa từng thấy = mình vừa được thêm vào nhóm/DM mới → nạp lại danh sách
        // (kèm title DM + unread). Tin của kênh đó sẽ hiện khi mở nó.
        guard let index = channels.firstIndex(where: { $0.id == channelId }) else {
            await loadChannels()
            return
        }
        // Chụp membership + kind TRƯỚC sort/await — giá trị theo kênh, không theo vị trí.
        let isMember = channels[index].isMember
        let isDM = channels[index].kind == "dm"

        // Kênh nổi lên đầu NGAY — không chờ round-trip. Dùng giờ máy thay vì parse
        // `created_at` trong payload: chỉ để sắp thứ tự, lệch vài giây không đổi thứ hạng,
        // và bản chính xác sẽ về cùng lần loadChannels sau.
        channels[index].lastMessageAt = Date()
        channels.sort { ($0.lastMessageAt ?? .distantPast) > ($1.lastMessageAt ?? .distantPast) }

        // Người đang gõ vừa gửi tin thật → nhãn "đang nhập" đổi ngay thành tin.
        clearTyper(senderId, in: channelId)

        // Kênh đang nạp tin trên màn → kéo phần đuôi có tên tác giả về.
        if messagesByChannel[channelId] != nil {
            await fetchNewMessages(channelId: channelId)
        }

        if channelId == visibleChannelId {
            // Đang đứng TRONG chat này: người dùng nhìn thấy tin rồi — báo server đã đọc
            // luôn, không thì thiết bị khác (và lần mở app sau) vẫn đếm nó là chưa đọc.
            //
            // DM: mỗi tin một markRead — nhãn "Đã xem" bên kia phải tươi. Kênh/nhóm: throttle
            // 10s — mỗi markRead là một UPDATE `channel_members` mà 0041 fan-out cho CẢ kênh,
            // kênh đông người cùng mở thì per-message tự khuếch đại đúng cái giới hạn
            // postgres_changes đã biết. Badge local không cần nó (đang mở thì unread vốn 0).
            if !isMine {
                let last = lastMarkReadSentAt[channelId] ?? .distantPast
                if isDM || Date().timeIntervalSince(last) > 10 {
                    await markRead(channelId: channelId)
                }
            }
        } else if !isMine, isMember {
            // `isMember` chặn badge ma: kênh public đọc được cả khi CHƯA tham gia (RLS cho),
            // mà chưa tham gia thì không có `last_read_at` nào để mà "chưa đọc".
            unreadByChannel[channelId, default: 0] += 1
            let counts = unreadByChannel
            Task { await ChatDiskCache.shared.saveUnread(counts) }
        }
    }

    /// Người khác SỬA hoặc XOÁ MỀM một tin. Payload UPDATE mang cả dòng mới nên vá được
    /// tại chỗ; tin chưa nạp vào RAM thì bỏ qua — đĩa tự lành ở lần replace trang đầu kế.
    @MainActor
    private func handleMessageUpdate(_ record: [String: AnyJSON]) async {
        guard let rawChannel = record["channel_id"]?.stringValue,
              let channelId = UUID(uuidString: rawChannel),
              let rawId = record["id"]?.stringValue,
              let messageId = UUID(uuidString: rawId) else { return }

        // Xoá mềm: mọi query đọc lọc `deleted_at is null` — màn hình cũng phải lọc ngay.
        if record["deleted_at"]?.stringValue != nil {
            messagesByChannel[channelId]?.removeAll { $0.id == messageId }
            Task { await ChatDiskCache.shared.deleteMessage(id: messageId) }
            return
        }

        guard let index = messagesByChannel[channelId]?.firstIndex(where: { $0.id == messageId })
        else { return }
        let updated = messagesByChannel[channelId]![index].replacingBody(
            record["body"]?.stringValue,
            editedAt: record["edited_at"]?.stringValue.flatMap(Self.parseTimestamp)
        )
        messagesByChannel[channelId]![index] = updated
        Task { await ChatDiskCache.shared.insertMessages([updated]) }
    }

    /// Ai đó thả/gỡ một reaction. Event KHÔNG mang `channel_id` nên tìm tin trong các kênh
    /// đã nạp; không thấy = tin chưa hiện trên màn nào, bỏ qua là đúng.
    ///
    /// Reaction của CHÍNH MÌNH cũng dội về đây (toggle lạc quan đã vẽ xong) — append phải
    /// check trùng, remove vốn idempotent, nên echo vô hại.
    @MainActor
    private func handleReaction(_ record: [String: AnyJSON], added: Bool) async {
        guard let rawMessage = record["message_id"]?.stringValue,
              let messageId = UUID(uuidString: rawMessage),
              let rawUser = record["user_id"]?.stringValue,
              let userId = UUID(uuidString: rawUser),
              let kind = record["kind"]?.stringValue else { return }

        for (channelId, rows) in messagesByChannel {
            guard let index = rows.firstIndex(where: { $0.id == messageId }) else { continue }
            var reactions = rows[index].reactions ?? []
            if added {
                guard !reactions.contains(where: { $0.userId == userId && $0.kind == kind })
                else { return }
                reactions.append(MessageRow.ReactionRow(kind: kind, userId: userId))
            } else {
                reactions.removeAll { $0.userId == userId && $0.kind == kind }
            }
            let updated = rows[index].replacingReactions(reactions)
            messagesByChannel[channelId]![index] = updated
            Task { await ChatDiskCache.shared.insertMessages([updated]) }
            return
        }
    }

    /// Người kia vừa đọc tới đâu đó — nguồn live của nhãn "Đã xem" trong DM.
    /// Chỉ quan tâm DM: nhóm/kênh không có nhãn này (v1), và event của CHÍNH MÌNH bỏ qua.
    @MainActor
    private func handleMemberUpdate(_ record: [String: AnyJSON]) async {
        guard let rawChannel = record["channel_id"]?.stringValue,
              let channelId = UUID(uuidString: rawChannel),
              let rawUser = record["user_id"]?.stringValue,
              let userId = UUID(uuidString: rawUser),
              userId != currentUserId,
              channel(id: channelId)?.kind == "dm",
              let ts = record["last_read_at"]?.stringValue.flatMap(Self.parseTimestamp)
        else { return }
        dmPeerLastRead[channelId] = ts
    }

    /// Timestamp trong payload Realtime là chuỗi ISO8601, CÓ THỂ kèm phần lẻ giây tuỳ giá trị
    /// — `ISO8601DateFormatter` lại đòi biết trước có hay không, nên thử cả hai.
    private static let isoWithFraction: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private static let isoPlain = ISO8601DateFormatter()
    static func parseTimestamp(_ raw: String) -> Date? {
        isoWithFraction.date(from: raw) ?? isoPlain.date(from: raw)
    }

    /// Nạp tin mới hơn tin cuối đang giữ (keyset tiến về phía trước).
    ///
    /// Khử trùng theo `id`: tin của CHÍNH MÌNH đã nằm sẵn trên màn từ bản lạc quan, mà Realtime
    /// vẫn đẩy nó về — không lọc là mỗi tin mình gửi hiện hai lần. `NewMessage.id` sinh ở client
    /// chính là để hai bản này trùng id.
    ///
    /// `@MainActor` cùng lý do `uploadPending`: đây là writer chạy NỀN thường trực vào
    /// `messagesByChannel` trong khi main thread đang đọc để vẽ.
    @MainActor
    func fetchNewMessages(channelId: UUID) async {
        let after = messagesByChannel[channelId]?.last?.createdAt
        do {
            var query = client.from("messages")
                .select(ConversationStore.messageSelect)
                .eq("channel_id", value: channelId)
                .is("deleted_at", value: nil)
            if let after { query = query.gt("created_at", value: after) }

            let rows: [MessageRow] = try await query
                .order("created_at", ascending: true).limit(50)
                .execute().value

            let existing = Set((messagesByChannel[channelId] ?? []).map(\.id))
            // Người bị chặn vẫn gửi được và RLS không biết chuyện đó — lọc ở client.
            let fresh = rows.filter { !existing.contains($0.id) && !isBlocked($0.userId) }
            guard !fresh.isEmpty else { return }
            messagesByChannel[channelId, default: []].append(contentsOf: fresh)
            Task { await ChatDiskCache.shared.insertMessages(fresh) }
        } catch { /* im lặng: mất một lần đẩy không đáng bắn alert; kéo refresh là có lại */ }
    }
}
