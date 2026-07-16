import Foundation
import Supabase

/// Tin mới của người khác tự hiện ra, không cần kéo refresh.
///
/// **Sự kiện chỉ là TIẾNG CHUÔNG, không phải dữ liệu.** Payload `postgres_changes` chỉ chứa
/// dòng `messages` thô — không có `author:profiles(display_name)` vì Realtime không chạy join.
/// Decode thẳng payload thì mọi tin đến đều hiện "Ẩn danh". Nên nhận tín hiệu xong là gọi
/// PostgREST nạp phần đuôi: có tên tác giả, đúng RLS, và khỏi tự chế decoder ngày tháng
/// (`JSONDecoder.supabase()` của SDK là `package`, app không với tới).
///
/// Giá phải trả: thêm một round-trip mỗi lần có tin. Chấp nhận ở v1 — kênh cộng đồng nhỏ.
///
/// Giới hạn cần biết: `postgres_changes` kiểm RLS cho MỖI subscriber trên MỖI sự kiện, không
/// gánh nổi quá vài trăm subscriber đồng thời. Khi đông thì chuyển sang Realtime Broadcast —
/// đổi ở đây, không đụng schema.
extension ConversationStore {

    /// Mở kênh Realtime cho một hội thoại. Gọi lại cho cùng kênh là no-op.
    func subscribe(to channelId: UUID) async {
        guard liveChannels[channelId] == nil else { return }

        let realtime = client.channel("room:\(channelId.uuidString)")
        let inserts = realtime.postgresChange(
            InsertAction.self,
            schema: "public",
            table: "messages",
            filter: .eq("channel_id", value: channelId.uuidString)
        )
        await realtime.subscribe()
        liveChannels[channelId] = realtime

        liveTasks[channelId] = Task { [weak self] in
            for await _ in inserts {
                guard let self, !Task.isCancelled else { return }
                await self.fetchNewMessages(channelId: channelId)
            }
        }
    }

    /// Đóng kênh khi rời màn chat — không đóng thì subscription rò ra, và mỗi lần vào lại
    /// một chat sẽ chồng thêm một cái nữa lên cùng một phòng.
    func unsubscribe(from channelId: UUID) async {
        liveTasks[channelId]?.cancel()
        liveTasks[channelId] = nil
        if let realtime = liveChannels[channelId] {
            await realtime.unsubscribe()
            liveChannels[channelId] = nil
        }
    }

    /// Nạp tin mới hơn tin cuối đang giữ (keyset tiến về phía trước).
    ///
    /// Khử trùng theo `id`: tin của CHÍNH MÌNH đã nằm sẵn trên màn từ bản lạc quan, mà Realtime
    /// vẫn đẩy nó về — không lọc là mỗi tin mình gửi hiện hai lần. `NewMessage.id` sinh ở client
    /// chính là để hai bản này trùng id.
    private func fetchNewMessages(channelId: UUID) async {
        let after = messagesByChannel[channelId]?.last?.createdAt
        do {
            var query = client.from("messages")
                .select("id,channel_id,user_id,body,created_at,author:profiles(display_name)")
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
        } catch { /* im lặng: mất một lần đẩy không đáng bắn alert; kéo refresh là có lại */ }
    }
}
