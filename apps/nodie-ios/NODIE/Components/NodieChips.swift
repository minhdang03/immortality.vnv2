import SwiftUI

/// Nhãn in hoa giãn chữ — "HÚT VỀ · KHỚP ĐIỀU BẠN CHIẾU SÁNG", "NGÀY 128 · THỨ TƯ".
///
/// `text` tra String Catalog theo NGUYÊN VĂN caller đưa (không match key thì hiện y nguyên
/// — chuỗi runtime/brand name tự rơi qua). In hoa bằng .textCase để key giữ nguyên chữ gốc.
struct EyebrowLabel: View {
    let text: String
    var color: Color = NodieColors.label
    var font: Font = NodieTypography.eyebrowSm

    var body: some View {
        Text(LocalizedStringKey(text))
            .textCase(.uppercase)
            .font(font)
            .tracking(NodieSpacing.eyebrowTracking)
            .foregroundStyle(color)
    }
}

/// Xếp con theo hàng, hết chỗ thì xuống dòng — `flex-wrap` của prototype.
///
/// `HStack` không xuống dòng: chip lĩnh vực ("Y học trường thọ"…) sẽ bị bóp chữ hoặc tràn,
/// và càng chắc tràn khi user tăng cỡ chữ hệ thống.
struct FlowRow: Layout {
    var spacing: CGFloat = NodieSpacing.sm

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = layout(subviews: subviews, width: proposal.replacingUnspecifiedDimensions().width)
        let height = rows.last.map { $0.y + $0.height } ?? 0
        return CGSize(width: proposal.replacingUnspecifiedDimensions().width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for row in layout(subviews: subviews, width: bounds.width) {
            for item in row.items {
                subviews[item.index].place(
                    at: CGPoint(x: bounds.minX + item.x, y: bounds.minY + row.y),
                    proposal: ProposedViewSize(item.size)
                )
            }
        }
    }

    private struct Row {
        var y: CGFloat
        var height: CGFloat
        var items: [(index: Int, x: CGFloat, size: CGSize)]
    }

    private func layout(subviews: Subviews, width: CGFloat) -> [Row] {
        var rows: [Row] = []
        var current = Row(y: 0, height: 0, items: [])
        var x: CGFloat = 0

        for (index, subview) in subviews.enumerated() {
            let size = subview.sizeThatFits(.unspecified)
            // Xuống dòng khi hết chỗ — trừ con đầu hàng, nó phải nằm đâu đó dù có rộng quá.
            if x + size.width > width, !current.items.isEmpty {
                rows.append(current)
                current = Row(y: current.y + current.height + spacing, height: 0, items: [])
                x = 0
            }
            current.items.append((index, x, size))
            current.height = max(current.height, size.height)
            x += size.width + spacing
        }
        if !current.items.isEmpty { rows.append(current) }
        return rows
    }
}

/// Chip lọc — chọn: nền mực chữ kem. Thường: viền mảnh.
struct FilterChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            // Key lookup: nhãn chip là rawValue tiếng Việt của enum lọc.
            Text(LocalizedStringKey(label))
                .font(NodieTypography.chip)
                .foregroundStyle(isSelected ? NodieColors.cream : NodieColors.inkSoft)
                .padding(.horizontal, 13)
                .padding(.vertical, 6)
                .background {
                    if isSelected {
                        Capsule().fill(NodieColors.ink)
                    } else {
                        Capsule().stroke(NodieColors.chipBorder, lineWidth: 1)
                    }
                }
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isSelected ? [.isSelected, .isButton] : .isButton)
    }
}

/// Hàng chip lọc dùng chung cho Hỏi đáp và Hội thoại.
struct FilterChipRow<T: Identifiable & Hashable>: View where T: RawRepresentable, T.RawValue == String {
    let options: [T]
    @Binding var selection: T

    var body: some View {
        HStack(spacing: NodieSpacing.sm) {
            ForEach(options) { option in
                FilterChip(label: option.rawValue, isSelected: option == selection) {
                    selection = option
                }
            }
            Spacer(minLength: 0)
        }
    }
}

/// Tag chủ đề (nền be) hoặc badge chuyên gia (nền tím).
struct TopicTagView: View {
    let label: String
    var isExpert: Bool = false

    var body: some View {
        Text(label)
            .font(NodieTypography.tag)
            .foregroundStyle(isExpert ? NodieColors.purple : NodieColors.label)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(Capsule().fill(isExpert ? NodieColors.expertBg : NodieColors.tagBg))
    }
}

/// Viên đếm tin chưa đọc.
struct UnreadBadge: View {
    let count: Int

    var body: some View {
        Text("\(count)")
            .font(NodieTypography.unread)
            .foregroundStyle(.white)
            .padding(.horizontal, 6)
            .frame(minWidth: 20, minHeight: 20)
            .background(Capsule().fill(NodieColors.accent))
            .accessibilityLabel(Text("\(count) tin chưa đọc"))
    }
}

/// Nút viền tròn dùng cho nút back ở màn detail.
///
/// VoiceOver phải đọc "Quay lại" chứ không phải "arrow.left" — tên SF Symbol là
/// chi tiết kỹ thuật, không phải thứ để đọc cho người dùng nghe.
struct CircleIconButton: View {
    let systemName: String
    var accessibilityLabel: LocalizedStringKey = "Quay lại"
    /// Trên header mực: glyph kem trên đĩa mờ, thay vì mực trên viền be (chìm nghỉm).
    var onDark: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(onDark ? NodieColors.cream : NodieColors.ink)
                .frame(width: 34, height: 34)
                .background {
                    if onDark {
                        Circle().fill(NodieColors.onDarkFill)
                    } else {
                        Circle().stroke(NodieColors.chipBorder, lineWidth: 1)
                    }
                }
                .expandedHitArea()
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityLabel)
    }
}

extension View {
    /// Nới vùng bấm ra tối thiểu 44pt (Apple HIG) mà KHÔNG đổi chỗ view chiếm trong layout.
    ///
    /// `padding(inset)` nới vùng bấm, `contentShape` biến vùng đó thành vùng nhận chạm,
    /// rồi `padding(-inset)` trả kích thước báo cho layout về như cũ — nút vẫn vẽ 34pt,
    /// hàng xóm không bị đẩy đi, ảnh không đổi. Bọc `.frame(44)` thẳng sẽ đội layout lên 10pt.
    func expandedHitArea(minimum: CGFloat = 44, visual: CGFloat = 34) -> some View {
        let inset = max(0, (minimum - visual) / 2)
        return self
            .padding(inset)
            .contentShape(Rectangle())
            .padding(-inset)
    }
}
