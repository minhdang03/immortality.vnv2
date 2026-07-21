import SwiftUI

/// "Đã xem bởi ai" — liệt kê thành viên nhóm đã đọc một tin của mình (Zalo/Messenger).
///
/// CHỈ liệt kê tên, KHÔNG biến số người đọc thành điểm số/thứ hạng: đây là metric trên NỘI
/// DUNG (tin này đã tới ai), không phải xếp hạng NGƯỜI — đúng anti-pattern CLAUDE.md. Tiêu
/// đề đếm chỉ là độ dài danh sách, như "3 người đã xem" của Messenger.
///
/// **Tự nạp thành viên** (không nhận sẵn từ ChatDetailView): mốc đọc của người khác đổi
/// LIÊN TỤC, và `members` ở màn chat là snapshot lúc mở chat. Nạp riêng tại đây = danh sách
/// đúng LÚC BẤM, và không ghi đè `members` của màn chat (nếu ghi đè lúc mạng lỗi thì mất
/// luôn gợi ý @nhắc-tên của ô soạn). Sheet mở NGAY, tự hiện spinner rồi lỗi/kết quả.
struct SeenBySheet: View {
    let message: MessageRow
    let store: ConversationStore
    let channelId: UUID
    @Environment(\.dismiss) private var dismiss

    @State private var seen: [ConversationStore.ChannelMember]?
    @State private var failed = false

    var body: some View {
        VStack(spacing: 0) {
            header
            content
        }
        .background(NodieColors.bg)
        .presentationDetents([.medium, .large])
        .task { await load() }
    }

    @ViewBuilder
    private var content: some View {
        if let seen {
            if seen.isEmpty {
                // Tin đã lên server nhưng chưa ai (ngoài mình + tác giả) đọc tới.
                centered("Chưa ai xem tin này.")
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(seen) { member in
                            row(member)
                            Divider().background(NodieColors.ruleLight).padding(.leading, 68)
                        }
                    }
                    .padding(.top, NodieSpacing.sm)
                }
            }
        } else if failed {
            // Phân biệt "chưa ai xem" với "không tải được" — gộp lại là nói dối.
            centered("Không tải được danh sách. Thử lại sau.")
        } else {
            ProgressView().tint(NodieColors.accent)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    private func centered(_ text: LocalizedStringKey) -> some View {
        Text(text)
            .font(NodieTypography.body)
            .foregroundStyle(NodieColors.inkMuted)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var header: some View {
        HStack {
            // Đếm = độ dài danh sách, KHÔNG phải điểm của ai (xem chú thích đầu file).
            Group {
                if let seen, !seen.isEmpty {
                    Text("\(seen.count) người đã xem")
                } else {
                    Text("Đã xem bởi")
                }
            }
            .font(NodieTypography.chatName)
            .foregroundStyle(NodieColors.ink)
            Spacer()
            Button("Xong") { dismiss() }
                .font(NodieTypography.body.weight(.semibold))
                .foregroundStyle(NodieColors.accent)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.lg)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private func row(_ member: ConversationStore.ChannelMember) -> some View {
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
            Spacer(minLength: 0)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.vertical, 10)
    }

    private func load() async {
        let members = await store.members(of: channelId)
        // members(of:) trả [] cả khi kênh rỗng LẪN khi lỗi mạng, nhưng nhóm luôn có ≥1 thành
        // viên (chính mình) — [] ở đây chỉ có nghĩa lỗi. Phân biệt để không nói "chưa ai xem".
        if members.isEmpty {
            failed = true
        } else {
            seen = store.seenBy(message, members: members)
        }
    }
}
