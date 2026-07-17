import SwiftUI

/// Bạn bè — danh sách người đang theo dõi + gợi ý.
///
/// Avatar góc header là lối vào Cá Nhân. Prototype đặt nó ở đây (trước kia ở Bảng tin,
/// nay Bảng tin đã rút khỏi tab bar) — cùng pattern avatar-góc-trên của IG/X.
struct FriendsView: View {
    @Bindable var state: AppState
    /// Chữ cái đầu của người đang đăng nhập — prototype vẽ cứng "M".
    var profileInitial: String = "?"

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        // "Đang theo dõi" biến mất khi chưa theo ai — section rỗng chỉ tổ hỏi
                        // một câu không ai trả lời được.
                        if !state.followingList.isEmpty {
                            section(title: "Đang theo dõi", people: state.followingList)
                        }
                        section(title: "Gợi ý cho bạn", people: state.suggestList)
                            .padding(.top, state.followingList.isEmpty ? 0 : 18)
                    }
                    .padding(.horizontal, NodieSpacing.screenH)
                    .padding(.top, NodieSpacing.lg)
                    .padding(.bottom, NodieSpacing.md)
                    .id("top")
                }
                // Chạm lại tab khi đã ở root → cuộn lên đầu (xem AppState.selectTab).
                .onChange(of: state.rootScrollTick) {
                    withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("top", anchor: .top) }
                }
            }
        }
        .background(NodieColors.bg)
    }

    private func section(title: String, people: [Person]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: title).padding(.bottom, NodieSpacing.xs)
            ForEach(people) { person in
                PersonRowView(
                    person: person,
                    isFollowing: state.isFollowing(person.id),
                    onTap: { state.friendsPath.append(FriendsRoute.member(person.id)) },
                    onToggleFollow: {
                        NodieHaptics.tap()
                        // Nút đổi nhãn "＋ Theo dõi" ↔ "✓ Đang theo dõi" (bề rộng khác nhau)
                        // — spring cho cú đổi chỗ, không phải nhảy khựng.
                        withAnimation(.snappy(duration: 0.25)) { state.toggleFollow(person.id) }
                    }
                )
                Divider().background(NodieColors.ruleLight)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Bạn bè")
                    .font(NodieTypography.screenTitle)
                    .foregroundStyle(NodieColors.ink)
                Spacer()
                Button {
                    state.friendsPath.append(FriendsRoute.profile)
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

            // Trang trí — prototype chưa nối tìm kiếm thật.
            HStack(spacing: 9) {
                Text("⌕")
                    .font(.system(size: 14))
                    .foregroundStyle(NodieColors.inkFaint)
                Text("Tìm người trong cộng đồng…")
                    .font(NodieTypography.bodySm)
                    .foregroundStyle(NodieColors.inkFaint)
            }
            .padding(.horizontal, 15)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Capsule().fill(NodieColors.surface))
            .overlay(Capsule().stroke(NodieColors.rule, lineWidth: 1))
            .padding(.top, 14)
            .accessibilityHidden(true)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
    }
}

/// Một người trong danh sách: chạm dòng mở hồ sơ, chạm nút follow thì KHÔNG mở.
///
/// Nút nằm lồng trong vùng chạm của dòng nên phải là `Button` riêng với `.buttonStyle(.plain)`
/// — bọc cả dòng bằng Button rồi đặt Button con vào trong thì con ăn trước, đúng thứ ta cần.
struct PersonRowView: View {
    let person: Person
    let isFollowing: Bool
    let onTap: () -> Void
    let onToggleFollow: () -> Void

    var body: some View {
        HStack(spacing: NodieSpacing.md) {
            Button(action: onTap) {
                HStack(spacing: NodieSpacing.md) {
                    Text(person.emoji)
                        .font(.system(size: 20))
                        .frame(width: 46, height: 46)
                        .background(Circle().fill(person.bg))

                    VStack(alignment: .leading, spacing: 1) {
                        Text(person.name)
                            .font(NodieTypography.rowTitle)
                            .foregroundStyle(NodieColors.ink)
                            .lineLimit(1)
                        Text(person.sub)
                            .font(NodieTypography.metaSm)
                            .foregroundStyle(NodieColors.inkMuted)
                            .lineLimit(1)
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
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isFollowing ? Text("Bỏ theo dõi \(person.name)") : Text("Theo dõi \(person.name)"))
        }
        .padding(.vertical, 11)
    }
}

#Preview {
    FriendsView(state: AppState())
}
