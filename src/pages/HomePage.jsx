import SunIcon from '../components/SunIcon'
import ArticleCard from '../components/ArticleCard'

const CARD_ICONS = {
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),
}

export default function HomePage({ t, lang, topics, articles, loading, navigate, siteSettings }) {
  const homeCards = (siteSettings?.homeCards || []).filter(c => c.visible !== false)
  const hero = siteSettings?.hero || {}

  const ctaPrimaryLabel = (lang === 'vi' ? hero.ctaPrimaryVi : hero.ctaPrimaryEn) || (lang === 'vi' ? 'Khám Phá Câu Chuyện' : 'Explore Stories')
  const ctaSecondaryLabel = (lang === 'vi' ? hero.ctaSecondaryVi : hero.ctaSecondaryEn) || t.heroCta

  return (
    <>
      {/* Hero */}
      <section className="hero fade-up">
        <div className="hero-sun"><SunIcon size={90} /></div>
        <h1>{t.heroTitle}</h1>
        <p className="hero-tagline">{t.heroSub}</p>
        <div className="hero-actions">
          <button className="cta-btn" onClick={() => navigate(hero.ctaPrimaryLink || 'stories')}>
            {ctaPrimaryLabel}
          </button>
          <button className="cta-btn-outline" onClick={() => navigate(hero.ctaSecondaryLink || 'search')}>
            {ctaSecondaryLabel}
          </button>
        </div>
      </section>

      {/* Quick Access Grid */}
      {homeCards.length > 0 && (
        <section className="section">
          <div className="home-grid">
            {homeCards.map((card, i) => (
              <div key={card.id + i} className={`home-card fade-up fade-up-d${i + 1}`} onClick={() => navigate(card.id)}>
                <div className="home-card-icon">{CARD_ICONS[card.icon] || CARD_ICONS.star}</div>
                <h3 className="home-card-title">{lang === 'vi' ? card.labelVi : card.labelEn}</h3>
                <p className="home-card-desc">{lang === 'vi' ? card.descVi : card.descEn}</p>
                <span className="home-card-arrow">→</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <section className="section">
          <h2 className="section-title fade-up"><SunIcon size={20} /> {t.topicsTitle}</h2>
          <div className="topics-grid">
            {topics.map((tp, i) => (
              <div key={tp.id} className={`topic-card fade-up fade-up-d${i + 1}`} onClick={() => navigate('topic', tp.id)}>
                <span className="topic-icon">{tp.icon}</span>
                <div className="topic-name">{lang === 'vi' ? tp.vi : tp.en}</div>
                <div className="topic-desc">{lang === 'vi' ? tp.descVi : tp.descEn}</div>
                <span className="topic-count">{articles.filter(a => a.topic === tp.id).length} {t.articles}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="section">
        <h2 className="section-title fade-up"><SunIcon size={20} /> {t.articlesTitle}</h2>
        {loading && [1,2,3].map(i => (
          <div key={i} className="skeleton-card fade-up">
            <div className="skeleton-line w40" />
            <div className="skeleton-line w80 thick" />
            <div className="skeleton-line w100" />
            <div className="skeleton-line w60" />
          </div>
        ))}
        {!loading && articles.slice(0, 5).map((a, i) => (
          <ArticleCard key={a.id} article={a} lang={lang} t={t} index={i} navigate={navigate} />
        ))}
        {!loading && articles.length > 5 && (
          <div className="home-see-all fade-up">
            <button className="cta-btn-outline" onClick={() => navigate('search')}>
              {lang === 'vi' ? `Xem tất cả ${articles.length} bài viết` : `View all ${articles.length} articles`}
            </button>
          </div>
        )}
      </section>
    </>
  )
}
