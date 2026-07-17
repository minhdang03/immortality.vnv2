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

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(follow.suggestions) { profile in
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

    private func row(_ profile: PublicProfile) -> some View {
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

            Spacer(minLength: 0)
        }
        .padding(.vertical, 11)
        .contentShape(Rectangle())
    }
}

#Preview {
    NewMessageView(state: AppState(), store: ConversationStore(), follow: FollowStore())
}
