import Foundation
import Supabase

/// Hoàn tác lần xoá vừa rồi.
///
/// Rẻ vì xoá là xoá MỀM (xem QAStoreOwnContent.swift): khôi phục chỉ là `deleted_at = null`,
/// không phải dựng lại dữ liệu từ hư không.
///
/// Có `confirmationDialog` rồi vẫn cần thứ này: hộp thoại chặn cú bấm trượt, nhưng không cứu
/// được người bấm "Xoá" xong mới nhận ra mình xoá nhầm bài.
extension QAStore {

    /// Một lần xoá còn hoàn tác được. Giữ luôn HÀNG đã xoá chứ không chỉ id: cache cục bộ đã
    /// gỡ nó rồi, và với reply thì không có đường nào nạp lại một mình nó từ server.
    struct PendingUndo: Identifiable, Equatable {
        enum Target: Equatable {
            case question(QuestionRow, wasSaved: Bool)
            case answer(AnswerRow, questionId: UUID)
            case reply(ReplyRow)
        }

        /// Danh tính riêng từng lần xoá — xoá hai thứ liên tiếp thì banner phải hiện lại từ
        /// đầu (đếm giờ lại), chứ không đứng im vì "vẫn cùng một loại".
        let id = UUID()
        let target: Target
    }

    func undoLastDelete() async {
        guard let undo = pendingUndo else { return }
        // Xoá cờ TRƯỚC: bấm hai lần vào cùng một banner thì lần hai không được gửi lại request.
        pendingUndo = nil

        do {
            switch undo.target {
            case .question(let row, let wasSaved):
                try await client.from("questions")
                    .update(RestoreDeleted()).eq("id", value: row.id).execute()
                if wasSaved { savedQuestionIds.insert(row.id) }
                await loadQuestions()

            case .answer(let row, let questionId):
                try await client.from("answers")
                    .update(RestoreDeleted()).eq("id", value: row.id).execute()
                // Nạp lại cả luồng chứ không chèn tay: xoá câu trả lời đã dọn sạch
                // `repliesByAnswer` của nó, mà thứ tự (Hay nhất → vote → thời gian) do server
                // quyết. Đoán lại ở client là mời sai.
                await loadThread(for: questionId)
                // `loadThread` không đụng tới hàng `questions`, nên `answer_count` cục bộ vẫn
                // đang thiếu 1 từ lúc xoá. Trigger phía server đã đếm lại đúng rồi (0033).
                bumpAnswerCount(questionId, by: 1)

            case .reply(let row):
                try await client.from("answer_replies")
                    .update(RestoreDeleted()).eq("id", value: row.id).execute()
                var list = repliesByAnswer[row.answerId] ?? []
                list.append(row)
                // `loadThread` xếp reply theo created_at tăng dần — chèn lại phải giữ đúng
                // thứ tự đó, không thì reply vừa khôi phục nhảy xuống cuối luồng.
                list.sort { $0.createdAt < $1.createdAt }
                repliesByAnswer[row.answerId] = list
            }
        } catch {
            errorMessage = ErrorText.localized(error)
        }
    }
}

/// `deleted_at = null`.
///
/// Phải tự viết `encode`: bộ mã hoá Swift tự sinh dùng `encodeIfPresent` cho Optional, tức
/// `nil` là BỎ HẲN key khỏi JSON — PostgREST nhận một update rỗng và không đổi gì, im lặng.
/// `encodeNil` mới gửi đúng `{"deleted_at": null}`.
private struct RestoreDeleted: Encodable {
    enum CodingKeys: String, CodingKey { case deletedAt = "deleted_at" }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encodeNil(forKey: .deletedAt)
    }
}
