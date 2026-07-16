import SwiftUI

struct ChatMessage: Identifiable, Hashable {
    let id = UUID()
    /// nil = tin của mình, hoặc tin cùng người gửi liền trước (không lặp tên)
    let who: String?
    let isMine: Bool
    let text: String
    let time: String
    var kind: Kind = .text

    /// Ba loại nội dung loại trừ nhau. Enum thay vì `media: String?` + `voice: String?`
    /// để không dựng nổi một tin vừa là ảnh vừa là thoại.
    enum Kind: Hashable {
        case text
        case media(MediaKind)
        /// Thời lượng đã format, vd "0:07".
        case voice(String)
    }
}

/// Thứ gửi được từ khay đính kèm.
enum MediaKind: String, Hashable, CaseIterable, Identifiable {
    case photo, camera, file

    var id: String { rawValue }

    /// Nhãn trên nút ở khay đính kèm.
    var trayLabel: String {
        switch self {
        case .photo: return String(localized: "Ảnh")
        case .camera: return String(localized: "Máy ảnh")
        case .file: return String(localized: "Tệp")
        }
    }

    /// Nhãn in trên bong bóng đã gửi — khác `trayLabel`: "Máy ảnh" là nơi chụp,
    /// còn thứ gửi đi là "Ảnh chụp".
    var bubbleLabel: String {
        switch self {
        case .photo: return String(localized: "Ảnh")
        case .camera: return String(localized: "Ảnh chụp")
        case .file: return String(localized: "Tệp đính kèm")
        }
    }

    var glyph: String {
        switch self {
        case .photo: return "▣"
        case .camera: return "◉"
        case .file: return "▤"
        }
    }
}

/// Metadata một hội thoại — khớp `chatMeta` của prototype.
struct Conversation: Identifiable, Hashable {
    /// Khoá ổn định: "naobo", "lab", "hachi", "vutru", "quan"
    let id: String
    let name: String
    let emoji: String
    let avatarBg: Color
    /// Kênh/nhóm bo 14px; DM bo tròn hoàn toàn
    let isRound: Bool
    let kindLabel: String?
    let kindBg: Color?
    /// "12,4k thành viên · TS. Lan Hương quản trị"
    let sub: String
    /// Kênh phát một chiều — chỉ admin đăng được. Quyết định này server phải enforce (RLS),
    /// không phải chỉ ẩn ô nhập ở client.
    let isBroadcast: Bool
    let time: String
    let unread: Int
}

/// Không có chip "1-1": DM đã nằm sẵn trong "Tất cả", và lọc riêng ra thì được một danh sách
/// gần như không đổi — chip tốn chỗ hơn phần nó lọc được.
enum ConversationFilter: String, CaseIterable, Identifiable {
    case all = "Tất cả"
    case channels = "Kênh"
    case groups = "Nhóm"

    var id: String { rawValue }

    func matches(_ c: Conversation) -> Bool {
        switch self {
        case .all: return true
        case .channels: return c.kindLabel == "KÊNH"
        case .groups: return c.kindLabel == "NHÓM"
        }
    }
}

/// Một mục trong dòng thời gian "Hoạt động gần đây" (màn Hành trình).
struct Projection: Identifiable, Hashable {
    let id = UUID()
    let dot: Color
    let title: String
    let meta: String
}

/// Nội dung được hút về sau khi chiếu sáng (màn Bảng tin).
struct AttractedItem: Identifiable, Hashable {
    let id = UUID()
    /// "Kênh · Khoa học não bộ"
    let source: String
    let sourceColor: Color
    /// 94 → "● khớp 94%"
    let matchPercent: Int
    let title: String
    /// Lý do hút về — nil thì không hiện hộp giải thích
    let reason: String?
    /// Dòng chân: "TS. Lan Hương · 8 phút đọc"
    let footnote: String?
    let hasAvatar: Bool
    let ctaLabel: String?

    /// Xanh khi khớp cao, vàng khi thấp — ngưỡng lấy từ prototype (62% → vàng).
    var matchColor: Color { matchPercent >= 70 ? NodieColors.accent : NodieColors.gold }
}
