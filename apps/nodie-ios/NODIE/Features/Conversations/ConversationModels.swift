import Foundation

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
        case id, slug, title, kind
        case isBroadcast = "is_broadcast"
        case lastMessageAt = "last_message_at"
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
    let body: String?
    let createdAt: Date
    let author: AuthorRef?
    let metadata: MessageMetadata?

    enum CodingKeys: String, CodingKey {
        case id, body, metadata
        case channelId = "channel_id"
        case userId = "user_id"
        case createdAt = "created_at"
        case author
    }

    var media: MessageMedia? { metadata?.media }

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
    var metadata: MessageMetadata?

    enum CodingKeys: String, CodingKey {
        case id, body, metadata
        case channelId = "channel_id"
        case userId = "user_id"
    }
}
