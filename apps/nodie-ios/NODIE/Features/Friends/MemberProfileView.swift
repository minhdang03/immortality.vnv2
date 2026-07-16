import SwiftUI

/// Hồ sơ một thành viên khác — header tối, thống kê, lĩnh vực, hoạt động gần đây.
///
/// Khác `ProfileView` (hồ sơ của chính mình): ở đây không sửa được gì, đổi lại có
/// Theo dõi + Nhắn tin. Hai màn cố nhập làm một sẽ thành một mớ `if isMe`.
struct MemberProfileView: View {
    @Bindable var state: AppState
    let memberId: String

    @Environment(\.dismiss) private var dismiss

    private var member: Member? { state.member(id: memberId) }
    private var isFollowing: Bool { state.isFollowing(memberId) }

    var body: some View {
        ScrollView {
            if let member {
                VStack(alignment: .leading, spacing: 0) {
                    header(member)
                    statsGrid(member)
                    fields(member)
                    activity(member)
                }
            }
        }
        .background(NodieColors.bg)
    }

    // MARK: - Header tối

    private func header(_ member: Member) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            CircleIconButton(systemName: "arrow.left", onDark: true) { dismiss() }

            HStack(spacing: 15) {
                Text(member.emoji)
                    .font(.system(size: 32))
                    .frame(width: 72, height: 72)
                    .background(
                        Circle().fill(
                            LinearGradient(colors: member.gradient,
                                           startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                    )

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 7) {
                        Text(member.name)
                            .font(NodieTypography.memberName)
                            .foregroundStyle(NodieColors.cream)
                        if member.verified {
                            Text("✦")
                                .font(.system(size: 15))
                                .foregroundStyle(NodieColors.accentLight)
                                .accessibilityLabel("Đã xác minh")
                        }
                    }
                    Text(member.level)
                        .font(NodieTypography.meta.weight(.semibold))
                        .foregroundStyle(NodieColors.goldOnDark)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.top, NodieSpacing.lg)

            Text(member.join)
                .font(NodieTypography.meta)
                .foregroundStyle(NodieColors.cream.opacity(0.55))
                .padding(.top, NodieSpacing.md)

            Text(member.bio)
                .font(NodieTypography.bodySm)
                .lineSpacing(5)
                .foregroundStyle(NodieColors.onDarkStrong)
                .padding(.top, 10)

            HStack(spacing: 10) {
                followButton
                Button {
                    state.openOrCreateDM(with: memberId)
                } label: {
                    darkPill("Nhắn tin")
                        .background(Capsule().fill(NodieColors.onDarkFill))
                        .overlay(Capsule().stroke(NodieColors.onDarkBorder, lineWidth: 1))
                }
                .buttonStyle(.plain)
            }
            .padding(.top, NodieSpacing.lg)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.xxl)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .topTrailing) {
            // Quầng sáng góc phải — prototype: radial-gradient accent 27% → trong suốt.
            Circle()
                .fill(RadialGradient(colors: [NodieColors.accent.opacity(0.27), .clear],
                                     center: .center, startRadius: 0, endRadius: 85))
                .frame(width: 170, height: 170)
                .offset(x: 30, y: -40)
        }
        .background(NodieColors.ink)
    }

    /// Đang theo dõi thì dùng hệ nền-tối như nút "Nhắn tin" cạnh nó.
    /// Prototype để `transparent` + chữ #6d5f45 cho trạng thái này — nâu sẫm trên nền gần đen,
    /// đọc không ra; đó là style của nút follow bên màn Bạn bè (nền sáng) bị bê nhầm sang đây.
    private var followButton: some View {
        Button { state.toggleFollow(memberId) } label: {
            darkPill(isFollowing ? "✓ Đang theo dõi" : "＋ Theo dõi")
                .background(Capsule().fill(isFollowing ? NodieColors.onDarkFill : NodieColors.accent))
                .overlay(Capsule().stroke(isFollowing ? NodieColors.onDarkBorder : NodieColors.accent, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private func darkPill(_ label: String) -> some View {
        Text(label)
            .font(NodieTypography.bodySm.weight(.bold))
            .foregroundStyle(NodieColors.cream)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 11)
    }

    // MARK: - Thống kê

    private func statsGrid(_ member: Member) -> some View {
        NodieStatGrid(items: member.stats.map { .init(value: $0.value, label: $0.label) })
            .padding(.horizontal, NodieSpacing.screenH)
            .padding(.top, 18)
    }

    // MARK: - Lĩnh vực

    private func fields(_ member: Member) -> some View {
        VStack(alignment: .leading, spacing: NodieSpacing.sm) {
            EyebrowLabel(text: "Lĩnh vực đang theo")
            FlowRow(spacing: NodieSpacing.sm) {
                ForEach(member.fields) { field in
                    Text(field.label)
                        .font(NodieTypography.chip)
                        .foregroundStyle(field.fg)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(field.bg))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.lg)
    }

    // MARK: - Hoạt động gần đây

    private func activity(_ member: Member) -> some View {
        VStack(alignment: .leading, spacing: NodieSpacing.sm) {
            EyebrowLabel(text: "Hoạt động gần đây")
            ForEach(member.posts) { post in
                VStack(alignment: .leading, spacing: 6) {
                    Text(post.title)
                        .font(NodieTypography.postTitle)
                        .foregroundStyle(NodieColors.ink)
                        .lineSpacing(2)
                        .multilineTextAlignment(.leading)
                    MemberPostMeta(meta: post.meta)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 15)
                .padding(.vertical, 13)
                .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.surface))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(NodieColors.rule, lineWidth: 1))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, 18)
        .padding(.bottom, NodieSpacing.xxl)
    }
}

/// Meta của bài: "214 ☀ · 2 giờ trước". ☀ phải vàng nắng — nó là hạt ánh sáng,
/// và đây là chỗ duy nhất trong chuỗi cần tô khác phần còn lại.
struct MemberPostMeta: View {
    let meta: String

    var body: some View {
        buildText()
            .font(NodieTypography.metaSm)
            .foregroundStyle(NodieColors.inkMuted)
    }

    private func buildText() -> Text {
        meta.split(separator: " ", omittingEmptySubsequences: false)
            .map { $0 == "☀" ? Text("☀").foregroundColor(NodieColors.sun) : Text(String($0)) }
            .enumerated()
            .reduce(Text("")) { acc, item in
                item.offset == 0 ? item.element : acc + Text(" ") + item.element
            }
    }
}

#Preview {
    MemberProfileView(state: AppState(), memberId: "huong")
}
