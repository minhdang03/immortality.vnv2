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
    /// Đang bay lên server. Thiếu cờ này thì bấm đúp = 2 reply trùng — INSERT thật, không rút lại được.
    @State private var replySending = false

    /// Đang sửa nội dung câu trả lời của CHÍNH MÌNH — thay `Text(answer.body)` bằng ô nhập.
    @State private var isEditing = false
    @State private var editDraft = ""
    @State private var editSending = false

    private struct ReplyTarget: Equatable { let parentId: UUID?; let name: String }

    private var replies: [FlatReply] { qa.flatReplies(for: answer.id) }
    private var myInitial: String { "?" }
    private var isMine: Bool { qa.isMine(answer.authorId) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            authorRow

            if isEditing {
                editField.padding(.top, 9)
            } else {
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
            }

            actionRow.padding(.top, 11)

            if let target = replyTarget {
                InlineReplyField(
                    toName: target.name, text: $replyDraft,
                    avatarInitial: myInitial, isSending: replySending,
                    onSend: { Task { await sendReply(parentId: target.parentId) } },
                    // Bấm ✕ là chủ động bỏ → xoá luôn chữ. Khác hẳn gửi fail (chữ phải còn).
                    onCancel: { replyTarget = nil; replyDraft = "" }
                )
                .padding(.top, 11)
            }

            ForEach(replies) { item in
                AnswerReplyRow(
                    qa: qa,
                    reply: item.reply,
                    depth: item.depth,
                    isLit: qa.hasLit(item.reply.id),
                    onLit: { Task { await qa.toggleLitReply(item.reply.id, answerId: answer.id) } },
                    // Chặn đúng đường mở ô reply, KHÔNG `.disabled` cả dòng — làm thế là
                    // khoá luôn nút ☀ của reply, mà ☀ chẳng liên quan gì tới việc đang gửi.
                    onReply: { name in
                        guard !replySending else { return }
                        replyTarget = ReplyTarget(parentId: item.reply.id, name: name)
                    }
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
                HStack(spacing: 4) {
                    NodieRelativeTimeText {
                        Text(answer.relativeTime)
                            .font(NodieTypography.timestamp)
                            .foregroundStyle(NodieColors.inkMuted)
                    }
                    if answer.isEdited {
                        Text("(đã sửa)")
                            .font(NodieTypography.timestamp)
                            .foregroundStyle(NodieColors.inkFaint)
                    }
                }
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

            moderationMenu
        }
    }

    /// Tách khỏi lời gọi `ModerationMenu(...)`: `isMine ? { … } : nil` viết thẳng trong tham
    /// số thì Swift không suy ra nổi `(() -> Void)?` (cùng lỗi đã gặp ở ChatDetailView).
    private var moderationMenu: some View {
        let onEdit: (() -> Void)? = isMine ? {
            editDraft = answer.body
            isEditing = true
        } : nil
        let onDelete: (() -> Void)? = isMine ? {
            Task { await qa.deleteAnswer(id: answer.id, questionId: questionId) }
        } : nil
        return ModerationMenu(
            target: .init(kind: .answer, id: answer.id,
                          authorId: answer.authorId, authorName: answer.authorName),
            qa: qa, onEdit: onEdit, onDelete: onDelete
        )
    }

    /// Ô sửa câu trả lời — thay `Text(answer.body)` khi `isEditing`. Gửi fail thì Ở NGUYÊN
    /// trạng thái sửa với chữ đang gõ, không tự đóng — cùng luật "giữ nguyên chữ" với ô trả lời.
    private var editField: some View {
        VStack(alignment: .leading, spacing: 8) {
            TextField("Viết câu trả lời của bạn…", text: $editDraft, axis: .vertical)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.ink)
                .lineLimit(1...8)
                .padding(.horizontal, NodieSpacing.md)
                .padding(.vertical, 9)
                .background(RoundedRectangle(cornerRadius: 12).fill(NodieColors.surface))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(NodieColors.chipBorder, lineWidth: 1))

            HStack(spacing: NodieSpacing.md) {
                Button("Huỷ") { isEditing = false }
                    .font(NodieTypography.metaSm.weight(.semibold))
                    .foregroundStyle(NodieColors.inkMuted)
                    .buttonStyle(.plain)
                    .disabled(editSending)
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
            }
        }
    }

    private func saveEdit() async {
        editSending = true
        let ok = await qa.editAnswer(id: answer.id, questionId: questionId, body: editDraft)
        editSending = false
        guard ok else { return }   // fail: giữ nguyên ô sửa + chữ đang gõ, không đóng
        isEditing = false
    }

    private var actionRow: some View {
        HStack(spacing: NodieSpacing.xl) {
            LitButton(count: answer.litCount, isLit: qa.hasLit(answer.id)) {
                Task { await qa.toggleLitAnswer(answer.id, questionId: questionId) }
            }
            VoteButton(count: answer.voteCount, hasVoted: qa.hasVoted(answer.id)) {
                Task { await qa.toggleVote(answerId: answer.id, questionId: questionId) }
            }
            // Khoá khi đang gửi: đổi ô sang mục khác rồi gõ tiếp, lúc reply cũ bay về nó sẽ
            // dọn `replyDraft` — nuốt đúng đoạn vừa gõ cho mục mới.
            ReplyButton {
                replyTarget = ReplyTarget(parentId: nil, name: answer.authorName)
            }
            .disabled(replySending)
            if canMarkBest {
                BestToggleButton(isBest: answer.isBest) {
                    Task { await qa.setBest(answerId: answer.id, questionId: questionId) }
                }
            }
            Spacer(minLength: 0)
        }
    }

    private func sendReply(parentId: UUID?) async {
        // Chốt chặn thật, không dựa vào `.disabled` của nút: `.disabled` chỉ ăn sau khi
        // SwiftUI kịp dựng lại body — nhanh tay hơn một vòng run-loop là lọt hai INSERT.
        guard !replySending else { return }
        replySending = true
        let ok = await qa.createReply(answerId: answer.id, parentId: parentId, body: replyDraft)
        replySending = false
        // Fail thì giữ CẢ chữ LẪN ô đang mở: đóng ô cũng là mất chữ, mà lỗi đâu phải tại người viết.
        guard ok else { return }
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
