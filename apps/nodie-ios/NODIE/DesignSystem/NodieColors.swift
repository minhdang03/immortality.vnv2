import SwiftUI

/// Bảng màu — trích nguyên văn từ `Aion Prototype v3.dc.html` (Claude Design),
/// không phải ước lượng từ ảnh chụp.
enum NodieColors {
    // Nền
    static let bg = Color(hex: 0xFAF7F0)          // nền app
    static let outerBg = Color(hex: 0xEFE9DD)     // nền ngoài khung máy
    static let surface = Color(hex: 0xFFFFFF)

    // Mực — cũng là nền của card tối và tab bar
    static let ink = Color(hex: 0x241C10)
    static let inkBody = Color(hex: 0x4D4230)     // thân bài
    // WCAG AA (phase 05, 260718): hue/saturation giữ nguyên, chỉ hạ value — vẫn đúng tông
    // be/mực. Đo trên nền kem thật 0xFAF7F0 (script `contrast.py` trong report phase 05):
    // inkSoft 7.00:1, inkMuted 5.57:1, inkFaint 4.50:1 — cả ba đạt ngưỡng AA text nhỏ ≥4.5:1.
    static let inkSoft = Color(hex: 0x60533D)     // chữ trên chip
    static let inkMuted = Color(hex: 0x6F624A)    // meta
    static let inkFaint = Color(hex: 0x7C7158)    // timestamp

    /// Nhãn tiết diện in hoa giãn chữ ("HÚT VỀ · KHỚP ĐIỀU BẠN CHIẾU SÁNG")
    static let label = Color(hex: 0x8A6D3F)

    // Accent — mặc định xanh rừng. Prototype cho chọn: #5b43d8 tím, #2b5cff lam,
    // #b8862b vàng, #2b7a5e lục. Chốt lục.
    static let accent = Color(hex: 0x2B7A5E)
    /// Tím sáng — dùng trên nền tối (chữ nhấn, vòng xung, nhãn AI). Cố định, không đổi theo accent.
    static let accentLight = Color(hex: 0xA894FF)
    static let gold = Color(hex: 0xB8862B)
    static let goldOnDark = Color(hex: 0xCBB98A)

    /// Mặt trời ☀ — glyph "thả ánh sáng" (thích/soi sáng). Vàng nắng khi đã thắp,
    /// vàng trầm khi chưa. KHÔNG dùng `gold`/`inkSoft` cho ☀ nữa: hai màu này là
    /// nhãn/chữ chung, còn ☀ cần đọc ra ngay là bật hay tắt.
    static let sun = Color(hex: 0xE8A200)
    /// WCAG AA (phase 05): chỉ dùng cho glyph ☀ (non-text) ở `QAActionButtons.LitButton`
    /// — ngưỡng non-text 3:1 đủ, KHÔNG đẩy lên 4.5:1 (sẽ mất sắc vàng trầm). Đo 3.01:1
    /// trên nền kem 0xFAF7F0.
    static let sunDim = Color(hex: 0xB88713)
    static let purple = Color(hex: 0x5B43D8)

    /// Ghi âm — đỏ báo động, chỉ dùng cho chấm nhấp nháy + viền thanh ghi âm.
    /// Nằm ngoài bảng be/mực có chủ đích: đang thu tiếng là trạng thái phải nhảy ra khỏi nền.
    static let rec = Color(hex: 0xC0392B)
    static let recBorder = Color(hex: 0xE5C9C4)

    /// Đỏ lỗi — dòng thông báo lỗi dưới ô nhập (đăng nhập, quên mật khẩu, sửa hồ sơ).
    /// Ngoài bảng be/mực có chủ đích, cùng lẽ với `rec`: lỗi phải bật khỏi nền kem.
    /// Đo 6.87:1 trên nền kem 0xFAF7F0 — đạt AA text nhỏ.
    static let error = Color(hex: 0xB3261E)

    /// Chữ/glyph/spinner đặt TRÊN nền accent đậm (nút gửi, CTA, badge đếm chưa đọc).
    /// Token riêng thay vì `.white` trần: đổi accent hay thêm nền tối sau này chỉ sửa một
    /// chỗ. `.white` trần chỉ còn hợp lệ trên media/scrim (ảnh, video, lớp phủ đen).
    static let onAccent = Color.white

    // Gradient avatar (prototype: linear-gradient 135deg)
    /// Avatar của chính người dùng — vàng. Dùng cho câu trả lời/reply vừa gửi + ô nhập inline.
    static let avatarSelfFrom = Color(hex: 0xFFE6A8)
    static let avatarSelfTo = gold
    /// Avatar tím — cặp mặc định cho nội dung "hút về" (Feed prototype).
    static let avatarPurpleFrom = Color(hex: 0xC9B8F5)
    static let avatarPurpleTo = purple

    // Viền
    static let rule = Color(hex: 0xE8DFC9)        // kẻ chia mục
    static let ruleLight = Color(hex: 0xF0E8D6)   // kẻ chia dòng hội thoại
    static let chipBorder = Color(hex: 0xD9CDB2)

    // Nền phụ
    static let tagBg = Color(hex: 0xF1E9D8)
    static let expertBg = Color(hex: 0xECE7FB)
    static let bestBg = Color(hex: 0xF3F7F4)
    static let bestBorder = Color(hex: 0xBCD8CA)
    static let bestBadgeBg = Color(hex: 0xE3F0E9)

    // Trên nền tối
    static let cream = Color(hex: 0xFAF7F0)
    static var tabDim: Color { cream.opacity(0.5) }
    static var onDarkBody: Color { cream.opacity(0.6) }
    static var onDarkStrong: Color { cream.opacity(0.8) }
    static var onDarkFill: Color { cream.opacity(0.06) }
    static var onDarkTrack: Color { cream.opacity(0.12) }
    static var onDarkBorder: Color { cream.opacity(0.2) }
}

extension Color {
    /// Khởi tạo từ hex 0xRRGGBB — gọn hơn UIColor literal khi port token từ web.
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }

    /// Khởi tạo từ chuỗi "#RRGGBB" — dạng `channels.avatar_hex`/`badge_hex` lưu ở DB (0025).
    /// Trả nil khi chuỗi sai để chỗ gọi tự chọn màu dự phòng: ép về đen câm lặng là kiểu
    /// hỏng không ai thấy cho tới lúc nhìn vào kênh (chính lý do 0025 có CHECK định dạng).
    init?(hexString: String?) {
        guard let raw = hexString?.trimmingCharacters(in: .whitespaces),
              raw.hasPrefix("#"), raw.count == 7,
              let value = UInt32(raw.dropFirst(), radix: 16)
        else { return nil }
        self.init(hex: value)
    }
}
