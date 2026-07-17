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
    let onRefresh: () async -> Void
    @ViewBuilder let rows: () -> Content

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            header

            if isLoading {
                // Vòng xoay lần đầu nằm NGOÀI ScrollView: đang quay mà kéo được nữa
                // thì hai spinner chồng lên nhau.
                Spacer()
                ProgressView().tint(NodieColors.accent)
                Spacer()
            } else {
                // Rỗng cũng phải kéo được — đó đúng là lúc người ta muốn kéo nhất
                // ("mình vừa lưu mà, sao chưa thấy?"). Để `.refreshable` trong nhánh
                // có-dữ-liệu thì đúng lúc cần nhất lại không kéo được.
                ScrollView {
                    if isEmpty {
                        // `containerRelativeFrame` lấy đúng chiều cao khung cuộn → chữ nằm
                        // giữa như hồi còn kẹp hai `Spacer()`. Chiều cao cứng thì chữ dính
                        // lên đỉnh, mà lấy số nào cũng sai trên máy khác cỡ.
                        Text(emptyText)
                            .font(NodieTypography.body)
                            .foregroundStyle(NodieColors.inkMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, NodieSpacing.xxl)
                            .frame(maxWidth: .infinity)
                            .containerRelativeFrame(.vertical)
                    } else {
                        LazyVStack(spacing: 0) { rows() }
                            .padding(.horizontal, NodieSpacing.screenH)
                            .padding(.bottom, NodieSpacing.xl)
                    }
                }
                .refreshable { await onRefresh() }
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
    /// Câu đang chờ xác nhận xoá — vuốt chỉ ĐÁNH DẤU, một confirmationDialog dùng chung
    /// cho cả danh sách mới thật sự xoá. `myQuestions()` chỉ trả bài CỦA MÌNH nên không
    /// cần kiểm `isMine` ở đây như ModerationMenu.
    @State private var pendingDelete: QuestionRow?

    var body: some View {
        MyContentScaffold(title: "Câu hỏi của tôi", isLoading: isLoading,
                          isEmpty: rows.isEmpty,
                          emptyText: "Bạn chưa chiếu câu hỏi nào.",
                          onRefresh: reload) {
            ForEach(rows) { question in
                NavigationLink(value: ProfileRoute.question(question.id.uuidString)) {
                    QuestionRowContent(question: question)
                }
                .buttonStyle(.plain)
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) { pendingDelete = question } label: {
                        Label("Xoá", systemImage: "trash")
                    }
                }
                Divider().background(NodieColors.rule)
            }
        }
        .task {
            await reload()
            isLoading = false
        }
        .confirmationDialog("Xoá nội dung này?", isPresented: Binding(
            get: { pendingDelete != nil }, set: { if !$0 { pendingDelete = nil } }
        ), titleVisibility: .visible) {
            Button("Xoá", role: .destructive) { Task { await confirmDelete() } }
            Button("Huỷ", role: .cancel) { pendingDelete = nil }
        } message: {
            Text("Không thể hoàn tác.")
        }
    }

    /// Kéo tay KHÔNG đụng `isLoading`: spinner của `.refreshable` là của hệ thống, bật
    /// `isLoading` nữa là nuốt danh sách đang hiện thành màn quay vòng.
    ///
    /// Fetch hỏng (`nil`) thì GIỮ danh sách đang hiện. Gán `[]` là thay bài của người ta bằng
    /// câu "bạn chưa chiếu câu hỏi nào" — cùng một loại nói dối với việc xoá nháp khi gửi fail.
    private func reload() async {
        guard let fetched = await qa.myQuestions() else { return }
        rows = fetched
    }

    private func confirmDelete() async {
        guard let target = pendingDelete else { return }
        if await qa.deleteQuestion(id: target.id) {
            rows.removeAll { $0.id == target.id }
        }
        pendingDelete = nil
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
                          emptyText: "Chưa lưu câu hỏi nào. Bấm ◍ ở một câu hỏi để đọc lại sau.",
                          onRefresh: reload) {
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
            await reload()
            isLoading = false
        }
    }

    /// Hỏng thì giữ danh sách đang hiện — xem ghi chú ở `MyQuestionsView.reload`.
    private func reload() async {
        guard let fetched = await qa.savedQuestions() else { return }
        rows = fetched
    }
}

// MARK: - Trả lời của tôi

struct MyAnswersView: View {
    @Bindable var qa: QAStore
    @State private var rows: [MyAnswerRow] = []
    @State private var isLoading = true
    /// Xem ghi chú ở `MyQuestionsView.pendingDelete` — cùng cơ chế, khác kiểu hàng.
    @State private var pendingDelete: MyAnswerRow?

    var body: some View {
        MyContentScaffold(title: "Trả lời của tôi", isLoading: isLoading,
                          isEmpty: rows.isEmpty,
                          emptyText: "Bạn chưa trả lời câu nào.",
                          onRefresh: reload) {
            ForEach(rows) { answer in
                // Câu hỏi gốc mất rồi thì dòng này không dẫn đi đâu — để bấm được chỉ tổ
                // đẩy người ta vào màn "không mở được". Nhưng không cho bấm thôi chưa đủ:
                // trông y hệt dòng bấm được thì người ta bấm hoài, tưởng app đơ. Phải mờ đi.
                Group {
                    if answer.isOrphaned {
                        row(answer)
                            .opacity(0.55)
                    } else {
                        NavigationLink(value: ProfileRoute.question(answer.questionId.uuidString)) {
                            row(answer)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) { pendingDelete = answer } label: {
                        Label("Xoá", systemImage: "trash")
                    }
                }
                Divider().background(NodieColors.rule)
            }
        }
        .task {
            await reload()
            isLoading = false
        }
        .confirmationDialog("Xoá nội dung này?", isPresented: Binding(
            get: { pendingDelete != nil }, set: { if !$0 { pendingDelete = nil } }
        ), titleVisibility: .visible) {
            Button("Xoá", role: .destructive) { Task { await confirmDelete() } }
            Button("Huỷ", role: .cancel) { pendingDelete = nil }
        } message: {
            Text("Không thể hoàn tác.")
        }
    }

    /// Hỏng thì giữ danh sách đang hiện — xem ghi chú ở `MyQuestionsView.reload`.
    private func reload() async {
        guard let fetched = await qa.myAnswers() else { return }
        rows = fetched
    }

    private func confirmDelete() async {
        guard let target = pendingDelete else { return }
        if await qa.deleteAnswer(id: target.id, questionId: target.questionId) {
            rows.removeAll { $0.id == target.id }
        }
        pendingDelete = nil
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
                if answer.isOrphaned {
                    Text("Câu hỏi gốc đã xoá")
                        .font(NodieTypography.tag)
                        .foregroundStyle(NodieColors.inkFaint)
                }
                NodieRelativeTimeText {
                    Text(verbatim: "\(answer.relativeTime) · \(NodieGlyph.sun) \(answer.litCount)")
                        .font(NodieTypography.meta)
                        .foregroundStyle(NodieColors.inkMuted)
                }
            }
            .padding(.top, NodieSpacing.sm)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, NodieSpacing.lg)
        .contentShape(Rectangle())
        .accessibilityHint(answer.isOrphaned ? Text("Câu hỏi gốc đã xoá") : Text(""))
    }
}
