import { useState, useMemo } from 'react'
import SunIcon from '../../components/shared/SunIcon'
import ArticleCard from '../../components/shared/ArticleCard'
import WisdomQuotes from '../../components/shared/WisdomQuotes'
import { HomeSkeleton } from '../../components/shared/Skeleton'
import NewsletterBand from '../../components/shared/NewsletterBand'
import AppBanner from '../../components/shared/AppBanner'
import { formatLocaleDate } from '../../utils/date'
import { articleSlug } from '../../utils/slug'

const CARD_ICONS = {
  book: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>),
  layers: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>),
  info: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>),
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
  star: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>),
  heart: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  compass: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>),
  lightning: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>),
}

// Estimate reading time from article body or summary (~200 wpm).
function readingMinutes(article, lang) {
  const d = article?.[lang] || article?.[lang === 'vi' ? 'en' : 'vi'] || {}
  const text = d.body || d.summary || ''
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// Render h1 with last segment (after em-dash or comma) wrapped in <em> for editorial accent.
// Falls back to plain when no separator found.
function HeroTitle({ text }) {
  if (!text) return null
  const m = text.match(/^(.*?)([—,–])(.+)$/)
  if (!m) return <>{text}</>
  return (<>{m[1]}{m[2]}<br /><em>{m[3].trim()}</em></>)
}

export default function HomePage({ t, lang, topics, articles, stories, loading, navigate, siteSettings }) {
  const homeCards = (siteSettings?.homeCards || []).filter(c => c.visible !== false)
  const hero = siteSettings?.hero || {}

  const ctaPrimaryLabel = (lang === 'vi' ? hero.ctaPrimaryVi : hero.ctaPrimaryEn) || (lang === 'vi' ? 'Đọc bài' : 'Read article')
  const ctaSecondaryLabel = (lang === 'vi' ? hero.ctaSecondaryVi : hero.ctaSecondaryEn) || (lang === 'vi' ? 'Khám phá thêm' : 'Explore more')

  const [selectedTopic, setSelectedTopic] = useState('all')

  const filteredArticles = useMemo(() => {
    if (selectedTopic === 'all') return articles
    return articles.filter(a => a.topic === selectedTopic)
  }, [articles, selectedTopic])

  // Derive chip list: prefer Firestore topics for nice labels, else derive from article topic IDs.
  const chipItems = useMemo(() => {
    if (topics.length > 0) {
      return topics
        .map(tp => ({ id: tp.id, label: lang === 'vi' ? tp.vi : tp.en, count: articles.filter(a => a.topic === tp.id).length }))
        .filter(t => t.count > 0)
    }
    const counts = new Map()
    articles.forEach(a => { if (a.topic) counts.set(a.topic, (counts.get(a.topic) || 0) + 1) })
    return [...counts.entries()].map(([id, count]) => ({ id, label: id, count }))
  }, [topics, articles, lang])

  // Hero featured: pick random article that has an image; fallback to articles[0].
  // useMemo keyed on articles so it's stable for the session but rotates per page load.
  const featured = useMemo(() => {
    if (!articles.length) return null
    const withImage = articles.filter(a => a.image)
    const pool = withImage.length > 0 ? withImage : articles
    return pool[Math.floor(Math.random() * pool.length)]
  }, [articles])

  if (loading) return <HomeSkeleton />

  const featuredTopic = featured && topics.find(tp => tp.id === featured.topic)
  const featuredTopicLabel = featuredTopic ? (lang === 'vi' ? featuredTopic.vi : featuredTopic.en) : null

  // Featured grid: 1 main + 3 side from current filter.
  const main = filteredArticles[0]
  const sides = filteredArticles.slice(1, 4)
  const rest = filteredArticles.slice(4, 10)

  const eyebrowFeatured = lang === 'vi' ? 'Bài đọc nổi bật' : 'Featured reading'
  const eyebrowRecent = lang === 'vi' ? 'Mới cập nhật' : 'Recent updates'
  const titleArticles = lang === 'vi' ? <>Bài viết <em>mới nhất</em></> : <>Latest <em>articles</em></>
  const allLabel = lang === 'vi' ? 'Tất cả' : 'All'
  const viewAllLabel = lang === 'vi' ? `Tất cả ${articles.length} bài viết →` : `All ${articles.length} articles →`
  const minReadLabel = (n) => lang === 'vi' ? `${n} phút đọc` : `${n} min read`

  return (
    <>
      {/* Hero — 2-col asymmetric (mockup: editorial-sacred-v2) */}
      <section className="hero fade-up">
        <div className="hero-text">
          <div className="hero-eyebrow">{eyebrowFeatured}</div>
          {hero.showTitle !== false && (
            <h1><HeroTitle text={t.heroTitle} /></h1>
          )}
          {hero.showSubtitle !== false && (
            <p className="hero-deck">{t.heroSub}</p>
          )}
          {(hero.showCtaPrimary !== false || hero.showCtaSecondary !== false) && (
            <div className="hero-cta">
              {hero.showCtaPrimary !== false && (
                <button className="btn btn-primary" onClick={() => navigate(hero.ctaPrimaryLink || (featured ? 'article' : 'articles'), featured)}>
                  {ctaPrimaryLabel} →
                </button>
              )}
              {hero.showCtaSecondary !== false && (
                <button className="btn btn-ghost" onClick={() => navigate(hero.ctaSecondaryLink || 'articles')}>
                  {ctaSecondaryLabel}
                </button>
              )}
            </div>
          )}
          {featured && (
            <div className="hero-meta">
              {featuredTopicLabel && <><span><strong>{featuredTopicLabel}</strong></span><span className="dot">·</span></>}
              <span>{formatLocaleDate(featured.date, lang)}</span>
              <span className="dot">·</span>
              <span>{minReadLabel(readingMinutes(featured, lang))}</span>
            </div>
          )}
        </div>
        {hero.showSun !== false && (
          <div
            className={`hero-image${featured?.image ? ' has-image' : ''}`}
            style={featured?.image ? { backgroundImage: `url(${featured.image})` } : undefined}
            aria-hidden="true"
          />
        )}
      </section>

      {/* Wisdom Quotes (app-specific, kept) */}
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

      {/* Latest Articles — section-header + chips + featured-grid + grid-cards */}
      {articles.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">{eyebrowRecent}</div>
              <h2 className="section-title-editorial">{titleArticles}</h2>
            </div>
            <button className="section-link" onClick={() => navigate('articles')}>{viewAllLabel}</button>
          </div>

          {/* Topic chips filter */}
          {chipItems.length > 0 && (
            <div className="topic-chips" role="tablist" aria-label={lang === 'vi' ? 'Lọc theo chủ đề' : 'Filter by topic'}>
              <button
                role="tab"
                aria-selected={selectedTopic === 'all'}
                className={`chip ${selectedTopic === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTopic('all')}
              >
                {allLabel} <span className="chip-count">{articles.length}</span>
              </button>
              {chipItems.map(tp => (
                <button
                  key={tp.id}
                  role="tab"
                  aria-selected={selectedTopic === tp.id}
                  className={`chip ${selectedTopic === tp.id ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(tp.id)}
                >
                  {tp.label} <span className="chip-count">{tp.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Featured grid — 1 main + 3 side */}
          {main && (
            <div className="featured-grid">
              <a
                className="featured-main"
                href={`/article/${articleSlug(main)}`}
                onClick={(e) => { e.preventDefault(); navigate('article', main) }}
              >
                <div
                  className="feat-img"
                  style={main.image ? { backgroundImage: `url(${main.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                />
                {(() => {
                  const tp = topics.find(x => x.id === main.topic)
                  const label = tp ? (lang === 'vi' ? tp.vi : tp.en) : main.tag?.[lang]
                  return label ? <span className="feat-tag">{label}</span> : null
                })()}
                <h2><span>{(main[lang] || main[lang === 'vi' ? 'en' : 'vi'])?.title}</span></h2>
                <p className="deck">{(main[lang] || main[lang === 'vi' ? 'en' : 'vi'])?.summary}</p>
                <div className="featured-meta">
                  <span>{formatLocaleDate(main.date, lang)}</span>
                  <span className="dot">·</span>
                  <span>{minReadLabel(readingMinutes(main, lang))}</span>
                </div>
              </a>
              {sides.length > 0 && (
                <div className="featured-side">
                  {sides.map(a => {
                    const tp = topics.find(x => x.id === a.topic)
                    const tag = tp ? (lang === 'vi' ? tp.vi : tp.en) : a.tag?.[lang]
                    const d = a[lang] || a[lang === 'vi' ? 'en' : 'vi'] || {}
                    return (
                      <a
                        key={a.id}
                        className="side-card"
                        href={`/article/${articleSlug(a)}`}
                        onClick={(e) => { e.preventDefault(); navigate('article', a) }}
                      >
                        <div
                          className="img"
                          style={a.image ? { backgroundImage: `url(${a.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                        />
                        <div>
                          {tag && <span className="side-tag">{tag}</span>}
                          <h3>{d.title}</h3>
                          <div className="side-meta">{formatLocaleDate(a.date, lang)} · {minReadLabel(readingMinutes(a, lang))}</div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Remainder in 3-col editorial grid (mockup grid-card style) */}
          {rest.length > 0 && (
            <div className="grid-cards">
              {rest.map(a => {
                const tp = topics.find(x => x.id === a.topic)
                const tag = tp ? (lang === 'vi' ? tp.vi : tp.en) : (a.tag?.[lang] || a.topic)
                const d = a[lang] || a[lang === 'vi' ? 'en' : 'vi'] || {}
                return (
                  <a
                    key={a.id}
                    className="grid-card"
                    href={`/article/${articleSlug(a)}`}
                    onClick={(e) => { e.preventDefault(); navigate('article', a) }}
                  >
                    <div
                      className="img"
                      style={a.image ? { backgroundImage: `url(${a.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    />
                    {tag && <span className="feat-tag">{tag}</span>}
                    <h3>{d.title}</h3>
                    {d.summary && <p className="summary">{d.summary}</p>}
                    <div className="meta">
                      <span>{formatLocaleDate(a.date, lang)}</span>
                      <span className="dot">·</span>
                      <span>{minReadLabel(readingMinutes(a, lang))}</span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}

          {filteredArticles.length === 0 && (
            <p className="empty-state">{lang === 'vi' ? 'Chưa có bài viết cho chủ đề này.' : 'No articles in this topic yet.'}</p>
          )}
        </section>
      )}

      {/* Topics overview (kept — has descriptions chips don't show) */}
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

      {/* Newsletter signup */}
      <NewsletterBand lang={lang} source="home" />

      {/* iOS app banner */}
      <AppBanner lang={lang} navigate={navigate} />
    </>
  )
}
