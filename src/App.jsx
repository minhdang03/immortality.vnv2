import { useState, useEffect, useRef } from 'react'

/* ───────── DATA ───────── */
const TOPICS = [
  { id: 'mat-ngu', icon: '🌙', vi: 'Mất Ngủ & Đau Đầu', en: 'Insomnia & Headaches', descVi: 'Phương pháp phi thuyền chữa mất ngủ', descEn: 'Spaceship method for insomnia', count: 12 },
  { id: 'tam-linh', icon: '✦', vi: 'Tâm Linh & Tôn Giáo', en: 'Spirituality & Religion', descVi: 'Ánh sáng vượt qua mọi tôn giáo', descEn: 'Light beyond all religions', count: 18 },
  { id: 'suc-khoe', icon: '❤', vi: 'Sức Khỏe Cơ Thể', en: 'Body Health', descVi: 'Năng lượng chữa lành cơ thể', descEn: 'Energy healing for the body', count: 15 },
  { id: 'vu-tru', icon: '◎', vi: 'Y Học Vũ Trụ', en: 'Cosmic Medicine', descVi: 'Nguyên lý vũ trụ trong y học', descEn: 'Cosmic principles in medicine', count: 22 },
  { id: 'tri-tue', icon: '◈', vi: 'Trí Tuệ Việt Nam', en: 'Vietnamese Wisdom', descVi: 'Kho tàng trí tuệ người Việt', descEn: 'Treasury of Vietnamese wisdom', count: 10 },
  { id: 'thuc-hanh', icon: '△', vi: 'Thực Hành', en: 'Practice', descVi: 'Bài tập thực hành hàng ngày', descEn: 'Daily practice exercises', count: 8 },
]

