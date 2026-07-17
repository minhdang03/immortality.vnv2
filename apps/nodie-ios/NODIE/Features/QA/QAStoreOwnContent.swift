import Foundation
import Supabase

/// Sửa/xoá nội dung của CHÍNH MÌNH. Tách khỏi QAStore.swift (đã gần 400 dòng) theo đúng
/// pattern QAStoreSaves.swift/QAStoreModeration.swift.
///
/// RLS sửa/xoá có sẵn từ 0017+0018+0019: `questions_update_own`/`answers_update_own`/
/// `answer_replies_update_own` (author_id = mình).
///
/// ⚠️ Policy ĐỌC không còn tự lọc hàng đã xoá nữa. Trước 0034 nó là `deleted_at is null or
/// is_admin()`, và chính vế đó làm xoá mềm BẤT KHẢ THI với người thường: hàng mới có
/// `deleted_at` không lọt qua policy đọc của chính người vừa xoá → Postgres bác cả lệnh update
/// (42501). 0034 nới ra `or author_id = auth.uid()` để lệnh đi qua được, đổi lại **mọi select
/// phải tự lọc `.is("deleted_at", value: nil)`** — xem QAStore/QAStoreSaves.
///
/// Xoá là xoá MỀM (`deleted_at = now()`), không DELETE thật: `answer_replies.answer_id` có
/// `on delete cascade` — xoá cứng một câu trả lời sẽ cuốn theo reply của NGƯỜI KHÁC nằm dưới
/// nó. Xoá bài mình không được phép xoá lời người ta.
extension QAStore {

    // MARK: - Sửa

    /// `body` rỗng sau trim → gửi `nil` (câu hỏi vốn không bắt buộc có thân).
    /// `title` rỗng sau trim → không gửi gì, coi như không sửa.
    @discardableResult
    func editQuestion(id: UUID, title: String, body: String?) async -> Bool {
        let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty, let current = questionsById[id] else { return false }
        let cleanBody = body?.trimmingCharacters(in: .whitespacesAndNewlines).nilIfEmpty
        let editedAt = Date()
        do {
            try await client.from("questions")
                .update(EditQuestion(title: t, body: cleanBody, editedAt: editedAt))
                .eq("id", value: id).execute()
            let updated = QuestionRow(id: current.id, title: t, body: cleanBody, topic: current.topic,
                                      answerCount: current.answerCount, createdAt: current.createdAt,
                                      authorId: current.authorId, author: current.author, editedAt: editedAt)
            questionsById[id] = updated
            if let i = questions.firstIndex(where: { $0.id == id }) { questions[i] = updated }
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    @discardableResult
    func editAnswer(id: UUID, questionId: UUID, body: String) async -> Bool {
        let clean = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty, let list = answersByQuestion[questionId],
              let i = list.firstIndex(where: { $0.id == id }) else { return false }
        let editedAt = Date()
        do {
            try await client.from("answers")
                .update(EditBody(body: clean, editedAt: editedAt))
                .eq("id", value: id).execute()
            let old = list[i]
            answersByQuestion[questionId]?[i] = AnswerRow(
                id: old.id, body: clean, createdAt: old.createdAt, voteCount: old.voteCount,
                litCount: old.litCount, isBest: old.isBest, authorId: old.authorId,
                author: old.author, editedAt: editedAt
            )
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    @discardableResult
    func editReply(id: UUID, answerId: UUID, body: String) async -> Bool {
        let clean = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty, let list = repliesByAnswer[answerId],
              let i = list.firstIndex(where: { $0.id == id }) else { return false }
        let editedAt = Date()
        do {
            try await client.from("answer_replies")
                .update(EditBody(body: clean, editedAt: editedAt))
                .eq("id", value: id).execute()
            let old = list[i]
            repliesByAnswer[answerId]?[i] = ReplyRow(
                id: old.id, answerId: old.answerId, parentId: old.parentId, body: clean,
                litCount: old.litCount, createdAt: old.createdAt, authorId: old.authorId,
                author: old.author, editedAt: editedAt
            )
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    // MARK: - Xoá mềm

    /// Gỡ luôn khỏi `savedQuestionIds`: câu đã xoá không còn gì để "đọc lại sau".
    /// Giữ lại hàng vừa gỡ để `undoLastDelete()` khôi phục được (xem QAStoreUndo.swift).
    @discardableResult
    func deleteQuestion(id: UUID) async -> Bool {
        guard let row = questionsById[id] else { return false }
        let wasSaved = savedQuestionIds.contains(id)
        do {
            try await client.from("questions")
                .update(SoftDelete(deletedAt: Date()))
                .eq("id", value: id).execute()
            questions.removeAll { $0.id == id }
            questionsById[id] = nil
            savedQuestionIds.remove(id)
            pendingUndo = PendingUndo(target: .question(row, wasSaved: wasSaved))
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    /// Nhích `answer_count` cục bộ ngay (-1) cho người vừa xoá thấy số đúng mà không phải
    /// chờ nạp lại. Phía server `trg_answers_count` (0033) đã đếm lại theo `deleted_at`
    /// trên cả UPDATE, nên đây thuần tuý là bù cho cache — không phải vá cho DB.
    @discardableResult
    func deleteAnswer(id: UUID, questionId: UUID) async -> Bool {
        guard let row = answersByQuestion[questionId]?.first(where: { $0.id == id }) else { return false }
        do {
            try await client.from("answers")
                .update(SoftDelete(deletedAt: Date()))
                .eq("id", value: id).execute()
            answersByQuestion[questionId]?.removeAll { $0.id == id }
            repliesByAnswer[id] = nil
            bumpAnswerCount(questionId, by: -1)
            pendingUndo = PendingUndo(target: .answer(row, questionId: questionId))
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    @discardableResult
    func deleteReply(id: UUID, answerId: UUID) async -> Bool {
        guard let row = repliesByAnswer[answerId]?.first(where: { $0.id == id }) else { return false }
        do {
            try await client.from("answer_replies")
                .update(SoftDelete(deletedAt: Date()))
                .eq("id", value: id).execute()
            repliesByAnswer[answerId]?.removeAll { $0.id == id }
            pendingUndo = PendingUndo(target: .reply(row))
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }
}
