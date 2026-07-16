import SwiftUI

/// Chi tiết câu hỏi — thân bài + danh sách trả lời (phẳng, không vote/best). Chiếm trọn màn.
struct QuestionDetailView: View {
    @Bindable var qa: QAStore
    let questionId: String

    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""
    @State private var sending = false
    /// Đang đi tìm câu hỏi. Tách khỏi `question == nil` vì hai thứ khác nhau: chưa biết
    /// (quay vòng) và biết là không có (báo hẳn). Gộp lại là quay vòng vĩnh viễn.
    @State private var isResolving = true

    private var uuid: UUID? { UUID(uuidString: questionId) }
    /// Đọc từ cache theo id chứ không lọc `qa.questions`: màn này còn mở từ "Đã lưu" /
    /// "Câu hỏi của tôi", nơi câu hỏi có thể nằm ngoài 50 câu mới nhất của danh sách —
    /// lọc danh sách thì những câu đó kẹt ở vòng xoay vĩnh viễn.
    private var question: QuestionRow? { uuid.flatMap { qa.question(id: $0) } }
    private var answers: [AnswerRow] { uuid.map { qa.answers(for: $0) } ?? [] }
    /// Chỉ tác giả câu hỏi được chọn "Hay nhất".
    private var canMarkBest: Bool {
        guard let author = question?.authorId, let me = qa.currentUserId else { return false }
        return author == me
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            if let question {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        if let topic = question.topic, !topic.isEmpty {
                            TopicTagView(label: topic).frame(maxWidth: .infinity, alignment: .leading)
                        }

                        Text(question.title)
                            .font(NodieTypography.detailTitle)
                            .foregroundStyle(NodieColors.ink)
                            .lineSpacing(4)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.top, 10)

                        Text(verbatim: "\(question.authorName) · \(question.relativeTime)")
                            .font(NodieTypography.meta)
                            .foregroundStyle(NodieColors.inkMuted)
                            .padding(.top, NodieSpacing.md)

                        if let body = question.body, !body.isEmpty {
                            Text(body)
                                .font(NodieTypography.body)
                                .foregroundStyle(NodieColors.inkBody)
                                .lineSpacing(5)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.top, NodieSpacing.md)
                        }

                        Divider().background(NodieColors.rule).padding(.top, NodieSpacing.lg)

                        EyebrowLabel(text: String(localized: "\(answers.count) câu trả lời"), font: NodieTypography.eyebrow)
                            .padding(.top, NodieSpacing.lg)

                        if answers.isEmpty {
                            Text("Chưa có câu trả lời. Hãy là người soi sáng đầu tiên.")
                                .font(NodieTypography.bodySm)
                                .foregroundStyle(NodieColors.inkFaint)
                                .padding(.top, NodieSpacing.md)
                        }

                        ForEach(answers) { answer in
                            AnswerCardView(qa: qa, questionId: question.id, answer: answer, canMarkBest: canMarkBest)
                                .padding(.top, 10)
                        }
                    }
                    .padding(.horizontal, NodieSpacing.screenH)
                    .padding(.top, NodieSpacing.lg)
                    .padding(.bottom, NodieSpacing.xl)
                }
            } else if isResolving {
                Spacer()
                ProgressView().tint(NodieColors.accent)
                Spacer()
            } else {
                unavailableState
            }

            // Câu hỏi không mở được thì không có gì để trả lời — giấu luôn thanh soạn.
            if question != nil { replyBar }
        }
        .background(NodieColors.bg)
        .task {
            guard let uuid else { isResolving = false; return }
            // Vào từ "Đã lưu"/"Câu hỏi của tôi" thì cache có thể chưa có câu này — no-op nếu đã có.
            await qa.loadQuestion(id: uuid)
            isResolving = false
            // Nạp mỗi lần mở: rẻ (bảng nhỏ, chỉ hàng của mình) và nút lưu không được đoán mò.
            await qa.loadSaves()
            if qa.answers(for: uuid).isEmpty { await qa.loadThread(for: uuid) }
        }
    }

    /// Câu hỏi đã xoá, hoặc của người mình đã chặn, hoặc mạng hỏng lúc mở từ "Đã lưu".
    /// Nói thẳng còn hơn để người ta nhìn vòng xoay không bao giờ dừng.
    private var unavailableState: some View {
        VStack(spacing: NodieSpacing.sm) {
            Spacer()
            Image(systemName: "eye.slash")
                .font(.system(size: 30))
                .foregroundStyle(NodieColors.inkFaint)
            Text("Không mở được câu hỏi này.")
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
            Text("Có thể nó đã bị xoá, hoặc thuộc về người bạn đã chặn.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkFaint)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(.horizontal, NodieSpacing.xxl)
        .frame(maxWidth: .infinity)
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "arrow.left") { dismiss() }
            EyebrowLabel(text: "Hỏi đáp", font: NodieTypography.eyebrow)
            Spacer()
            if let question {
                saveButton(question.id)
                ModerationMenu(
                    target: .init(kind: .question, id: question.id,
                                  authorId: question.authorId, authorName: question.authorName),
                    qa: qa
                )
            }
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    /// Lưu để đọc lại — riêng tư, không đếm, không hiện cho ai (khác ▲/☀ ở dưới).
    /// Tô đầy khi đã lưu: trạng thái phải thấy được mà không cần bấm thử.
    private func saveButton(_ id: UUID) -> some View {
        let saved = qa.isSaved(id)
        return Button {
            Task { await qa.toggleSave(id) }
        } label: {
            Image(systemName: saved ? "bookmark.fill" : "bookmark")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(saved ? NodieColors.accent : NodieColors.ink)
                .frame(width: 34, height: 34)
                .expandedHitArea()
        }
        .buttonStyle(.plain)
        .accessibilityLabel(saved ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi")
        .accessibilityIdentifier("saveQuestion")
    }

    private var replyBar: some View {
        HStack(spacing: 10) {
            TextField("Viết câu trả lời của bạn…", text: $draft, axis: .vertical)
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.ink)
                .lineLimit(1...4)
                .padding(.horizontal, NodieSpacing.lg)
                .padding(.vertical, 12)
                .background(Capsule().fill(NodieColors.surface))
                .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))

            Button { Task { await send() } } label: {
                Group {
                    if sending { ProgressView().tint(.white) }
                    else { Text(NodieGlyph.sun).font(.system(size: 17)).foregroundStyle(.white) }
                }
                .frame(width: 44, height: 44)
                .background(Circle().fill(canSend ? NodieColors.accent : NodieColors.chipBorder))
            }
            .buttonStyle(.plain)
            .disabled(!canSend || sending)
            .accessibilityLabel("Gửi câu trả lời")
        }
        .padding(.horizontal, 14)
        .padding(.top, 10)
        .padding(.bottom, 26)
        .background(NodieColors.bg)
        .overlay(alignment: .top) { Divider().background(NodieColors.rule) }
    }

    private var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func send() async {
        guard let uuid, canSend else { return }
        sending = true
        await qa.createAnswer(questionId: uuid, body: draft)
        draft = ""
        sending = false
    }
}

#if DEBUG
#Preview {
    QuestionDetailView(qa: .makePreview(), questionId: QAStore.previewQuestionId.uuidString)
}
#endif
