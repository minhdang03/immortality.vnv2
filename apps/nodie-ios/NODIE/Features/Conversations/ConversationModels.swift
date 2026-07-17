import SwiftUI

/// DTO khớp bảng `channels` / `channel_members` / `messages` (migration 0017).
///
/// Tách hẳn khỏi `Models/Conversation.swift`: struct đó là DTO của prototype — nó gánh
/// `Color`, `emoji`, `isRound`, id kiểu "naobo" — và Bảng tin/Hành trình còn xài. Nhồi field
/// DB vào đó sẽ trộn hai thứ có vòng đời khác nhau. `ChannelRow` chỉ biết những gì DB có;
/// phần trang trí do view suy ra.
///
/// Tái dùng `AuthorRef` + `RelativeTime` + `ErrorText` của QAModels/QAStore (DRY).

/// Một dòng `channels` kèm phần thành viên của CHÍNH MÌNH (join `channel_members`).
struct ChannelRow: Codable, Identifiable, Hashable {
    let id: UUID
    let slug: String?
    let title: String?
    /// public | group | dm | feed
    let kind: String
    let isBroadcast: Bool
    let lastMessageAt: Date?

    /// Mặt mũi kênh (0025). Cả ba nil với DM — avatar DM suy từ tên/uid người kia, không ai
    /// đi chọn emoji cho từng cuộc 1-1.
    let emoji: String?
    let avatarHex: String?
    let badgeHex: String?

    /// Hàng `channel_members` của mình — nil nghĩa là CHƯA tham gia (kênh public đọc được
    /// nhưng chưa join). Quyết định được cả unread lẫn quyền đăng.
    let membership: [Membership]

    struct Membership: Codable, Hashable {
        let role: String
        let lastReadAt: Date
        let mutedUntil: Date?

        enum CodingKeys: String, CodingKey {
            case role
            case lastReadAt = "last_read_at"
            case mutedUntil = "muted_until"
        }
    }

    enum CodingKeys: String, CodingKey {
        case id, slug, title, kind, emoji
        case isBroadcast = "is_broadcast"
        case lastMessageAt = "last_message_at"
        case avatarHex = "avatar_hex"
        case badgeHex = "badge_hex"
        case membership = "channel_members"
    }

    var me: Membership? { membership.first }
    var isMember: Bool { me != nil }
    var isMod: Bool { me?.role == "mod" }

    /// Chỉ mod/admin đăng được vào kênh phát một chiều. RLS `messages_insert` (0017) mới là
    /// thứ chặn thật — chỗ này chỉ để ẩn ô nhập cho khỏi mời người ta gõ rồi báo lỗi.
    var canPost: Bool { isMember && (!isBroadcast || isMod) }

    var isMuted: Bool {
        guard let until = me?.mutedUntil else { return false }
        return until > Date()
    }

    /// Nhãn góc phải dòng danh sách. DM không có nhãn — tên người đã đủ nói nó là gì.
    var kindLabel: String? {
        switch kind {
        case "public": return String(localized: "KÊNH")
        case "group": return String(localized: "NHÓM")
        default: return nil
        }
    }

    var displayTitle: String { title ?? slug ?? String(localized: "Hội thoại") }
    var relativeTime: String { lastMessageAt.map(RelativeTime.format) ?? "" }

    // MARK: - Trang trí (0025 chở dữ liệu, chỗ này chỉ dịch sang kiểu của SwiftUI)

    /// DM bo tròn hoàn toàn, kênh/nhóm bo 14 — tín hiệu thị giác phân biệt NGƯỜI với KHÔNG GIAN.
    var isRound: Bool { kind == "dm" }

    /// Chữ trong avatar. Kênh/nhóm dùng emoji của người tạo; DM không có emoji nên lấy chữ
    /// cái đầu của tên, giống khuôn avatar mặc định của Slack/Google.
    var avatarGlyph: String {
        if let emoji, !emoji.isEmpty { return emoji }
        return displayTitle.first.map { String($0).uppercased() } ?? "?"
    }

    /// Nền avatar. DM không có `avatar_hex` → suy từ `id` để mỗi người một màu ổn định
    /// (cùng người, cùng màu, mọi lần mở app).
    var avatarBg: Color {
        Color(hexString: avatarHex) ?? Self.derivedPalette[abs(id.hashValue) % Self.derivedPalette.count]
    }

    /// Nền badge KÊNH/NHÓM. Nil với DM — DM không có badge.
    var badgeBg: Color? {
        guard kindLabel != nil else { return nil }
        return Color(hexString: badgeHex) ?? NodieColors.inkMuted
    }

    /// Bảng màu dự phòng cho avatar DM. Lấy từ token có sẵn — không đẻ màu mới ngoài hệ thống.
    private static let derivedPalette: [Color] = [
        NodieColors.expertBg, NodieColors.tagBg, NodieColors.bestBg, NodieColors.recBorder,
    ]
}

/// Không có chip "1-1": DM đã nằm sẵn trong "Tất cả", và lọc riêng ra thì được một danh sách
/// gần như không đổi — chip tốn chỗ hơn phần nó lọc được.
///
/// Lọc theo `channels.kind` (dữ liệu) chứ không theo nhãn hiển thị: nhãn là chuỗi đã dịch,
/// so sánh với "KÊNH" thì đổi sang tiếng Anh là bộ lọc câm lặng không khớp gì nữa.
enum ConversationFilter: String, CaseIterable, Identifiable {
    case all = "Tất cả"
    case channels = "Kênh"
    case groups = "Nhóm"

