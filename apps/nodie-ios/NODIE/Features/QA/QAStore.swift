import Foundation
import Supabase

/// Nguồn dữ liệu Hỏi đáp — đọc/ghi Supabase qua RLS (0017 + 0018).
/// Engagement (▲ vote ☀ lit / Hay nhất / reply lồng) chạy thật trên Supabase (handoff v4).
/// Tách khỏi `AppState` (còn chạy prototype cho Bảng tin/Hành trình) để wire độc lập.
@Observable
final class QAStore {
    /// Không `private(set)`: QAStoreOwnContent.swift (sửa/xoá nội dung của mình, file khác)
    /// phải viết/xoá thẳng vào cache khi lưu thành công — cùng lý do với `savedQuestionIds`.
    var questions: [QuestionRow] = []
    private(set) var isLoading = false
    /// Không `private(set)` như mấy cái dưới: `private` trong Swift bó theo FILE, mà
    /// QAStoreModeration.swift (report/block ở file khác) cũng phải báo lỗi qua đây.
    /// Cùng lý do với `blockedUserIds`. View chỉ đọc + gọi `clearError()`.
    var errorMessage: String?

    /// Không `private(set)` — cùng lý do với `questions`: QAStoreOwnContent.swift cần gỡ/thay
    /// hàng sau khi sửa/xoá thành công, không đợi round-trip refetch.
    var answersByQuestion: [UUID: [AnswerRow]] = [:]
    var repliesByAnswer: [UUID: [ReplyRow]] = [:]

    /// Mọi câu hỏi ĐÃ THẤY, khoá theo id — kể cả câu không nằm trong `questions`.
    /// Màn Đã lưu / Câu hỏi của tôi mở được câu cũ hơn 50 câu mới nhất, mà nhét chúng vào
    /// `questions` thì danh sách Hỏi đáp mọc thêm bài không thuộc về nó. Chi tiết đọc ở đây.
    var questionsById: [UUID: QuestionRow] = [:]

    /// Câu hỏi MÌNH đã lưu. Đổi trong QAStoreSaves (file khác) nên không `private(set)` —
    /// cùng lý do với `blockedUserIds`.
    var savedQuestionIds: Set<UUID> = []

    /// Câu đang có lệnh lưu/bỏ lưu bay trên đường. Bấm nhanh hai nhát mà không chặn thì
    /// INSERT và DELETE đua nhau trên server, kết quả cuối tuỳ cái nào về sau — UI nói một
    /// đằng, DB một nẻo.
    var savesInFlight: Set<UUID> = []

    /// Reaction CỦA MÌNH (id mục → đã tương tác). id UUID không đụng nhau giữa answer/reply.
    private(set) var votedAnswers: Set<UUID> = []
    private(set) var litItems: Set<UUID> = []

    /// Người MÌNH đã chặn — nội dung của họ bị lọc khỏi mọi accessor bên dưới.
    /// Nạp cùng loadQuestions; đổi trong QAStoreModeration (block/unblock).
    var blockedUserIds: Set<UUID> = []

    /// Lần xoá vừa rồi, còn hoàn tác được. Ghi ở QAStoreOwnContent, đọc ở QAStoreUndo,
    /// hiện ra bằng banner gắn ở RootTabView (gốc cây — xoá câu hỏi xong là màn chi tiết
    /// bị pop, banner đặt trong màn đó sẽ chết theo trước khi ai kịp đọc).
    var pendingUndo: PendingUndo?

    let client = SupabaseClientProvider.shared

    /// Không `private`: QAStoreSaves.swift (file khác) dựng cùng shape QuestionRow —
    /// `private` bó theo FILE nên nó sẽ không thấy. Hai bản select lệch nhau là decode nổ.
    static let questionSelect = "id,title,body,topic,answer_count,created_at,author_id,author:public_profiles(display_name),edited_at"
    private static let answerSelect   = "id,body,created_at,vote_count,lit_count,is_best,author_id,author:public_profiles(display_name),edited_at"
    private static let replySelect    = "id,answer_id,parent_id,body,lit_count,created_at,author_id,author:public_profiles(display_name),edited_at"

    private var uid: UUID? { client.auth.currentUser?.id }
    /// User hiện tại — view dùng để biết có được chọn "Hay nhất" (tác giả câu hỏi) không.
    var currentUserId: UUID? { uid }

    // MARK: - Đọc

