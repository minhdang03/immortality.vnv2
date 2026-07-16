import UIKit

/// Rung phản hồi — gom một chỗ để cả app nói cùng một "ngôn ngữ" rung như FB/IG/X.
/// Hai mức là đủ: thêm mức là thêm quyết định cho mỗi call-site mà user không phân biệt nổi.
enum NodieHaptics {
    /// Chạm nhẹ — toggle trạng thái (☀ lit, ▲ vote, theo dõi), chuyển tab.
    static func tap() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    /// Gõ rõ — hành động "gửi đi" (tin nhắn, thoại, media) và bắt đầu ghi âm.
    static func action() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
}
