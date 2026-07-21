import SwiftUI

/// "Đang hoạt động" (chấm xanh) / "Hoạt động X phút trước" từ một mốc `last_seen_at` (0052).
///
/// Một chỗ quyết định, mọi màn (header DM, hồ sơ thành viên) chỉ hỏi — không mỗi nơi tự định
/// nghĩa "online là bao lâu" rồi lệch nhau.
///
/// **Online = mốc trong vòng 60s.** App đập nhịp mỗi ~45s khi mở (xem heartbeat ở
/// RootTabView), nên 60s đủ dung sai một nhịp lỡ mà không giữ chấm xanh cho người đã đóng app.
enum PresenceStatus: Equatable {
    case online
    case lastSeen(Date)
    /// Chưa từng thấy (tài khoản cũ chưa có mốc) — không vẽ gì, không đoán bừa "offline".
    case unknown

    /// Ngưỡng coi là đang online. Đúng bằng 60s: gấp ~1.3 lần chu kỳ heartbeat.
    private static let onlineWindow: TimeInterval = 60

    static func of(_ lastSeen: Date?) -> PresenceStatus {
        guard let lastSeen else { return .unknown }
        return -lastSeen.timeIntervalSinceNow <= onlineWindow ? .online : .lastSeen(lastSeen)
    }

    var isOnline: Bool { self == .online }

    /// Chuỗi dưới tên. nil = `.unknown` (không hiện dòng nào).
    var label: String? {
        switch self {
        case .online:            return String(localized: "Đang hoạt động")
        case .unknown:           return nil
        case .lastSeen(let at):  return String(localized: "Hoạt động \(RelativeTime.format(at))")
        }
    }
}

/// Chấm xanh online — góc avatar. Chỉ vẽ khi thật sự online (caller tự quyết ẩn/hiện).
struct OnlineDot: View {
    var size: CGFloat = 12

    var body: some View {
        Circle()
            .fill(NodieColors.online)
            // Viền nền để chấm tách khỏi avatar bên dưới, dù avatar màu gì.
            .overlay(Circle().stroke(NodieColors.bg, lineWidth: 2))
            .frame(width: size, height: size)
            .accessibilityLabel("Đang hoạt động")
    }
}
