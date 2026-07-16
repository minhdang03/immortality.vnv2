import SwiftUI
import UIKit

/// Typography — prototype dùng Lora (serif) + Be Vietnam Pro (sans).
///
/// Hiện map sang font hệ thống: New York (serif) + SF Pro (sans). Cả hai phủ đủ
/// dấu tiếng Việt, không cần bundle .ttf. Muốn khớp 100% với prototype thì bundle
/// Lora + Be Vietnam Pro rồi chỉ sửa 2 hàm `serif`/`sans` bên dưới — view không đổi.
///
/// Dynamic Type: mọi cỡ đi qua `scaled()` nên chữ to/nhỏ theo cỡ chữ hệ thống.
/// Phải là computed `var` chứ không `let`: `let` chỉ tính một lần rồi đóng băng,
/// user đổi cỡ chữ sẽ không ăn.
enum NodieTypography {
    private static func serif(_ size: CGFloat, _ weight: Font.Weight = .medium) -> Font {
        .system(size: scaled(size), weight: weight, design: .serif)
    }
    private static func sans(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
        .system(size: scaled(size), weight: weight)
    }

    /// Neo mỗi cỡ vào text style có cỡ gốc gần nhất → cỡ lớn phình ít hơn cỡ nhỏ,
    /// đúng đường cong của iOS.
    ///
    /// KHÔNG dùng `.caption2` cho cỡ nhỏ nhất dù nó có vẻ hợp: đo trên iOS 18 thì
    /// caption2 phình 3.69× còn footnote chỉ 2.89× — chữ 11.5 sẽ to HƠN chữ 13.5 ở
    /// cỡ chữ lớn nhất, lộn ngược thứ bậc. Mọi cỡ < 15 dùng chung footnote.
    private static func metrics(for size: CGFloat) -> UIFontMetrics {
        switch size {
        case 30...:   return UIFontMetrics(forTextStyle: .largeTitle)
        case 24..<30: return UIFontMetrics(forTextStyle: .title1)
        case 18..<24: return UIFontMetrics(forTextStyle: .title3)
        case 15..<18: return UIFontMetrics(forTextStyle: .body)
        default:      return UIFontMetrics(forTextStyle: .footnote)
        }
    }

    /// Nhân theo TỈ LỆ, không gọi thẳng `scaledValue(for: size)`: scaledValue làm tròn
    /// cỡ lẻ ngay ở cỡ chữ mặc định (15.5 → 15.7, 8.5 → 8.7) → layout xê dịch dù user
    /// không đổi gì. Tỉ lệ ở cỡ mặc định đúng bằng 1.0 nên cỡ lẻ giữ nguyên tuyệt đối.
    private static func scaled(_ size: CGFloat) -> CGFloat {
        size * (metrics(for: size).scaledValue(for: 1000) / 1000)
    }

    // Serif — tiêu đề, câu hỏi, câu trích
    static var screenTitle: Font { serif(26) }
    static var cardTitleLg: Font { serif(19) }      // card chiếu sáng
    static var cardTitle: Font { serif(18) }        // nội dung hút về (hạng nhất)
    static var cardTitleSm: Font { serif(16) }      // câu hỏi trong list
    static var detailTitle: Font { serif(20) }      // tiêu đề chi tiết câu hỏi
    static var askField: Font { serif(17) }         // ô nhập câu hỏi ở màn Chiếu câu hỏi
    static var memberName: Font { serif(22) }       // tên + số thống kê ở hồ sơ thành viên
    static var postTitle: Font { serif(14.5) }      // tiêu đề bài trong "Hoạt động gần đây"
    static var quote: Font { serif(15.5) }          // "{{ projText }}"
    static var insight: Font { serif(15) }          // nhận định AI

    // Sans — thân, meta, nhãn
    static var body: Font { sans(13.5) }
    static var bodySm: Font { sans(13) }
    static var bodyXs: Font { sans(12.5) }
    static var meta: Font { sans(12) }
    static var metaSm: Font { sans(11.5) }
    static var timestamp: Font { sans(11) }
    static var timestampXs: Font { sans(10) }

    static var rowTitle: Font { sans(14.5, .semibold) }
    static var chatName: Font { sans(15, .bold) }
    static var chip: Font { sans(12, .semibold) }
    static var tag: Font { sans(11, .semibold) }
    static var kindBadge: Font { sans(8.5, .bold) }
    static var unread: Font { sans(11, .bold) }
    static var matchScore: Font { sans(10.5, .semibold) }
    static var ctaLg: Font { sans(13.5, .bold) }
    static var cta: Font { sans(12.5, .semibold) }
    static var tabIcon: Font { sans(16) }
    static var tabLabel: Font { sans(9.5, .semibold) }

    /// Nhãn in hoa giãn chữ. Tracking đặt riêng ở view qua `.tracking()`.
    static var eyebrow: Font { sans(12, .semibold) }
    static var eyebrowSm: Font { sans(11, .semibold) }
    static var eyebrowXs: Font { sans(10.5, .semibold) }
}

/// Thang cách — khớp `packages/ui-tokens/src/index.ts` để web và app cùng nhịp.
enum NodieSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24

    /// Lề ngang chuẩn của mọi màn (prototype: 22px)
    static let screenH: CGFloat = 22
    /// Khoảng từ mép trên tới nội dung (prototype: 62px — dưới Dynamic Island)
    static let screenTop: CGFloat = 18

    /// Tracking cho nhãn in hoa
    static let eyebrowTracking: CGFloat = 1.6
}
