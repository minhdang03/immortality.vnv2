import SwiftUI

/// Chọn nhiều người — dùng cho HAI việc: tạo nhóm mới và thêm người vào nhóm sẵn có.
/// Một màn cho cả hai vì việc chọn giống hệt nhau; khác nhau chỉ ở có ô tên nhóm hay không
/// và nhãn nút, truyền qua `mode`.
struct GroupComposeView: View {
    enum Mode {
        /// Tạo nhóm mới: có ô tên, nút "Tạo".
        case create
        /// Thêm người vào nhóm có sẵn: không ô tên, nút "Thêm", loại sẵn người đã ở trong nhóm.
        case add(existingMemberIds: Set<UUID>)
    }

    let mode: Mode
    let store: ConversationStore
    let follow: FollowStore
    /// Trả về danh sách người đã chọn (+ tên nhóm nếu tạo mới). View cha lo gọi store.
    let onSubmit: (_ title: String, _ memberIds: [UUID]) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var selected: Set<UUID> = []
    @FocusState private var titleFocused: Bool

    private var isCreate: Bool { if case .create = mode { return true }; return false }

    /// Người đã ở trong nhóm không hiện lại ở chế độ "thêm" — chọn người đã có là vô nghĩa.
    private var candidates: [PublicProfile] {
        guard case .add(let existing) = mode else { return follow.peoplePicker }
        return follow.peoplePicker.filter { !existing.contains($0.id) }
    }

    private var canSubmit: Bool {
        !selected.isEmpty && (!isCreate || !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            if isCreate { nameField }
            candidateList
        }
        .background(NodieColors.bg)
        .task { if !follow.didLoadOnce { await follow.load() } }
    }

    private var header: some View {
        HStack {
            Button("Huỷ") { dismiss() }
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)
            Spacer()
            Text(isCreate ? "Nhóm mới" : "Thêm thành viên")
                .font(NodieTypography.chatName)
                .foregroundStyle(NodieColors.ink)
            Spacer()
            Button(isCreate ? "Tạo" : "Thêm") {
                onSubmit(title, Array(selected))
                dismiss()
            }
            .font(NodieTypography.body.weight(.semibold))
            .foregroundStyle(canSubmit ? NodieColors.accent : NodieColors.inkFaint)
            .disabled(!canSubmit)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private var nameField: some View {
        TextField("Tên nhóm", text: $title)
            .font(NodieTypography.body)
            .foregroundStyle(NodieColors.ink)
            .focused($titleFocused)
            .padding(.horizontal, NodieSpacing.lg)
            .padding(.vertical, 12)
            .background(Capsule().fill(NodieColors.surface))
            .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
            .padding(.horizontal, NodieSpacing.screenH)
            .padding(.vertical, NodieSpacing.md)
            .accessibilityIdentifier("groupNameField")
    }

    private var candidateList: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if candidates.isEmpty {
                    Text("Chưa có ai để thêm.")
                        .font(NodieTypography.bodySm)
                        .foregroundStyle(NodieColors.inkMuted)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, NodieSpacing.xl)
                }
                ForEach(candidates) { profile in
                    Button { toggle(profile.id) } label: { row(profile) }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("groupPickPerson-\(profile.id)")
                    Divider().background(NodieColors.ruleLight)
                }
            }
            .padding(.horizontal, NodieSpacing.screenH)
            .padding(.bottom, NodieSpacing.xl)
        }
    }

    private func row(_ profile: PublicProfile) -> some View {
        let picked = selected.contains(profile.id)
        return HStack(spacing: NodieSpacing.md) {
            InitialAvatar(initial: String(profile.name.prefix(1)).uppercased(), size: 46)
            Text(profile.name)
                .font(NodieTypography.rowTitle)
                .foregroundStyle(NodieColors.ink)
                .lineLimit(1...2)
            Spacer(minLength: 0)
            Image(systemName: picked ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 22))
                .foregroundStyle(picked ? NodieColors.accent : NodieColors.inkFaint)
        }
        .padding(.vertical, 11)
        .contentShape(Rectangle())
    }

    private func toggle(_ id: UUID) {
        if selected.contains(id) { selected.remove(id) } else { selected.insert(id) }
    }
}