    func loadQuestions(limit: Int = 50) async {
        isLoading = true; errorMessage = nil
        // Danh sách chặn phải có TRƯỚC khi lọc — sai thứ tự là flash nội dung đã chặn.
        await loadBlockedIds()
        do {
            let rows: [QuestionRow] = try await client.from("questions")
                .select(Self.questionSelect)
                // Lọc ở client vì RLS KHÔNG còn tự lo: 0034 buộc phải cho tác giả đọc lại
                // hàng đã xoá của chính mình (không thì Postgres bác luôn lệnh xoá mềm).
                // Bỏ dòng này là người ta thấy lại bài mình vừa xoá.
                .is("deleted_at", value: nil)
                .order("created_at", ascending: false).limit(limit)
                .execute().value
            questions = rows.filter { !isBlocked($0.authorId) }
            cache(questions)
        } catch { errorMessage = ErrorText.localized(error) }
        isLoading = false
    }

    /// Ghi vào cache theo id — gọi ở MỌI nơi nhận QuestionRow về, để màn chi tiết mở được
    /// dù câu hỏi đến từ danh sách nào.
    func cache(_ rows: [QuestionRow]) {
        for row in rows { questionsById[row.id] = row }
    }

    /// Câu hỏi theo id, không quan tâm nó đến từ danh sách nào.
    /// Lọc người đã chặn NGAY TẠI ĐÂY — cùng luật với `answers(for:)`/`replies(for:)`:
    /// cache giữ nguyên hàng (bỏ chặn là thấy lại), chỉ accessor từ chối trả.
    func question(id: UUID) -> QuestionRow? {
        guard let row = questionsById[id], !isBlocked(row.authorId) else { return nil }
        return row
    }

    /// Nạp một câu hỏi lẻ — màn chi tiết mở từ Đã lưu / Câu hỏi của tôi khi cache chưa có.
    func loadQuestion(id: UUID) async {
        guard questionsById[id] == nil else { return }
        do {
            let row: QuestionRow = try await client.from("questions")
                .select(Self.questionSelect).eq("id", value: id)
                .is("deleted_at", value: nil)       // xem ghi chú ở loadQuestions
                .single()
                .execute().value
            cache([row])
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Nạp câu trả lời + reply + reaction của mình cho một câu hỏi (ít round-trip nhất có thể).
    func loadThread(for questionId: UUID) async {
        do {
            let answers: [AnswerRow] = try await client.from("answers")
                .select(Self.answerSelect)
                .eq("question_id", value: questionId)
                .is("deleted_at", value: nil)            // xem ghi chú ở loadQuestions
                .order("is_best", ascending: false)      // Hay nhất lên đầu
                .order("vote_count", ascending: false)
                .order("created_at", ascending: true)
                .execute().value
            answersByQuestion[questionId] = answers

            let answerIds = answers.map(\.id)
            guard !answerIds.isEmpty else { return }

            let replies: [ReplyRow] = try await client.from("answer_replies")
                .select(Self.replySelect)
                .in("answer_id", values: answerIds)
                .is("deleted_at", value: nil)       // xem ghi chú ở loadQuestions
                .order("created_at", ascending: true)
                .execute().value
            for a in answers { repliesByAnswer[a.id] = replies.filter { $0.answerId == a.id } }

            await loadMyReactions(answerIds: answerIds, replyIds: replies.map(\.id))
        } catch { errorMessage = ErrorText.localized(error) }
    }

    /// Reaction của mình — RLS chỉ trả về hàng của user hiện tại.
    private func loadMyReactions(answerIds: [UUID], replyIds: [UUID]) async {
        struct Reaction: Decodable { let target_id: UUID; let kind: String }
        let ids = answerIds + replyIds
        guard !ids.isEmpty else { return }
        do {
            let rows: [Reaction] = try await client.from("answer_reactions")
                .select("target_id,kind").in("target_id", values: ids)
                .execute().value
            votedAnswers = Set(rows.filter { $0.kind == "vote" }.map(\.target_id))
            litItems = Set(rows.filter { $0.kind == "lit" }.map(\.target_id))
        } catch { /* đếm vẫn đúng từ cột denormalized; chỉ mất trạng thái "đã tương tác" */ }
    }

    /// Nội dung của người đã chặn lọc ở accessor (không xoá khỏi cache):
    /// bỏ chặn xong chỉ cần refetch nhẹ, không phải dựng lại state.
    func answers(for questionId: UUID) -> [AnswerRow] {
        (answersByQuestion[questionId] ?? []).filter { !isBlocked($0.authorId) }
    }
    func replies(for answerId: UUID) -> [ReplyRow] {
        (repliesByAnswer[answerId] ?? []).filter { !isBlocked($0.authorId) }
    }

    func isBlocked(_ authorId: UUID?) -> Bool {
        authorId.map(blockedUserIds.contains) ?? false
    }

    /// Tác giả có phải chính mình không — dùng ở ModerationMenu (Sửa/Xoá vs Báo cáo/Chặn)
    /// và QAStoreOwnContent để một luật không lặp lại ở nhiều nơi.
    func isMine(_ authorId: UUID?) -> Bool {
        authorId != nil && authorId == currentUserId
    }

    /// QAStoreModeration gọi sau khi chặn — `questions` là private(set) nên việc xoá
    /// khỏi cache hiển thị phải đi qua đây.
    func removeQuestions(by authorId: UUID) {
        questions.removeAll { $0.authorId == authorId }
    }

    /// Làm phẳng cây reply kèm độ sâu (DFS: cha rồi tới con).
    func flatReplies(for answerId: UUID) -> [FlatReply] {
        let all = replies(for: answerId)
        var childrenOf: [UUID?: [ReplyRow]] = [:]
        for r in all { childrenOf[r.parentId, default: []].append(r) }
        var out: [FlatReply] = []
        func walk(_ parent: UUID?, _ depth: Int) {
            for r in (childrenOf[parent] ?? []) {
                out.append(FlatReply(reply: r, depth: depth))
                walk(r.id, depth + 1)
            }
        }
        walk(nil, 0)
        return out
    }

    // MARK: - Ghi: câu hỏi / trả lời / reply

    @discardableResult
    func createQuestion(title: String, body: String?, topic: String?) async -> QuestionRow? {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return nil }
        let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return nil }
        do {
            let payload = NewQuestion(authorId: uid, title: t,
                                      body: body?.trimmingCharacters(in: .whitespacesAndNewlines).nilIfEmpty,
                                      topic: topic?.trimmingCharacters(in: .whitespacesAndNewlines).nilIfEmpty)
            let row: QuestionRow = try await client.from("questions")
                .insert(payload).select(Self.questionSelect).single().execute().value
            questions.insert(row, at: 0)
            cache([row])
            AppEventLogger.log(kind: "post_question")
            return row
        } catch { errorMessage = ErrorText.localized(error); return nil }
    }