const ARTICLES = [
  {
    id: 1, topic: 'mat-ngu', date: '2026-01-15', tag: { vi: 'Mất Ngủ', en: 'Insomnia' },
    vi: {
      title: 'Phi thuyền đưa linh hồn đi vào vũ trụ du lịch và an nghỉ ở khách sạn thiên đường',
      question: 'Con bị đau đầu mất ngủ 4 năm, uống thuốc tây thì ngủ được, không uống là thức trắng.',
      summary: 'Phương pháp phi thuyền: nhắm mắt, nhìn ra ánh sáng mờ ảo, phóng ra ngoài vũ trụ. Lắc qua lắc lại, du lịch không gian, tìm đến khách sạn thiên đường ánh sáng. Nằm trong phòng ngủ trắng có hoa thơm, sáng thức dậy đau đầu từ từ biến mất.',
      body: 'Phương pháp phi thuyền là một kỹ thuật thiền định đặc biệt. Bạn nhắm mắt lại, tưởng tượng mình đang ngồi trong một phi thuyền ánh sáng. Nhìn ra phía trước, bạn thấy ánh sáng mờ ảo lung linh. Phi thuyền bắt đầu di chuyển, lắc nhẹ qua lại như đang bay qua các vì sao.\n\nBạn du lịch qua không gian vũ trụ bao la, qua các thiên hà lấp lánh. Cuối cùng, phi thuyền đưa bạn đến khách sạn thiên đường - một nơi tràn ngập ánh sáng vàng ấm áp.\n\nBạn bước vào phòng ngủ trắng tinh khiết, có hoa thơm ngát. Nằm xuống giường mềm mại, bạn cảm nhận năng lượng ánh sáng chữa lành từ từ thấm vào cơ thể. Sáng hôm sau thức dậy, đau đầu từ từ biến mất.',
    },
    en: {
      title: 'Spaceship carrying the soul into cosmic travel and rest at the paradise hotel of light',
      question: "I've had headaches and insomnia for 4 years. Western medicine helps me sleep, without it I stay up all night.",
      summary: 'The spaceship method: close your eyes, look toward dim light, project outward into the universe. Sway gently, travel through space, find the paradise hotel of light. Rest in a white room with fragrant flowers, wake up and headaches gradually disappear.',
      body: 'The spaceship method is a special meditation technique. Close your eyes and imagine sitting in a spaceship of light. Looking ahead, you see shimmering dim light. The spaceship begins to move, swaying gently as if flying past stars.\n\nYou travel through the vast cosmos, past sparkling galaxies. Finally, the spaceship brings you to the paradise hotel - a place overflowing with warm golden light.\n\nYou enter a pure white room filled with fragrant flowers. Lying on the soft bed, you feel healing light energy slowly permeating your body. The next morning when you wake, headaches gradually disappear.',
    },
  },
  {
    id: 2, topic: 'tam-linh', date: '2026-01-18', tag: { vi: 'Tâm Linh', en: 'Spirituality' },
    vi: {
      title: 'Thế giới loài người muốn có hòa bình thì không nên phân chia sắc tộc, tôn giáo',
      question: 'Con theo đạo Công Giáo. Nhắm mắt nhìn sâu vào tim thì tim đập nhanh, thấy hình ảnh Chúa Giêsu.',
      summary: 'Công giáo hay Phật giáo đều chung mục đích. Đừng niệm Chúa hay Phật vào tâm, hãy nhìn ra ánh sáng. Chúa nói \'Ta là ánh sáng\' thì nhìn ánh sáng, không nhìn tượng. Trái tim cần tự do, hấp thu năng lượng từ ánh sáng.',
      body: 'Tất cả các tôn giáo trên thế giới đều hướng đến một mục đích chung: giải thoát con người khỏi khổ đau và đưa tâm hồn đến nơi an lạc.\n\nChúa Giêsu nói "Ta là ánh sáng thế gian." Đức Phật cũng dạy về ánh sáng giác ngộ. Vậy thì thay vì niệm danh hiệu, hãy nhìn thẳng vào ánh sáng - nguồn gốc chung của mọi tôn giáo.\n\nKhi bạn nhắm mắt và nhìn ra ánh sáng thay vì nhìn vào trong, trái tim được tự do. Nó không còn bị giam trong khuôn khổ tôn giáo nào. Trái tim hấp thu năng lượng trực tiếp từ ánh sáng vũ trụ, và đó chính là con đường hòa bình thật sự.',
    },
    en: {
      title: 'For world peace, humanity should not divide by race or religion',
      question: "I'm Catholic. When I close my eyes and look deep into my heart, it beats fast and I see Jesus.",
      summary: "Catholicism and Buddhism share the same purpose. Don't recite Christ or Buddha into your heart, look outward to light. Christ said 'I am the light' so look at light, not statues. The heart needs freedom, absorbing energy from light.",
      body: 'All religions in the world share a common purpose: to free humanity from suffering and guide the soul to peace.\n\nJesus Christ said "I am the light of the world." The Buddha also taught about the light of enlightenment. So instead of reciting names, look directly at the light - the common origin of all religions.\n\nWhen you close your eyes and look outward toward light instead of inward, the heart becomes free. It is no longer confined within any religious framework. The heart absorbs energy directly from cosmic light, and that is the true path to peace.',
    },
  },
  {
    id: 3, topic: 'vu-tru', date: '2026-01-22', tag: { vi: 'Vũ Trụ', en: 'Cosmic' },
    vi: {
      title: 'Nguyên lý đốt rác não và chuyển đổi năng lượng vũ trụ',
      question: 'Tại sao con hay bị đau đầu và stress?',
      summary: 'Hai con mắt thịt hút thông tin vào não giữa. Não giữa đốt rác thông tin, chuyển thành năng lượng. Không đốt được thì rác chất đống, não nóng như hiệu ứng nhà kính. Phi thuyền giúp đốt rác, giải phóng trí tuệ.',
      body: 'Mỗi ngày, hai con mắt của bạn liên tục hút thông tin từ thế giới bên ngoài vào não. Thông tin này được chuyển đến não giữa - trung tâm xử lý của ý thức.\n\nNão giữa có nhiệm vụ "đốt rác" - tức là phân loại, xử lý và chuyển đổi thông tin thành năng lượng hữu ích. Giống như một lò đốt rác hoạt động hiệu quả.\n\nNhưng khi bạn tiếp nhận quá nhiều thông tin tiêu cực, lo âu, stress - lò đốt quá tải. Rác thông tin chất đống trong não, tạo ra nhiệt như hiệu ứng nhà kính. Đó là nguyên nhân đau đầu và mất ngủ.\n\nPhương pháp phi thuyền giúp kích hoạt lại lò đốt rác của não. Khi bạn nhắm mắt và phóng ra ngoài vũ trụ, bạn ngừng hút rác vào. Đồng thời, năng lượng vũ trụ giúp đốt sạch rác tồn đọng, giải phóng trí tuệ.',
    },
    en: {
      title: 'The principle of brain waste burning and cosmic energy conversion',
      question: 'Why do I always have headaches and stress?',
      summary: "Two physical eyes absorb information into the mid-brain. The mid-brain burns information waste, converting it to energy. When it can't burn, waste piles up, the brain heats like a greenhouse effect. The spaceship method helps burn waste and release wisdom.",
      body: 'Every day, your two eyes continuously absorb information from the outside world into the brain. This information is transferred to the mid-brain - the processing center of consciousness.\n\nThe mid-brain has the task of "burning waste" - that is, sorting, processing, and converting information into useful energy. Like an efficient waste incinerator.\n\nBut when you receive too much negative information, anxiety, stress - the incinerator overloads. Information waste piles up in the brain, generating heat like the greenhouse effect. That is the cause of headaches and insomnia.\n\nThe spaceship method helps reactivate the brain\'s waste incinerator. When you close your eyes and project outward into the universe, you stop absorbing waste. At the same time, cosmic energy helps burn accumulated waste, releasing wisdom.',
    },
  },
]

