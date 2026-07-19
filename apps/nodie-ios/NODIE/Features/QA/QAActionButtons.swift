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
            // Chữ trần không padding — vẽ ~14-15pt tuỳ `font` (bodyXs mặc định, hoặc metaSm
            // 11.5pt khi AnswerReplyRow truyền `font:` nhỏ hơn cho tầng reply). Ước lượng 12
            // CHỦ Ý thấp hơn cả hai: helper nới theo (44-visual), đoán thấp thì vùng chạm thật
            // vẫn ≥44; đoán cao (từng dùng 14, hụt 0.2pt ở font nhỏ) mới hụt — xem
            // NodieChips.expandedHitArea + đo thật bằng TouchTargetUITests.
            .expandedHitArea(visual: 12)
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
            .expandedHitArea(visual: 12)
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
            .expandedHitArea(visual: 12)
        }
        .buttonStyle(.plain)
        // Thiếu dòng này thì VoiceOver gộp CẢ glyph ↩ lẫn chữ "Trả lời" thành một nhãn
        // đọc tên ký tự Unicode trước — cùng lỗi lớp mà ☀/▲/Hay nhất đã né bằng
        // `.accessibilityLabel` riêng, chỉ ReplyButton bị bỏ sót (bắt được bằng UITest phase 05).
        .accessibilityLabel(Text("Trả lời"))
    }
}

/// Avatar chữ cái đầu — nền kem, chữ mực. Dùng cho user thật (Q&A + chat) thay gradient giả.
///
/// `accessibilityHidden`: MỌI chỗ dùng component này đều đặt tên đầy đủ ngay cạnh (hoặc —
/// như ô trả lời inline — là avatar của chính người đang gõ, không mang thông tin gì mới).
/// Không ẩn thì VoiceOver đọc lặp "M, Minh…" trước tên thật (phase 05, audit medium).
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
            .accessibilityHidden(true)
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
            .expandedHitArea(visual: 12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isBest ? Text("Bỏ đánh dấu Hay nhất") : Text("Đánh dấu Hay nhất"))
    }
}