    /// Trả `true` khi server đã nhận. Caller cần biết để quyết định có xoá ô soạn hay không —
    /// nuốt chữ của người ta rồi mới báo lỗi là cú lừa. Giống `createQuestion` trả `QuestionRow?`.
    @discardableResult
    func createAnswer(questionId: UUID, body: String) async -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }
        let clean = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return false }
        do {
            let row: AnswerRow = try await client.from("answers")
                .insert(NewAnswer(questionId: questionId, authorId: uid, body: clean))
                .select(Self.answerSelect).single().execute().value
            answersByQuestion[questionId, default: []].append(row)
            bumpAnswerCount(questionId, by: 1)
            AppEventLogger.log(kind: "post_answer")
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    /// Trả `true` khi server đã nhận — xem ghi chú ở `createAnswer`.
    @discardableResult
    func createReply(answerId: UUID, parentId: UUID?, body: String) async -> Bool {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return false }
        let clean = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return false }
        do {
            let row: ReplyRow = try await client.from("answer_replies")
                .insert(NewReply(answerId: answerId, parentId: parentId, authorId: uid, body: clean))
                .select(Self.replySelect).single().execute().value
            repliesByAnswer[answerId, default: []].append(row)
            return true
        } catch { errorMessage = ErrorText.localized(error); return false }
    }

    // MARK: - Reaction ▲ vote / ☀ lit

    func toggleVote(answerId: UUID, questionId: UUID) async {
        await toggleReaction(targetId: answerId, targetType: "answer", kind: "vote",
                             set: \.votedAnswers) { [weak self] delta in
            self?.mutateAnswer(answerId, in: questionId) { $0.withVote(delta) }
        }
    }

    func toggleLitAnswer(_ answerId: UUID, questionId: UUID) async {
        await toggleReaction(targetId: answerId, targetType: "answer", kind: "lit",
                             set: \.litItems) { [weak self] delta in
            self?.mutateAnswer(answerId, in: questionId) { $0.withLit(delta) }
        }
    }

    func toggleLitReply(_ replyId: UUID, answerId: UUID) async {
        await toggleReaction(targetId: replyId, targetType: "reply", kind: "lit",
                             set: \.litItems) { [weak self] delta in
            self?.mutateReply(replyId, in: answerId) { $0.withLit(delta) }
        }
    }

    func hasVoted(_ answerId: UUID) -> Bool { votedAnswers.contains(answerId) }
    func hasLit(_ id: UUID) -> Bool { litItems.contains(id) }

    /// Chọn "Hay nhất" — RPC kiểm tra caller là tác giả câu hỏi.
    func setBest(answerId: UUID, questionId: UUID) async {
        do {
            try await client.rpc("set_best_answer", params: ["p_answer_id": answerId.uuidString]).execute()
            // Cập nhật cục bộ: đúng 1 câu là Hay nhất.
            answersByQuestion[questionId] = answersByQuestion[questionId]?.map { $0.settingBest($0.id == answerId) }
        } catch { errorMessage = ErrorText.localized(error) }
    }

    // MARK: - Riêng tư

    private func toggleReaction(targetId: UUID, targetType: String, kind: String,
                                set keyPath: ReferenceWritableKeyPath<QAStore, Set<UUID>>,
                                applyDelta: @escaping (Int) -> Void) async {
        guard let uid else { errorMessage = String(localized: "Cần đăng nhập."); return }
        let active = self[keyPath: keyPath].contains(targetId)
        do {
            if active {
                try await client.from("answer_reactions").delete()
                    .eq("user_id", value: uid).eq("target_type", value: targetType)
                    .eq("target_id", value: targetId).eq("kind", value: kind).execute()
                self[keyPath: keyPath].remove(targetId); applyDelta(-1)
            } else {
                try await client.from("answer_reactions")
                    .insert(NewReaction(userId: uid, targetType: targetType, targetId: targetId, kind: kind))
                    .execute()
                self[keyPath: keyPath].insert(targetId); applyDelta(1)
            }
        } catch { errorMessage = ErrorText.localized(error) }
    }

    private func mutateAnswer(_ id: UUID, in questionId: UUID, _ transform: (AnswerRow) -> AnswerRow) {
        guard var list = answersByQuestion[questionId], let i = list.firstIndex(where: { $0.id == id }) else { return }
        list[i] = transform(list[i]); answersByQuestion[questionId] = list
    }

    private func mutateReply(_ id: UUID, in answerId: UUID, _ transform: (ReplyRow) -> ReplyRow) {
        guard var list = repliesByAnswer[answerId], let i = list.firstIndex(where: { $0.id == id }) else { return }
        list[i] = transform(list[i]); repliesByAnswer[answerId] = list
    }

    /// Đếm sống ở hai chỗ (danh sách + cache theo id) nên phải nhích cả hai:
    /// trả lời xong quay ra danh sách mà số không đổi thì trông như mất bài.
    ///
    /// Không `private`: QAStoreOwnContent.swift gọi khi xoá mềm một câu trả lời để số hiện
    /// đúng ngay (không đợi migration đếm lại phía server — xem ghi chú ở đó).
    func bumpAnswerCount(_ questionId: UUID, by delta: Int) {
        func bumped(_ q: QuestionRow) -> QuestionRow {
            QuestionRow(id: q.id, title: q.title, body: q.body, topic: q.topic,
                        answerCount: max(q.answerCount + delta, 0), createdAt: q.createdAt,
                        authorId: q.authorId, author: q.author, editedAt: q.editedAt)
        }
        if let i = questions.firstIndex(where: { $0.id == questionId }) {
            questions[i] = bumped(questions[i])
        }
        if let cached = questionsById[questionId] {
            questionsById[questionId] = bumped(cached)
        }
    }

    func clearError() { errorMessage = nil }
}

