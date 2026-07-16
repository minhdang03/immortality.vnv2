import SwiftUI

/// Glyph Unicode lấy từ prototype (không dùng icon font).
///
/// ⚠️ Vài ký tự ở đây (☀ U+2600, ↩ U+21A9) có "emoji presentation" mặc định trên iOS:
/// hệ thống vẽ chúng bằng Apple Color Emoji → ra hình MÀU CỐ ĐỊNH và nuốt luôn
/// `foregroundStyle`, nên `sun`/`sunDim` không tô được. Variation selector U+FE0E
/// ép về dạng chữ đơn sắc để màu token ăn trở lại.
/// Ký tự nào vốn đã là chữ (▲, ▣, ▤…) thì không cần.
enum NodieGlyph {
    static let sun = "☀\u{FE0E}"
    static let reply = "↩\u{FE0E}"
    static let upvote = "▲"
}
