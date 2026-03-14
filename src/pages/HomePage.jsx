import SunIcon from '../components/SunIcon'
import ArticleCard from '../components/ArticleCard'
import WisdomQuotes from '../components/WisdomQuotes'

const CARD_ICONS = {
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" width="28" height="28">
      <defs>
        <radialGradient id="sunCardGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0d48a" />
          <stop offset="100%" stopColor="#c9a86c" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="5" fill="url(#sunCardGrad)" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => {
        const a = deg * Math.PI / 180
        return <line key={deg} x1={12+Math.cos(a)*7.5} y1={12+Math.sin(a)*7.5} x2={12+Math.cos(a)*10.5} y2={12+Math.sin(a)*10.5} stroke="#e4c78a" strokeWidth="1.8" strokeLinecap="round" />
      })}
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),
}


export default function HomePage({ t, lang, topics, articles, stories, loading, navigate, siteSettings }) {
  const homeCards = (siteSettings?.homeCards || []).filter(c => c.visible !== false)
  const hero = siteSettings?.hero || {}

  const ctaPrimaryLabel = (lang === 'vi' ? hero.ctaPrimaryVi : hero.ctaPrimaryEn) || (lang === 'vi' ? 'Khám Phá Câu Chuyện' : 'Explore Stories')
  const ctaSecondaryLabel = (lang === 'vi' ? hero.ctaSecondaryVi : hero.ctaSecondaryEn) || t.heroCta

  return (
    <>
      {/* Hero */}
      <section className="hero fade-up">
        {hero.showSun !== false && <div className="hero-sun"><SunIcon size={90} /></div>}
        {hero.showTitle !== false && <h1>{t.heroTitle}</h1>}
        {hero.showSubtitle !== false && <p className="hero-tagline">{t.heroSub}</p>}
        {(hero.showCtaPrimary !== false || hero.showCtaSecondary !== false) && (
          <div className="hero-actions">
            {hero.showCtaPrimary !== false && (
              <button className="cta-btn" onClick={() => navigate(hero.ctaPrimaryLink || 'stories')}>
                {ctaPrimaryLabel}
              </button>
            )}
            {hero.showCtaSecondary !== false && (
              <button className="cta-btn-outline" onClick={() => navigate(hero.ctaSecondaryLink || 'search')}>
                {ctaSecondaryLabel}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Wisdom Quotes */}
      <WisdomQuotes stories={stories} lang={lang} navigate={navigate} />

      {/* Quick Access Grid */}
      {homeCards.length > 0 && (
        <section className="section">
          <div className="home-grid">
            {homeCards.map((card, i) => (
              <div key={card.id + i} className={`home-card fade-up fade-up-d${i + 1}`} onClick={() => navigate(card.id)}>
                <div className="home-card-icon">{CARD_ICONS[card.icon] || CARD_ICONS.star}</div>
                <h3 className="home-card-title">{lang === 'vi' ? card.labelVi : card.labelEn}</h3>
                <p className="home-card-desc">{lang === 'vi' ? card.descVi : card.descEn}</p>
                <span className="home-card-arrow">&rarr;</span>
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
