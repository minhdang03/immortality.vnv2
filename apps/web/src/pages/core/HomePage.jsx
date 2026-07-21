import { useMemo } from 'react'
import ArticleCard from '../../components/shared/ArticleCard'
import WisdomQuotes from '../../components/shared/WisdomQuotes'
import { HomeSkeleton } from '../../components/shared/Skeleton'
import NewsletterBand from '../../components/shared/NewsletterBand'
import AppBanner from '../../components/shared/AppBanner'
import HomeEnergyHero from '../../components/home/HomeEnergyHero'
import { formatLocaleDate } from '../../utils/date'
import { articleSlug, humanizeSlug } from '../../utils/slug'
import { cdnImage } from '../../utils/image-cdn'

// Best label for a topic — prefer stored vi/en field, fallback to other lang, then humanize slug.
function topicLabel(tp, lang) {
  return (lang === 'vi' ? tp?.vi : tp?.en) || tp?.vi || tp?.en || humanizeSlug(tp?.id)
}

// Resolve an article's topic label using the same priority chain everywhere:
//   topic doc (lang) → topic doc (other lang) → article.tag (lang) → article.tag (other) → null
// Returns null when nothing usable found, so callers can hide the eyebrow.
function articleTopicLabel(article, topics, lang) {
  if (!article?.topic) return article?.tag?.[lang] || article?.tag?.[lang === 'vi' ? 'en' : 'vi'] || null
  const doc = topics.find(t => t.id === article.topic)
  if (doc) {
    const v = (lang === 'vi' ? doc.vi : doc.en) || doc.vi || doc.en
    if (v) return v
  }
  const tag = article.tag
  if (tag) {
    const v = (lang === 'vi' ? tag.vi : tag.en) || tag.vi || tag.en
    if (v) return v
  }
  return null
}

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

// Wrap last segment after em-dash/comma in <em> for editorial accent.
function HeroTitle({ text }) {
  if (!text) return null
  const m = text.match(/^(.*?)([—,–])(.+)$/)
  if (!m) return <>{text}</>
  return (<>{m[1]}{m[2]}<br /><em>{m[3].trim()}</em></>)
}

