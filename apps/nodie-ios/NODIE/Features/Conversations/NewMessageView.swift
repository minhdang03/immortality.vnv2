import SwiftUI

/// Chọn người để mở tin nhắn mới (nút ✎ ở màn Chat).
///
/// Danh sách người lấy từ `FollowStore.suggestions` — UUID thật của `profiles`, không còn
/// slug Mock ("huong"…) và không còn guard `UUID(uuidString:)` tạm bợ để ép id giả chạy.
///
/// `follow` là instance RIÊNG của màn này, không nhận qua init: chỗ gọi duy nhất
/// (`ConversationListView.swift:116`) thuộc phạm vi cấm sửa của tác vụ này, đổi chữ ký
/// init sẽ vỡ build ở đó. Không hại gì — sheet này chỉ hiện tên/bio để chọn người nhắn,
/// không vẽ nút Theo dõi nên không cần state follow "sống chung" với FriendsView/
/// MemberProfileView (khác `ConversationStore`, nơi lệch cache là bug thật — xem
/// `MemberProfileView`).
///
/// KHÔNG tái dùng `PersonRowView` (Friends/): nó kèm pill "Theo dõi" — ở đây một dòng chỉ
/// được làm một việc là mở DM, thêm nút thứ hai vào là mời bấm nhầm.
struct NewMessageView: View {
    @Bindable var state: AppState
    let store: ConversationStore
    /// Truyền từ RootTabView xuống, KHÔNG `@State` cục bộ: store riêng của màn này sẽ có
    /// danh sách "đang theo dõi" riêng, nên follow ai đó ở tab Bạn bè rồi mở màn này vẫn
    /// thấy trạng thái cũ — và ngược lại. Một trạng thái, một nguồn.
    let follow: FollowStore
    @Environment(\.dismiss) private var dismiss

    /// Ô tìm — `peoplePicker` chỉ có 50 người đầu (order theo tên), quá đó là không mở được
    /// DM với người ngoài danh sách theo dõi. Search chạy `public_profiles` server-side như
    /// tab Bạn bè, nên tìm được toàn cộng đồng.
    @State private var query = ""
    @State private var searchTask: Task<Void, Never>?
    private var trimmedQuery: String { query.trimmingCharacters(in: .whitespacesAndNewlines) }
    private var isSearchActive: Bool { !trimmedQuery.isEmpty }
    /// Đang tìm thì hiện kết quả server; không thì danh bạ 50 người.
    private var peopleToShow: [PublicProfile] { isSearchActive ? follow.searchResults : follow.peoplePicker }

    var body: some View {
        VStack(spacing: 0) {
            header
            searchBar

            ScrollView {
                LazyVStack(spacing: 0) {
                    if isSearchActive && peopleToShow.isEmpty && !follow.isSearching {
                        Text("Không tìm thấy ai.")
                            .font(NodieTypography.bodySm)
                            .foregroundStyle(NodieColors.inkMuted)
                            .padding(.top, NodieSpacing.xl)
                    }
                    // `peoplePicker` chứ không `suggestions`: suggestions trừ người mình theo,
                    // mà đây là picker nhắn tin — giấu người quen là ngược đời (bug đã dính:
                    // An theo Bình xong không nhắn được cho Bình từ nút ✎).
                    ForEach(peopleToShow) { profile in
                        Button {
                            // Đóng sheet TRƯỚC để nó không còn nằm trên khung chat vừa mở
                            // (RPC + điều hướng chạy async, không đợi kịp sẽ thấy giật).
                            let userId = profile.id
                            dismiss()
                            Task {
                                if let channelId = await store.openOrCreateDM(with: userId) {
                                    state.openChat(channelId)
                                }
                            }
                        } label: {
                            row(profile)
                        }
                        .buttonStyle(.plain)
                        // Danh sách hội thoại nằm ngay dưới sheet cũng có dòng trùng TÊN
                        // → tìm theo nhãn là mơ hồ. Định danh bằng UUID thì không.
                        .accessibilityIdentifier("newMessagePerson-\(profile.id)")

                        Divider().background(NodieColors.ruleLight)
                    }
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.bottom, NodieSpacing.xl)
            }
        }
        .background(NodieColors.bg)
        .task {
            if !follow.didLoadOnce { await follow.load() }
        }
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            EyebrowLabel(text: "Tin nhắn mới", font: NodieTypography.eyebrow)
            Spacer()
            Button { dismiss() } label: {
                Text("Huỷ")
                    .font(NodieTypography.chip)
                    .foregroundStyle(NodieColors.inkSoft)
                    .padding(.horizontal, 15)
                    .padding(.vertical, 7)
                    .background(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private var searchBar: some View {
        HStack(spacing: 9) {
            Text("⌕")
                .font(.system(size: 14))
                .foregroundStyle(NodieColors.inkFaint)
            TextField("Tìm người trong cộng đồng…", text: $query)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.ink)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                // Debounce huỷ-được: mỗi phím huỷ Task cũ, xếp Task mới — gõ nhanh chỉ bắn
                // request cuối (cùng cách FriendsView; comment gốc ở FollowStore.search).
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
                Button { query = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 15))
                        .foregroundStyle(NodieColors.inkFaint)
                        .expandedHitArea(visual: 15)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Xoá tìm kiếm")
            }
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.vertical, NodieSpacing.sm)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private func row(_ profile: PublicProfile) -> some View {
        HStack(spacing: NodieSpacing.md) {
            InitialAvatar(initial: String(profile.name.prefix(1)).uppercased(), size: 46)

            VStack(alignment: .leading, spacing: 1) {
                // Tên là danh tính chính — cho tràn 2 dòng ở cỡ chữ lớn nhất thay vì cắt mất
                // một phần tên (phase 05, a11y).
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

            Spacer(minLength: 0)
        }
        .padding(.vertical, 11)
        .contentShape(Rectangle())
    }
}

#Preview {
    NewMessageView(state: AppState(), store: ConversationStore(), follow: FollowStore())
}
