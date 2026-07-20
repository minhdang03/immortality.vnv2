import SwiftUI

/// Lưới ảnh cho một LƯỢT gửi nhiều mục (`MessageMedia.albumId`).
///
/// Gửi 6 ảnh trước đây ra 6 bong bóng rời, chiếm trọn màn và đẩy ngữ cảnh trôi lên trên.
/// Messenger/Zalo gộp thành một lưới — cùng lượng thông tin, một phần mười chỗ.
///
/// **Gộp là chuyện trình bày, không phải chuyện lưu trữ.** Mỗi ảnh vẫn là một hàng
/// `messages` riêng: xoá/trả lời/cảm xúc/chuyển tiếp và hàng đợi offline vẫn theo TỪNG ảnh
/// (menu giữ một ô dùng chung `MessageActionsMenu` với bong bóng thường). Nếu gộp mà mất
/// những thao tác đó thì đây là đổi một cải tiến trình bày lấy một hồi quy.
struct AlbumBubbleView: View {
    /// Các tin cùng album, thứ tự cũ→mới như lúc gửi.
    let items: [MessageRow]
    let isMine: Bool
    /// Cạnh lưới — 78% khung, cùng trần với bong bóng chữ (xem `bubbleMaxWidth`).
    let maxWidth: CGFloat
    /// Đính kèm còn đang lên của một tin (nil = đã nằm trên server).
    let pending: (UUID) -> ConversationStore.PendingMedia?
    let onOpen: (MessageRow) -> Void
    /// Menu giữ-một-ô. Dựng ở ChatDetailView vì nó nắm store + các closure thao tác.
    let cellMenu: (MessageRow) -> MessageActionsMenu
    /// Cảm xúc đã thả trên một ô, để vẽ đè lên ảnh. Menu ô cho thả ☀ nhưng lưới không vẽ
    /// reaction nào thì thả xong màn hình đứng im — người ta tưởng hỏng, chạm lại là gỡ mất.
    var reactionSummary: (MessageRow) -> [(kind: ReactionKind, count: Int, mine: Bool)] = { _ in [] }
    /// Chế độ chọn nhiều tin (phase 03): nil = không chọn. Chọn theo TỪNG ẢNH chứ không cả
    /// cụm — mỗi ô là một tin thật, xoá/chuyển tiếp cũng theo tin.
    var selectedIds: Set<UUID>? = nil
    /// Gửi lại / bỏ một ô upload hỏng. Không có hai đường này thì ô hỏng là ngõ cụt: thoát
    /// app là mất bytes (PendingMedia chỉ sống trong RAM).
    var onRetry: (MessageRow) -> Void = { _ in }
    var onDiscard: (MessageRow) -> Void = { _ in }

    private static let gap: CGFloat = 2

    /// 2 mục → 2 cột; 4 mục → 2×2; còn lại 3 cột. 3 mục đi đường riêng (xem `body`).
    private var columns: Int { items.count == 2 || items.count == 4 ? 2 : 3 }

