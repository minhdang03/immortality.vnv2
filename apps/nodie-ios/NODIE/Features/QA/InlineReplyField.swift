import SwiftUI

/// Ô trả lời inline — hiện ngay dưới mục đang nhắm tới (câu trả lời hoặc reply).
/// Presentational: text + onSend do view cha (AnswerCardView) quản lý.
struct InlineReplyField: View {
    /// Tên người được trả lời — vào placeholder.
    let toName: String
    @Binding var text: String
    var avatarInitial: String = "?"
    var avatarSize: CGFloat = 26
    var sendSize: CGFloat = 34
    let onSend: () -> Void

    @FocusState private var isFocused: Bool

    private var canSend: Bool { !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    var body: some View {
        HStack(spacing: NodieSpacing.sm) {
            InitialAvatar(initial: avatarInitial, size: avatarSize)

            TextField("Trả lời \(toName)…", text: $text, axis: .vertical)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.ink)
                .lineLimit(1...4)
                .focused($isFocused)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(Capsule().fill(NodieColors.surface))
                .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))

            Button(action: onSend) {
                Image(systemName: "arrow.up")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: sendSize, height: sendSize)
                    .background(Circle().fill(canSend ? NodieColors.accent : NodieColors.chipBorder))
            }
            .buttonStyle(.plain)
            .disabled(!canSend)
            .accessibilityLabel("Gửi")
        }
        // Ô vừa hiện là gõ được ngay (autoFocus của prototype).
        .onAppear { isFocused = true }
    }
}
