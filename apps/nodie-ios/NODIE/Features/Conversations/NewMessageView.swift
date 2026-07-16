import SwiftUI

/// Chọn người để mở tin nhắn mới (nút ✎ ở màn Chat).
///
/// Vẫn chạy `MockData.people` — đúng tầng hiện tại của Chat (conversations/messages đều
/// mock). Wire Supabase là việc của vòng sau, một lượt cho cả tầng chứ không nửa vời.
///
/// KHÔNG tái dùng `PersonRowView`: nó kèm pill "Theo dõi" — ở đây một dòng chỉ được làm
/// một việc là mở DM, thêm nút thứ hai vào là mời bấm nhầm.
struct NewMessageView: View {
    @Bindable var state: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(MockData.people) { person in
                        Button {
                            // Mở DM = đổi tab + đổi path. Đóng sheet TRƯỚC để nó không
                            // còn nằm trên khung chat vừa mở.
                            dismiss()
                            state.openOrCreateDM(with: person.id)
                        } label: {
                            row(person)
                        }
                        .buttonStyle(.plain)
                        // Danh sách hội thoại nằm ngay dưới sheet cũng có dòng trùng TÊN
                        // (vd "Hà Chi") → tìm theo nhãn là mơ hồ. Định danh thì không.
                        .accessibilityIdentifier("newMessagePerson-\(person.id)")

                        Divider().background(NodieColors.ruleLight)
                    }
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.bottom, NodieSpacing.xl)
            }
        }
        .background(NodieColors.bg)
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

    private func row(_ person: Person) -> some View {
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

            Spacer(minLength: 0)
        }
        .padding(.vertical, 11)
        .contentShape(Rectangle())
    }
}

#Preview {
    NewMessageView(state: AppState())
}
