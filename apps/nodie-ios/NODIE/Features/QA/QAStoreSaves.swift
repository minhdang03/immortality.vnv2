import Foundation
import Supabase

/// "Đã lưu" — đánh dấu câu hỏi để đọc lại (bảng `question_saves`, migration 0022).
///
/// Nằm trên QAStore vì lưu là thao tác TRÊN câu hỏi: nút bấm ở màn chi tiết, và màn
/// "Đã lưu" mở lại đúng màn chi tiết đó. Store riêng sẽ phải soi gương cache câu hỏi.
///
/// Riêng tư: RLS chỉ trả hàng của mình, không đếm, không lộ cho ai — khác ▲/☀ (công khai).
extension QAStore {

    /// RLS `question_saves_self` chỉ trả hàng của mình — không cần eq(user_id).
    func loadSaves() async {
        struct Row: Decodable { let question_id: UUID }
        do {
            let rows: [Row] = try await client.from("question_saves")
                .select("question_id").execute().value
            savedQuestionIds = Set(rows.map(\.question_id))
        } catch { /* thiếu danh sách lưu không được làm sập màn chi tiết — refresh sau nạp lại */ }
    }

    func isSaved(_ questionId: UUID) -> Bool { savedQuestionIds.contains(questionId) }

    /// Đổi set TRƯỚC rồi mới gọi mạng: nút phải sáng/tắt ngay dưới ngón tay.
    /// Lỗi thì trả về trạng thái cũ — không để nút nói dối.
    func toggleSave(_ questionId: UUID) async {
        guard let uid = currentUserId else {
            errorMessage = String(localized: "Cần đăng nhập.")
            return
        }
        // Nhát bấm thứ hai lúc nhát đầu chưa về thì bỏ qua, không xếp hàng đảo trạng thái.
        guard !savesInFlight.contains(questionId) else { return }
        savesInFlight.insert(questionId)
        defer { savesInFlight.remove(questionId) }

        let wasSaved = savedQuestionIds.contains(questionId)
        if wasSaved { savedQuestionIds.remove(questionId) } else { savedQuestionIds.insert(questionId) }

        struct NewSave: Encodable {
            let userId: UUID
            let questionId: UUID
            enum CodingKeys: String, CodingKey {
                case userId = "user_id"
                case questionId = "question_id"
            }
        }
        do {
            if wasSaved {
                try await client.from("question_saves").delete()
                    .eq("user_id", value: uid).eq("question_id", value: questionId)
                    .execute()
            } else {
                try await client.from("question_saves")
                    .insert(NewSave(userId: uid, questionId: questionId))
                    .execute()
            }
        } catch {
            if wasSaved { savedQuestionIds.insert(questionId) } else { savedQuestionIds.remove(questionId) }
            errorMessage = ErrorText.localized(error)
        }
    }

    /// Câu hỏi đã lưu, mới lưu nhất trước.
    ///
    /// Nhúng `question:questions(...)` thay vì lấy id rồi query lần hai: một round-trip,
    /// và thứ tự "mới lưu nhất" nằm ở `question_saves.created_at` chứ không phải ở câu hỏi.
    /// Nội dung của người đã chặn lọc luôn tại đây — cùng luật với danh sách Hỏi đáp.
    /// `nil` = hỏng (mạng/chưa đăng nhập), `[]` = thật sự chưa lưu câu nào. Gộp hai thứ này
    /// làm một thì màn kéo-làm-mới lúc rớt mạng sẽ thay danh sách bằng "chưa lưu câu hỏi nào" —
    /// app nói dối người ta ngay cạnh cái alert báo lỗi.
    func savedQuestions() async -> [QuestionRow]? {
        struct Row: Decodable { let question: QuestionRow? }
        do {
            let rows: [Row] = try await client.from("question_saves")
                .select("created_at, question:questions(\(Self.questionSelect))")
                .order("created_at", ascending: false)
                .execute().value
            let all = rows.compactMap(\.question)
            // Set dựng TRƯỚC khi lọc chặn: nó phản ánh cái gì đang nằm trong bảng, không
            // phải cái gì đang hiện ra. Dựng sau thì câu đã lưu của người bị chặn biến khỏi
            // set, và nút lưu ở màn chi tiết sẽ tưởng là chưa lưu → INSERT trùng khoá chính.
            savedQuestionIds = Set(all.map(\.id))
            let questions = all.filter { !isBlocked($0.authorId) }
            cache(questions)
            return questions
        } catch {
            errorMessage = ErrorText.localized(error)
            return nil
        }
    }

    /// Câu hỏi mình đã đặt, mới nhất trước. `nil` = hỏng — xem ghi chú ở `savedQuestions`.
    func myQuestions() async -> [QuestionRow]? {
        // Chưa đăng nhập cũng là hỏng, không phải "chưa hỏi câu nào". Trả `[]` ở đây là
        // xoá trắng danh sách mà không một lời báo — im lặng còn tệ hơn báo lỗi.
        guard let uid = currentUserId else { return nil }
        do {
            let rows: [QuestionRow] = try await client.from("questions")
                .select(Self.questionSelect)
                .eq("author_id", value: uid)
                .order("created_at", ascending: false)
                .execute().value
            cache(rows)
            return rows
        } catch {
            errorMessage = ErrorText.localized(error)
            return nil
        }
    }

    /// Câu trả lời mình đã viết + tiêu đề câu hỏi của nó (để biết đang trả lời cho cái gì).
    ///
    /// Câu trả lời là của mình nên không cần lọc tác giả CỦA NÓ — nhưng CÂU HỎI thì của người
    /// khác: chặn ai rồi thì tiêu đề của họ cũng không được hiện ở đây.
    /// `nil` = hỏng — xem ghi chú ở `savedQuestions`.
    func myAnswers() async -> [MyAnswerRow]? {
        guard let uid = currentUserId else { return nil }
        do {
            let rows: [MyAnswerRow] = try await client.from("answers")
                .select("id, body, created_at, lit_count, is_best, question_id, question:questions(title,author_id)")
                .eq("author_id", value: uid)
                .order("created_at", ascending: false)
                .execute().value
            return rows.filter { !isBlocked($0.question?.authorId) }
        } catch {
            errorMessage = ErrorText.localized(error)
            return nil
        }
    }
}
