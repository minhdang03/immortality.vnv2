import SwiftUI

/// Ba màn sau ba dòng "Đóng góp của bạn": Câu hỏi của tôi · Trả lời của tôi · Đã lưu.
/// Đều đọc Supabase thật; chưa đăng nhập thì rỗng chứ không sập (RLS trả 0 hàng).

/// Khung chung: header có nút quay lại + trạng thái tải/rỗng/danh sách.
/// Ba màn khác nhau đúng ở dòng dữ liệu — phần còn lại viết một lần.
private struct MyContentScaffold<Content: View>: View {
    /// String chứ không LocalizedStringKey: `EyebrowLabel` tự bọc LocalizedStringKey bên trong.
    let title: String
    let isLoading: Bool
    let isEmpty: Bool
    let emptyText: LocalizedStringKey
    @ViewBuilder let rows: () -> Content

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            header

            if isLoading {
                Spacer()
                ProgressView().tint(NodieColors.accent)
                Spacer()
            } else if isEmpty {
                Spacer()
                Text(emptyText)
                    .font(NodieTypography.body)
                    .foregroundStyle(NodieColors.inkMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, NodieSpacing.xxl)
                Spacer()
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) { rows() }
                        .padding(.horizontal, NodieSpacing.screenH)
                        .padding(.bottom, NodieSpacing.xl)
                }
            }
        }
        .background(NodieColors.bg)
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "arrow.left") { dismiss() }
            EyebrowLabel(text: title, font: NodieTypography.eyebrow)
            Spacer()
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }
}

// MARK: - Câu hỏi của tôi

struct MyQuestionsView: View {
    @Bindable var qa: QAStore
    @State private var rows: [QuestionRow] = []
    @State private var isLoading = true

    var body: some View {
        MyContentScaffold(title: "Câu hỏi của tôi", isLoading: isLoading,
                          isEmpty: rows.isEmpty,
                          emptyText: "Bạn chưa chiếu câu hỏi nào.") {
            ForEach(rows) { question in
                NavigationLink(value: ProfileRoute.question(question.id.uuidString)) {
                    QuestionRowContent(question: question)
                }
                .buttonStyle(.plain)
                Divider().background(NodieColors.rule)
            }
        }
        .task {
            rows = await qa.myQuestions()
            isLoading = false
        }
    }
}

// MARK: - Đã lưu

struct SavedQuestionsView: View {
    @Bindable var qa: QAStore
    @State private var rows: [QuestionRow] = []
    @State private var isLoading = true

    var body: some View {
        MyContentScaffold(title: "Đã lưu", isLoading: isLoading,
                          isEmpty: rows.isEmpty,
                          emptyText: "Chưa lưu câu hỏi nào. Bấm ◍ ở một câu hỏi để đọc lại sau.") {
            ForEach(rows) { question in
                NavigationLink(value: ProfileRoute.question(question.id.uuidString)) {
                    QuestionRowContent(question: question)
                }
                .buttonStyle(.plain)
                Divider().background(NodieColors.rule)
            }
        }
        // Bỏ lưu ở màn chi tiết rồi quay lại thì dòng đó phải biến mất → nạp lại mỗi lần hiện,
        // không cache. Danh sách này ngắn.
        .task {
            rows = await qa.savedQuestions()
            isLoading = false
        }
    }
}

// MARK: - Trả lời của tôi

struct MyAnswersView: View {
    @Bindable var qa: QAStore
    @State private var rows: [MyAnswerRow] = []
    @State private var isLoading = true

    var body: some View {
        MyContentScaffold(title: "Trả lời của tôi", isLoading: isLoading,
                          isEmpty: rows.isEmpty,
                          emptyText: "Bạn chưa trả lời câu nào.") {
            ForEach(rows) { answer in
                // Câu hỏi gốc mất rồi thì dòng này không dẫn đi đâu — để bấm được chỉ tổ
                // đẩy người ta vào màn "không mở được".
                if answer.isOrphaned {
                    row(answer)
                } else {
                    NavigationLink(value: ProfileRoute.question(answer.questionId.uuidString)) {
                        row(answer)
                    }
                    .buttonStyle(.plain)
                }
                Divider().background(NodieColors.rule)
            }
        }
        .task {
            rows = await qa.myAnswers()
            isLoading = false
        }
    }

    /// Tiêu đề câu hỏi đứng trên (biết đang trả lời cho cái gì), câu trả lời của mình đứng dưới.
    private func row(_ answer: MyAnswerRow) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(answer.questionTitle)
                .font(NodieTypography.cardTitleSm)
                .foregroundStyle(NodieColors.ink)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            Text(answer.body)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.inkBody)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
                .padding(.top, 6)

            HStack(spacing: NodieSpacing.sm) {
                if answer.isBest {
                    Text("Hay nhất")
                        .font(NodieTypography.tag)
                        .foregroundStyle(NodieColors.accent)
                }
                Text(verbatim: "\(answer.relativeTime) · \(NodieGlyph.sun) \(answer.litCount)")
                    .font(NodieTypography.meta)
                    .foregroundStyle(NodieColors.inkMuted)
            }
            .padding(.top, NodieSpacing.sm)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, NodieSpacing.lg)
        .contentShape(Rectangle())
    }
}
