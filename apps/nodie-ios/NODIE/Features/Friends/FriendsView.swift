import SwiftUI

/// Bạn bè — hai section kiểu IG: "Đang theo dõi" (quản lý người đã theo) + "Gợi ý cho bạn",
/// kèm tìm kiếm. Chạy `FollowStore` thật; mọi trạng thái tải/rỗng/lỗi/tìm đều có mặt riêng.
struct FriendsView: View {
    @Bindable var state: AppState
    @Bindable var follow: FollowStore
    /// Chữ cái đầu của người đang đăng nhập — prototype vẽ cứng "M".
    var profileInitial: String = "?"

    @State private var query = ""
    @State private var searchTask: Task<Void, Never>?
    /// Người đang chờ xác nhận bỏ theo dõi — bỏ theo là phá huỷ nhẹ (mất kết nối đã gây
    /// dựng), một confirmationDialog chặn cú bấm trượt. Theo dõi thì không hỏi.
    @State private var pendingUnfollow: PublicProfile?

    private var trimmedQuery: String { query.trimmingCharacters(in: .whitespacesAndNewlines) }
    private var isSearchActive: Bool { !trimmedQuery.isEmpty }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            content
        }
        .background(NodieColors.bg)
        .task {
            if !follow.didLoadOnce { await follow.load() }
        }
        .confirmationDialog(
            Text("Bỏ theo dõi \(pendingUnfollow?.name ?? "")?"),
            isPresented: Binding(
                get: { pendingUnfollow != nil },
                set: { if !$0 { pendingUnfollow = nil } }
            ),
            titleVisibility: .visible
        ) {
            Button("Bỏ theo dõi", role: .destructive) {
                guard let person = pendingUnfollow else { return }
                NodieHaptics.tap()
                Task { await follow.toggle(person.id) }
            }
        }
    }

    /// Ưu tiên trạng thái: đang tìm > đang tải lần đầu > lỗi nạp > nội dung.
    /// Lỗi nạp chỉ chặn màn khi CHƯA từng có dữ liệu — refresh hỏng thì giữ nội dung cũ.
    @ViewBuilder private var content: some View {
        if isSearchActive {
            searchResults
        } else if follow.isLoading && !follow.didLoadOnce {
            loading
        } else if let error = follow.loadError, !follow.didLoadOnce {
            errorState(error)
        } else {
            peopleList
        }
    }

    // MARK: - Nội dung chính

    private var peopleList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    followingSection
                    suggestionsSection.padding(.top, NodieSpacing.lg)
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

    private var followingSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "Đang theo dõi").padding(.bottom, NodieSpacing.xs)
            if follow.followingProfiles.isEmpty {
                // Gợi ý nằm ngay bên dưới nên CTA chỉ cần trỏ xuống, không cần nút cuộn.
                sectionNote(title: "Bạn chưa theo dõi ai.", hint: "Xem gợi ý bên dưới nhé.")
            } else {
                rows(follow.followingProfiles, isFollowing: { _ in true }) { profile in
                    pendingUnfollow = profile
                }
            }
        }
    }

    private var suggestionsSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            EyebrowLabel(text: "Gợi ý cho bạn").padding(.bottom, NodieSpacing.xs)
            if follow.suggestions.isEmpty {
                sectionNote(title: "Chưa có gợi ý mới.", hint: nil)
            } else {
                rows(follow.suggestions, isFollowing: { follow.isFollowing($0.id) }) { profile in
                    NodieHaptics.tap()
                    // Nút đổi nhãn "＋ Theo dõi" ↔ "✓ Đang theo dõi" (bề rộng khác nhau)
                    // — spring cho cú đổi chỗ, không phải nhảy khựng.
                    Task { await follow.toggle(profile.id) }
                }
            }
        }
    }

    private func rows(_ people: [PublicProfile],
                      isFollowing: @escaping (PublicProfile) -> Bool,
                      onToggle: @escaping (PublicProfile) -> Void) -> some View {
        ForEach(people) { profile in
            PersonRowView(
                profile: profile,
                isFollowing: isFollowing(profile),
                onTap: { state.friendsPath.append(FriendsRoute.member(profile.id)) },
                onToggleFollow: { onToggle(profile) }
            )
            Divider().background(NodieColors.ruleLight)
        }
    }

    private func sectionNote(title: LocalizedStringKey, hint: LocalizedStringKey?) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title).font(NodieTypography.bodySm).foregroundStyle(NodieColors.inkMuted)
            if let hint {
                Text(hint).font(NodieTypography.metaSm).foregroundStyle(NodieColors.inkFaint)
            }
        }
        .padding(.vertical, NodieSpacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Tìm kiếm

    @ViewBuilder private var searchResults: some View {
        if follow.searchResults.isEmpty {
            if follow.isSearching {
                // Chưa có gì để vẽ mà nói "không tìm thấy" là nói dối sớm — chờ câu trả lời.
                ProgressView().tint(NodieColors.accent)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                VStack(spacing: NodieSpacing.sm) {
                    Image(systemName: "person.crop.circle.badge.questionmark")
                        .font(.system(size: 30)).foregroundStyle(NodieColors.inkFaint)
                    Text("Không tìm thấy ai với “\(trimmedQuery)”.")
                        .font(NodieTypography.body).foregroundStyle(NodieColors.inkMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        } else {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    rows(follow.searchResults, isFollowing: { follow.isFollowing($0.id) }) { profile in
                        NodieHaptics.tap()
                        // Trong kết quả tìm, bỏ theo cũng hỏi lại — cùng luật với section trên.
                        if follow.isFollowing(profile.id) { pendingUnfollow = profile }
                        else { Task { await follow.toggle(profile.id) } }
                    }
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.top, NodieSpacing.sm)
            }
        }
    }

    // MARK: - Tải / lỗi

    /// Khung xương thay vòng xoay — dùng lại chính `PersonRowView` nên danh sách thật
    /// hiện ra không nhảy layout (cùng lối `.redacted` với QuestionListView).
    private var loading: some View {
        VStack(spacing: 0) {
            ForEach(0..<6, id: \.self) { seed in
                PersonRowView(profile: .placeholder(seed: seed), isFollowing: false,
                              onTap: {}, onToggleFollow: {})
                Divider().background(NodieColors.ruleLight)
            }
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.lg)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .redacted(reason: .placeholder)
        // Khung xương là tiếng ồn với VoiceOver — nó đọc ra sáu người bịa.
        .accessibilityHidden(true)
        .overlay {
            Color.clear
                .accessibilityLabel("Đang tải danh sách")
                .accessibilityAddTraits(.updatesFrequently)
        }
    }

    /// Lỗi vẽ tại chỗ, không alert gốc: màn hình nói được vì sao và mời đúng hành động
    /// (`NodieErrorKind` quyết có nên mời "Thử lại" — hết quyền thì mời là hứa suông).
    private func errorState(_ error: NodieErrorKind) -> some View {
        VStack(spacing: NodieSpacing.sm) {
            Image(systemName: error == .offline ? "wifi.slash" : "exclamationmark.triangle")
                .font(.system(size: 30)).foregroundStyle(NodieColors.inkFaint)
            Text(error.message)
                .font(NodieTypography.body).foregroundStyle(NodieColors.inkMuted)
                .multilineTextAlignment(.center)
            if error.isRetryable {
                Button {
                    Task { await follow.load() }
                } label: {
                    Text("Thử lại")
                        .font(NodieTypography.chip.weight(.bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, NodieSpacing.lg)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(NodieColors.accent))
                        .expandedHitArea(visual: 34)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Header

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
                if follow.isSearching {
                    ProgressView().controlSize(.small).tint(NodieColors.inkFaint)
                } else if !query.isEmpty {
                    Button {
                        query = ""   // onChange lo phần còn lại: huỷ task cũ, xoá kết quả
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 15))
                            .foregroundStyle(NodieColors.inkFaint)
                            .expandedHitArea(visual: 20)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Xoá tìm kiếm")
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

#Preview {
    FriendsView(state: AppState(), follow: FollowStore())
}
