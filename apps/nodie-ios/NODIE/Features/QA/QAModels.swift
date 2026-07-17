import Foundation

/// DTO khớp bảng `questions`/`answers`/`answer_replies` (migrations 0017 + 0018).
/// Engagement (▲ vote, ☀ lit, "Hay nhất", reply lồng) là ĐƯỢC muốn — Đăng chốt handoff v4 (2026-07-16).
/// Metric ở đây trên NỘI DUNG (câu trả lời/reply), khác "no metrics on people" (hồ sơ).

/// Tác giả nhúng qua `author:profiles(display_name)`.
struct AuthorRef: Codable, Hashable {
    let displayName: String?
    enum CodingKeys: String, CodingKey { case displayName = "display_name" }

    var name: String { (displayName?.isEmpty == false ? displayName : nil) ?? String(localized: "Ẩn danh") }
}

/// Một dòng `questions` (list + detail). `answerCount` denormalized (trigger giữ).
struct QuestionRow: Codable, Identifiable, Hashable {
    let id: UUID
    let title: String
    let body: String?
    let topic: String?
    let answerCount: Int
    let createdAt: Date
    let authorId: UUID?
    let author: AuthorRef?

    enum CodingKeys: String, CodingKey {
        case id, title, body, topic
        case answerCount = "answer_count"
        case createdAt = "created_at"
        case authorId = "author_id"
        case author
    }

    var authorName: String { author?.name ?? String(localized: "Ẩn danh") }
    var relativeTime: String { RelativeTime.format(createdAt) }
    var answerMeta: String { String(localized: "\(answerCount) câu trả lời") }

    /// Hàng giả cho khung xương lúc đang nạp. `.redacted` vẽ thanh xám theo ĐỘ DÀI chữ thật,
    /// nên tiêu đề phải dài ngắn khác nhau — sáu dòng bằng chằn chặn trông như mã vạch,
    /// không giống một danh sách sắp hiện ra.
    ///
    /// KHÔNG dịch: `.redacted` phủ kín trước khi tới mắt ai, và skeleton `.accessibilityHidden`
    /// nên VoiceOver cũng không đọc. Đưa vào catalog dịch là bắt người dịch làm việc vô ích.
    static func placeholder(seed: Int) -> QuestionRow {
        let titles = [
            "Làm sao biết mình đang tiến bộ hay chỉ đang bận rộn?",
            "Thiền buổi sáng có khác buổi tối không?",
            "Khi trí nhớ dài hạn được củng cố lúc ngủ, phần nào của não làm việc đó?",
            "Vì sao càng cố ngủ càng tỉnh?",
            "Có nên tập khi đang mệt?",
            "Ăn chay có ảnh hưởng tới năng lượng tập luyện không?",
        ]
        return QuestionRow(
            id: UUID(), title: titles[seed % titles.count], body: nil, topic: "———",
            answerCount: 0, createdAt: Date(), authorId: nil, author: nil
        )
    }
}

/// Một dòng `answers` — có vote/lit/Hay nhất (đếm denormalized).
/// `authorId` để chặn/báo cáo người viết và lọc nội dung của người đã chặn.
struct AnswerRow: Codable, Identifiable, Hashable {
    let id: UUID
    let body: String
    let createdAt: Date
    let voteCount: Int
    let litCount: Int
    let isBest: Bool
    let authorId: UUID?
    let author: AuthorRef?

    enum CodingKeys: String, CodingKey {
        case id, body
        case createdAt = "created_at"
        case voteCount = "vote_count"
        case litCount = "lit_count"
        case isBest = "is_best"
        case authorId = "author_id"
        case author
    }

    var authorName: String { author?.name ?? String(localized: "Ẩn danh") }
    var relativeTime: String { RelativeTime.format(createdAt) }
    var authorInitial: String { authorName.first.map { String($0).uppercased() } ?? "?" }
}

/// Một dòng `answer_replies` — reply lồng nhiều lớp; `parentId == nil` = trả lời thẳng câu trả lời.
struct ReplyRow: Codable, Identifiable, Hashable {
    let id: UUID
    let answerId: UUID
    let parentId: UUID?
    let body: String
    let litCount: Int
    let createdAt: Date
    let authorId: UUID?
    let author: AuthorRef?

