import Foundation
import Supabase

/// "Đang nhập…" — Realtime **Broadcast**, KHÔNG phải postgres_changes: typing là tín hiệu
/// phù du, chạm DB cho mỗi cú gõ là tự giết mình. Đây cũng là lần đầu app dùng Broadcast —
/// khởi đầu cho món nợ chuyển toàn bộ realtime sang Broadcast khi đông user.
///
/// Topic per-chat `typing:{channelId}`, vòng đời theo MÀN chat (vào mở, rời đóng) — đúng
/// scope hiển thị: chỉ người đang mở cùng khung chat cần biết ai đang gõ. Nợ đã ghi nhận:
/// broadcast không kiểm RLS, ai biết channelId có thể nghe topic này (chỉ lộ "ai đang gõ ở
/// kênh nào", không lộ nội dung) — private channel authorization để đợt Broadcast tổng.
extension ConversationStore {

    /// Vào màn chat — mở topic typing của kênh đó. Cùng khuôn chống-đúp với startRealtime:
    /// chốt trạng thái TRƯỚC await, kiểm lại danh tính SAU await.
    @MainActor
    func startTyping(in channelId: UUID) async {
        // `.task` của màn chat có thể đã bị huỷ (back nhanh trước khi loadMessages xong) mà
        // body vẫn trôi tới đây — mở topic cho một màn đã chết là subscription mồ côi.
        guard !Task.isCancelled else { return }
        guard typingTopicChannelId != channelId else { return }
        await stopTyping()
        typingTopicChannelId = channelId

        let realtime = client.channel("typing:\(channelId.uuidString)")
        typingRealtimeChannel = realtime
        let stream = realtime.broadcastStream(event: "typing")
        await realtime.subscribe()
        guard typingRealtimeChannel === realtime, typingTopicChannelId == channelId,
              !Task.isCancelled else {
            await realtime.unsubscribe()
            if typingRealtimeChannel === realtime {
                typingRealtimeChannel = nil
                typingTopicChannelId = nil
            }
            return
        }

        typingListenTask = Task { [weak self] in
            for await message in stream {
                guard let self, !Task.isCancelled else { return }
                await self.handleTypingEvent(message)
            }
        }
    }

    /// Rời màn / xuống nền. `ifCurrent` cùng lý do với guard của `visibleChannelId`: push có
    /// thể đã điều hướng sang chat khác và màn kia mở topic mới TRƯỚC khi onDisappear màn cũ
    /// kịp chạy — đóng mù là đóng của người ta.
    @MainActor
    func stopTyping(ifCurrent channelId: UUID? = nil) async {
        if let channelId, typingTopicChannelId != channelId { return }
        typingListenTask?.cancel()
        typingListenTask = nil
        typersInVisibleChannel = [:]
        typingTopicChannelId = nil
        if let realtime = typingRealtimeChannel {
            typingRealtimeChannel = nil
            await realtime.unsubscribe()
        }
    }

    /// Mình đang gõ — bắn tín hiệu, throttle 3s/lần (TTL bên nhận là 5s nên 3s giữ nhãn
    /// liền mạch mà không spam socket theo từng phím).
    @MainActor
    func broadcastTyping(channelId: UUID) {
        guard channelId == typingTopicChannelId,
              let realtime = typingRealtimeChannel,
              let uid = currentUserId,
              Date().timeIntervalSince(lastTypingSentAt) > 3 else { return }
        lastTypingSentAt = Date()
        let payload: JSONObject = [
            "user_id": .string(uid.uuidString),
            "name": .string(myDisplayName ?? ""),
            // Cho receiver đối chiếu: event kênh CŨ còn kẹt trong stream lúc mình vừa
            // chuyển chat không được ghi typer vào chat mới.
            "channel_id": .string(channelId.uuidString),
        ]
        Task { try? await realtime.broadcast(event: "typing", message: payload) }
    }

    /// Tên những người đang gõ, đã lọc hạn — view đọc trực tiếp.
    var activeTypers: [String] {
        let now = Date()
        return typersInVisibleChannel.values.filter { $0.until > now }.map(\.name)
    }

    @MainActor
    private func handleTypingEvent(_ message: JSONObject) {
        // supabase-swift gói payload trong khoá "payload"; phòng cả trường hợp trả phẳng.
        let payload = message["payload"]?.objectValue ?? message
        // Event của kênh khác (dequeue muộn sau khi mình đã chuyển chat) → bỏ.
        if let rawChannel = payload["channel_id"]?.stringValue,
           UUID(uuidString: rawChannel) != typingTopicChannelId { return }
        guard let rawUser = payload["user_id"]?.stringValue,
              let userId = UUID(uuidString: rawUser),
              userId != currentUserId,
              // Người bị chặn: "đang nhập" cũng là dấu vết của họ — ẩn nốt, cùng luật
              // với tin và reaction (chuẩn IG).
              !isBlocked(userId) else { return }
        let name = payload["name"]?.stringValue ?? ""
        typersInVisibleChannel[userId] = (
            name.isEmpty ? String(localized: "Ẩn danh") : name,
            Date().addingTimeInterval(5)
        )
        // Hẹn dọn sau hạn — mutate dict là UI tự vẽ lại, nhãn tự tắt khi người ta ngừng gõ.
        Task { [weak self] in
            try? await Task.sleep(for: .seconds(5.5))
            await self?.pruneExpiredTypers()
        }
    }

    @MainActor
    func pruneExpiredTypers() {
        let now = Date()
        typersInVisibleChannel = typersInVisibleChannel.filter { $0.value.until > now }
    }

    /// Tin THẬT của người đang gõ vừa đến — "đang nhập" đổi ngay thành tin, không chờ TTL
    /// (Messenger-style). Gọi từ handleIncoming.
    @MainActor
    func clearTyper(_ userId: UUID?, in channelId: UUID) {
        guard let userId, channelId == typingTopicChannelId else { return }
        typersInVisibleChannel[userId] = nil
    }
}
