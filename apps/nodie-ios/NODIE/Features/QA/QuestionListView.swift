import SwiftUI

/// Hỏi đáp — đặt câu hỏi được đóng khung là "một lần chiếu sáng".
/// Dữ liệu thật từ Supabase qua `QAStore` (thay MockData).
struct QuestionListView: View {
    @Bindable var state: AppState
    @Bindable var qa: QAStore
    @State private var filter: QAListFilter = .all
    @State private var showCompose = false

    private var visible: [QuestionRow] {
        filter == .unanswered ? qa.questions.filter { $0.answerCount == 0 } : qa.questions
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            Group {
                if qa.isLoading && qa.questions.isEmpty {
                    loading
                } else if visible.isEmpty {
                    // Lỗi mạng lúc cold-start (chưa kịp warm từ đĩa) khác hẳn "cộng đồng chưa
                    // có câu nào" — nói thẳng + cho thử lại, đừng để trống mà đổ tại người dùng.
                    if qa.questionsLoadFailed { errorState } else { emptyState }
                } else {
                    list
                }
            }
        }
        .background(NodieColors.bg)
        .task { if qa.questions.isEmpty { await qa.loadQuestions() } }
        // fullScreenCover chứ không sheet: prototype vẽ màn hỏi chiếm trọn khung, và thẻ
        // sheet vuốt-xuống-là-đóng sẽ nuốt mất câu hỏi đang gõ dở. Thoát bằng nút "Huỷ".
        .fullScreenCover(isPresented: $showCompose) {
            AskQuestionView(qa: qa) { newId in
                state.qaPath.append(newId.uuidString)   // mở luôn câu vừa chiếu
            }
        }
        // Alert lỗi của QAStore nay treo ở RootTabView — xem chú thích ở đó.
    }

    private var list: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(visible) { question in
                        QuestionRowView(question: question) {
                            state.qaPath.append(question.id.uuidString)
                        }
                        Divider().background(NodieColors.rule)
                    }
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.top, NodieSpacing.sm)
                .padding(.bottom, NodieSpacing.md)
                .id("top")
            }
            .refreshable { await qa.loadQuestions() }
            // Chạm lại tab khi đã ở root → cuộn lên đầu (chuẩn FB/IG/X, xem AppState.selectTab).
            .onChange(of: state.rootScrollTick) {
                withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("top", anchor: .top) }
            }
        }
    }

    /// Khung xương thay vòng xoay: vòng xoay nói "chờ đi", khung xương nói "sắp có gì" —
    /// và vì nó dùng lại chính `QuestionRowView`, danh sách thật hiện ra không nhảy layout.
    /// Cùng lối `.redacted` với ProfileStatsGrid, không phải bộ hình thứ hai để phải nhớ sửa kèm.
    private var loading: some View {
        VStack(spacing: 0) {
            ForEach(0..<6, id: \.self) { seed in
                QuestionRowView(question: .placeholder(seed: seed)) {}
                Divider().background(NodieColors.rule)
            }
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.sm)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .redacted(reason: .placeholder)
        // Khung xương là tiếng ồn với VoiceOver — nó đọc ra sáu câu hỏi bịa. Một thông báo
        // "Đang tải" nói đúng thứ đang xảy ra.
        .accessibilityHidden(true)
        .overlay {
            Color.clear
                .accessibilityLabel("Đang tải câu hỏi")
                .accessibilityAddTraits(.updatesFrequently)
        }
    }

    private var emptyState: some View {
        VStack(spacing: NodieSpacing.sm) {
            Image(systemName: "bubble.left.and.bubble.right").font(.system(size: 30)).foregroundStyle(NodieColors.inkFaint)
            (filter == .unanswered ? Text("Chưa có câu nào đang chờ.") : Text("Chưa có câu hỏi nào."))
                .font(NodieTypography.body).foregroundStyle(NodieColors.inkMuted)
            Text("Chiếu câu hỏi đầu tiên đi.").font(NodieTypography.metaSm).foregroundStyle(NodieColors.inkFaint)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    /// Nạp hỏng lúc chưa có gì để hiện: nói thẳng + nút thử lại (gọi lại chính `loadQuestions`).
    private var errorState: some View {
        VStack(spacing: NodieSpacing.sm) {
            Image(systemName: "wifi.slash").font(.system(size: 30)).foregroundStyle(NodieColors.inkFaint)
            Text("Không tải được câu hỏi.")
                .font(NodieTypography.body).foregroundStyle(NodieColors.inkMuted)
            Text("Kiểm tra mạng giúp mình nhé.")
                .font(NodieTypography.metaSm).foregroundStyle(NodieColors.inkFaint)
            Button { Task { await qa.loadQuestions() } } label: {
                Text("Thử lại")
                    .font(NodieTypography.cta)
                    .foregroundStyle(NodieColors.onAccent)
                    .padding(.horizontal, NodieSpacing.lg)
                    .padding(.vertical, NodieSpacing.sm)
                    .background(Capsule().fill(NodieColors.accent))
            }
            .buttonStyle(.plain)
            .padding(.top, NodieSpacing.sm)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Hỏi đáp")
                    .font(NodieTypography.screenTitle)
                    .foregroundStyle(NodieColors.ink)
                Spacer()
                Button { showCompose = true } label: {
                    Text("＋ Chiếu câu hỏi")
                        .font(NodieTypography.cta)
                        .foregroundStyle(NodieColors.onAccent)
                        .padding(.horizontal, NodieSpacing.lg)
                        .padding(.vertical, NodieSpacing.sm)
                        .background(Capsule().fill(NodieColors.accent))
                }
                .buttonStyle(.plain)
            }

            Text("Mỗi câu hỏi là một lần chiếu sáng — hỏi rõ để thu về câu trả lời đúng.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkMuted)
                .padding(.top, NodieSpacing.sm)

            FilterChipRow(options: QAListFilter.allCases, selection: $filter)
                .padding(.top, NodieSpacing.md)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
    }
}

/// Một câu hỏi trong danh sách. Không badge chuyên gia, không đếm "đã đọc" (anti-pattern đã gỡ).
struct QuestionRowView: View {
    let question: QuestionRow
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) { QuestionRowContent(question: question) }
            .buttonStyle(.plain)
    }
}

