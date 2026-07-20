import SwiftUI

/// Thông tin nhóm/kênh — avatar, tên, thành viên, và (chỉ với quản trị) các nút quản lý.
///
/// Thành viên thường thấy đúng màn như trước: danh sách + mở hồ sơ. Nút quản trị ẩn HẲN
/// (không disable) — nút xám mời người ta bấm để nhận một câu từ chối. Nhãn "Quản trị" chỉ
/// hiện TRONG màn này, không rò ra bong bóng chat hay hồ sơ: nhãn vai trò khắp nơi là phân
/// tầng người dùng, đúng thứ CLAUDE.md cấm.
struct GroupInfoView: View {
    @Bindable var state: AppState
    let store: ConversationStore
    let follow: FollowStore
    let channelId: UUID

    @State private var members: [ConversationStore.ChannelMember] = []
    @State private var loading = true
    @State private var showAddMembers = false
    @State private var renaming = false
    @State private var draftName = ""
    /// Xác nhận hai bước cho chuyển giao chủ — không hoàn tác được.
    @State private var transferTarget: ConversationStore.ChannelMember?

    private var channel: ChannelRow? { store.channel(id: channelId) }
    private var isGroup: Bool { channel?.kind == "group" }
    /// Mình có quyền quản trị nhóm này không — quyết định mọi nút quản lý.
    private var iAmMod: Bool { isGroup && (channel?.isMod ?? false) }
    private var iAmOwner: Bool { isGroup && (channel?.isOwner(store.currentUserId) ?? false) }

    var body: some View {
        ScrollView {
            VStack(spacing: NodieSpacing.lg) {
                header
                if iAmMod { adminActions }
                memberSection
            }
            .padding(.horizontal, 18)
            .padding(.top, NodieSpacing.lg)
            .padding(.bottom, 90)
        }
        .background(NodieColors.bg)
        .task { await load() }
        .sheet(isPresented: $showAddMembers) {
            GroupComposeView(mode: .add(existingMemberIds: Set(members.map(\.id))),
                             store: store, follow: follow) { _, memberIds in
                Task {
                    await store.addMembers(memberIds, to: channelId)
                    await load()
                }
            }
        }
        .alert("Đổi tên nhóm", isPresented: $renaming) {
            TextField("Tên nhóm", text: $draftName)
            Button("Huỷ", role: .cancel) {}
            Button("Lưu") { Task { await store.renameGroup(channelId, to: draftName) } }
        }
        .alert(item: $transferTarget) { target in
            // Chuyển giao là không hoàn tác — xác nhận nêu đích danh tên người nhận.
            Alert(
                title: Text("Chuyển quyền chủ nhóm?"),
                message: Text("\(target.displayName) sẽ thành chủ nhóm. Bạn vẫn là quản trị nhưng không lấy lại quyền chủ được."),
                primaryButton: .destructive(Text("Chuyển giao")) {
                    Task { await store.transferOwner(of: channelId, to: target.id); await load() }
                },
                secondaryButton: .cancel(Text("Huỷ"))
            )
        }
    }

    private var header: some View {
        VStack(spacing: NodieSpacing.sm) {
            if let channel {
                ConversationAvatar(channel: channel, size: 72, fontSize: 32, showsBadge: false)
            }
            HStack(spacing: 6) {
                Text(channel?.displayTitle ?? "")
                    .font(NodieTypography.chatName)
                    .foregroundStyle(NodieColors.ink)
                    .multilineTextAlignment(.center)
                if iAmMod {
                    Button {
                        draftName = channel?.displayTitle ?? ""
                        renaming = true
                    } label: {
                        Image(systemName: "pencil")
                            .font(.system(size: 13))
                            .foregroundStyle(NodieColors.accent)
                    }
                    .accessibilityLabel("Đổi tên nhóm")
                }
            }
            if let label = channel?.kindLabel {
                Text(verbatim: label)
                    .font(NodieTypography.tag.weight(.semibold))
                    .foregroundStyle(NodieColors.inkMuted)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, NodieSpacing.md)
    }

    private var adminActions: some View {
        Button { showAddMembers = true } label: {
            HStack(spacing: NodieSpacing.sm) {
                Image(systemName: "person.badge.plus").font(.system(size: 15))
                Text("Thêm thành viên").font(NodieTypography.body.weight(.medium))
                Spacer()
            }
            .foregroundStyle(NodieColors.accent)
            .padding(.horizontal, NodieSpacing.md)
            .padding(.vertical, 12)
            .background(RoundedRectangle(cornerRadius: 14).fill(NodieColors.surface))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(NodieColors.rule, lineWidth: 1))
        }
        .buttonStyle(.plain)
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
        let isMe = member.id == store.currentUserId
        let isOwner = channel?.createdBy == member.id

        return HStack(spacing: NodieSpacing.md) {
            Button {
                state.chatsPath.append(ChatRoute.member(member.id))
            } label: {
                HStack(spacing: NodieSpacing.md) {
                    Text(member.displayName.first.map { String($0).uppercased() } ?? "?")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(NodieColors.cream)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(NodieColors.accent))
                        .accessibilityHidden(true)

                    Text(member.displayName)
                        .font(NodieTypography.rowTitle)
                        .foregroundStyle(NodieColors.ink)
                        .lineLimit(1...2)

                    // Nhãn vai trò CHỈ ở màn này. Chủ nhóm > quản trị.
                    if isOwner {
                        roleTag("Chủ nhóm")
                    } else if member.isMod {
                        roleTag("Quản trị")
                    }
                    Spacer()
                    if isMe {
                        Text("Bạn").font(NodieTypography.tag).foregroundStyle(NodieColors.inkFaint)
                    }
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            // Menu quản trị — chỉ mod thấy, và không tự thao tác lên chính mình / lên chủ nhóm.
            if iAmMod, !isMe, !isOwner {
                Menu {
                    if member.isMod {
                        Button("Gỡ quản trị") {
                            Task { await store.setRole("member", for: member.id, in: channelId); await load() }
                        }
                    } else {
                        Button("Phong quản trị") {
                            Task { await store.setRole("mod", for: member.id, in: channelId); await load() }
                        }
                    }
                    // Chuyển giao chủ nhóm: chỉ CHỦ thấy.
                    if iAmOwner {
                        Button("Chuyển quyền chủ nhóm") { transferTarget = member }
                    }
                    Button("Xoá khỏi nhóm", role: .destructive) {
                        Task { await store.removeMember(member.id, from: channelId); await load() }
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 15))
                        .foregroundStyle(NodieColors.inkMuted)
                        .frame(width: 32, height: 32)
                }
                .accessibilityLabel("Quản lý \(member.displayName)")
            } else if !isMe {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(NodieColors.inkFaint)
                    .accessibilityHidden(true)
            }
        }
        .padding(.horizontal, NodieSpacing.md)
        .padding(.vertical, 10)
    }

    private func roleTag(_ text: LocalizedStringKey) -> some View {
        Text(text)
            .font(NodieTypography.timestampXs.weight(.semibold))
            .foregroundStyle(NodieColors.accent)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(Capsule().fill(NodieColors.accent.opacity(0.12)))
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
    GroupInfoView(state: AppState(), store: ConversationStore(), follow: FollowStore(), channelId: UUID())
}
