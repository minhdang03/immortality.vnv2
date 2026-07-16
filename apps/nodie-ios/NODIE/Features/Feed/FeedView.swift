import SwiftUI

/// Bảng tin — hai trạng thái: chưa chiếu sáng (chỉ có lời mời) → đã chiếu sáng (hút nội dung về).
struct FeedView: View {
    @Bindable var state: AppState
    /// Chữ cái đầu của người đang đăng nhập — prototype vẽ cứng "M".
    var profileInitial: String = "?"

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    if state.hasProjected {
                        projectedState
                    } else {
                        ProjectionPromptCard(state: state)
                        ProjectionPrincipleNote()
                    }
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.top, NodieSpacing.md)
                .padding(.bottom, NodieSpacing.md)
            }
        }
        .background(NodieColors.bg)
    }

    private var header: some View {
        HStack {
            EyebrowLabel(text: "Ngày 128 · Thứ Tư", font: NodieTypography.eyebrow)
            Spacer()
            // Prototype đặt sẵn vòng tròn này ở đây — nó chính là lối vào Cá Nhân
            // (pattern avatar-góc-trên của IG/X). Không cần tab thứ 5.
            Button {
                state.feedPath.append(FeedRoute.profile)
            } label: {
                Text(profileInitial)
                    .font(NodieTypography.quote)
                    .foregroundStyle(NodieColors.cream)
                    .frame(width: 36, height: 36)
                    .background(Circle().fill(NodieColors.ink))
                    .expandedHitArea(visual: 36)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Cá nhân")
            .accessibilityIdentifier("profileAvatar")
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
    }

    /// Sau khi chiếu sáng: tóm tắt điều đã chiếu + danh sách hút về.
    private var projectedState: some View {
        VStack(alignment: .leading, spacing: 0) {
            ProjectedSummaryCard(state: state)

            EyebrowLabel(text: "Hút về · khớp điều bạn chiếu sáng")
                .padding(.top, 18)
                .padding(.bottom, NodieSpacing.xs)

            ForEach(Array(MockData.attracted.enumerated()), id: \.element.id) { index, item in
                AttractedItemRow(item: item) {
                    if item.ctaLabel != nil { state.openQuestion("q1") }
                }
                if index < MockData.attracted.count - 1 {
                    Divider().background(NodieColors.rule)
                }
            }
        }
    }
}

/// Card tối tóm tắt điều vừa chiếu sáng + trạng thái đang hút.
private struct ProjectedSummaryCard: View {
    @Bindable var state: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                EyebrowLabel(text: "✦ Bạn đã chiếu sáng",
                             color: NodieColors.goldOnDark,
                             font: NodieTypography.eyebrowXs)
                Spacer()
                Button {
                    withAnimation(.easeOut(duration: 0.2)) { state.reproject() }
                } label: {
                    Text("Chiếu lại")
                        .font(NodieTypography.timestamp)
                        .foregroundStyle(NodieColors.accentLight)
                }
                .buttonStyle(.plain)
            }

            Text("\"\(state.projectionText)\"")
                .font(NodieTypography.quote)
                .foregroundStyle(NodieColors.cream)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 7)

            HStack(spacing: 7) {
                PulsingDot()
                Text("Đang hút 6 nội dung khớp về · não bạn dẫn đường")
                    .font(NodieTypography.metaSm)
                    .foregroundStyle(NodieColors.onDarkBody)
            }
            .padding(.top, 11)
        }
        .padding(.horizontal, 17)
        .padding(.vertical, 15)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 18).fill(NodieColors.ink))
    }
}

/// Chấm xung nhịp — báo hiệu đang hút nội dung về.
private struct PulsingDot: View {
    @State private var animating = false

    var body: some View {
        ZStack {
            Circle()
                .fill(NodieColors.accentLight)
                .scaleEffect(animating ? 1.5 : 0.6)
                .opacity(animating ? 0 : 0.7)
                .animation(.easeOut(duration: 1.6).repeatForever(autoreverses: false), value: animating)
            Circle().fill(NodieColors.accentLight)
        }
        .frame(width: 9, height: 9)
        .onAppear { animating = true }
    }
}

#Preview {
    FeedView(state: AppState())
}
