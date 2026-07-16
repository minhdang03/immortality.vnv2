import SwiftUI

/// Một nội dung được hút về — kèm nguồn, điểm khớp, và (khi có) lý do hút.
/// Điểm khớp + lý do là điểm khác biệt so với feed thuật toán thường:
/// người dùng luôn thấy VÌ SAO thứ này xuất hiện.
struct AttractedItemRow: View {
    let item: AttractedItem
    let onTap: () -> Void

    // Button chứ không onTapGesture — xem ghi chú ở QuestionRowView.
    var body: some View {
        Button(action: onTap) {
            content
        }
        .buttonStyle(.plain)
    }

    private var content: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                EyebrowLabel(text: item.source, color: item.sourceColor)
                Spacer()
                Text("● khớp \(item.matchPercent)%")
                    .font(NodieTypography.matchScore)
                    .foregroundStyle(item.matchColor)
            }

            Text(item.title)
                .font(item.reason != nil ? NodieTypography.cardTitle : NodieTypography.cardTitleSm)
                .foregroundStyle(NodieColors.ink)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.leading)
                .padding(.top, NodieSpacing.sm)

            if let reason = item.reason {
                (Text("✦ Vì sao hút về: ").font(NodieTypography.bodyXs.weight(.bold))
                    .foregroundColor(NodieColors.label)
                 + Text(reason).font(NodieTypography.bodyXs).foregroundColor(NodieColors.inkSoft))
                    .lineSpacing(3)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 13)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 12).fill(NodieColors.tagBg))
                    .padding(.top, 9)
            }

            if let cta = item.ctaLabel {
                Text(cta)
                    .font(NodieTypography.meta)
                    .foregroundStyle(NodieColors.inkSoft)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 5)
                    .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
                    .padding(.top, 9)
            }

            if let footnote = item.footnote {
                HStack(spacing: 10) {
                    if item.hasAvatar {
                        Circle()
                            .fill(LinearGradient(
                                colors: [Color(hex: 0xC9B8F5), Color(hex: 0x5B43D8)],
                                startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 26, height: 26)
                    }
                    Text(footnote)
                        .font(NodieTypography.meta)
                        .foregroundStyle(NodieColors.inkMuted)
                }
                .padding(.top, item.hasAvatar ? 11 : 6)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 14)
        .contentShape(Rectangle())
    }
}

#Preview {
    VStack(spacing: 0) {
        ForEach(MockData.attracted) { item in
            AttractedItemRow(item: item) {}
            Divider().background(NodieColors.rule)
        }
    }
    .padding(.horizontal, NodieSpacing.screenH)
    .background(NodieColors.bg)
}
