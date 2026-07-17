import SwiftUI

/// Nút ⋯ — nội dung NGƯỜI KHÁC thì "Báo cáo"/"Chặn" (App Review tìm affordance NHÌN THẤY
/// ĐƯỢC trên UGC, nên đây là nút hiện hữu chứ không giấu sau long-press). Nội dung CỦA
/// CHÍNH MÌNH thì thay bằng "Sửa"/"Xoá" — tự báo cáo/tự chặn là menu rác.
struct ModerationMenu: View {
    let target: QAStore.ModerationTarget
    @Bindable var qa: QAStore
    /// Cỡ glyph ⋯ — reply dùng nhỏ hơn card.
    var size: CGFloat = 15
    /// nil = không cho sửa nội dung này. Chỉ có ý nghĩa khi `isOwnContent`; view cha
    /// (AnswerCardView/AnswerReplyRow/QuestionDetailView) tự quyết định có truyền hay không.
    var onEdit: (() -> Void)? = nil
    var onDelete: (() -> Void)? = nil

    @State private var showReportDialog = false
    @State private var showBlockConfirm = false
    @State private var showReportedAlert = false
    @State private var showDeleteConfirm = false

    private var isOwnContent: Bool { qa.isMine(target.authorId) }

    var body: some View {
        Group {
            if isOwnContent {
                if onEdit != nil || onDelete != nil {
                    Menu {
                        if let onEdit {
                            Button(action: onEdit) { Label("Sửa", systemImage: "pencil") }
                        }
                        if onDelete != nil {
                            Button(role: .destructive) {
                                showDeleteConfirm = true
                            } label: {
                                Label("Xoá", systemImage: "trash")
                            }
                        }
                    } label: { glyph }
                    .accessibilityLabel("Sửa hoặc xoá")
                }
            } else {
                Menu {
                    Button {
                        showReportDialog = true
                    } label: {
                        Label("Báo cáo", systemImage: "flag")
                    }
                    if target.authorId != nil {
                        Button(role: .destructive) {
                            showBlockConfirm = true
                        } label: {
                            Label("Chặn \(target.authorName)", systemImage: "hand.raised")
                        }
                    }
                } label: { glyph }
                .accessibilityLabel("Báo cáo hoặc chặn")
            }
        }
        // Xoá không hoàn tác được — một chạm trong menu là chưa đủ chắc, phải hỏi lại.
        .confirmationDialog("Xoá nội dung này?", isPresented: $showDeleteConfirm,
                            titleVisibility: .visible) {
            Button("Xoá", role: .destructive) { onDelete?() }
            Button("Huỷ", role: .cancel) {}
        } message: {
            Text("Không thể hoàn tác.")
        }
        .confirmationDialog("Vì sao bạn báo cáo nội dung này?",
                            isPresented: $showReportDialog, titleVisibility: .visible) {
            reasonButton("Spam", .spam)
            reasonButton("Quấy rối", .harassment)
            reasonButton("Nội dung không phù hợp", .inappropriate)
            reasonButton("Khác", .other)
            Button("Huỷ", role: .cancel) {}
        }
        .alert("Đã gửi báo cáo. Cảm ơn bạn.", isPresented: $showReportedAlert) {
            Button("OK") {}
        }
        .confirmationDialog("Chặn \(target.authorName)?",
                            isPresented: $showBlockConfirm, titleVisibility: .visible) {
            Button("Chặn", role: .destructive) {
                if let authorId = target.authorId {
                    Task { await qa.block(userId: authorId) }
                }
            }
            Button("Huỷ", role: .cancel) {}
        } message: {
            Text("Bạn sẽ không thấy nội dung của người này nữa.")
        }
    }

    private var glyph: some View {
        Image(systemName: "ellipsis")
            .font(.system(size: size))
            .foregroundStyle(NodieColors.inkMuted)
            .expandedHitArea(visual: size + 10)
    }

    private func reasonButton(_ label: LocalizedStringKey, _ reason: QAStore.ReportReason) -> some View {
        Button(label) {
            Task {
                await qa.report(target, reason: reason)
                if qa.errorMessage == nil { showReportedAlert = true }
            }
        }
    }
}
