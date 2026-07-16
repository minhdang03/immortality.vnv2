import SwiftUI

/// Một người trong cộng đồng — dòng trong màn Bạn bè.
struct Person: Identifiable, Hashable {
    let id: String
    let name: String
    let emoji: String
    /// Nền avatar ở danh sách (phẳng). Hồ sơ đầy đủ dùng gradient riêng — xem `Member`.
    let bg: Color
    /// "Cùng Lab trường thọ #3", "Theo dõi lẫn nhau"…
    let sub: String
}

/// Hồ sơ đầy đủ của một thành viên khác.
///
/// Tách khỏi `Person` vì hai thứ dùng ở hai chỗ khác nhau: `Person` là một dòng trong danh sách,
/// `Member` là cả màn hồ sơ. Nhập làm một thì mỗi lần vẽ danh sách phải kéo theo bio/stats/posts.
struct Member: Identifiable, Hashable {
    let id: String
    let name: String
    let emoji: String
    /// Gradient avatar 135° — [từ, tới].
    let gradient: [Color]
    let verified: Bool
    /// "Chuyên gia thần kinh học · cấp 9"
    let level: String
    /// "Tham gia 02.2025 · quản trị kênh Khoa học não bộ"
    let join: String
    let bio: String
    let stats: [Stat]
    let fields: [FieldChip]
    let posts: [Post]

    struct Stat: Hashable, Identifiable {
        let value: String
        let label: String
        var id: String { label }
    }

    struct FieldChip: Hashable, Identifiable {
        let label: String
        let bg: Color
        let fg: Color
        var id: String { label }
    }

    struct Post: Hashable, Identifiable {
        let title: String
        /// "214 ☀ · 2 giờ trước"
        let meta: String
        var id: String { title }
    }
}
