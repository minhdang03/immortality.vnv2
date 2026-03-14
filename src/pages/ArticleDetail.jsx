import { useState, useEffect, useMemo } from 'react'
import ShareButtons from '../components/ShareButtons'
import Comments from '../components/Comments'
import ArticleCard from '../components/ArticleCard'
import InlineEdit from '../components/InlineEdit'

function ReadingTime({ body, lang }) {
  if (!body) return null
  const words = body.split(/\s+/).length
  const min = Math.max(1, Math.round(words / 200))
  return (
    <span className="reading-time">
      {lang === 'vi' ? `${min} phút đọc` : `${min} min read`}
    </span>
  )
}

function FontSizeControls({ onDecrease, onIncrease, onReset, fontSize }) {
  return (
    <div className="font-size-controls">
      <button className="font-size-btn" onClick={onDecrease} title="Nhỏ hơn">A-</button>
      <button className="font-size-btn font-size-reset" onClick={onReset} title="Mặc định">{fontSize}%</button>
      <button className="font-size-btn" onClick={onIncrease} title="Lớn hơn">A+</button>
    </div>
  )
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="reading-progress" style={{ width: `${progress}%` }} />
}

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

function ArticleBody({ body }) {
  if (!body) return null
  const paragraphs = body.split('\n\n')
  return (
    <div className="detail-body">
      {paragraphs.map((p, i) => (
        <p key={i} data-para={i}>{p}</p>
      ))}
    </div>
  )
}

export default function ArticleDetail({ t, lang, article, articles, topics, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, user, onUpdateArticle }) {
  const d = article[lang]
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
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button onClick={() => navigate('home')}>{t.navHome}</button>
          <span className="breadcrumb-sep">/</span>
          {topicObj && (
            <>
              <button onClick={() => navigate('topic', article.topic)}>
                {lang === 'vi' ? topicObj.vi : topicObj.en}
              </button>
              <span className="breadcrumb-sep">/</span>
            </>
          )}
          <span className="breadcrumb-current">{d?.title?.slice(0, 30)}{d?.title?.length > 30 ? '...' : ''}</span>
        </div>

        <div className="video-placeholder">{t.videoPlaceholder}</div>

        {/* Article meta */}
        <div className="detail-meta">
          {article.tag?.[lang] && <span className="article-tag">{article.tag[lang]}</span>}
          <span className="article-date">{article.date}</span>
          <ReadingTime body={d?.body} lang={lang} />
        </div>

        <h1 className="detail-title">{d?.title}</h1>
        <div className="detail-question">{d?.question}</div>

        {/* Toolbar: Font size + Share */}
        <div className="detail-toolbar">
          <FontSizeControls
            fontSize={fontSize}
            onIncrease={onFontIncrease}
            onDecrease={onFontDecrease}
            onReset={onFontReset}
          />
          <ShareButtons title={d?.title || ''} articleId={article.id} t={t} />
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
          <ArticleBody body={d?.body} />
        </div>

        <div className="detail-share">
          <ShareButtons title={d?.title || ''} articleId={article.id} t={t} />
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