    enum CodingKeys: String, CodingKey {
        case id
        case answerId = "answer_id"
        case parentId = "parent_id"
        case body
        case litCount = "lit_count"
        case createdAt = "created_at"
        case authorId = "author_id"
        case author
    }

    var authorName: String { author?.name ?? String(localized: "Ẩn danh") }
    var relativeTime: String { RelativeTime.format(createdAt) }
    var authorInitial: String { authorName.first.map { String($0).uppercased() } ?? "?" }
}

/// Câu trả lời của MÌNH kèm tiêu đề câu hỏi gốc — màn "Trả lời của tôi".
///
/// Không tái dùng `AnswerRow`: ở đây không cần tác giả (biết rồi — là mình), nhưng cần
/// `questionId` + tiêu đề để mở lại câu hỏi. Nhét hai nhu cầu vào một struct thì mỗi lần
/// đọc thread lại phải kéo theo join `questions`.
struct MyAnswerRow: Codable, Identifiable, Hashable {
    let id: UUID
    let body: String
    let createdAt: Date
    let litCount: Int
    let isBest: Bool
    let questionId: UUID
    let question: QuestionTitleRef?

    enum CodingKeys: String, CodingKey {
        case id, body
        case createdAt = "created_at"
        case litCount = "lit_count"
        case isBest = "is_best"
        case questionId = "question_id"
        case question
    }

    var questionTitle: String { question?.title ?? String(localized: "Câu hỏi đã bị xoá") }
    var relativeTime: String { RelativeTime.format(createdAt) }
    /// Câu hỏi gốc đã biến mất (xoá/không đọc được) → đừng cho bấm vào chỗ trống.
    var isOrphaned: Bool { question == nil }
}

/// Tiêu đề + tác giả câu hỏi, nhúng qua `question:questions(title,author_id)`.
/// Có `authorId` để lọc nội dung của người đã chặn — thiếu nó thì màn "Trả lời của tôi"
/// vẫn hiện tiêu đề của người mình đã chặn.
struct QuestionTitleRef: Codable, Hashable {
    let title: String
    let authorId: UUID?

    enum CodingKeys: String, CodingKey {
        case title
        case authorId = "author_id"
    }
}

// MARK: - Payload ghi

struct NewQuestion: Encodable {
    let authorId: UUID
    let title: String
    let body: String?
    let topic: String?
    enum CodingKeys: String, CodingKey {
        case authorId = "author_id"
        case title, body, topic
    }
}

struct NewAnswer: Encodable {
    let questionId: UUID
    let authorId: UUID
    let body: String
    enum CodingKeys: String, CodingKey {
        case questionId = "question_id"
        case authorId = "author_id"
        case body
    }
}

struct NewReply: Encodable {
    let answerId: UUID
    let parentId: UUID?
    let authorId: UUID
    let body: String
    enum CodingKeys: String, CodingKey {
        case answerId = "answer_id"
        case parentId = "parent_id"
        case authorId = "author_id"
        case body
    }
}

/// Payload toggle reaction (▲ vote / ☀ lit) trên answer hoặc reply.
struct NewReaction: Encodable {
    let userId: UUID
    let targetType: String   // "answer" | "reply"
    let targetId: UUID
    let kind: String         // "vote" | "lit"
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case targetType = "target_type"
        case targetId = "target_id"
        case kind
    }
}

/// Một node reply đã làm phẳng kèm độ sâu — để render cây lồng nhiều lớp.
struct FlatReply: Identifiable {
    let reply: ReplyRow
    let depth: Int
    var id: UUID { reply.id }
}

/// Định dạng thời gian tương đối — dùng chung Q&A + chat.
/// Chuỗi qua String Catalog (kèm số nhiều cho en/ru/…); ngày cũ theo locale hệ thống.
enum RelativeTime {
    static func format(_ date: Date) -> String {
        let secs = Date().timeIntervalSince(date)
        if secs < 60 { return String(localized: "vừa xong") }
        if secs < 3600 { return String(localized: "\(Int(secs / 60)) phút trước") }
        if secs < 86_400 { return String(localized: "\(Int(secs / 3600)) giờ trước") }
        if secs < 604_800 { return String(localized: "\(Int(secs / 86_400)) ngày trước") }
        let f = DateFormatter()
        f.locale = Locale.current
        f.setLocalizedDateFormatFromTemplate("d MMM")
        return f.string(from: date)
    }
}
