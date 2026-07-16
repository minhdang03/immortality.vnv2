import SwiftUI

/// Một reply trong nhánh dưới câu trả lời — lồng nhiều lớp kiểu X/Reddit.
///
/// `parent == nil` = trả lời thẳng câu trả lời; ngược lại là id của reply cha.
/// Cây được dựng lúc hiển thị (xem `AppState.flatReplies`), không lưu sẵn thứ bậc:
/// server chỉ cần cột `parent_id`, đúng shape của bảng `answer_replies` sau này.
struct AnswerReply: Identifiable, Hashable {
    let id: String
    let parent: String?
    let who: String
    /// Gradient avatar (prototype dùng linear-gradient 135deg)
    let avatarFrom: Color
    let avatarTo: Color
    let time: String
    let text: String
    /// Số hạt ánh sáng seed — người đang xem thả thêm thì cộng ở `AppState.litCount`.
    let litBase: Int
}

struct Answer: Identifiable, Hashable {
    /// Khớp `a.key` của prototype — dùng làm khoá vote.
    let id: String
    let who: String
    /// "· Chuyên gia thần kinh học" hoặc rỗng
    let role: String
    let time: String
    let isBest: Bool
    let votes: Int
    /// Gradient avatar (prototype dùng linear-gradient 135deg)
    let avatarFrom: Color
    let avatarTo: Color
    let text: String
    let litBase: Int
    let replies: [AnswerReply]
}

/// Avatar của người đang dùng app — gradient vàng, dùng cho câu trả lời/reply vừa gửi
/// và cho ô nhập inline. Prototype: linear-gradient(135deg,#ffe6a8,#b8862b).
enum MyAvatar {
    static let from = Color(hex: 0xFFE6A8)
    static let to = Color(hex: 0xB8862B)
}

struct Question: Identifiable, Hashable {
    let id: String
    let tag: String
    let hasExpert: Bool
    let title: String
    /// "3 câu trả lời · 2,1k đã đọc" — chuỗi dựng sẵn (denormalized), không COUNT lúc đọc.
    let meta: String
    let author: String
    let time: String
    let body: String
    let answers: [Answer]

    var answerCount: Int { answers.count }
}

enum QuestionFilter: String, CaseIterable, Identifiable {
    case featured = "Nổi bật"
    case unanswered = "Chưa trả lời"
    case following = "Đang theo"

    var id: String { rawValue }
}
