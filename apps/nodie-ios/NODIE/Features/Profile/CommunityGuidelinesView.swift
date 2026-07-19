import SwiftUI

/// Nội quy cộng đồng — bản đọc-trong-30-giây của mục 2 `TermsOfUseView`.
///
/// Vì sao tách khỏi Điều khoản: guideline 1.2 của Apple muốn user UGC **thấy được** luật chơi,
/// mà không ai đọc hết 6 mục văn bản pháp lý trước khi đăng ký. Đây là bản rút gọn để đọc thật,
/// còn Điều khoản vẫn là văn bản ràng buộc — link "đọc đầy đủ" ở cuối màn.
///
/// KHÔNG nhân đôi toàn văn: sửa luật thì sửa `TermsOfUseView` (bản gốc) rồi rút lại ý ở đây.
/// Hai bản lệch nhau là tự bắn vào chân lúc Apple đối chiếu.
///
/// Văn bản giữ tiếng Việt kể cả khi UI đổi ngôn ngữ — cùng lý do với `TermsOfUseView`:
/// dịch máy sai một chữ là đổi nghĩa cam kết. Chỉ chrome (nút Đóng, tiêu đề) dịch theo máy.
struct CommunityGuidelinesView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showTerms = false

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: NodieSpacing.lg) {
                    Text(verbatim: "NODIE là chỗ để hỏi và để nghe nhau. Vài điều để chỗ này còn đáng ở lại:")
                        .font(NodieTypography.bodySm)
                        .foregroundStyle(NodieColors.inkBody)
                        .lineSpacing(4)
                        .fixedSize(horizontal: false, vertical: true)

                    rule("Nói với người, không nói xuống người",
                         "Không quấy rối, thù ghét, miệt thị. Bất đồng thì tranh luận, đừng công kích.")

                    rule("Không nội dung khiêu dâm, bạo lực, lừa đảo",
                         "Kể cả đăng đùa. Spam và quảng cáo trá hình cũng nằm ở đây.")

                    rule("Là chính mình",
                         "Không mạo danh người khác. Không đăng thông tin cá nhân của ai khi chưa được họ đồng ý.")

                    rule("Nội dung sức khoẻ là chia sẻ, không phải chỉ định",
                         "Kinh nghiệm của bạn có ích cho người khác, nhưng nó không thay thế người có chuyên môn.")

                    rule("Thấy sai thì báo",
                         "Mỗi câu hỏi, câu trả lời và tin nhắn đều báo cáo hoặc chặn được ngay trong app. Chúng mình xem trong vòng 24 giờ.")

                    rule("Vi phạm nhiều lần thì mất chỗ",
                         "Nội dung vi phạm bị gỡ; tài khoản lặp lại nhiều lần sẽ bị khoá.")

                    Button { showTerms = true } label: {
                        Text("Đọc Điều khoản sử dụng đầy đủ")
                            .font(NodieTypography.bodySm.weight(.semibold))
                            .underline()
                            .foregroundStyle(NodieColors.accent)
                    }
                    .buttonStyle(.plain)
                    .padding(.top, NodieSpacing.sm)
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.vertical, NodieSpacing.lg)
            }
        }
        .background(NodieColors.bg)
        .sheet(isPresented: $showTerms) { TermsOfUseView() }
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "xmark", accessibilityLabel: "Đóng") { dismiss() }
            EyebrowLabel(text: "Nội quy cộng đồng", font: NodieTypography.eyebrow)
            Spacer()
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    /// Một điều: tiêu đề ngắn đọc lướt được + một câu giải thích.
    /// Gộp thành MỘT phần tử cho VoiceOver — đọc rời "tiêu đề" rồi "thân" là mất mạch.
    private func rule(_ title: String, _ body: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(verbatim: "· " + title)
                .font(NodieTypography.bodySm.weight(.semibold))
                .foregroundStyle(NodieColors.ink)
            Text(verbatim: body)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.inkBody)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    CommunityGuidelinesView()
}
