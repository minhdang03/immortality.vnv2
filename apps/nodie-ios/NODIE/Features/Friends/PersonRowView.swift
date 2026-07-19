import SwiftUI

/// Một người trong danh sách: chạm dòng mở hồ sơ, chạm nút follow thì KHÔNG mở.
///
/// Nút nằm lồng trong vùng chạm của dòng nên phải là `Button` riêng với `.buttonStyle(.plain)`
/// — bọc cả dòng bằng Button rồi đặt Button con vào trong thì con ăn trước, đúng thứ ta cần.
struct PersonRowView: View {
    let profile: PublicProfile
    let isFollowing: Bool
    let onTap: () -> Void
    let onToggleFollow: () -> Void

    var body: some View {
        HStack(spacing: NodieSpacing.md) {
            Button(action: onTap) {
                HStack(spacing: NodieSpacing.md) {
                    InitialAvatar(initial: String(profile.name.prefix(1)).uppercased(), size: 46)

                    VStack(alignment: .leading, spacing: 1) {
                        // Tên là danh tính chính — cho tràn 2 dòng ở cỡ chữ lớn nhất thay vì
                        // cắt mất một phần tên (phase 05, a11y).
                        Text(profile.name)
                            .font(NodieTypography.rowTitle)
                            .foregroundStyle(NodieColors.ink)
                            .lineLimit(1...2)
                        if let bio = profile.bio, !bio.isEmpty {
                            // Bio là thông tin phụ, xem đầy đủ được ở hồ sơ — cắt 1 dòng có chủ đích.
                            Text(bio)
                                .font(NodieTypography.metaSm)
                                .foregroundStyle(NodieColors.inkMuted)
                                .lineLimit(1)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            Button(action: onToggleFollow) {
                (isFollowing ? Text("✓ Đang theo dõi") : Text("＋ Theo dõi"))
                    .font(NodieTypography.chip.weight(.bold))
                    .foregroundStyle(isFollowing ? NodieColors.inkSoft : .white)
                    .padding(.horizontal, 15)
                    .padding(.vertical, 7)
                    .background(Capsule().fill(isFollowing ? .clear : NodieColors.accent))
                    .overlay(Capsule().stroke(isFollowing ? NodieColors.chipBorder : NodieColors.accent, lineWidth: 1))
                    // Viên nang cao ~30pt — nới vùng chạm lên chuẩn 44pt, hình vẽ giữ nguyên.
                    .expandedHitArea(visual: 30)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isFollowing ? Text("Bỏ theo dõi \(profile.name)") : Text("Theo dõi \(profile.name)"))
        }
        .padding(.vertical, 11)
    }
}

extension PublicProfile {
    /// Hàng giả cho khung xương lúc đang nạp. `.redacted` vẽ thanh xám theo ĐỘ DÀI chữ thật,
    /// nên tên/bio phải dài ngắn khác nhau — các dòng bằng chằn chặn trông như mã vạch.
    ///
    /// KHÔNG dịch: `.redacted` phủ kín trước khi tới mắt ai, và skeleton `.accessibilityHidden`
    /// nên VoiceOver cũng không đọc (cùng lý do với `QuestionRow.placeholder`).
    static func placeholder(seed: Int) -> PublicProfile {
        let names = ["Nguyễn Thảo My", "An", "Trần Đức Bình An", "Hà Chi", "Phạm Quang", "Lê Bảo Ngọc Anh"]
        let bios = ["Đi tìm giấc ngủ sâu", nil, "Ăn sạch, tập đều, ngủ đúng giờ", "Người mới", nil, "Học lại cách thở"]
        return PublicProfile(
            id: UUID(),
            displayName: names[seed % names.count],
            bio: bios[seed % bios.count]
        )
    }
}
