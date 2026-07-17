import LegalDoc from '../../components/shared/LegalDoc'

// Điều khoản sử dụng — chép ĐÚNG TỪNG CHỮ từ NODIE/Features/Profile/TermsOfUseView.swift.
// App Review đối chiếu bản in-app với bản web (guideline 1.2); lệch một chữ là mời tranh cãi.
// Sửa bên nào cũng phải sửa bên kia trong cùng một lần.
const SECTIONS = [
  {
    title: '1. Về NODIE',
    paragraphs: [
      'NODIE là không gian hỏi đáp và trò chuyện của cộng đồng Bất Tử Đạo. Dùng app nghĩa là bạn đồng ý với các điều khoản dưới đây.',
    ],
  },
  {
    title: '2. Quy tắc cộng đồng',
    paragraphs: [
      'Không đăng nội dung quấy rối, thù ghét, khiêu dâm, bạo lực, spam hay lừa đảo. Không mạo danh người khác. Không đăng thông tin cá nhân của người khác khi chưa được đồng ý. Nội dung sức khoẻ chỉ mang tính chia sẻ, không thay thế tư vấn y khoa chuyên nghiệp.',
    ],
  },
  {
    title: '3. Nội dung bạn đăng',
    paragraphs: [
      'Bạn giữ quyền với nội dung mình viết và cho phép NODIE hiển thị nội dung đó trong app. Bạn chịu trách nhiệm về những gì mình đăng.',
    ],
  },
  {
    title: '4. Kiểm duyệt',
    paragraphs: [
      'Bạn có thể báo cáo nội dung vi phạm hoặc chặn người khác ngay trong app. Chúng mình xem xét báo cáo và gỡ nội dung vi phạm trong vòng 24 giờ; tài khoản vi phạm nhiều lần sẽ bị khoá.',
    ],
  },
  {
    title: '5. Tài khoản',
    paragraphs: [
      'Bạn có thể xoá tài khoản bất cứ lúc nào trong màn Cá nhân. Khi xoá, hồ sơ và dữ liệu cá nhân bị xoá vĩnh viễn; câu hỏi và câu trả lời đã đăng ở lại dưới dạng ẩn danh để giữ mạch thảo luận chung.',
    ],
  },
  {
    title: '6. Liên hệ',
    paragraphs: [
      'Mọi thắc mắc về điều khoản hoặc khiếu nại nội dung: liên hệ qua trang Liên hệ trên battudao.com.',
    ],
  },
]

const CHROME = {
  vi: {
    eyebrow: '— Pháp lý',
    title: 'Điều khoản',
    titleEm: 'sử dụng',
    subtitle: 'Điều khoản áp dụng cho app NODIE và cộng đồng Bất Tử Đạo.',
    note: null,
  },
  en: {
    eyebrow: '— Legal',
    title: 'Terms of',
    titleEm: 'Use',
    subtitle: 'Terms for the NODIE app and the Bất Tử Đạo community.',
    note: 'The Vietnamese text below is the authoritative version — it matches word-for-word the terms shown inside the app.',
  },
}

export default function TermsPage({ lang = 'vi' }) {
  const c = CHROME[lang] || CHROME.vi
  return (
    <LegalDoc
      eyebrow={c.eyebrow}
      title={c.title}
      titleEm={c.titleEm}
      subtitle={c.subtitle}
      note={c.note}
      sections={SECTIONS}
      updated="Cập nhật: 16/07/2026"
    />
  )
}
