import SwiftUI
import UIKit   // UIPasteboard — SwiftUI không re-export

/// Một câu trả lời — card trắng (hoặc nền xanh nếu "Hay nhất"), với ▲ vote, ☀ lit,
/// nút Trả lời + ô inline, và nhánh reply lồng nhiều lớp. Chạy thật trên Supabase (handoff v4).
struct AnswerCardView: View {
    @Bindable var qa: QAStore
    let questionId: UUID
    let answer: AnswerRow
    /// Chỉ tác giả câu hỏi mới thấy nút "Hay nhất".
    let canMarkBest: Bool

    /// Mục đang được trả lời inline: parentId nil = trả lời thẳng câu trả lời,
    /// ngược lại = id của reply cha. `name` cho placeholder.
    @State private var replyTarget: ReplyTarget?
    @State private var replyDraft = ""

    private struct ReplyTarget: Equatable { let parentId: UUID?; let name: String }

    private var replies: [FlatReply] { qa.flatReplies(for: answer.id) }
    private var myInitial: String { "?" }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            authorRow

            Text(answer.body)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.inkBody)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 9)
                // Giữ để copy — báo cáo/chặn đã có chỗ ở menu ⋯, đây chỉ lo phần chữ.
                .contextMenu {
                    Button {
                        UIPasteboard.general.string = answer.body
                    } label: {
                        Label("Sao chép", systemImage: "doc.on.doc")
                    }
                }

            actionRow.padding(.top, 11)

            if let target = replyTarget {
                InlineReplyField(toName: target.name, text: $replyDraft,
                                 avatarInitial: myInitial) {
                    Task { await sendReply(parentId: target.parentId) }
                }
                .padding(.top, 11)
            }

            ForEach(replies) { item in
                AnswerReplyRow(
                    qa: qa,
                    reply: item.reply,
                    depth: item.depth,
                    isLit: qa.hasLit(item.reply.id),
                    onLit: { Task { await qa.toggleLitReply(item.reply.id, answerId: answer.id) } },
                    onReply: { name in replyTarget = ReplyTarget(parentId: item.reply.id, name: name) }
                )
            }
        }
        .padding(.horizontal, NodieSpacing.lg)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(answer.isBest ? NodieColors.bestBg : NodieColors.surface))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(answer.isBest ? NodieColors.bestBorder : NodieColors.rule, lineWidth: 1))
    }

    private var authorRow: some View {
        HStack(spacing: 10) {
            InitialAvatar(initial: answer.authorInitial, size: 30)

            VStack(alignment: .leading, spacing: 1) {
                Text(answer.authorName)
                    .font(NodieTypography.bodySm.weight(.semibold))
                    .foregroundStyle(NodieColors.ink)
                Text(answer.relativeTime)
                    .font(NodieTypography.timestamp)
                    .foregroundStyle(NodieColors.inkMuted)
            }

            Spacer(minLength: NodieSpacing.sm)

            if answer.isBest {
                Text("✓ Hay nhất")
                    .font(NodieTypography.eyebrowXs)
                    .foregroundStyle(NodieColors.accent)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(NodieColors.bestBadgeBg))
            }

            ModerationMenu(
                target: .init(kind: .answer, id: answer.id,
                              authorId: answer.authorId, authorName: answer.authorName),
                qa: qa
            )
        }
    }

    private var actionRow: some View {
        HStack(spacing: NodieSpacing.xl) {
            LitButton(count: answer.litCount, isLit: qa.hasLit(answer.id)) {
                Task { await qa.toggleLitAnswer(answer.id, questionId: questionId) }
            }
            VoteButton(count: answer.voteCount, hasVoted: qa.hasVoted(answer.id)) {
                Task { await qa.toggleVote(answerId: answer.id, questionId: questionId) }
            }
            ReplyButton {
                replyTarget = ReplyTarget(parentId: nil, name: answer.authorName)
            }
            if canMarkBest {
                BestToggleButton(isBest: answer.isBest) {
                    Task { await qa.setBest(answerId: answer.id, questionId: questionId) }
                }
            }
            Spacer(minLength: 0)
        }
    }

    private func sendReply(parentId: UUID?) async {
        await qa.createReply(answerId: answer.id, parentId: parentId, body: replyDraft)
        replyDraft = ""
        replyTarget = nil
    }
}

#if DEBUG
#Preview {
    ScrollView {
        AnswerCardView(qa: .makePreview(),
                       questionId: QAStore.previewQuestionId,
                       answer: QAStore.previewAnswer,
                       canMarkBest: true)
            .padding()
    }
    .background(NodieColors.bg)
}
#endif
