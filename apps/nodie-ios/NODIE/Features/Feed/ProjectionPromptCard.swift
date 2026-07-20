import SwiftUI

/// Bước 1 — card tối mời "chiếu sáng" trước khi được hút nội dung về.
/// Đây là cơ chế cốt lõi của app: chưa chiếu sáng thì Bảng tin trống.
struct ProjectionPromptCard: View {
    @Bindable var state: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "Bước 1 · Chiếu sáng trước",
                         color: NodieColors.goldOnDark,
                         font: NodieTypography.eyebrowXs)

            (Text("Hôm nay bạn muốn ")
             + Text("hiểu xuyên").italic().foregroundColor(NodieColors.accentLight)
             + Text(" điều gì?"))
                .font(NodieTypography.cardTitleLg)
                .foregroundStyle(NodieColors.cream)
                .lineSpacing(4)
                .padding(.top, NodieSpacing.sm)

            Text("Chiếu câu hỏi / hình dung của bạn ra trước — rồi Bảng tin mới hút nội dung tương ứng về. Nạp vào mà không chiếu ra chỉ thành kho rác.")
                .font(NodieTypography.bodyXs)
                .foregroundStyle(NodieColors.onDarkBody)
                .lineSpacing(3)
                .padding(.top, NodieSpacing.sm)

            TextEditor(text: $state.projectionDraft)
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.cream)
                .scrollContentBackground(.hidden)
                .frame(height: 64)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.onDarkFill))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(NodieColors.onDarkBorder, lineWidth: 1))
                .overlay(alignment: .topLeading) {
                    // TextEditor không có placeholder — tự vẽ, tắt hitTest để không chặn gõ.
                    if state.projectionDraft.isEmpty {
                        Text("Vd: Trí nhớ dài hạn được củng cố lúc ngủ như thế nào?")
                            .font(NodieTypography.body)
                            .foregroundStyle(NodieColors.cream.opacity(0.4))
                            .padding(.horizontal, 15)
                            .padding(.vertical, 14)
                            .allowsHitTesting(false)
                    }
                }
                .padding(.top, 14)

            Button {
                withAnimation(.easeOut(duration: 0.25)) { state.project() }
            } label: {
                Text("✦ Chiếu sáng & hút nội dung về")
                    .font(NodieTypography.ctaLg)
                    .foregroundStyle(NodieColors.onAccent)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Capsule().fill(NodieColors.accent))
            }
            .buttonStyle(.plain)
            .padding(.top, NodieSpacing.md)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, NodieSpacing.xl)
        .background(alignment: .topTrailing) {
            RoundedRectangle(cornerRadius: 22).fill(NodieColors.ink)
                .overlay(alignment: .topTrailing) {
                    // Quầng sáng accent ở góc — radial-gradient của prototype
                    Circle()
                        .fill(RadialGradient(
                            colors: [NodieColors.accent.opacity(0.33), .clear],
                            center: .center, startRadius: 0, endRadius: 60))
                        .frame(width: 120, height: 120)
                        .offset(x: 30, y: -30)
                }
                .clipShape(RoundedRectangle(cornerRadius: 22))
        }
    }
}

/// Câu nhắc nguyên lý dưới card — chỉ hiện khi chưa chiếu sáng.
struct ProjectionPrincipleNote: View {
    var body: some View {
        (Text("Theo nguyên lý Bất Tử Đạo: ")
         + Text("chiếu sáng trước → hút vào sau.").italic()
         + Text("\nChưa chiếu sáng thì chưa có gì chảy về."))
            .font(NodieTypography.metaSm)
            .foregroundStyle(NodieColors.inkFaint)
            .multilineTextAlignment(.center)
            .lineSpacing(3)
            .frame(maxWidth: .infinity)
            .padding(.top, NodieSpacing.lg)
    }
}
