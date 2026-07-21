import SwiftUI
import Supabase

/// Hồ sơ một thành viên khác — header tối, thống kê, hoạt động.
///
/// Khác `ProfileView` (hồ sơ của chính mình): ở đây không sửa được gì, đổi lại có
/// Theo dõi + Nhắn tin. Hai màn cố nhập làm một sẽ thành một mớ `if isMe`.
///
/// Chạy Supabase thật (view `public_profiles`, 0027) — không còn `Member`/`MockData`.
/// `emoji`/`gradient`/`verified`/`level`/`fields`/`posts` của mock KHÔNG có cột nào
/// tương ứng trong DB và không có nguồn nào sinh ra được thật, nên bỏ hẳn thay vì bịa —
/// xem `InitialAvatar` (đã dùng khắp Q&A/chat cho user thật) thay avatar màu mè.
struct MemberProfileView: View {
    @Bindable var state: AppState
    @Bindable var follow: FollowStore
    let conversations: ConversationStore
    let memberId: UUID

    @Environment(\.dismiss) private var dismiss

    @State private var loadState: LoadState = .loading
    @State private var stats: ProfileStatsStore
    @State private var isOpeningChat = false

    private enum LoadState {
        case loading
        /// Dùng lại `PublicProfile` (FollowStore) — cùng 3 cột `id/display_name/bio` của
        /// view `public_profiles`, không cần khai riêng một struct trùng lặp.
        case loaded(PublicProfile)
        /// Cờ RIÊNG, không suy từ "loaded == nil": id sai/đã xoá và "mạng đang chờ" là
        /// hai trạng thái khác nhau, gộp lại thì màn hình đứng chờ mãi không biết đâu mà lần
        /// (cùng bài với `isResolving` ở `QuestionDetailView`).
        case notFound
    }

    init(state: AppState, follow: FollowStore, conversations: ConversationStore, memberId: UUID) {
        self.state = state
        self.follow = follow
        self.conversations = conversations
        self.memberId = memberId
        _stats = State(initialValue: ProfileStatsStore(uid: memberId))
    }

    private var isFollowing: Bool { follow.isFollowing(memberId) }

    var body: some View {
        ScrollView {
            switch loadState {
            case .loading:
                ProgressView()
                    .padding(.top, 120)
                    .frame(maxWidth: .infinity)
            case .loaded(let profile):
                VStack(alignment: .leading, spacing: 0) {
                    header(profile)
                    ProfileStatsGrid(stats: stats)
                        .padding(.horizontal, NodieSpacing.screenH)
                        .padding(.top, 18)
                        .padding(.bottom, NodieSpacing.xxl)
                }
            case .notFound:
                notFoundState
            }
        }
        .background(NodieColors.bg)
        .task {
            // Đứng ở đây phòng khi vào thẳng hồ sơ (vd sau này từ chat) mà chưa qua tab
            // Bạn bè — không có bước đó thì `follow.isFollowing` luôn trả false sai.
            if !follow.didLoadOnce { await follow.load() }
            await load()
        }
    }

    private func load() async {
        do {
            let profile: PublicProfile = try await SupabaseClientProvider.shared
                .from("public_profiles")
                .select("id,display_name,bio,last_seen_at")
                .eq("id", value: memberId)
                .single()
                .execute().value
            loadState = .loaded(profile)
        } catch {
            // `.single()` ném lỗi cả khi 0 dòng (id sai/đã xoá) lẫn khi mạng hỏng — không
            // phân biệt được hai ca từ đây, và với người dùng thì cả hai đều là "mở không
            // được", đúng như yêu cầu #3.
            loadState = .notFound
        }
    }

    // MARK: - Không tìm thấy

    private var notFoundState: some View {
        VStack(spacing: NodieSpacing.sm) {
            Spacer(minLength: 80)
            Image(systemName: "eye.slash")
                .font(.system(size: 30))
                .foregroundStyle(NodieColors.inkFaint)
            // Nói ĐÚNG chuyện đang xảy ra: id này không có ai. "Có lỗi xảy ra, thử lại"
            // là lời khuyên sai — thử lại bao nhiêu lần cũng vẫn không có người đó.
            Text("Không tìm thấy người này.")
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
                .multilineTextAlignment(.center)
            Text("Có thể tài khoản đã bị xoá.")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkFaint)
                .multilineTextAlignment(.center)
            Spacer(minLength: 80)
        }
        .padding(.horizontal, NodieSpacing.xxl)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Header tối

    private func header(_ profile: PublicProfile) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            CircleIconButton(systemName: "arrow.left", onDark: true) { dismiss() }

            HStack(spacing: 15) {
                ZStack(alignment: .bottomTrailing) {
                    InitialAvatar(initial: String(profile.name.prefix(1)).uppercased(), size: 72)
                    if PresenceStatus.of(profile.lastSeenAt).isOnline {
                        OnlineDot(size: 16).offset(x: 2, y: 2)
                    }
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(profile.name)
                        .font(NodieTypography.memberName)
                        .foregroundStyle(NodieColors.cream)
                    if let label = PresenceStatus.of(profile.lastSeenAt).label {
                        Text(label)
                            .font(NodieTypography.bodySm)
                            .foregroundStyle(NodieColors.onDarkStrong)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.top, NodieSpacing.lg)

            if let bio = profile.bio, !bio.isEmpty {
                Text(bio)
                    .font(NodieTypography.bodySm)
                    .lineSpacing(5)
                    .foregroundStyle(NodieColors.onDarkStrong)
                    .padding(.top, NodieSpacing.md)
            }

            HStack(spacing: 10) {
                followButton
                messageButton
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
    private var followButton: some View {
        Button {
            Task { await follow.toggle(memberId) }
        } label: {
            darkPill(isFollowing ? "✓ Đang theo dõi" : "＋ Theo dõi")
                .background(Capsule().fill(isFollowing ? NodieColors.onDarkFill : NodieColors.accent))
                .overlay(Capsule().stroke(isFollowing ? NodieColors.onDarkBorder : NodieColors.accent, lineWidth: 1))
                .expandedHitArea(visual: 34)
        }
        .buttonStyle(.plain)
    }

    /// `conversations` được RootTabView bơm xuống — CÙNG store với ConversationListView/
    /// ChatDetailView, không tự `ConversationStore()` tại chỗ. Store cục bộ sẽ không thấy
    /// cache/realtime của phần còn lại của app: mở DM xong quay lại danh sách hội thoại sẽ
    /// không thấy kênh vừa tạo cho tới khi app tự nạp lại lần khác.
    private var messageButton: some View {
        Button {
            guard !isOpeningChat else { return }
            isOpeningChat = true
            Task {
                defer { isOpeningChat = false }
                if let channelId = await conversations.openOrCreateDM(with: memberId) {
                    state.openChat(channelId)
                }
            }
        } label: {
            darkPill("Nhắn tin")
                .background(Capsule().fill(NodieColors.onDarkFill))
                .overlay(Capsule().stroke(NodieColors.onDarkBorder, lineWidth: 1))
                .opacity(isOpeningChat ? 0.6 : 1)
                .expandedHitArea(visual: 34)
        }
        .buttonStyle(.plain)
        .disabled(isOpeningChat)
    }

    private func darkPill(_ label: LocalizedStringKey) -> some View {
        Text(label)
            .font(NodieTypography.bodySm.weight(.bold))
            .foregroundStyle(NodieColors.cream)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 11)
    }
}

#Preview {
    MemberProfileView(state: AppState(), follow: FollowStore(), conversations: ConversationStore(),
                       memberId: UUID())
}
