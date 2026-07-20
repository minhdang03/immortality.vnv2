import SwiftUI
import UIKit

/// Ảnh/video đã chuẩn bị xong (đã thu nhỏ, đã sinh poster), đang chờ người dùng gõ chú thích.
///
/// Chuẩn bị TRƯỚC rồi mới hỏi chú thích, không phải ngược lại: thu nhỏ 6 ảnh 4000px là việc
/// nặng, làm sau khi người ta bấm "Gửi" thì nút đứng hình vài giây và trông như treo.
enum PreparedAttachment: Identifiable {
    case photo(ChatImageProcessor.Encoded)
    case video(ChatVideoProcessor.Prepared)

    /// Danh tính chỉ để `ForEach` phân biệt trong một lượt chọn — không cần bền qua vòng đời.
    var id: Int {
        switch self {
        case .photo(let e): return e.data.hashValue
        case .video(let p): return p.videoData.hashValue
        }
    }

    var preview: UIImage {
        switch self {
        case .photo(let e): return e.image
        case .video(let p): return p.poster
        }
    }

    var isVideo: Bool {
        if case .video = self { return true }
        return false
    }
}

/// Xem lại ảnh sắp gửi + gõ chú thích, trước khi gửi thật.
///
/// Trước đây chọn ảnh là gửi thẳng, không có đường nào nói kèm một câu — mà "ảnh + một câu"
/// mới là cách người ta thật sự gửi ảnh (Zalo/Messenger đều có ô này ngay trên nút gửi).
/// Muốn nói gì thì phải gửi thêm một tin chữ rời, và ở kênh đông người hai tin đó dễ bị
/// tin người khác chen vào giữa.
///
/// **Chú thích đi theo tin CUỐI của lượt gửi.** Mỗi ảnh vẫn là một tin riêng (không gộp
/// album — đó là việc khác, cần đổi model). Trong khung chat cũ→mới, tin cuối nằm sát đáy,
/// ngay trên ô nhập: đó là chỗ mắt đọc câu chú thích cho cả cụm ảnh vừa hiện.
struct ChatCaptionSheet: View {
    let items: [PreparedAttachment]
    let onCancel: () -> Void
    /// Chú thích đã trim — rỗng nghĩa là gửi không kèm chữ.
    let onSend: (String) -> Void

    @State private var caption = ""
    /// Bàn phím bật sẵn: người ta mở tấm ảnh này ra là để viết gì đó. Không tự focus thì
    /// mất thêm một cú chạm cho việc chắc chắn sẽ làm.
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: NodieSpacing.sm) {
                    ForEach(items) { item in
                        Image(uiImage: item.preview)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 96, height: 128)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(NodieColors.rule, lineWidth: 1))
                            // Video và ảnh nhìn y hệt nhau ở dạng thu nhỏ — không có dấu này
                            // thì người gửi không biết mình đang gửi clip hay khung hình.
                            .overlay(alignment: .bottomLeading) {
                                if item.isVideo {
                                    Image(systemName: "play.fill")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundStyle(.white)
                                        .padding(5)
                                        .background(Circle().fill(.black.opacity(0.45)))
                                        .padding(6)
                                }
                            }
                            .accessibilityLabel(item.isVideo ? "Video sắp gửi" : "Ảnh sắp gửi")
                    }
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.vertical, NodieSpacing.lg)
            }

            Spacer(minLength: 0)

            captionBar
        }
        .background(NodieColors.bg)
        .onAppear { focused = true }
    }

    private var header: some View {
        HStack {
            Button("Huỷ", action: onCancel)
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.inkMuted)

            Spacer()

            Text(items.count > 1
                 ? String(localized: "\(items.count) mục") : String(localized: "Gửi ảnh"))
                .font(NodieTypography.rowTitle)
                .foregroundStyle(NodieColors.ink)

            Spacer()

            // Chỗ giữ đối xứng cho tiêu đề đứng giữa thật — Spacer hai bên không đủ khi
            // nhãn trái và phải dài khác nhau.
            Text("Huỷ")
                .font(NodieTypography.body)
                .opacity(0)
                .accessibilityHidden(true)
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.lg)
        .padding(.bottom, NodieSpacing.sm)
    }

    /// Cùng khuôn ô nhập của MessageComposer (ô bo tròn + nút gửi tròn 44pt) — hai chỗ gửi
    /// tin trông như một, người dùng không phải học lại.
    private var captionBar: some View {
        HStack(spacing: 10) {
            TextField("Thêm chú thích…", text: $caption, axis: .vertical)
                .font(NodieTypography.body)
                .foregroundStyle(NodieColors.ink)
                .focused($focused)
                .lineLimit(1...4)
                .padding(.horizontal, NodieSpacing.lg)
                .padding(.vertical, 12)
                .background(Capsule().fill(NodieColors.surface))
                .overlay(Capsule().stroke(NodieColors.chipBorder, lineWidth: 1))
                .accessibilityIdentifier("captionField")

            Button {
                onSend(caption.trimmingCharacters(in: .whitespacesAndNewlines))
            } label: {
                Image(systemName: "arrow.up")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(NodieColors.onAccent)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(NodieColors.accent))
                    .expandedHitArea(visual: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Gửi")
            .accessibilityIdentifier("sendWithCaption")
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.sm)
        .padding(.bottom, NodieSpacing.lg)
        .background(NodieColors.bg)
        .overlay(alignment: .top) { Divider().background(NodieColors.rule) }
    }
}
