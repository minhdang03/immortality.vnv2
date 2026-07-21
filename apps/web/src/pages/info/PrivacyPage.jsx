import LegalDoc from '../../components/shared/LegalDoc'

// Chính sách quyền riêng tư — URL này là field BẮT BUỘC của App Store Connect.
//
// Apple đối chiếu trang này với App Privacy labels khai trong ASC: khai lệch là bị bắt lỗi.
// Ai sửa App Privacy labels phải sửa trang này cùng lúc, và ngược lại.
//
// Mục 5 nói thẳng chuyện ảnh/tệp có thể còn lại sau khi xoá tài khoản: đó là rủi ro đã
// chấp nhận có ghi nhận (C-06), chưa có cron dọn orphan. Chính sách quyền riêng tư
// phải nói thật — im lặng chỗ này mới là thứ gây hậu quả.
const SECTIONS = [
  {
    title: '1. Chúng mình thu thập gì',
    paragraphs: [
      'Tài khoản: email và mật khẩu (qua Supabase Auth), tên hiển thị, giới thiệu ngắn về bạn.',
      'Nội dung bạn đăng: câu hỏi, câu trả lời, bình luận, tin nhắn, ảnh, tệp và tin nhắn thoại bạn gửi trong app.',
      'Thiết bị: mã thiết bị (device token) do Apple cấp, chỉ dùng để gửi thông báo đẩy.',
      'Khi bạn đang mở battudao.com, trang Trực Tiếp dùng một mã ngẫu nhiên theo tab, đường dẫn đang xem, mã quốc gia và vị trí làm tròn theo vùng 10 độ để đếm lượt đang kết nối. Dữ liệu này chỉ tồn tại trong kết nối trực tiếp; chúng mình không lưu IP, thành phố hay lịch sử vị trí.',
    ],
  },
  {
    title: '2. Dùng để làm gì',
    paragraphs: [
      'Chỉ để vận hành tài khoản của bạn, hiển thị nội dung bạn đăng cho đúng người, và gửi thông báo khi có tin mới.',
      'Chúng mình không chạy quảng cáo, không theo dõi bạn sang app hay trang web khác, không bán và không chia sẻ dữ liệu của bạn cho bên thứ ba.',
    ],
  },
  {
    title: '3. Dữ liệu nằm ở đâu',
    paragraphs: [
      'Dữ liệu lưu trên Supabase, vùng ap-southeast-1 (Singapore).',
      'Thông báo đẩy đi qua dịch vụ APNs của Apple — Apple chỉ nhận mã thiết bị và nội dung thông báo, không nhận nội dung khác của bạn.',
    ],
  },
  {
    title: '4. Xoá tài khoản và dữ liệu',
    paragraphs: [
      'Bạn có thể xoá tài khoản bất cứ lúc nào trong màn Cá nhân — không cần hỏi ai, không cần gửi email cho ai.',
      'Khi xoá: hồ sơ, email và dữ liệu cá nhân của bạn bị xoá vĩnh viễn. Câu hỏi và câu trả lời đã đăng ở lại dưới dạng ẩn danh để giữ mạch thảo luận chung — chúng không còn gắn với tên hay email của bạn nữa.',
    ],
  },
  {
    title: '5. Ảnh và tệp trong trò chuyện',
    paragraphs: [
      'Nói thật: ảnh, tệp và tin nhắn thoại bạn đã gửi trong trò chuyện có thể còn lại trong kho lưu trữ sau khi bạn xoá tài khoản. Chúng không còn gắn với hồ sơ của bạn, nhưng tệp thì chưa được dọn tự động.',
      'Chúng mình đang làm phần dọn dẹp này. Trong lúc chờ, nếu bạn muốn xoá hẳn những tệp đó, hãy liên hệ để chúng mình xoá tay.',
    ],
  },
  {
    title: '6. Liên hệ',
    paragraphs: [
      'Mọi thắc mắc về quyền riêng tư hoặc yêu cầu xoá dữ liệu: liên hệ qua trang Liên hệ trên battudao.com.',
    ],
  },
]

const CHROME = {
  vi: {
    eyebrow: '— Pháp lý',
    title: 'Quyền',
    titleEm: 'riêng tư',
    subtitle: 'Chúng mình thu gì, dùng làm gì, và bạn xoá được những gì.',
    note: null,
  },
  en: {
    eyebrow: '— Legal',
    title: 'Privacy',
    titleEm: 'Policy',
    subtitle: 'What we collect, what we use it for, and what you can delete.',
    note: 'The Vietnamese text below is the authoritative version.',
  },
}

export default function PrivacyPage({ lang = 'vi' }) {
  const c = CHROME[lang] || CHROME.vi
  return (
    <LegalDoc
      eyebrow={c.eyebrow}
      title={c.title}
      titleEm={c.titleEm}
      subtitle={c.subtitle}
      note={c.note}
      sections={SECTIONS}
      updated="Cập nhật: 21/07/2026"
    />
  )
}