// Cập nhật cục bộ (struct immutable → tạo bản mới) cho phản hồi tức thì.
private extension AnswerRow {
    func withVote(_ d: Int) -> AnswerRow {
        AnswerRow(id: id, body: body, createdAt: createdAt, voteCount: max(voteCount + d, 0),
                  litCount: litCount, isBest: isBest, authorId: authorId, author: author, editedAt: editedAt)
    }
    func withLit(_ d: Int) -> AnswerRow {
        AnswerRow(id: id, body: body, createdAt: createdAt, voteCount: voteCount,
                  litCount: max(litCount + d, 0), isBest: isBest, authorId: authorId, author: author, editedAt: editedAt)
    }
    func settingBest(_ v: Bool) -> AnswerRow {
        AnswerRow(id: id, body: body, createdAt: createdAt, voteCount: voteCount,
                  litCount: litCount, isBest: v, authorId: authorId, author: author, editedAt: editedAt)
    }
}

private extension ReplyRow {
    func withLit(_ d: Int) -> ReplyRow {
        ReplyRow(id: id, answerId: answerId, parentId: parentId, body: body,
                 litCount: max(litCount + d, 0), createdAt: createdAt, authorId: authorId, author: author, editedAt: editedAt)
    }
}

extension String {
    var nilIfEmpty: String? { isEmpty ? nil : self }
}

