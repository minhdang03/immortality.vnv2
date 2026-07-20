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
    /// Đang gửi — khoá cả gửi lẫn huỷ. Default `false` để call site cũ không gãy.
    var isSending: Bool = false
    let onSend: () -> Void
    /// Đóng ô. Thiếu nó thì mở nhầm một cái là nó nằm đó tới hết đời màn hình.
    let onCancel: () -> Void

    @FocusState private var isFocused: Bool

    private var canSend: Bool { !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    var body: some View {
        HStack(spacing: NodieSpacing.sm) {
            InitialAvatar(initial: avatarInitial, size: avatarSize)

            // Huỷ giữa chừng không rút được INSERT đã bay đi → đang gửi thì khoá luôn.
            Button(action: onCancel) {
                Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(NodieColors.inkMuted)
                    .frame(width: 24, height: 24)
                    .expandedHitArea(visual: 24)
            }
            .buttonStyle(.plain)
            .disabled(isSending)
            .accessibilityLabel("Huỷ trả lời")

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
                Group {
                    if isSending { ProgressView().tint(NodieColors.onAccent) }
                    else {
                        Image(systemName: "arrow.up")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(NodieColors.onAccent)
                    }
                }
                .frame(width: sendSize, height: sendSize)
                .background(Circle().fill(canSend ? NodieColors.accent : NodieColors.chipBorder))
                .expandedHitArea(visual: sendSize)
            }
            .buttonStyle(.plain)
            .disabled(!canSend || isSending)
            .accessibilityLabel("Gửi")
        }
        // Ô vừa hiện là gõ được ngay (autoFocus của prototype).
        .onAppear { isFocused = true }
    }
}
