import Foundation
import Supabase
import os

/// Đường ghi sự kiện app → bảng `app_events` (kind + payload jsonb, RLS chỉ cho
/// `authenticated` insert với user_id = auth.uid()).
///
/// Best-effort tuyệt đối: log hỏng là chuyện nền — không ném, không chặn UI,
/// cùng lắm ghi os_log debug. Observability không được làm vỡ luồng chính.
enum AppEventLogger {
    private static let logger = Logger(subsystem: "com.battudao.nodie", category: "app-events")

    /// Payload jsonb có check `pg_column_size < 64000` phía DB — vượt là mất cả row,
    /// nên chặn từ client ở ngưỡng thấp hơn hẳn cho chắc.
    private static let maxPayloadBytes = 50_000

    /// Ghi một sự kiện, fire-and-forget. Gọi được từ bất kỳ đâu, kể cả ngoài main actor.
    static func log(kind: String, payload: [String: AnyJSON] = [:]) {
        Task.detached(priority: .utility) {
            await write(kind: kind, payload: payload)
        }
    }

    private static func write(kind: String, payload: [String: AnyJSON]) async {
        let client = SupabaseClientProvider.shared

        // RLS chỉ cho phép khi đã đăng nhập — chưa có session thì bỏ qua êm,
        // đừng cố insert rồi nhận 401 ồn ào.
        guard client.auth.currentSession != nil else {
            logger.debug("bỏ qua event '\(kind, privacy: .public)': chưa có session")
            return
        }

        struct NewEvent: Encodable {
            let kind: String
            let payload: [String: AnyJSON]
        }

        // user_id không gửi — cột có default auth.uid() phía DB.
        do {
            try await client.from("app_events")
                .insert(NewEvent(kind: kind, payload: capped(payload)))
                .execute()
        } catch {
            logger.debug("ghi event '\(kind, privacy: .public)' hỏng: \(error.localizedDescription, privacy: .public)")
        }
    }

    /// Giữ payload dưới ngưỡng: bỏ dần field nặng nhất cho tới khi lọt,
    /// đánh dấu `truncated` để phía đọc biết dữ liệu không nguyên vẹn.
    private static func capped(_ payload: [String: AnyJSON]) -> [String: AnyJSON] {
        guard encodedSize(of: payload) > maxPayloadBytes else { return payload }

        var trimmed = payload
        var droppedBytes = 0
        while encodedSize(of: trimmed) > maxPayloadBytes, !trimmed.isEmpty {
            let heaviest = trimmed.max { encodedSize(of: [$0.key: $0.value]) < encodedSize(of: [$1.key: $1.value]) }
            guard let key = heaviest?.key else { break }
            droppedBytes += encodedSize(of: [key: trimmed[key] ?? .null])
            trimmed.removeValue(forKey: key)
        }
        trimmed["truncated"] = .bool(true)
        trimmed["dropped_bytes"] = .integer(droppedBytes)
        return trimmed
    }

    private static func encodedSize(of payload: [String: AnyJSON]) -> Int {
        (try? JSONEncoder().encode(payload).count) ?? 0
    }
}
