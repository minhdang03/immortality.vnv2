/**
 * iOS / Android app banner — appears site-wide before footer.
 * Variant 'compact' for non-home pages.
 */
const COPY = {
  vi: {
    soon: '✦ Sắp ra mắt',
    title: 'Cộng đồng',
    titleEm: 'Bất Tử Đạo',
    on: 'trên iOS & Android',
    body: 'Đọc offline, thông báo bài mới, thảo luận với cộng đồng, chia sẻ trải nghiệm cá nhân. Đăng ký nhận thông báo khi app phát hành.',
    appstore: 'Tải xuống trên',
    appstoreName: 'App Store',
    play: 'Tải xuống trên',
    playName: 'Google Play',
    learnMore: 'Tìm hiểu thêm →',
  },
  en: {
    soon: '✦ Coming soon',
    title: 'The Immortality',
    titleEm: 'Community',
    on: 'on iOS & Android',
    body: 'Read offline, new article alerts, community discussions, personal experiences. Subscribe to get notified at launch.',
    appstore: 'Download on',
    appstoreName: 'App Store',
    play: 'Get it on',
    playName: 'Google Play',
    learnMore: 'Learn more →',
  },
}

export default function AppBanner({ lang = 'vi', variant = 'full', navigate }) {
  const t = COPY[lang] || COPY.vi
  const compact = variant === 'compact'

  return (
    <section className={`app-banner${compact ? ' app-banner-compact' : ''}`}>
      <div className="app-banner-text">
        <span className="app-banner-soon">{t.soon}</span>
        <h2>
          {t.title} <em>{t.titleEm}</em>
          <br /><span className="app-banner-on">{t.on}</span>
        </h2>
        {!compact && <p>{t.body}</p>}
        <div className="app-buttons">
          <a href="#" className="app-btn" aria-label={`${t.appstore} ${t.appstoreName}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <div><div className="small">{t.appstore}</div><div className="big">{t.appstoreName}</div></div>
          </a>
          <a href="#" className="app-btn" aria-label={`${t.play} ${t.playName}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3.609 1.814 13.792 12 3.609 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .61-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198 2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658 16.802 8.99l-2.302 2.302L5.864 2.658z" />
            </svg>
            <div><div className="small">{t.play}</div><div className="big">{t.playName}</div></div>
          </a>
          {navigate && (
            <button type="button" className="app-banner-learn" onClick={() => navigate('cong-dong')}>{t.learnMore}</button>
          )}
        </div>
      </div>
      {!compact && <PhoneMockup lang={lang} />}
    </section>
  )
}

function PhoneMockup({ lang }) {
  const isVi = lang === 'vi'
  return (
    <div className="phone-mockup" aria-hidden="true">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-status">
          <span>9:41</span>
          <span className="phone-status-right">●●● 5G ▮▮▮</span>
        </div>
        <div className="phone-screen">
          <div className="phone-navbar">
            <span className="phone-nav-icon">○</span>
            <span className="phone-brand">✦ Bất Tử Đạo</span>
            <span className="phone-nav-icon">⌕</span>
          </div>
          <div className="phone-hero">
            <span className="phone-tag">✦ {isVi ? 'BÀI ĐỌC NỔI BẬT' : 'FEATURED'}</span>
            <h3>{isVi ? <>Linh thai — vệ tinh tâm linh<br/>của <em>mỗi người</em></> : <>Linh thai — spiritual satellite<br/>of <em>each person</em></>}</h3>
            <div className="phone-meta">06.05 · 12 {isVi ? 'phút' : 'min'}</div>
          </div>
          <div className="phone-section-title">
            <span>{isVi ? 'Mới nhất' : 'Latest'}</span>
            <span className="phone-link">{isVi ? 'Tất cả →' : 'All →'}</span>
          </div>
          {[
            { tag: isVi ? 'Tâm Linh' : 'Spirituality', title: isVi ? 'Vì sao Chúa Giêsu bị kẹt' : 'Why Jesus is stuck', g: 'linear-gradient(135deg,#6a3a8e,#d4823a)' },
            { tag: isVi ? 'Bài học' : 'Lessons', title: isVi ? 'Reset bộ não — Về Không Đạo' : 'Reset the mind — Empty Way', g: 'linear-gradient(135deg,#4a3267,#b08642)' },
          ].map((r, i) => (
            <div key={i} className="phone-row">
              <div className="phone-row-img" style={{ background: r.g }} />
              <div className="phone-row-text">
                <div className="phone-row-tag">{r.tag}</div>
                <div className="phone-row-title">{r.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="phone-tabbar">
          <span className="phone-tab active">●</span>
          <span className="phone-tab">▦</span>
          <span className="phone-tab">?</span>
          <span className="phone-tab">✦</span>
          <span className="phone-tab">○</span>
        </div>
        <div className="phone-home-bar" />
      </div>
    </div>
  )
}