    var id: String { rawValue }

    func matches(_ c: ChannelRow) -> Bool {
        switch self {
        case .all: return true
        case .channels: return c.kind == "public"
        case .groups: return c.kind == "group"
        }
    }
}

/// Ảnh/tệp/thoại đính kèm một tin — nằm trong cột `messages.metadata` (jsonb, có từ 0017).
///
/// DB chỉ giữ ĐƯỜNG DẪN trong bucket `chat-media`, không giữ URL: bucket là private nên URL
/// phải ký lại mỗi lần xem và có hạn dùng — lưu URL vào DB là lưu một thứ hết hạn.
/// Quy ước đường dẫn `{channel_id}/{user_id}/{uuid}.{ext}` là thứ policy Storage (0024)
/// đứng lên để phân quyền, không phải chỉ để sắp file cho gọn.
struct MessageMedia: Codable, Hashable {
    let kind: Kind
    let path: String
    /// Giây — chỉ có ở thoại.
    let duration: Double?

    enum Kind: String, Codable, Hashable {
        case photo, file, voice
    }

    /// "0:07" — định dạng như prototype.
    var durationLabel: String? {
        guard let duration else { return nil }
        let total = Int(duration.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}

/// Bọc `messages.metadata`. Cố tình là struct chứ không `[String: AnyJSON]`: metadata là
/// nơi dễ biến thành bãi rác nhất, có kiểu thì thêm field phải khai ra.
struct MessageMetadata: Codable, Hashable {
    let media: MessageMedia?
}

/// Một dòng `messages`. `userId` nil = tác giả đã xoá tài khoản (FK SET NULL ở 0020/0021).
struct MessageRow: Codable, Identifiable, Hashable {
    let id: UUID
    let channelId: UUID
    let userId: UUID?
    /// Tin này trả lời tin nào (`messages.parent_id`, có từ 0017). Giữ ID chứ không chụp lại
    /// nội dung: sửa/xoá tin gốc thì trích dẫn theo kịp.
    let parentId: UUID?
    let body: String?
    let createdAt: Date
    /// Non-nil = đã sửa. View hiện nhãn "đã sửa" để người đọc biết bản họ thấy không phải bản gốc.
    let editedAt: Date?
    let author: AuthorRef?
    let metadata: MessageMetadata?
    /// Mọi thả của MỌI người trên tin này (`message_reactions`, 0027). Nhúng cả `user_id`
    /// để suy ra được "mình đã thả chưa" mà không cần query thứ hai.
    let reactions: [ReactionRow]?

    struct ReactionRow: Codable, Hashable {
        let kind: String
        let userId: UUID
        enum CodingKeys: String, CodingKey {
            case kind
            case userId = "user_id"
        }
    }

    enum CodingKeys: String, CodingKey {
        case id, body, metadata, author, reactions
        case channelId = "channel_id"
        case userId = "user_id"
        case parentId = "parent_id"
        case createdAt = "created_at"
        case editedAt = "edited_at"
    }

    var media: MessageMedia? { metadata?.media }
    var isEdited: Bool { editedAt != nil }

    /// Đếm theo loại, gồm cả của mình — khớp `count(*)` trên `message_reactions`.
    var reactionCounts: [ReactionKind: Int] {
        (reactions ?? []).reduce(into: [:]) { acc, row in
            guard let kind = ReactionKind(rawValue: row.kind) else { return }
            acc[kind, default: 0] += 1
        }
    }

    /// Loại MÌNH đã thả — tách khỏi `reactionCounts` vì hiển thị khác: đếm để hiện số,
    /// cái này để tô đậm.
    func myReactions(uid: UUID?) -> Set<ReactionKind> {
        guard let uid else { return [] }
        return Set((reactions ?? []).filter { $0.userId == uid }.compactMap { ReactionKind(rawValue: $0.kind) })
    }

    /// Bản sao với danh sách thả khác — cho mutate lạc quan lúc bật/tắt reaction.
    /// Mọi field là `let` nên phải dựng lại; đổi sang `var` thì bất kỳ chỗ nào cũng sửa
    /// được một dòng DB đang nằm trong cache, đó mới là thứ khó lần.
    func replacingReactions(_ rows: [ReactionRow]) -> MessageRow {
        MessageRow(id: id, channelId: channelId, userId: userId, parentId: parentId,
                   body: body, createdAt: createdAt, editedAt: editedAt,
                   author: author, metadata: metadata, reactions: rows)
    }

    var authorName: String { author?.name ?? String(localized: "Ẩn danh") }

    /// Giờ hiển thị trên bong bóng — "14:32". Ngày nằm ở dải phân cách, không lặp vào từng tin.
    var timeLabel: String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "vi_VN")
        f.dateFormat = "HH:mm"
        return f.string(from: createdAt)
    }
}

/// Payload gửi tin. `id` sinh ở CLIENT chứ không để DB tự cấp: bản lạc quan hiện ngay trên màn
/// phải mang đúng id mà server sẽ lưu, nếu không lúc Realtime đẩy chính tin đó về sẽ không
/// nhận ra là trùng và tin bị hiện hai lần.
struct NewMessage: Encodable {
    let id: UUID
    let channelId: UUID
    let userId: UUID
    let body: String
    var parentId: UUID?
    var metadata: MessageMetadata?

    enum CodingKeys: String, CodingKey {
        case id, body, metadata
        case channelId = "channel_id"
        case userId = "user_id"
        case parentId = "parent_id"
    }
}