const T = {
  vi: {
    siteName: 'Bất Tử Đạo',
    siteTagline: 'Trí Tuệ Người Việt Nam',
    heroTitle: 'Phi Thuyền Trí Tuệ',
    heroSub: 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời',
    heroCta: 'Khám Phá Ngay',
    topicsTitle: 'Chủ Đề',
    articlesTitle: 'Bài Viết Mới',
    articles: 'bài viết',
    readMore: 'Đọc tiếp',
    watchVideo: 'Xem video',
    back: '← Quay lại',
    videoPlaceholder: 'Video sẽ được cập nhật',
    searchTitle: 'Tìm Kiếm',
    searchPlaceholder: 'Tìm theo tiêu đề, câu hỏi...',
    noResults: 'Không tìm thấy kết quả',
    contactTitle: 'Liên Hệ',
    contactName: 'Họ và tên',
    contactEmail: 'Email',
    contactMsg: 'Nội dung tin nhắn',
    contactSend: 'Gửi Tin Nhắn',
    contactThanks: 'Cảm ơn bạn! Tin nhắn đã được gửi.',
    footer: '© 2026 Bất Tử Đạo. Nội dung mang tính chia sẻ cá nhân, không thay thế tư vấn y khoa chuyên nghiệp.',
    navHome: 'Trang chủ',
    navTopics: 'Chủ đề',
    navSearch: 'Tìm kiếm',
    navContact: 'Liên hệ',
    menuOpen: 'Menu',
  },
  en: {
    siteName: 'Immortality',
    siteTagline: 'Vietnamese Wisdom',
    heroTitle: 'Spaceship of Wisdom',
    heroSub: 'Discover the light within you — a healing journey from timeless Vietnamese wisdom',
    heroCta: 'Explore Now',
    topicsTitle: 'Topics',
    articlesTitle: 'Latest Articles',
    articles: 'articles',
    readMore: 'Read more',
    watchVideo: 'Watch video',
    back: '← Go back',
    videoPlaceholder: 'Video coming soon',
    searchTitle: 'Search',
    searchPlaceholder: 'Search by title, question...',
    noResults: 'No results found',
    contactTitle: 'Contact',
    contactName: 'Full name',
    contactEmail: 'Email',
    contactMsg: 'Message',
    contactSend: 'Send Message',
    contactThanks: 'Thank you! Your message has been sent.',
    footer: '© 2026 Immortality. Content is personal sharing and does not replace professional medical advice.',
    navHome: 'Home',
    navTopics: 'Topics',
    navSearch: 'Search',
    navContact: 'Contact',
    menuOpen: 'Menu',
  },
}

/* ───────── ANIMATED SUN COMPONENT (inline) ───────── */
function SunIcon({ size = 28 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="sun-icon" aria-hidden="true">
      <defs>
        <radialGradient id={`sg${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e4c78a" />
          <stop offset="100%" stopColor="#c9a86c" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#c9a86c" strokeWidth="0.8" opacity="0.25" className="sun-glow" />
      <circle cx="50" cy="50" r="18" fill={`url(#sg${size})`} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * Math.PI / 180
        const x1 = 50 + Math.cos(angle) * 24
        const y1 = 50 + Math.sin(angle) * 24
        const x2 = 50 + Math.cos(angle) * 38
        const y2 = 50 + Math.sin(angle) * 38
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a86c" strokeWidth="2" strokeLinecap="round" className="sun-ray" style={{ animationDelay: `${i * 0.15}s` }} />
      })}
    </svg>
  )
}

