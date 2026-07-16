import SwiftUI

/// Hành trình — đo cân bằng Phóng ↔ Hút. Đây là "gương soi" của app:
/// hút nhiều hơn phóng = đang tích kho, chưa tiêu hoá.
struct JourneyView: View {
    @Bindable var state: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    BalanceCard()

                    InsightCard()
                        .padding(.top, NodieSpacing.lg)

                    EyebrowLabel(text: "Bạn đã phóng ra gần đây")
                        .padding(.top, 18)
                        .padding(.bottom, NodieSpacing.sm)

                    ProjectionTimeline(projections: MockData.projections)

                    Text("🔒 Ghi chú & nhật ký phóng của bạn được phân tích ngay trên máy (SLM) — không rời khỏi điện thoại.")
                        .font(NodieTypography.metaSm)
                        .foregroundStyle(NodieColors.inkSoft)
                        .lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.horizontal, 15)
                        .padding(.vertical, NodieSpacing.md)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.tagBg))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .strokeBorder(NodieColors.chipBorder, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                        )
                        .padding(.top, 14)
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.top, 14)
                .padding(.bottom, NodieSpacing.md)
            }
        }
        .background(NodieColors.bg)
    }

    private var header: some View {
        HStack {
            EyebrowLabel(text: "Hành trình · Ngày 128", font: NodieTypography.eyebrow)
            Spacer()
            Text("28 ngày 🔥")
                .font(NodieTypography.chip)
                .foregroundStyle(NodieColors.gold)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
    }
}

/// Card tối: 2 thanh Phóng ra / Hút về + nhận định AI về tỷ lệ.
private struct BalanceCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "Cân bằng Phóng ↔ Hút · tuần này",
                         color: NodieColors.goldOnDark,
                         font: NodieTypography.eyebrowXs)

            BalanceBar(label: "Phóng ra", value: 32, fraction: 0.64, color: NodieColors.accentLight)
                .padding(.top, 14)
            BalanceBar(label: "Hút về", value: 50, fraction: 1.0, color: NodieColors.goldOnDark)
                .padding(.top, NodieSpacing.md)

            (Text("✦ AI: ").font(NodieTypography.bodyXs.weight(.bold))
                .foregroundColor(NodieColors.accentLight)
             + Text("Tỷ lệ phóng/hút của bạn là ").font(NodieTypography.bodyXs)
                .foregroundColor(NodieColors.onDarkStrong)
             + Text("64%").font(NodieTypography.bodyXs.weight(.bold))
                .foregroundColor(NodieColors.onDarkStrong)
             + Text(" — khá tốt. Nếu tụt dưới 50%, bạn đang nạp nhiều hơn phóng → kho bắt đầu tích rác. Hãy phóng thêm: đặt câu hỏi, viết trả lời, dạy lại.")
                .font(NodieTypography.bodyXs).foregroundColor(NodieColors.onDarkStrong))
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal, 13)
                .padding(.vertical, 11)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 13).fill(NodieColors.onDarkFill))
                .padding(.top, 14)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 22).fill(NodieColors.ink))
    }
}

private struct BalanceBar: View {
    let label: String
    let value: Int
    let fraction: CGFloat
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                Text(label).font(NodieTypography.chip).foregroundStyle(color)
                Spacer()
                Text("\(value)").font(NodieTypography.chip).foregroundStyle(color)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(NodieColors.onDarkTrack)
                    Capsule().fill(color).frame(width: geo.size.width * fraction)
                }
            }
            .frame(height: 8)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }
}

/// Nhận định AI tuần này — nêu điều đã tiêu hoá vs điều còn nằm kho.
private struct InsightCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "✦ Nhận định tuần này")

            (Text("Điều bạn phóng ra nhiều nhất là ")
             + Text("trí nhớ & giấc ngủ").italic().foregroundColor(NodieColors.accent)
             + Text(" — và cũng là nơi bạn hút về hiểu biết vững nhất. Ngược lại, ")
             + Text("vật chất tối").italic()
             + Text(" bạn hút về nhiều nhưng chưa phóng ra lần nào → còn nằm ở kho, chưa tiêu hoá."))
                .font(NodieTypography.insight)
                .foregroundStyle(NodieColors.ink)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, NodieSpacing.sm)

            Text("Xem dẫn chứng ↗")
                .font(NodieTypography.meta)
                .foregroundStyle(NodieColors.inkSoft)
                .padding(.horizontal, 13)
                .padding(.vertical, 6)
                .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
                .padding(.top, 11)
        }
        .padding(.horizontal, NodieSpacing.lg)
        .padding(.vertical, 15)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(NodieColors.surface))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(NodieColors.rule, lineWidth: 1))
    }
}

/// Dòng thời gian có đường kẻ dọc + chấm màu.
private struct ProjectionTimeline: View {
    let projections: [Projection]

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            // Đường kẻ dọc — inset 8pt trên/dưới như prototype
            Rectangle()
                .fill(NodieColors.rule)
                .frame(width: 1.5)
                .padding(.vertical, NodieSpacing.sm)
                .padding(.leading, 6)

            VStack(alignment: .leading, spacing: 0) {
                ForEach(projections) { p in
                    HStack(alignment: .top, spacing: 0) {
                        Circle()
                            .fill(p.dot)
                            .frame(width: 11, height: 11)
                            .overlay(Circle().stroke(NodieColors.bg, lineWidth: 2.5))
                            .offset(x: -6, y: 4)
                            .frame(width: 0)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(p.title)
                                .font(NodieTypography.bodySm.weight(.semibold))
                                .foregroundStyle(NodieColors.ink)
                                .fixedSize(horizontal: false, vertical: true)
                            Text(p.meta)
                                .font(NodieTypography.meta)
                                .foregroundStyle(NodieColors.inkMuted)
                        }
                        .padding(.leading, 16)
                    }
                    .padding(.vertical, 10)
                }
            }
        }
    }
}

#Preview {
    JourneyView(state: AppState())
}
