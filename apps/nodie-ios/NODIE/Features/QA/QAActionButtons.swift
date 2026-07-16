import SwiftUI

/// ☀ + số hạt ánh sáng. Presentational — trạng thái/đếm do QAStore truyền vào.
/// Màu là tín hiệu bật/tắt duy nhất (không nền, không viền) → dùng sun/sunDim, không gold.
struct LitButton: View {
    let count: Int
    let isLit: Bool
    var font: Font = NodieTypography.bodyXs
    var spacing: CGFloat = 5
    let action: () -> Void

    var body: some View {
        Button {
            NodieHaptics.tap()
            action()
        } label: {
            HStack(spacing: spacing) {
                Text(NodieGlyph.sun)
                Text("\(count)")
                    // Chỉ chữ số lăn, ☀ đứng yên — numericText cần animation đi kèm
                    // ở dưới, tự nó không chạy.
                    .contentTransition(.numericText())
            }
            .font(font.weight(.bold))
            .foregroundStyle(isLit ? NodieColors.sun : NodieColors.sunDim)
            .animation(.snappy(duration: 0.2), value: count)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isLit ? Text("Bỏ thả ánh sáng") : Text("Thả ánh sáng"))
        .accessibilityValue(Text("\(count) hạt ánh sáng"))
    }
}

/// ▲ + số vote — upvote kiểu X/Reddit: chỉ mũi tên và số.
struct VoteButton: View {
    let count: Int
    let hasVoted: Bool
    let action: () -> Void

    var body: some View {
        Button {
            NodieHaptics.tap()
            action()
        } label: {
            HStack(spacing: 5) {
                Text(NodieGlyph.upvote)
                Text("\(count)")
                    .contentTransition(.numericText())
            }
            .font(NodieTypography.bodyXs.weight(.semibold))
            .foregroundStyle(hasVoted ? NodieColors.accent : NodieColors.inkMuted)
            .animation(.snappy(duration: 0.2), value: count)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(hasVoted ? Text("Bỏ đánh dấu hữu ích") : Text("Đánh dấu hữu ích"))
        .accessibilityValue(Text("\(count) lượt"))
    }
}

/// ↩ Trả lời — mở ô nhập inline.
struct ReplyButton: View {
    var font: Font = NodieTypography.bodyXs
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 5) {
                Text(NodieGlyph.reply)
                Text("Trả lời")
            }
            .font(font.weight(.semibold))
            .foregroundStyle(NodieColors.inkMuted)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

/// Avatar chữ cái đầu — nền kem, chữ mực. Dùng cho user thật (Q&A + chat) thay gradient giả.
struct InitialAvatar: View {
    let initial: String
    var size: CGFloat = 30

    var body: some View {
        Circle()
            .fill(NodieColors.tagBg)
            .frame(width: size, height: size)
            .overlay(
                Text(initial)
                    .font(.system(size: size * 0.42, weight: .semibold))
                    .foregroundStyle(NodieColors.inkSoft)
            )
    }
}

/// Nút chọn "Hay nhất" — chỉ hiện cho tác giả câu hỏi.
struct BestToggleButton: View {
    let isBest: Bool
    let action: () -> Void

    var body: some View {
        Button {
            NodieHaptics.tap()
            action()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: isBest ? "checkmark.seal.fill" : "checkmark.seal")
                Text("Hay nhất")
            }
            .font(NodieTypography.bodyXs.weight(.semibold))
            .foregroundStyle(isBest ? NodieColors.accent : NodieColors.inkMuted)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isBest ? Text("Bỏ đánh dấu Hay nhất") : Text("Đánh dấu Hay nhất"))
    }
}
