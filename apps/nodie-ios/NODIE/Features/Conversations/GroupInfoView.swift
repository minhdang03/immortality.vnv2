import SwiftUI

/// Thông tin nhóm/kênh — avatar, tên, loại, và danh sách thành viên thật.
///
/// Tối thiểu có chủ đích: chỉ admin tạo nhóm (theo product), nên KHÔNG có sửa tên/thêm
/// người ở đây. Mỗi hàng thành viên mở hồ sơ người đó — back quay về đúng màn này.
struct GroupInfoView: View {
    @Bindable var state: AppState
    let store: ConversationStore
    let channelId: UUID

    @State private var members: [ConversationStore.ChannelMember] = []
    @State private var loading = true

    private var channel: ChannelRow? { store.channel(id: channelId) }

    var body: some View {
        ScrollView {
            VStack(spacing: NodieSpacing.lg) {
                header
                memberSection
            }
            .padding(.horizontal, 18)
            .padding(.top, NodieSpacing.lg)
            .padding(.bottom, 90)
        }
        .background(NodieColors.bg)
        .task { await load() }
    }

    private var header: some View {
        VStack(spacing: NodieSpacing.sm) {
            if let channel {
                ConversationAvatar(channel: channel, size: 72, fontSize: 32, showsBadge: false)
            }
            Text(channel?.displayTitle ?? "")
                .font(NodieTypography.chatName)
                .foregroundStyle(NodieColors.ink)
                .multilineTextAlignment(.center)
            if let label = channel?.kindLabel {
                Text(verbatim: label)
                    .font(NodieTypography.tag.weight(.semibold))
                    .foregroundStyle(NodieColors.inkMuted)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, NodieSpacing.md)
    }

    @ViewBuilder
    private var memberSection: some View {
        VStack(alignment: .leading, spacing: NodieSpacing.sm) {
            Text("\(members.count) thành viên")
                .font(NodieTypography.bodySm.weight(.semibold))
                .foregroundStyle(NodieColors.inkSoft)
                .opacity(loading ? 0 : 1)

            VStack(spacing: 0) {
                if loading {
                    ProgressView()
                        .tint(NodieColors.accent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, NodieSpacing.xl)
                } else if members.isEmpty {
                    // members(of:) lỗi mạng trả [] và đã set errorMessage — đừng để trống câm.
                    Text("Không tải được danh sách thành viên.")
                        .font(NodieTypography.bodySm)
                        .foregroundStyle(NodieColors.inkMuted)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, NodieSpacing.xl)
                } else {
                    ForEach(members) { member in
                        memberRow(member)
                        if member.id != members.last?.id {
                            Divider().background(NodieColors.rule).padding(.leading, 60)
                        }
                    }
                }
            }
            .background(RoundedRectangle(cornerRadius: 16).fill(NodieColors.surface))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(NodieColors.rule, lineWidth: 1))
        }
    }

    private func memberRow(_ member: ConversationStore.ChannelMember) -> some View {
        Button {
            state.chatsPath.append(ChatRoute.member(member.id))
        } label: {
            HStack(spacing: NodieSpacing.md) {
                // Cùng khuôn avatar-chữ-cái của Friends/QA; màu suy từ id để ổn định.
                Text(member.displayName.first.map { String($0).uppercased() } ?? "?")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(NodieColors.cream)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(NodieColors.accent))
                    .accessibilityHidden(true)

                // Tên là danh tính chính — cho tràn 2 dòng ở cỡ chữ lớn nhất thay vì cắt mất
                // một phần tên (phase 05, a11y).
                Text(member.displayName)
                    .font(NodieTypography.rowTitle)
                    .foregroundStyle(NodieColors.ink)
                    .lineLimit(1...2)

                Spacer()

                if member.id == store.currentUserId {
                    Text("Bạn")
                        .font(NodieTypography.tag)
                        .foregroundStyle(NodieColors.inkFaint)
                } else {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(NodieColors.inkFaint)
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, NodieSpacing.md)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text("Thành viên \(member.displayName)"))
    }

    private func load() async {
        loading = true
        var all = await store.members(of: channelId)
        // Mình đứng đầu — khuôn quen của Zalo/WhatsApp, và khỏi phải đi tìm chính mình.
        if let meIndex = all.firstIndex(where: { $0.id == store.currentUserId }) {
            all.insert(all.remove(at: meIndex), at: 0)
        }
        members = all
        loading = false
    }
}

#Preview {
    GroupInfoView(state: AppState(), store: ConversationStore(), channelId: UUID())
}