#if DEBUG
// Dữ liệu mẫu cho SwiftUI Preview — seed thẳng các store nội bộ (private(set) set được vì cùng file),
// KHÔNG gọi Supabase. Chỉ compile ở Debug nên không lọt vào bản release.
extension QAStore {
    /// UUID cố định để màn Chi tiết / AnswerCard tham chiếu đúng câu hỏi + câu trả lời đã seed.
    static let previewQuestionId = UUID()
    static let previewAnswer = AnswerRow(
        id: UUID(),
        body: "Phối hợp thế này hiệu quả với mình: active recall để tự kiểm tra, rồi spaced repetition giãn khoảng ôn theo đường quên. Cái nào sai thì đẩy lịch ôn gần lại.",
        createdAt: Date().addingTimeInterval(-1800),
        voteCount: 4, litCount: 2, isBest: true,
        authorId: UUID(), author: AuthorRef(displayName: "Hà"), editedAt: nil
    )

    /// Store đã seed cho preview.
    static func makePreview() -> QAStore {
        let s = QAStore()
        let q1 = QuestionRow(
            id: previewQuestionId,
            title: "Active recall và spaced repetition — nên phối hợp thế nào?",
            body: "Mình đang tự học và thấy hai kỹ thuật này hay bị nhắc chung. Thực tế nên kết hợp ra sao cho đỡ tốn thời gian?",
            topic: "Não bộ", answerCount: 2,
            createdAt: Date().addingTimeInterval(-7200),
            authorId: UUID(), author: AuthorRef(displayName: "Minh"), editedAt: nil
        )
        let q2 = QuestionRow(
            id: UUID(), title: "Làm sao giữ thói quen đọc mỗi ngày?",
            body: nil, topic: "Thói quen", answerCount: 0,
            createdAt: Date().addingTimeInterval(-3600),
            authorId: UUID(), author: AuthorRef(displayName: "Lan"), editedAt: nil
        )
        s.questions = [q1, q2]

        let a2 = AnswerRow(
            id: UUID(), body: "Theo mình cứ recall trước khi mở tài liệu, sai chỗ nào ôn chỗ đó dày hơn.",
            createdAt: Date().addingTimeInterval(-900),
            voteCount: 1, litCount: 0, isBest: false,
            authorId: UUID(), author: AuthorRef(displayName: "Tú"), editedAt: nil
        )
        s.answersByQuestion[previewQuestionId] = [previewAnswer, a2]
        s.repliesByAnswer[previewAnswer.id] = [
            ReplyRow(id: UUID(), answerId: previewAnswer.id, parentId: nil,
                     body: "Cảm ơn, phần đường quên rất rõ!", litCount: 1,
                     createdAt: Date().addingTimeInterval(-600),
                     authorId: UUID(), author: AuthorRef(displayName: "Minh"), editedAt: nil)
        ]
        return s
    }
}
#endif

/// Dịch lỗi Supabase sang chuỗi thân thiện (đa ngữ qua String Catalog) — dùng chung các store NODIE.
enum ErrorText {
    /// Giữ nguyên tên/chữ ký vì ~30 chỗ đang gọi — nhưng việc phân loại đã dọn sang
    /// `NodieErrorKind`, nơi mỗi loại lỗi còn trả lời được "có nên mời thử lại không".
    /// Chỗ nào chỉ cần một câu chữ thì gọi ở đây; chỗ nào cần quyết định hành vi thì hỏi
    /// thẳng `NodieErrorKind.of(error)`.
    static func localized(_ error: Error) -> String {
        NodieErrorKind.of(error).message
    }
}
