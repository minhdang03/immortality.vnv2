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
    static let inkSoft = Color(hex: 0x6D5F45)     // chữ trên chip
    static let inkMuted = Color(hex: 0x8A7A5C)    // meta
    static let inkFaint = Color(hex: 0xA99A78)    // timestamp

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
    static let sunDim = Color(hex: 0xC69214)
    static let purple = Color(hex: 0x5B43D8)

    /// Ghi âm — đỏ báo động, chỉ dùng cho chấm nhấp nháy + viền thanh ghi âm.
    /// Nằm ngoài bảng be/mực có chủ đích: đang thu tiếng là trạng thái phải nhảy ra khỏi nền.
    static let rec = Color(hex: 0xC0392B)
    static let recBorder = Color(hex: 0xE5C9C4)

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
