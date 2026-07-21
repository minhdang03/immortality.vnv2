import { useMemo, useRef } from 'react'
import { useArticleAnalytics } from '../../hooks/useAnalytics'
import { useReadingTracker } from '../../hooks/useReadingTracker'
import ShareButtons from '../../components/shared/ShareButtons'
import Comments from '../../components/shared/Comments'
import ArticleCard from '../../components/shared/ArticleCard'
import InlineEdit from '../../components/shared/InlineEdit'
import { ReadingProgress, ReadingTime, FontSizeControls } from '../../components/shared/ReadingHelpers'
import { articleSlug } from '../../utils/slug'
import { cdnImage } from '../../utils/image-cdn'
import { formatLocaleDate } from '../../utils/date'

function TableOfContents({ body, lang }) {
  const paragraphs = useMemo(() => {
    if (!body) return []
    return body.split('\n\n')
      .map((p, i) => ({ text: p.trim(), index: i }))
      .filter(p => p.text.length > 0 && p.text.length < 120)
      .slice(0, 8)
  }, [body])

  if (paragraphs.length < 3) return null

  const scrollTo = (index) => {
    const el = document.querySelector(`[data-para="${index}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="toc">
      <div className="toc-title">{lang === 'vi' ? 'Nội dung' : 'Contents'}</div>
      {paragraphs.map(p => (
        <button key={p.index} className="toc-item" onClick={() => scrollTo(p.index)}>
          {p.text.slice(0, 60)}{p.text.length > 60 ? '...' : ''}
        </button>
      ))}
    </nav>
  )
}

function ArticleBody({ body, bodyRef }) {
  if (!body) return null
  const paragraphs = body.split('\n\n')
  return (
    <div className="detail-body" ref={bodyRef}>
      {paragraphs.map((p, i) => (
        <p key={i} data-para={i}>{p}</p>
      ))}
    </div>
  )
}

export default function ArticleDetail({ t, lang, article, articles, topics, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, user, onUpdateArticle }) {
  useArticleAnalytics(article, lang)
  const bodyRef = useRef(null)
  // Supabase micro-analytics: track per-paragraph dwell + completion.
  useReadingTracker(article?.id ?? null, bodyRef)
  // Fallback to other lang when current lang has no body — prevents blank page
  // for articles only authored in one language.
  const d = article[lang] || article[lang === 'vi' ? 'en' : 'vi'] || {}
  const topicObj = topics?.find(tp => tp.id === article.topic)
  const isAdmin = !!user

  const saveField = (nestedPath) => async (value) => {
    if (onUpdateArticle && article.id) {
      const parts = nestedPath.split('.')
      if (parts.length === 2) {
        const current = article[parts[0]] || {}
        await onUpdateArticle(article.id, { [parts[0]]: { ...current, [parts[1]]: value } })
      }
    }
  }

  const related = useMemo(() => {
    if (!articles) return []
    return articles
      .filter(a => a.id !== article.id && (a.topic === article.topic || a.tag?.[lang] === article.tag?.[lang]))
      .slice(0, 3)
  }, [articles, article.id, article.topic, lang])

  return (
    <>
      <ReadingProgress />
      <section className="section fade-up">
        {/* Breadcrumb: Home / Articles / [Topic] / Title */}
        <nav className="detail-breadcrumb" aria-label={lang === 'vi' ? 'Đường dẫn' : 'Breadcrumb'}>
          <button onClick={() => navigate('home')}>{t.navHome}</button>
          <span className="breadcrumb-sep" aria-hidden="true">/</span>
          <button onClick={() => navigate('articles')}>{lang === 'vi' ? 'Bài viết' : 'Articles'}</button>
          {topicObj && (
            <>
              <span className="breadcrumb-sep" aria-hidden="true">/</span>
              <button onClick={() => navigate('topic', article.topic)}>
                {lang === 'vi' ? topicObj.vi : topicObj.en}
              </button>
            </>
          )}
          <span className="breadcrumb-sep" aria-hidden="true">/</span>
          <span className="breadcrumb-current" title={d?.title} aria-current="page">{d?.title}</span>
        </nav>

        {article.image ? (
          <div className="article-hero">
            <img src={cdnImage(article.image, { w: 1200, q: 85 })} alt={d?.title || ''} loading="eager" fetchpriority="high" decoding="async" onError={e => { e.target.parentElement.style.display = 'none' }} />
          </div>
        ) : (
          <div className="video-placeholder">{t.videoPlaceholder}</div>
        )}

        {/* Article meta */}
        <div className="detail-meta">
          {article.tag?.[lang] && <span className="article-tag">{article.tag[lang]}</span>}
          <span className="article-date">{formatLocaleDate(article.date, lang)}</span>
          <ReadingTime text={d?.body} lang={lang} />
        </div>

        <h1 className="detail-title">{d?.title}</h1>
        {d?.question?.trim() && <div className="detail-question">{d.question}</div>}

        {/* Toolbar: Font size + Share */}
        <div className="detail-toolbar">
          <FontSizeControls
            fontSize={fontSize}
            onIncrease={onFontIncrease}
            onDecrease={onFontDecrease}
            onReset={onFontReset}
          />
          <ShareButtons title={d?.title || ''} shareUrl={`${window.location.origin}/article/${articleSlug(article)}`} t={t} />
        </div>

        {/* TOC for long articles */}
        <TableOfContents body={d?.body} lang={lang} />

        {/* Body with reader-optimized typography */}
        <div style={{ position: 'relative' }}>
          {isAdmin && (
            <InlineEdit
              label="Nội dung"
              value={d?.body || ''}
              onSave={saveField(`${lang}.body`)}
              multiline
            />
          )}
          <ArticleBody body={d?.body} bodyRef={bodyRef} />
        </div>

        <div className="detail-share">
          <ShareButtons title={d?.title || ''} shareUrl={`${window.location.origin}/article/${articleSlug(article)}`} t={t} />
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="related-section">
            <h3 className="related-title">
              {lang === 'vi' ? 'Bài viết liên quan' : 'Related articles'}
            </h3>
            {related.map((a, i) => (
              <ArticleCard key={a.id} article={a} lang={lang} t={t} index={i} navigate={navigate} />
            ))}
          </div>
        )}

        <Comments articleId={article.id} t={t} user={user} />
      </section>
    </>
  )
}
