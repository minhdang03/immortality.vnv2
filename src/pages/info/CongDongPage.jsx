import NewsletterBand from '../../components/shared/NewsletterBand'
import AppBanner from '../../components/shared/AppBanner'

const COPY = {
  vi: {
    eyebrow: '— Sắp ra mắt',
    title: 'Cộng đồng',
    titleEm: 'Bất Tử Đạo',
    deck: 'App iOS, Android và Web — đọc offline, nhận thông báo bài mới, thảo luận với cộng đồng tu học.',
    featuresTitle: 'Tính năng',
    features: [
      { icon: '📖', t: 'Đọc offline', d: 'Lưu bài viết để đọc khi không có mạng. Đồng bộ khi online lại.' },
      { icon: '🔔', t: 'Thông báo thông minh', d: 'Bài mới, Khai Trí mới — chỉ chủ đề anh chị quan tâm.' },
      { icon: '💬', t: 'Thảo luận cộng đồng', d: 'Hỏi đáp, chia sẻ trải nghiệm, kết nối người tu cùng đường.' },
      { icon: '🌅', t: 'Reading mode', d: 'Font size, dark mode, vị trí đọc — đồng bộ giữa các thiết bị.' },
      { icon: '🔖', t: 'Bookmarks', d: 'Đánh dấu, tổ chức bộ sưu tập riêng, ghi chú cá nhân.' },
      { icon: '✦', t: 'Phụ thuộc duy nhất vào ánh sáng', d: 'Mỗi sáng nhắc anh chị 1 phút Thái Dương Quyền.' },
    ],
    roadmapTitle: 'Lộ trình',
    roadmap: [
      { q: 'Q3 2026', t: 'Web v2 — Editorial redesign', s: 'done' },
      { q: 'Q4 2026', t: 'iOS app v1 — Capacitor wrap + Cộng đồng', s: 'pending' },
      { q: 'Q1 2027', t: 'Android app v1', s: 'pending' },
      { q: 'Q2 2027', t: 'Native iOS — push, widget, Apple Watch', s: 'pending' },
    ],
  },
  en: {
    eyebrow: '— Coming soon',
    title: 'Bất Tử Đạo',
    titleEm: 'Community',
    deck: 'iOS, Android and Web app — read offline, get article alerts, discuss with the cultivating community.',
    featuresTitle: 'Features',
    features: [
      { icon: '📖', t: 'Offline reading', d: 'Save articles to read without internet. Auto-sync when back online.' },
      { icon: '🔔', t: 'Smart notifications', d: 'New articles, new Khai Trí — only on topics you care about.' },
      { icon: '💬', t: 'Community discussions', d: 'Q&A, share experiences, connect with fellow cultivators.' },
      { icon: '🌅', t: 'Reading mode', d: 'Font size, dark mode, reading position — synced across devices.' },
      { icon: '🔖', t: 'Bookmarks', d: 'Mark, organize collections, personal notes.' },
      { icon: '✦', t: 'Light-only dependency', d: 'Daily 1-minute Sun practice reminder.' },
    ],
    roadmapTitle: 'Roadmap',
    roadmap: [
      { q: 'Q3 2026', t: 'Web v2 — Editorial redesign', s: 'done' },
      { q: 'Q4 2026', t: 'iOS app v1 — Capacitor + Community', s: 'pending' },
      { q: 'Q1 2027', t: 'Android app v1', s: 'pending' },
      { q: 'Q2 2027', t: 'Native iOS — push, widget, Apple Watch', s: 'pending' },
    ],
  },
}

export default function CongDongPage({ lang = 'vi', navigate }) {
  const t = COPY[lang] || COPY.vi
  return (
    <section className="section page-cong-dong">
      <header className="page-header" style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <div className="page-eyebrow" style={{ marginBottom: 16 }}>{t.eyebrow}</div>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 20 }}>
          {t.title} <em style={{ fontStyle: 'italic', color: 'var(--gold-deep)' }}>{t.titleEm}</em>
        </h1>
        <p className="page-deck" style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--ink-soft)', maxWidth: 540, margin: '0 auto' }}>{t.deck}</p>
      </header>

      <NewsletterBand lang={lang} source="community" />

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 600, color: 'var(--ink)', textAlign: 'center', margin: '64px 0 24px' }}>{t.featuresTitle}</h2>
      <div className="cong-dong-features">
        {t.features.map(f => (
          <div key={f.t} className="cd-feature">
            <span className="cd-feature-icon" aria-hidden="true">{f.icon}</span>
            <h3>{f.t}</h3>
            <p>{f.d}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 600, color: 'var(--ink)', textAlign: 'center', margin: '64px 0 24px' }}>{t.roadmapTitle}</h2>
      <ol className="cong-dong-roadmap">
        {t.roadmap.map(r => (
          <li key={r.q} className={`cd-roadmap-item cd-${r.s}`}>
            <span className="cd-q">{r.q}</span>
            <span className="cd-t">{r.t}</span>
            <span className="cd-s">{r.s === 'done' ? '✓' : '○'}</span>
          </li>
        ))}
      </ol>

      <AppBanner lang={lang} />
    </section>
  )
}
