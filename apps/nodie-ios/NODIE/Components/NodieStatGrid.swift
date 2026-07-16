import SwiftUI

/// Lưới thống kê 2 cột — card kem viền mảnh, số serif trên nhãn nhỏ.
///
/// Dùng ở hồ sơ người khác (`MemberProfileView`) và hồ sơ mình (`ProfileStatsGrid`).
/// Nhận chuỗi đã format sẵn chứ không nhận số: hai màn có nguồn khác nhau (mock vs
/// Supabase) và cách rút gọn khác nhau ("4.2k" vs "128") — format là việc của caller.
struct NodieStatGrid: View {
    struct Item: Identifiable, Hashable {
        let value: String
        let label: String
        var id: String { label }
    }

    let items: [Item]

    private let columns = [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 10) {
            ForEach(items) { item in
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.value)
                        .font(NodieTypography.memberName)
                        .foregroundStyle(NodieColors.ink)
                    Text(item.label)
                        .font(NodieTypography.timestampXs)
                        .foregroundStyle(NodieColors.inkMuted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 14)
                .padding(.vertical, NodieSpacing.md)
                .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.surface))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(NodieColors.rule, lineWidth: 1))
                // Số + nhãn là MỘT thông tin ("128 hạt ánh sáng"), không phải hai mẩu chữ
                // rời — gộp để VoiceOver đọc liền thay vì đọc số trần rồi nhãn trần.
                .accessibilityElement(children: .combine)
            }
        }
    }
}
