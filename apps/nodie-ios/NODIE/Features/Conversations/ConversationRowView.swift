import SwiftUI

/// Một dòng hội thoại — avatar + badge loại, tên, preview, giờ, số chưa đọc.
///
/// Nhận `ChannelRow` (dòng DB thật) chứ không `Conversation` (DTO prototype): trang trí
/// giờ đến từ `channels.emoji/avatar_hex/badge_hex` (0025), không phải hằng số trong MockData.
struct ConversationRowView: View {
    let channel: ChannelRow
    let preview: String
    var unread: Int = 0
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
            ConversationAvatar(channel: channel, size: 47, fontSize: 20, showsBadge: true)

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 5) {
                    // Tên/tiêu đề hội thoại là danh tính chính — cho tràn 2 dòng ở cỡ chữ lớn
                    // nhất thay vì cắt mất một phần tên (phase 05, a11y).
                    Text(channel.displayTitle)
                        .font(NodieTypography.rowTitle)
                        .foregroundStyle(NodieColors.ink)
                        .lineLimit(1...2)
                    if isMuted {
                        Image(systemName: "bell.slash.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(NodieColors.inkFaint)
                    }
                }
                // Preview tin nhắn — cắt 1 dòng CÓ CHỦ ĐÍCH: xem đầy đủ được ngay khi mở
                // hội thoại, không mất nội dung thật, chỉ mất bản xem trước.
                Text(preview)
                    .font(NodieTypography.bodyXs)
                    .foregroundStyle(NodieColors.inkMuted)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(alignment: .trailing, spacing: 5) {
                Text(channel.relativeTime)
                    .font(NodieTypography.timestamp)
                    .foregroundStyle(NodieColors.inkFaint)
                if unread > 0 {
                    UnreadBadge(count: unread)
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
    let channel: ChannelRow
    let size: CGFloat
    let fontSize: CGFloat
    var showsBadge: Bool = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: channel.isRound ? size / 2 : 14, style: .continuous)
                .fill(channel.avatarBg)
                .frame(width: size, height: size)
                .overlay(Text(channel.avatarGlyph).font(.system(size: fontSize)))

            if showsBadge, let label = channel.kindLabel, let bg = channel.badgeBg {
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