    var body: some View {
        Group {
            if items.count == 3 {
                // 1 lớn trái + 2 nhỏ phải — ba ô bằng nhau trên một hàng thì mỗi ô quá dẹt
                // để nhìn ra cái gì.
                HStack(spacing: Self.gap) {
                    cell(items[0], side: bigSide)
                    VStack(spacing: Self.gap) {
                        cell(items[1], side: smallSide)
                        cell(items[2], side: smallSide)
                    }
                }
            } else {
                VStack(spacing: Self.gap) {
                    ForEach(Array(rowsOfItems.enumerated()), id: \.offset) { _, row in
                        HStack(spacing: Self.gap) {
                            ForEach(row) { item in
                                cell(item, side: squareSide)
                            }
                            // Hàng cuối thiếu ô thì chừa chỗ trống, KHÔNG kéo ô còn lại ra
                            // rộng bằng cả hàng — lưới lệch cỡ trông như vỡ layout.
                            if row.count < columns {
                                ForEach(0..<(columns - row.count), id: \.self) { _ in
                                    Color.clear.frame(width: squareSide, height: squareSide)
                                }
                            }
                        }
                    }
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
            .stroke(NodieColors.rule, lineWidth: 1))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text("Cụm \(items.count) ảnh"))
    }

    /// Chia mục thành từng hàng theo số cột.
    private var rowsOfItems: [[MessageRow]] {
        stride(from: 0, to: items.count, by: columns).map {
            Array(items[$0..<min($0 + columns, items.count)])
        }
    }

    private var squareSide: CGFloat {
        (maxWidth - Self.gap * CGFloat(columns - 1)) / CGFloat(columns)
    }
    private var bigSide: CGFloat { (maxWidth - Self.gap) * 2 / 3 }
    private var smallSide: CGFloat { (bigSide - Self.gap) / 2 }

    private func cell(_ item: MessageRow, side: CGFloat) -> some View {
        let media = item.media
        let itemPending = pending(item.id)

        return Group {
            if let image = itemPending?.preview {
                // Đã giải mã sẵn lúc chọn ảnh — không `UIImage(data:)` ở đây, chỗ này chạy
                // lại mỗi lần thân view được tính lại.
                Image(uiImage: image).resizable().aspectRatio(contentMode: .fill)
            } else if let path = media?.posterPath ?? media?.path, !path.isEmpty {
                // Bản thu nhỏ theo ĐÚNG cạnh ô (×2 cho retina) — ô lưới nhỏ hơn bong bóng
                // ảnh đơn nhiều, tải bản to là phí băng thông cho thứ không ai thấy rõ.
                ChatRemoteImage(path: path, thumbWidth: Int(side) * 2)
            } else {
                NodieColors.surface
            }
        }
        .frame(width: side, height: side)
        .clipped()
        .overlay { uploadOverlay(itemPending, item: item) }
        // Video trong lưới: không có dấu này thì không phân biệt được với ảnh tĩnh.
        .overlay(alignment: .bottomTrailing) {
            if itemPending == nil, media?.kind == .video {
                Image(systemName: "play.fill")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(5)
                    .background(Circle().fill(.black.opacity(0.45)))
                    .padding(5)
            }
        }
        // Đang chọn: ô hiện dấu chọn, và chạm là chọn chứ không mở ảnh. Cùng luật với bong
        // bóng thường — một chế độ, một nghĩa cho mỗi cú chạm.
        .overlay(alignment: .topTrailing) {
            if let selectedIds {
                Image(systemName: selectedIds.contains(item.id) ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 17))
                    .foregroundStyle(selectedIds.contains(item.id) ? NodieColors.accent : .white)
                    .shadow(color: .black.opacity(0.35), radius: 2)
                    .padding(5)
            }
        }
        .overlay(alignment: .bottomLeading) {
            let summary = reactionSummary(item)
            if !summary.isEmpty {
                HStack(spacing: 3) {
                    ForEach(summary, id: \.kind) { entry in
                        HStack(spacing: 2) {
                            Text(entry.kind.glyph).font(.system(size: 9))
                            if entry.count > 1 {
                                Text("\(entry.count)")
                                    .font(NodieTypography.timestampXs.weight(.semibold))
                                    .foregroundStyle(entry.mine ? NodieColors.accent : NodieColors.ink)
                            }
                        }
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(NodieColors.cream.opacity(0.92)))
                    }
                }
                .padding(5)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture { if itemPending?.phase != .failed { onOpen(item) } }
        .contextMenu { if selectedIds == nil { cellMenu(item) } }
        .accessibilityLabel(cellLabel(itemPending))
        .accessibilityAddTraits(.isButton)
    }

    private func cellLabel(_ pending: ConversationStore.PendingMedia?) -> Text {
        switch pending?.phase {
        case .uploading: return Text("Ảnh, đang gửi")
        case .failed: return Text("Ảnh, gửi không thành công")
        case nil: return Text("Ảnh, chạm để xem")
        }
    }

    /// Trạng thái lên của TỪNG ô — một ảnh hỏng không kéo cả cụm thành hỏng.
    ///
    /// Ô hỏng phải có ĐƯỜNG RA ngay trên ô: bong bóng ảnh đơn có "Gửi lại"/"Bỏ", gộp lưới mà
    /// bỏ mất hai nút đó là biến ô hỏng thành ngõ cụt — auto-retry chỉ chạy khi mạng
    /// *chuyển trạng thái*, còn ca "vẫn satisfied nhưng không với tới host" thì không bao giờ
    /// bắn, và thoát app là mất bytes.
    @ViewBuilder
    private func uploadOverlay(_ pending: ConversationStore.PendingMedia?, item: MessageRow) -> some View {
        switch pending?.phase {
        case .uploading:
            ZStack {
                Color.black.opacity(0.28)
                ProgressView().tint(.white)
            }
        case .failed:
            ZStack {
                Color.black.opacity(0.55)
                VStack(spacing: 6) {
                    Button { onRetry(item) } label: {
                        Label("Gửi lại", systemImage: "arrow.clockwise")
                            .font(NodieTypography.tag)
                            .foregroundStyle(NodieColors.ink)
                            .padding(.horizontal, 9)
                            .padding(.vertical, 5)
                            .background(Capsule().fill(NodieColors.cream))
                    }
                    Button { onDiscard(item) } label: {
                        Text("Bỏ")
                            .font(NodieTypography.tag)
                            .foregroundStyle(.white)
                    }
                }
                .buttonStyle(.plain)
            }
        case nil:
            EmptyView()
        }
    }
}
