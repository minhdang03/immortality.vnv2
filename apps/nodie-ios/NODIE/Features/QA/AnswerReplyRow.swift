import SwiftUI
import UIKit   // UIPasteboard — SwiftUI không re-export

/// Một reply trong nhánh dưới câu trả lời — thụt lề theo độ sâu, kẻ dọc bên trái.
/// Presentational trừ `qa`: ModerationMenu cần store để ghi báo cáo/chặn.
struct AnswerReplyRow: View {
    @Bindable var qa: QAStore
    let reply: ReplyRow
    let depth: Int
    let isLit: Bool
    let onLit: () -> Void
    let onReply: (_ toName: String) -> Void

    /// Thụt tối đa 3 bậc — sâu hơn thì cột chữ quá hẹp (cùng ngưỡng prototype).
    private var indent: CGFloat { CGFloat(min(depth, 3)) * 18 }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: NodieSpacing.sm) {
                InitialAvatar(initial: reply.authorInitial, size: 24)
                (Text(reply.authorName)
                    .font(NodieTypography.meta.weight(.semibold))
                    .foregroundColor(NodieColors.ink)
                 + Text(verbatim: " · \(reply.relativeTime)")
                    .font(NodieTypography.meta)
                    .foregroundColor(NodieColors.inkFaint))
            }

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

            HStack(spacing: NodieSpacing.lg) {
                LitButton(count: reply.litCount, isLit: isLit,
                          font: NodieTypography.metaSm, spacing: 4, action: onLit)
                ReplyButton(font: NodieTypography.metaSm) { onReply(reply.authorName) }
                ModerationMenu(
                    target: .init(kind: .reply, id: reply.id,
                                  authorId: reply.authorId, authorName: reply.authorName),
                    qa: qa, size: 12
                )
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
}
