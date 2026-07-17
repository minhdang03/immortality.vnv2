import SwiftUI

/// Bạn bè — danh sách người trong cộng đồng + tìm kiếm, chạy `FollowStore` thật.
///
/// Không còn "Đang theo dõi"/"Gợi ý cho bạn" là hai section tách biệt: `FollowStore`
/// (đã verify chạy prod, KHÔNG sửa ở đây) chỉ chở `following: Set<UUID>` (không tên) và
/// `suggestions: [PublicProfile]` (tối đa 50 người, đã loại người mình theo — xem
/// `loadSuggestions()`). Không có nguồn thật nào để dựng lại một danh sách "đang theo dõi"
/// có tên/bio mà không sửa store — dựng danh sách đó ở đây sẽ phải tự bịa hoặc query trùng
/// logic của store, phạm DRY. Ghi nợ: cần `FollowStore` thêm hàm nạp hồ sơ những người mình
/// đang theo, cho một section riêng đúng thiết kế gốc.
struct FriendsView: View {
    @Bindable var state: AppState
    @Bindable var follow: FollowStore
    /// Chữ cái đầu của người đang đăng nhập — prototype vẽ cứng "M".
    var profileInitial: String = "?"

    @State private var query = ""
    @State private var searchTask: Task<Void, Never>?

    /// Đang gõ tìm kiếm thì hiện kết quả tìm; ô trống thì hiện danh sách gợi ý.
    private var displayedPeople: [PublicProfile] {
        query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? follow.suggestions : follow.searchResults
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        section(title: "Gợi ý cho bạn", people: displayedPeople)
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
        .task {
            if !follow.didLoadOnce { await follow.load() }
        }
    }

    private func section(title: String, people: [PublicProfile]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: title).padding(.bottom, NodieSpacing.xs)
            ForEach(people) { profile in
                PersonRowView(
                    profile: profile,
                    isFollowing: follow.isFollowing(profile.id),
                    onTap: { state.friendsPath.append(FriendsRoute.member(profile.id)) },
                    onToggleFollow: {
                        NodieHaptics.tap()
                        // Nút đổi nhãn "＋ Theo dõi" ↔ "✓ Đang theo dõi" (bề rộng khác nhau)
                        // — spring cho cú đổi chỗ, không phải nhảy khựng.
                        Task { await follow.toggle(profile.id) }
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

            HStack(spacing: 9) {
                Text("⌕")
                    .font(.system(size: 14))
                    .foregroundStyle(NodieColors.inkFaint)
                TextField("Tìm người trong cộng đồng…", text: $query)
                    .font(NodieTypography.bodySm)
                    .foregroundStyle(NodieColors.ink)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    // Debounce bằng Task huỷ-được: mỗi phím huỷ Task cũ rồi xếp Task mới —
                    // gõ nhanh chỉ bắn đúng một request cuối cùng, không tự DDoS chính mình
                    // (comment gốc ở `FollowStore.search`).
                    .onChange(of: query) { _, newValue in
                        searchTask?.cancel()
                        searchTask = Task {
                            try? await Task.sleep(nanoseconds: 300_000_000)
                            guard !Task.isCancelled else { return }
                            await follow.search(newValue)
                        }
                    }
            }
            .padding(.horizontal, 15)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Capsule().fill(NodieColors.surface))
            .overlay(Capsule().stroke(NodieColors.rule, lineWidth: 1))
            .padding(.top, 14)
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
                        Text(profile.name)
                            .font(NodieTypography.rowTitle)
                            .foregroundStyle(NodieColors.ink)
                            .lineLimit(1)
                        if let bio = profile.bio, !bio.isEmpty {
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
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isFollowing ? Text("Bỏ theo dõi \(profile.name)") : Text("Theo dõi \(profile.name)"))
        }
        .padding(.vertical, 11)
    }
}

#Preview {
    FriendsView(state: AppState(), follow: FollowStore())
}
