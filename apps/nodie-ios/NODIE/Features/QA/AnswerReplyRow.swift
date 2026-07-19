import SwiftUI
import UIKit   // UIPasteboard — SwiftUI không re-export

/// Một reply trong nhánh dưới câu trả lời — thụt lề theo độ sâu, kẻ dọc bên trái.
/// Không còn thuần presentational: reply của CHÍNH MÌNH gọi thẳng `qa.editReply`/`deleteReply`
/// (đã cầm `qa` sẵn cho ModerationMenu) — thêm hai closure `onEdit`/`onDelete` xuyên qua
/// AnswerCardView chỉ để gọi lại đúng hai hàm đó là vòng lằng nhằng không cần thiết.
struct AnswerReplyRow: View {
    @Bindable var qa: QAStore
    let reply: ReplyRow
    let depth: Int
    let isLit: Bool
    let onLit: () -> Void
    let onReply: (_ toName: String) -> Void

    /// Đang sửa nội dung reply của CHÍNH MÌNH — thay `Text(reply.body)` bằng ô nhập.
    @State private var isEditing = false
    @State private var editDraft = ""
    @State private var editSending = false

    /// Thụt tối đa 3 bậc — sâu hơn thì cột chữ quá hẹp (cùng ngưỡng prototype).
    private var indent: CGFloat { CGFloat(min(depth, 3)) * 18 }
    private var isMine: Bool { qa.isMine(reply.authorId) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: NodieSpacing.sm) {
                InitialAvatar(initial: reply.authorInitial, size: 24)
                VStack(alignment: .leading, spacing: 1) {
                    // Tên và giờ ghép bằng `+` thành MỘT Text → phải bọc cả cụm, không tách được.
                    NodieRelativeTimeText {
                        (Text(reply.authorName)
                            .font(NodieTypography.meta.weight(.semibold))
                            .foregroundColor(NodieColors.ink)
                         + Text(verbatim: " · \(reply.relativeTime)")
                            .font(NodieTypography.meta)
                            .foregroundColor(NodieColors.inkFaint))
                    }
                    if reply.isEdited {
                        Text("(đã sửa)")
                            .font(NodieTypography.metaSm)
                            .foregroundStyle(NodieColors.inkFaint)
                    }
                }
            }

            if isEditing {
                editField.padding(.top, 5)
            } else {
                Text(reply.body)
                    .font(NodieTypography.bodyXs)
                    .foregroundStyle(NodieColors.inkBody)
                    .lineSpacing(3)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 5)
                    // Giữ để copy — cùng cử chỉ với bong bóng chat và thân câu trả lời.
                    .contextMenu {
                        Button {
                            UIPasteboard.general.string = reply.body
                        } label: {
                            Label("Sao chép", systemImage: "doc.on.doc")
                        }
                    }
            }

            HStack(spacing: NodieSpacing.lg) {
                LitButton(count: reply.litCount, isLit: isLit,
                          font: NodieTypography.metaSm, spacing: 4, action: onLit)
                ReplyButton(font: NodieTypography.metaSm) { onReply(reply.authorName) }
                moderationMenu
            }
            .padding(.top, 6)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.leading, NodieSpacing.md)
        .overlay(alignment: .leading) {
            Rectangle().fill(NodieColors.ruleLight).frame(width: 2)
        }
        .padding(.leading, indent)
        .padding(.top, 13)
    }

    /// Tách khỏi lời gọi `ModerationMenu(...)`: `isMine ? { … } : nil` viết thẳng trong tham
    /// số thì Swift không suy ra nổi `(() -> Void)?` (cùng lỗi đã gặp ở ChatDetailView).
    private var moderationMenu: some View {
        let onEdit: (() -> Void)? = isMine ? {
            editDraft = reply.body
            isEditing = true
        } : nil
        let onDelete: (() -> Void)? = isMine ? {
            Task { await qa.deleteReply(id: reply.id, answerId: reply.answerId) }
        } : nil
        return ModerationMenu(
            target: .init(kind: .reply, id: reply.id,
                          authorId: reply.authorId, authorName: reply.authorName),
            qa: qa, size: 12, onEdit: onEdit, onDelete: onDelete
        )
    }

    /// Fail thì Ở NGUYÊN trạng thái sửa với chữ đang gõ — cùng luật "giữ nguyên chữ".
    private var editField: some View {
        VStack(alignment: .leading, spacing: 6) {
            TextField("Viết câu trả lời của bạn…", text: $editDraft, axis: .vertical)
                .font(NodieTypography.bodyXs)
                .foregroundStyle(NodieColors.ink)
                .lineLimit(1...6)
                .padding(.horizontal, NodieSpacing.sm)
                .padding(.vertical, 7)
                .background(RoundedRectangle(cornerRadius: 10).fill(NodieColors.surface))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(NodieColors.chipBorder, lineWidth: 1))

            HStack(spacing: NodieSpacing.sm) {
                Button("Huỷ") { isEditing = false }
                    .font(NodieTypography.metaSm.weight(.semibold))
                    .foregroundStyle(NodieColors.inkMuted)
                    .buttonStyle(.plain)
                    .disabled(editSending)
                    .expandedHitArea(visual: 12)
                Spacer(minLength: 0)
                Button {
                    Task { await saveEdit() }
                } label: {
                    if editSending { ProgressView() } else { Text("Lưu") }
                }
                .font(NodieTypography.metaSm.weight(.semibold))
                .foregroundStyle(NodieColors.accent)
                .buttonStyle(.plain)
                .disabled(editSending || editDraft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .expandedHitArea(visual: 12)
            }
        }
    }

    private func saveEdit() async {
        editSending = true
        let ok = await qa.editReply(id: reply.id, answerId: reply.answerId, body: editDraft)
        editSending = false
        guard ok else { return }
        isEditing = false
    }
}