export default function HomePage({ t, lang, topics, articles, stories, loading, navigate, siteSettings }) {
  const homeCards = (siteSettings?.homeCards || []).filter(c => c.visible !== false)
  const hero = siteSettings?.hero || {}

  const ctaPrimaryLabel = (lang === 'vi' ? hero.ctaPrimaryVi : hero.ctaPrimaryEn) || (lang === 'vi' ? 'Khám phá' : 'Explore')
  const ctaSecondaryLabel = (lang === 'vi' ? hero.ctaSecondaryVi : hero.ctaSecondaryEn) || (lang === 'vi' ? 'Xem bài viết' : 'Browse articles')

  // Pick the best content for the current lang, falling back to the other lang
  // when the requested one is empty. Keeps cards from rendering blank.
  const pickLang = (article) => {
    const wanted = article?.[lang]
    if (wanted?.title?.trim()) return { d: wanted }
    const other = lang === 'vi' ? 'en' : 'vi'
    return { d: article?.[other] || {} }
  }

  // Featured: prefer one with current-lang content + image, else any with image.
  const featured = useMemo(() => {
    if (!articles.length) return null
    return articles.find(a => a.image && a[lang]?.title?.trim())
      || articles.find(a => a.image)
      || articles[0]
  }, [articles, lang])

  if (loading) return <HomeSkeleton />

  const featuredTopicLabel = featured ? articleTopicLabel(featured, topics, lang) : null
  const featuredData = featured ? pickLang(featured).d : {}

  // Latest grid: skip the featured article (shown above) and show next 9.
  const latest = articles.filter(a => !featured || a.id !== featured.id).slice(0, 9)

  const eyebrowFeatured = lang === 'vi' ? 'Bài đọc nổi bật' : 'Featured reading'
  const eyebrowRecent = lang === 'vi' ? 'Mới cập nhật' : 'Recent updates'
  const eyebrowExplore = lang === 'vi' ? 'Khám phá' : 'Explore'
  const titleArticles = lang === 'vi' ? <>Bài viết <em>mới nhất</em></> : <>Latest <em>articles</em></>
  const titleExplore = lang === 'vi' ? <>Hành trình <em>khám phá</em></> : <>Your <em>journey</em></>
  const viewAllLabel = lang === 'vi' ? `Tất cả ${articles.length} bài viết →` : `All ${articles.length} articles →`
  const minReadLabel = (n) => lang === 'vi' ? `${n} phút đọc` : `${n} min read`
  const readArticleLabel = lang === 'vi' ? 'Đọc bài viết' : 'Read article'

  return (
    <>
      <HomeEnergyHero
        eyebrow={lang === 'vi' ? 'Bất Tử Đạo' : 'Path of Immortality'}
        title={<HeroTitle text={t.heroTitle} />}
        subtitle={t.heroSub}
        showTitle={hero.showTitle !== false}
        showSubtitle={hero.showSubtitle !== false}
        primaryLabel={ctaPrimaryLabel}
        secondaryLabel={ctaSecondaryLabel}
        showPrimary={hero.showCtaPrimary !== false}
        showSecondary={hero.showCtaSecondary !== false}
        onPrimary={() => navigate(hero.ctaPrimaryLink || 'articles')}
        onSecondary={() => navigate(hero.ctaSecondaryLink || 'about')}
      />

      {/* WISDOM QUOTES — signature element */}
      <WisdomQuotes stories={stories} lang={lang} navigate={navigate} />

      {/* FEATURED ARTICLE — properly framed with meta */}
      {featured && (
        <section className="section featured-block">
          <div className="section-header">
            <div className="section-eyebrow">{eyebrowFeatured}</div>
          </div>
          <a
            className="featured-card"
            href={`/article/${articleSlug(featured)}`}
            onClick={(e) => { e.preventDefault(); navigate('article', featured) }}
          >
            <div
              className="featured-card-img"
              style={featured.image ? { backgroundImage: `url(${cdnImage(featured.image, { w: 1200 })})` } : undefined}
            />
            <div className="featured-card-body">
              {featuredTopicLabel && <span className="feat-tag">{featuredTopicLabel}</span>}
              <h2>{featuredData.title}</h2>
              {featuredData.summary && <p className="deck">{featuredData.summary}</p>}
              <div className="featured-meta">
                <span>{formatLocaleDate(featured.date, lang)}</span>
                <span className="dot">·</span>
                <span>{minReadLabel(readingMinutes(featured, lang))}</span>
                <span className="featured-cta">{readArticleLabel} →</span>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* LATEST ARTICLES — chips filter + 3-col grid */}
      {articles.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div className="section-eyebrow">{eyebrowRecent}</div>
            <h2 className="section-title-editorial">{titleArticles}</h2>
          </div>

          {latest.length > 0 ? (
            <div className="grid-cards">
              {latest.map(a => {
                const tag = articleTopicLabel(a, topics, lang)
                const { d } = pickLang(a)
                return (
                  <a
                    key={a.id}
                    className="grid-card"
                    href={`/article/${articleSlug(a)}`}
                    onClick={(e) => { e.preventDefault(); navigate('article', a) }}
                  >
                    <div
                      className="img"
                      style={a.image ? { backgroundImage: `url(${cdnImage(a.image, { w: 600 })})` } : undefined}
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
          ) : null}

          {articles.length > 0 && (
            <div className="section-cta">
              <button className="section-link" onClick={() => navigate('articles')}>{viewAllLabel}</button>
            </div>
          )}
        </section>
      )}

      {/* EXPLORE — quick-access tiles (homeCards) */}
      {homeCards.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div className="section-eyebrow">{eyebrowExplore}</div>
            <h2 className="section-title-editorial">{titleExplore}</h2>
          </div>
          <div className="explore-grid">
            {homeCards.map((card, i) => (
              <button
                key={card.id + i}
                className={`explore-tile fade-up fade-up-d${(i % 4) + 1}`}
                onClick={() => navigate(card.id)}
              >
                <div className="explore-tile-icon">{CARD_ICONS[card.icon] || CARD_ICONS.star}</div>
                <h3 className="explore-tile-title">{lang === 'vi' ? card.labelVi : card.labelEn}</h3>
                <p className="explore-tile-desc">{lang === 'vi' ? card.descVi : card.descEn}</p>
                <span className="explore-tile-arrow">→</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <NewsletterBand lang={lang} source="home" />
      <AppBanner lang={lang} navigate={navigate} />
    </>
  )
}
