import SwiftUI

/// Điều khoản sử dụng + quy tắc cộng đồng — App Store guideline 1.2 yêu cầu app UGC
/// có điều khoản user đọc được TRONG app.
///
/// Văn bản giữ tiếng Việt kể cả khi UI đổi ngôn ngữ: đây là văn bản pháp lý,
/// dịch máy sai một chữ là đổi nghĩa cam kết — sẽ dịch cùng đợt dịch nội dung (plan sau).
struct TermsOfUseView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: NodieSpacing.lg) {
                    section("1. Về NODIE",
                            "NODIE là không gian hỏi đáp và trò chuyện của cộng đồng Bất Tử Đạo. Dùng app nghĩa là bạn đồng ý với các điều khoản dưới đây.")

                    section("2. Quy tắc cộng đồng",
                            "Không đăng nội dung quấy rối, thù ghét, khiêu dâm, bạo lực, spam hay lừa đảo. Không mạo danh người khác. Không đăng thông tin cá nhân của người khác khi chưa được đồng ý. Nội dung sức khoẻ chỉ mang tính chia sẻ, không thay thế tư vấn y khoa chuyên nghiệp.")

                    section("3. Nội dung bạn đăng",
                            "Bạn giữ quyền với nội dung mình viết và cho phép NODIE hiển thị nội dung đó trong app. Bạn chịu trách nhiệm về những gì mình đăng.")

                    section("4. Kiểm duyệt",
                            "Bạn có thể báo cáo nội dung vi phạm hoặc chặn người khác ngay trong app. Chúng mình xem xét báo cáo và gỡ nội dung vi phạm trong vòng 24 giờ; tài khoản vi phạm nhiều lần sẽ bị khoá.")

                    section("5. Tài khoản",
                            "Bạn có thể xoá tài khoản bất cứ lúc nào trong màn Cá nhân. Khi xoá, hồ sơ và dữ liệu cá nhân bị xoá vĩnh viễn; câu hỏi và câu trả lời đã đăng ở lại dưới dạng ẩn danh để giữ mạch thảo luận chung.")

                    section("6. Liên hệ",
                            "Mọi thắc mắc về điều khoản hoặc khiếu nại nội dung: liên hệ qua trang Liên hệ trên battudao.com.")

                    Text("Cập nhật: 16/07/2026")
                        .font(NodieTypography.metaSm)
                        .foregroundStyle(NodieColors.inkFaint)
                }
                .padding(.horizontal, NodieSpacing.screenH)
                .padding(.vertical, NodieSpacing.lg)
            }
        }
        .background(NodieColors.bg)
    }

    private var header: some View {
        HStack(spacing: NodieSpacing.md) {
            CircleIconButton(systemName: "xmark", accessibilityLabel: "Đóng") { dismiss() }
            EyebrowLabel(text: "Điều khoản sử dụng", font: NodieTypography.eyebrow)
            Spacer()
        }
        .padding(.horizontal, NodieSpacing.screenH)
        .padding(.top, NodieSpacing.screenTop)
        .padding(.bottom, NodieSpacing.md)
        .overlay(alignment: .bottom) { Divider().background(NodieColors.rule) }
    }

    private func section(_ title: String, _ body: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(verbatim: title)
                .font(NodieTypography.bodySm.weight(.semibold))
                .foregroundStyle(NodieColors.ink)
            Text(verbatim: body)
                .font(NodieTypography.bodySm)
                .foregroundStyle(NodieColors.inkBody)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

#Preview {
    TermsOfUseView()
}
