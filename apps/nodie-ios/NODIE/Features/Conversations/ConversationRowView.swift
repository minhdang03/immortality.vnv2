import SwiftUI

/// Một dòng hội thoại — avatar + badge loại, tên, preview, giờ, số chưa đọc.
struct ConversationRowView: View {
    let conversation: Conversation
    let preview: String
    var isMuted: Bool = false
    let onTap: () -> Void

    // Button chứ không onTapGesture — xem ghi chú ở QuestionRowView.
    // Dòng này nằm trong List có .swipeActions: Button không nuốt mất cử chỉ vuốt,
    // List vẫn nhận vuốt trước (đã verify bằng test vuốt sẵn có).
    var body: some View {
        Button(action: onTap) {
            content
        }
        .buttonStyle(.plain)
    }

    private var content: some View {
        HStack(spacing: NodieSpacing.md) {
            ConversationAvatar(conversation: conversation, size: 47, fontSize: 20, showsBadge: true)

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 5) {
                    Text(conversation.name)
                        .font(NodieTypography.rowTitle)
                        .foregroundStyle(NodieColors.ink)
                        .lineLimit(1)
                    if isMuted {
                        Image(systemName: "bell.slash.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(NodieColors.inkFaint)
                    }
                }
                Text(preview)
                    .font(NodieTypography.bodyXs)
                    .foregroundStyle(NodieColors.inkMuted)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(alignment: .trailing, spacing: 5) {
                Text(conversation.time)
                    .font(NodieTypography.timestamp)
                    .foregroundStyle(NodieColors.inkFaint)
                if conversation.unread > 0 {
                    UnreadBadge(count: conversation.unread)
                }
            }
        }
        .padding(.vertical, 11)
        .contentShape(Rectangle())
    }
}

/// Avatar hội thoại dùng chung cho list và header chat.
/// Kênh/nhóm bo góc vuông; DM bo tròn — tín hiệu thị giác phân biệt người vs không gian.
struct ConversationAvatar: View {
    let conversation: Conversation
    let size: CGFloat
    let fontSize: CGFloat
    var showsBadge: Bool = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: conversation.isRound ? size / 2 : 14, style: .continuous)
                .fill(conversation.avatarBg)
                .frame(width: size, height: size)
                .overlay(Text(conversation.emoji).font(.system(size: fontSize)))

            if showsBadge, let label = conversation.kindLabel, let bg = conversation.kindBg {
                Text(label)
                    .font(NodieTypography.kindBadge)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 1)
                    .background(RoundedRectangle(cornerRadius: 8).fill(bg))
                    .offset(x: 3, y: 3)
            }
        }
        .frame(width: size, height: size)
    }
}

#Preview {
    VStack(spacing: 0) {
        ForEach(MockData.conversations) { c in
            ConversationRowView(conversation: c, preview: "Xem trước tin nhắn cuối cùng ở đây") {}
            Divider().background(NodieColors.ruleLight)
        }
    }
    .padding(.horizontal, NodieSpacing.screenH)
    .background(NodieColors.bg)
}

#Preview("Đã tắt thông báo") {
    ConversationRowView(conversation: MockData.conversations[0],
                        preview: "Kênh này đang tắt thông báo",
                        isMuted: true) {}
        .padding(.horizontal, NodieSpacing.screenH)
        .background(NodieColors.bg)
}