/* ───────── MAIN APP ───────── */
export default function App() {
  const [lang, setLang] = useState('vi')
  const [page, setPage] = useState('home')      // home | topic | article | search | contact
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const t = T[lang]

  // scroll to top on page change
  useEffect(() => { window.scrollTo(0, 0) }, [page, selectedArticle])

  const navigate = (p, extra) => {
    setMenuOpen(false)
    if (p === 'topic') { setSelectedTopic(extra); setPage('topic') }
    else if (p === 'article') { setSelectedArticle(extra); setPage('article') }
    else { setPage(p) }
  }

  const filteredArticles = (topicId) => ARTICLES.filter(a => !topicId || a.topic === topicId)

  const searchResults = ARTICLES.filter(a => {
    const q = search.toLowerCase()
    const d = a[lang]
    return d.title.toLowerCase().includes(q) || d.question.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q)
  })

  const handleContactSubmit = (e) => { e.preventDefault(); setContactSent(true); setTimeout(() => setContactSent(false), 3000) }

  /* ───────── RENDER ───────── */
  return (
    <>
      <style>{`
        /* ─── RESET & BASE ─── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; scroll-behavior: smooth; }
        body {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: #0a0a0f;
          color: #b8b5ad;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        a { color: inherit; text-decoration: none; }

        /* ─── VARIABLES ─── */
        :root {
          --bg: #0a0a0f;
          --card: #12121a;
          --gold: #c9a86c;
          --gold-bright: #e4c78a;
          --text: #b8b5ad;
          --text-dim: #8a8578;
          --white: #ffffff;
          --font-display: 'Cormorant Garamond', serif;
          --font-body: 'Be Vietnam Pro', sans-serif;
          --max-w: 480px;
        }
        @media (min-width: 768px) { :root { --max-w: 640px; } }

        /* ─── ANIMATED SUN ─── */
        .sun-icon .sun-ray {
          animation: rayPulse 2.5s ease-in-out infinite;
        }
        .sun-icon .sun-glow {
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes rayPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { r: 30; opacity: 0.2; }
          50% { r: 36; opacity: 0.45; }
        }

        /* ─── FLOATING PARTICLES ─── */
        .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .particle {
          position: absolute; bottom: -10px; width: 3px; height: 3px;
          background: var(--gold); border-radius: 50%;
          animation: floatUp linear infinite;
          opacity: 0;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }

        /* ─── AMBIENT GLOW ─── */
        .ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .ambient::before, .ambient::after {
          content: ''; position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,108,0.08) 0%, transparent 70%);
          animation: ambientPulse 6s ease-in-out infinite;
        }
        .ambient::before { top: -20%; left: -10%; width: 80vw; height: 80vw; }
        .ambient::after { bottom: -30%; right: -20%; width: 90vw; height: 90vw; animation-delay: 3s; }
        @keyframes ambientPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        /* ─── LIGHT RAYS ─── */
        .light-rays { position: fixed; top: 0; left: 0; right: 0; height: 100vh; pointer-events: none; z-index: 0; overflow: hidden; }
        .light-ray {
          position: absolute; top: -10%; width: 2px; height: 120%;
          background: linear-gradient(to bottom, rgba(201,168,108,0.15), transparent 80%);
          animation: raySwing 8s ease-in-out infinite;
        }
        @keyframes raySwing {
          0%, 100% { transform: rotate(-15deg); opacity: 0.3; }
          50% { transform: rotate(15deg); opacity: 0.7; }
        }

        /* ─── LAYOUT ─── */
        .app-wrap { position: relative; z-index: 1; }
        .container { max-width: var(--max-w); margin: 0 auto; padding: 0 20px; }

        /* ─── HEADER ─── */
        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,15,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,108,0.15);
          padding: 14px 0;
        }
        .header-inner {
          display: flex; align-items: center; justify-content: space-between;
          max-width: var(--max-w); margin: 0 auto; padding: 0 20px;
        }
        .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .logo-text { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--gold-bright); }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .lang-btn {
          background: rgba(201,168,108,0.12); border: 1px solid rgba(201,168,108,0.25);
          color: var(--gold-bright); padding: 5px 12px; border-radius: 20px;
          font-size: 0.78rem; font-weight: 500; cursor: pointer; font-family: var(--font-body);
          transition: all 0.3s;
        }
        .lang-btn:hover { background: rgba(201,168,108,0.25); }
        .hamburger {
          display: flex; flex-direction: column; gap: 5px; cursor: pointer;
          background: none; border: none; padding: 4px;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px; background: var(--gold-bright);
          transition: all 0.3s; border-radius: 2px;
        }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translateY(7px); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translateY(-7px); }
        @media (min-width: 768px) { .hamburger { display: none; } }

        /* ─── MOBILE OVERLAY NAV ─── */
        .overlay-nav {
          position: fixed; inset: 0; z-index: 99;
          background: rgba(10,10,15,0.97); backdrop-filter: blur(16px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px;
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        .overlay-nav.open { opacity: 1; pointer-events: auto; }
        .overlay-nav button {
          background: none; border: none; color: var(--gold-bright);
          font-family: var(--font-display); font-size: 1.8rem; font-weight: 600;
          cursor: pointer; transition: color 0.3s;
        }
        .overlay-nav button:hover { color: var(--white); }

        /* ─── DESKTOP NAV ─── */
        .desktop-nav { display: none; gap: 24px; }
        @media (min-width: 768px) {
          .desktop-nav { display: flex; }
          .desktop-nav button {
            background: none; border: none; color: var(--text-dim);
            font-family: var(--font-body); font-size: 0.85rem; font-weight: 500;
            cursor: pointer; transition: color 0.3s;
          }
          .desktop-nav button:hover, .desktop-nav button.active { color: var(--gold-bright); }
        }

        /* ─── HERO ─── */
        .hero {
          text-align: center; padding: 60px 20px 50px;
          max-width: var(--max-w); margin: 0 auto;
        }
        .hero-sun { margin-bottom: 24px; filter: drop-shadow(0 0 20px rgba(201,168,108,0.4)); }
        .hero h1 {
          font-family: var(--font-display); font-size: 2.4rem; font-weight: 700;
          color: var(--white); line-height: 1.2; margin-bottom: 16px;
          text-shadow: 0 0 30px rgba(201,168,108,0.3);
        }
        .hero p {
          color: var(--text); font-size: 0.95rem; line-height: 1.7;
          max-width: 360px; margin: 0 auto 28px;
        }
        .cta-btn {
          display: inline-block; background: linear-gradient(135deg, var(--gold), var(--gold-bright));
          color: #0a0a0f; font-weight: 600; font-size: 0.9rem;
          padding: 13px 36px; border-radius: 30px; border: none;
          cursor: pointer; font-family: var(--font-body);
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 4px 20px rgba(201,168,108,0.3);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(201,168,108,0.5); }

        /* ─── SECTION ─── */
        .section { padding: 40px 0; }
        .section-title {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-display); font-size: 1.6rem; font-weight: 700;
          color: var(--gold-bright); margin-bottom: 24px;
        }

        /* ─── TOPICS GRID ─── */
        .topics-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
        }
        @media (min-width: 768px) { .topics-grid { grid-template-columns: repeat(3, 1fr); } }
        .topic-card {
          background: var(--card); border-radius: 16px; padding: 20px 16px;
          text-align: center; cursor: pointer;
          border: 1px solid rgba(201,168,108,0.08);
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .topic-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(201,168,108,0.15);
          border-color: rgba(201,168,108,0.3);
        }
        .topic-icon { font-size: 1.8rem; margin-bottom: 10px; display: block; }
        .topic-name {
          font-family: var(--font-display); font-size: 1rem; font-weight: 600;
          color: var(--gold-bright); margin-bottom: 6px;
        }
        .topic-desc { font-size: 0.75rem; color: var(--text-dim); margin-bottom: 8px; line-height: 1.4; }
        .topic-count {
          font-size: 0.7rem; color: var(--gold); opacity: 0.7;
          background: rgba(201,168,108,0.08); padding: 3px 10px; border-radius: 12px;
          display: inline-block;
        }

        /* ─── ARTICLE CARD ─── */
        .article-card {
          background: var(--card); border-radius: 16px; padding: 22px 20px;
          margin-bottom: 16px;
          border: 1px solid rgba(201,168,108,0.08);
          transition: box-shadow 0.3s, border-color 0.3s;
        }
        .article-card:hover {
          box-shadow: 0 6px 25px rgba(201,168,108,0.12);
          border-color: rgba(201,168,108,0.25);
        }
        .article-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .article-tag {
          font-size: 0.7rem; font-weight: 500; color: var(--gold);
          background: rgba(201,168,108,0.1); padding: 3px 10px; border-radius: 10px;
        }
        .article-date { font-size: 0.72rem; color: var(--text-dim); }
        .article-title {
          font-family: var(--font-display); font-size: 1.15rem; font-weight: 600;
          color: var(--white); margin-bottom: 10px; line-height: 1.4;
        }
        .article-question {
          font-style: italic; font-size: 0.85rem; color: var(--text);
          border-left: 3px solid var(--gold); padding-left: 14px;
          margin-bottom: 12px; line-height: 1.6;
        }
        .article-summary { font-size: 0.85rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 16px; }
        .article-actions { display: flex; gap: 10px; }
        .btn-read, .btn-video {
          font-size: 0.8rem; font-weight: 500; padding: 8px 18px;
          border-radius: 20px; border: none; cursor: pointer;
          font-family: var(--font-body); transition: all 0.3s;
        }
        .btn-read {
          background: linear-gradient(135deg, var(--gold), var(--gold-bright));
          color: #0a0a0f;
        }
        .btn-read:hover { box-shadow: 0 4px 15px rgba(201,168,108,0.4); }
        .btn-video {
          background: transparent; border: 1px solid rgba(201,168,108,0.3);
          color: var(--gold-bright);
        }
        .btn-video:hover { border-color: var(--gold-bright); background: rgba(201,168,108,0.08); }

        /* ─── ARTICLE DETAIL ─── */
        .detail-back {
          background: none; border: none; color: var(--gold-bright);
          font-size: 0.9rem; cursor: pointer; margin-bottom: 20px;
          font-family: var(--font-body); padding: 0;
        }
        .detail-back:hover { color: var(--white); }
        .video-placeholder {
          background: var(--card); border-radius: 14px;
          height: 200px; display: flex; align-items: center; justify-content: center;
          color: var(--text-dim); font-size: 0.85rem; margin-bottom: 24px;
          border: 1px dashed rgba(201,168,108,0.2);
        }
        .detail-title {
          font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;
          color: var(--white); margin-bottom: 16px; line-height: 1.3;
        }
        .detail-question {
          font-style: italic; color: var(--text); font-size: 0.9rem;
          border-left: 3px solid var(--gold); padding: 14px 18px;
          background: rgba(201,168,108,0.05); border-radius: 0 12px 12px 0;
          margin-bottom: 24px; line-height: 1.6;
        }
        .detail-body {
          font-size: 0.92rem; line-height: 1.8; color: var(--text);
          white-space: pre-line;
        }

        /* ─── SEARCH ─── */
        .search-input {
          width: 100%; padding: 14px 20px; border-radius: 14px;
          background: var(--card); border: 1px solid rgba(201,168,108,0.15);
          color: var(--white); font-size: 0.9rem; font-family: var(--font-body);
          outline: none; transition: border-color 0.3s;
          margin-bottom: 24px;
        }
        .search-input::placeholder { color: var(--text-dim); }
        .search-input:focus { border-color: var(--gold); }
        .no-results { text-align: center; color: var(--text-dim); padding: 40px 0; font-size: 0.9rem; }

        /* ─── CONTACT ─── */
        .contact-form { display: flex; flex-direction: column; gap: 16px; }
        .contact-form input, .contact-form textarea {
          width: 100%; padding: 14px 18px; border-radius: 12px;
          background: var(--card); border: 1px solid rgba(201,168,108,0.15);
          color: var(--white); font-size: 0.88rem; font-family: var(--font-body);
          outline: none; transition: border-color 0.3s;
        }
        .contact-form input:focus, .contact-form textarea:focus { border-color: var(--gold); }
        .contact-form input::placeholder, .contact-form textarea::placeholder { color: var(--text-dim); }
        .contact-form textarea { min-height: 140px; resize: vertical; }
        .submit-btn {
          background: linear-gradient(135deg, var(--gold), var(--gold-bright));
          color: #0a0a0f; font-weight: 600; font-size: 0.9rem;
          padding: 14px; border-radius: 14px; border: none;
          cursor: pointer; font-family: var(--font-body);
          transition: box-shadow 0.3s;
        }
        .submit-btn:hover { box-shadow: 0 4px 20px rgba(201,168,108,0.4); }
        .contact-thanks { text-align: center; color: var(--gold-bright); padding: 16px 0; font-size: 0.9rem; }

        /* ─── FOOTER ─── */
        .footer {
          text-align: center; padding: 30px 20px 100px;
          font-size: 0.75rem; color: var(--text-dim); line-height: 1.6;
          max-width: var(--max-w); margin: 0 auto;
        }
        @media (min-width: 768px) { .footer { padding-bottom: 30px; } }

        /* ─── BOTTOM NAV ─── */
        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10,10,15,0.95); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(201,168,108,0.12);
          display: flex; justify-content: space-around; padding: 10px 0 14px;
        }
        @media (min-width: 768px) { .bottom-nav { display: none; } }
        .bottom-nav button {
          background: none; border: none; display: flex; flex-direction: column;
          align-items: center; gap: 3px; cursor: pointer;
          color: var(--text-dim); font-size: 0.65rem; font-family: var(--font-body);
          transition: color 0.3s;
        }
        .bottom-nav button.active { color: var(--gold-bright); }
        .bottom-nav button svg { width: 22px; height: 22px; }

        /* ─── FADE-UP ANIMATION ─── */
        .fade-up {
          opacity: 0; transform: translateY(24px);
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-d1 { animation-delay: 0.1s; }
        .fade-up-d2 { animation-delay: 0.2s; }
        .fade-up-d3 { animation-delay: 0.3s; }
        .fade-up-d4 { animation-delay: 0.4s; }
        .fade-up-d5 { animation-delay: 0.5s; }
        .fade-up-d6 { animation-delay: 0.6s; }
      `}</style>

      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="ambient" />
      <div className="light-rays">
        {[10, 25, 45, 65, 85].map((left, i) => (
          <div key={i} className="light-ray" style={{ left: `${left}%`, animationDelay: `${i * 1.5}s`, transform: `rotate(${-30 + i * 15}deg)` }} />
        ))}
      </div>
      <div className="particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            animationDuration: `${6 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 8}s`,
          }} />
        ))}
      </div>

      {/* ─── APP ─── */}
      <div className="app-wrap">
        {/* HEADER */}
        <header className="header">
          <div className="header-inner">
            <div className="logo" onClick={() => navigate('home')}>
              <SunIcon size={28} />
              <span className="logo-text">{t.siteName}</span>
            </div>
            <div className="desktop-nav">
              <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>{t.navHome}</button>
              <button className={page === 'search' ? 'active' : ''} onClick={() => navigate('search')}>{t.navSearch}</button>
              <button className={page === 'contact' ? 'active' : ''} onClick={() => navigate('contact')}>{t.navContact}</button>
            </div>
            <div className="header-actions">
              <button className="lang-btn" onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}>
                {lang === 'vi' ? 'EN' : 'VI'}
              </button>
              <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label={t.menuOpen}>
                <span /><span /><span />
              </button>
            </div>
          </div>
        </header>

        {/* OVERLAY NAV */}
        <div className={`overlay-nav ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => navigate('home')}>{t.navHome}</button>
          <button onClick={() => navigate('search')}>{t.navSearch}</button>
          <button onClick={() => navigate('contact')}>{t.navContact}</button>
        </div>

        {/* ─── PAGES ─── */}
        <main className="container">
          {/* HOME */}
          {page === 'home' && (
            <>
              <section className="hero fade-up">
                <div className="hero-sun"><SunIcon size={80} /></div>
                <h1>{t.heroTitle}</h1>
                <p>{t.heroSub}</p>
                <button className="cta-btn" onClick={() => navigate('search')}>{t.heroCta}</button>
              </section>

              <section className="section">
                <h2 className="section-title fade-up"><SunIcon size={20} /> {t.topicsTitle}</h2>
                <div className="topics-grid">
                  {TOPICS.map((tp, i) => (
                    <div key={tp.id} className={`topic-card fade-up fade-up-d${i + 1}`} onClick={() => navigate('topic', tp.id)}>
                      <span className="topic-icon">{tp.icon}</span>
                      <div className="topic-name">{lang === 'vi' ? tp.vi : tp.en}</div>
                      <div className="topic-desc">{lang === 'vi' ? tp.descVi : tp.descEn}</div>
                      <span className="topic-count">{tp.count} {t.articles}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section">
                <h2 className="section-title fade-up"><SunIcon size={20} /> {t.articlesTitle}</h2>
                {ARTICLES.map((a, i) => {
                  const d = a[lang]
                  return (
                    <div key={a.id} className={`article-card fade-up fade-up-d${i + 1}`}>
                      <div className="article-meta">
                        <span className="article-tag">{a.tag[lang]}</span>
                        <span className="article-date">{a.date}</span>
                      </div>
                      <div className="article-title">{d.title}</div>
                      <div className="article-question">{d.question}</div>
                      <div className="article-summary">{d.summary}</div>
                      <div className="article-actions">
                        <button className="btn-read" onClick={() => navigate('article', a)}>{t.readMore}</button>
                        <button className="btn-video">{t.watchVideo}</button>
                      </div>
                    </div>
                  )
                })}
              </section>
            </>
          )}

          {/* TOPIC */}
          {page === 'topic' && (
            <section className="section">
              <button className="detail-back" onClick={() => navigate('home')}>{t.back}</button>
              <h2 className="section-title fade-up">
                <SunIcon size={20} />
                {(() => { const tp = TOPICS.find(x => x.id === selectedTopic); return tp ? (lang === 'vi' ? tp.vi : tp.en) : '' })()}
              </h2>
              {filteredArticles(selectedTopic).length === 0 && <div className="no-results">{t.noResults}</div>}
              {filteredArticles(selectedTopic).map((a, i) => {
                const d = a[lang]
                return (
                  <div key={a.id} className={`article-card fade-up fade-up-d${i + 1}`}>
                    <div className="article-meta">
                      <span className="article-tag">{a.tag[lang]}</span>
                      <span className="article-date">{a.date}</span>
                    </div>
                    <div className="article-title">{d.title}</div>
                    <div className="article-question">{d.question}</div>
                    <div className="article-summary">{d.summary}</div>
                    <div className="article-actions">
                      <button className="btn-read" onClick={() => navigate('article', a)}>{t.readMore}</button>
                      <button className="btn-video">{t.watchVideo}</button>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {/* ARTICLE DETAIL */}
          {page === 'article' && selectedArticle && (
            <section className="section fade-up">
              <button className="detail-back" onClick={() => navigate('home')}>{t.back}</button>
              <div className="video-placeholder">{t.videoPlaceholder}</div>
              <h1 className="detail-title">{selectedArticle[lang].title}</h1>
              <div className="detail-question">{selectedArticle[lang].question}</div>
              <div className="detail-body">{selectedArticle[lang].body}</div>
            </section>
          )}

          {/* SEARCH */}
          {page === 'search' && (
            <section className="section">
              <h2 className="section-title fade-up"><SunIcon size={20} /> {t.searchTitle}</h2>
              <input
                className="search-input fade-up fade-up-d1"
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && searchResults.length === 0 && <div className="no-results">{t.noResults}</div>}
              {(search ? searchResults : ARTICLES).map((a, i) => {
                const d = a[lang]
                return (
                  <div key={a.id} className={`article-card fade-up fade-up-d${Math.min(i + 1, 6)}`}>
                    <div className="article-meta">
                      <span className="article-tag">{a.tag[lang]}</span>
                      <span className="article-date">{a.date}</span>
                    </div>
                    <div className="article-title">{d.title}</div>
                    <div className="article-question">{d.question}</div>
                    <div className="article-summary">{d.summary}</div>
                    <div className="article-actions">
                      <button className="btn-read" onClick={() => navigate('article', a)}>{t.readMore}</button>
                      <button className="btn-video">{t.watchVideo}</button>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {/* CONTACT */}
          {page === 'contact' && (
            <section className="section">
              <h2 className="section-title fade-up"><SunIcon size={20} /> {t.contactTitle}</h2>
              {contactSent && <div className="contact-thanks fade-up">{t.contactThanks}</div>}
              <form className="contact-form fade-up fade-up-d1" onSubmit={handleContactSubmit}>
                <input type="text" placeholder={t.contactName} required />
                <input type="email" placeholder={t.contactEmail} required />
                <textarea placeholder={t.contactMsg} required />
                <button type="submit" className="submit-btn">{t.contactSend}</button>
              </form>
            </section>
          )}
        </main>

        {/* FOOTER */}
        <footer className="footer">{t.footer}</footer>

        {/* BOTTOM NAV */}
        <nav className="bottom-nav">
          <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {t.navHome}
          </button>
          <button className={page === 'topic' ? 'active' : ''} onClick={() => navigate('home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            {t.navTopics}
          </button>
          <button className={page === 'search' ? 'active' : ''} onClick={() => navigate('search')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {t.navSearch}
          </button>
          <button className={page === 'contact' ? 'active' : ''} onClick={() => navigate('contact')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            {t.navContact}
          </button>
        </nav>
      </div>
    </>
  )
}
