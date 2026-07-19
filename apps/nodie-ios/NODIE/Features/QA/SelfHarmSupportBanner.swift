import SwiftUI

/// Dò từ khoá tự hại trong nội dung đang soạn — cùng cơ chế `detectedTag` ở AskQuestionView
/// (regex khớp mặt chữ, client-side). KHÔNG gọi mạng, KHÔNG log nội dung người dùng.
///
/// NODIE là mạng xã hội, không phải app y tế (chốt 17/07) — banner này theo chuẩn safety
/// FB/IG: chỉ đưa thêm một lựa chọn, không chặn gửi, không phán xét, không disclaimer y khoa.
enum SelfHarmKeywordDetector {
    /// Nhóm từ khoá tiếng Việt là chính (đối tượng chính gõ tiếng Việt); thêm vài cụm tiếng
    /// Anh phổ biến vì app song ngữ. Cố ý RỘNG hơn `fieldRules`: bỏ sót một câu thật ở đây đắt
    /// hơn nhiều so với hiện banner hơi thừa một lần.
    private static let pattern =
        "tự tử|tự sát|kết liễu (cuộc sống|cuộc đời|đời mình)|không (còn )?muốn sống|" +
        "muốn chết|hết muốn sống|tự hại|tự làm hại (bản thân|mình)|rạch tay|cắt tay|" +
        "kill myself|suicid|end (it all|my life)|self.?harm|want(s|ed)? to die"

    static func matches(_ text: String) -> Bool {
        guard !text.isEmpty else { return false }
        return text.range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil
    }
}

/// Banner hỗ trợ khi nội dung khớp từ khoá tự hại — đặt ngay trong luồng soạn câu hỏi,
/// không phải hộp thoại chặn. Vẫn gửi được bình thường sau khi thấy banner này.
struct SelfHarmSupportBanner: View {
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text("♡")
                .font(.system(size: 15))
                .foregroundStyle(NodieColors.accent)
            Text("Nếu bạn đang gặp khó khăn, có người sẵn sàng lắng nghe — gọi 115 (VN) / Lifeline 13 11 14 (AU).")
                .font(NodieTypography.metaSm)
                .foregroundStyle(NodieColors.inkSoft)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 13).fill(NodieColors.tagBg))
        .overlay(RoundedRectangle(cornerRadius: 13).stroke(NodieColors.chipBorder, lineWidth: 1))
        // Một khối cho VoiceOver, không phải hai mảnh rời (icon + câu) đọc tách đôi.
        .accessibilityElement(children: .combine)
    }
}

#if DEBUG
#Preview {
    SelfHarmSupportBanner().padding()
}
#endif
