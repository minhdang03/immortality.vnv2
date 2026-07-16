import SwiftUI

/// Nút ⋯ với "Báo cáo" + "Chặn" — App Review tìm affordance NHÌN THẤY ĐƯỢC trên UGC,
/// nên đây là nút hiện hữu chứ không giấu sau long-press.
/// Tự ẩn với nội dung của chính mình: tự báo cáo/tự chặn là menu rác.
struct ModerationMenu: View {
    let target: QAStore.ModerationTarget
    @Bindable var qa: QAStore
    /// Cỡ glyph ⋯ — reply dùng nhỏ hơn card.
    var size: CGFloat = 15

    @State private var showReportDialog = false
    @State private var showBlockConfirm = false
    @State private var showReportedAlert = false

    private var isOwnContent: Bool {
        target.authorId != nil && target.authorId == qa.currentUserId
    }

    var body: some View {
        if !isOwnContent {
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
            } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: size))
                    .foregroundStyle(NodieColors.inkMuted)
                    .expandedHitArea(visual: size + 10)
            }
            .accessibilityLabel("Báo cáo hoặc chặn")
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