/// Ruột của một dòng câu hỏi, KHÔNG kèm nút.
///
/// Tách ra vì màn "Câu hỏi của tôi"/"Đã lưu" bọc dòng này trong `NavigationLink` — mà
/// Button lồng trong NavigationLink thì hai thứ tranh nhau cú chạm.
struct QuestionRowContent: View {
    let question: QuestionRow

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let topic = question.topic, !topic.isEmpty {
                TopicTagView(label: topic)
            }

            Text(question.title)
                .font(NodieTypography.cardTitleSm)
                .foregroundStyle(NodieColors.ink)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.leading)
                .padding(.top, question.topic?.isEmpty == false ? 9 : 0)

            Text(verbatim: "\(question.authorName) · \(question.relativeTime) · \(question.answerMeta)")
                .font(NodieTypography.meta)
                .foregroundStyle(NodieColors.inkMuted)
                .padding(.top, NodieSpacing.sm)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, NodieSpacing.lg)
        .contentShape(Rectangle())
    }
}

/// Bộ lọc v1: chỉ Tất cả / Chưa trả lời. "Nổi bật"/"Đang theo" cần vote/follow — để phase sau.
enum QAListFilter: String, CaseIterable, Identifiable {
    case all = "Tất cả"
    case unanswered = "Chưa trả lời"
    var id: String { rawValue }
}

#if DEBUG
#Preview {
    QuestionListView(state: AppState(), qa: .makePreview())
}
#endif
