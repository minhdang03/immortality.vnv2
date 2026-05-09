import ShareButtons from './ShareButtons'
import { articleSlug } from '../../utils/slug'
import { formatLocaleDate } from '../../utils/date'
import { cdnImage } from '../../utils/image-cdn'

// Hide question if it just paraphrases the title (substring either way after lowercasing).
function questionAddsValue(title, question) {
  if (!question) return false
  const t = (title || '').toLowerCase().trim()
  const q = question.toLowerCase().trim()
  if (!t) return true
  return !t.includes(q) && !q.includes(t)
}

export default function ArticleCard({ article, lang, t, index, navigate, onTagClick, hideShare }) {
  const d = article[lang] || article[lang === 'vi' ? 'en' : 'vi']
  if (!d) return null
  const goToArticle = () => navigate('article', article)
  const onTitleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToArticle() }
  }
  const handleTagClick = (e) => {
    e.stopPropagation()
    if (onTagClick && article.topic) onTagClick(article.topic)
  }
  const tagLabel = article.tag?.[lang]
  const showQuestion = questionAddsValue(d.title, d.question)

  return (
    <article className={`article-card fade-up fade-up-d${Math.min(index + 1, 6)}`}>
      {article.image && (
        <div
          className="article-card-image"
          onClick={goToArticle}
          role="button"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img src={cdnImage(article.image, { w: 600 })} alt="" loading="lazy" decoding="async" onError={e => { e.target.parentElement.style.display = 'none' }} />
        </div>
      )}
      <div className="article-card-body">
        <div className="article-meta">
          {tagLabel && (
            onTagClick
              ? <button type="button" className="article-tag article-tag-button" onClick={handleTagClick}>{tagLabel}</button>
              : <span className="article-tag">{tagLabel}</span>
          )}
          <span className="article-date">{formatLocaleDate(article.date, lang)}</span>
        </div>
        <h3 className="article-title">
          <a
            className="article-title-link"
            href={`/article/${articleSlug(article)}`}
            onClick={(e) => { e.preventDefault(); goToArticle() }}
            onKeyDown={onTitleKey}
          >{d.title}</a>
        </h3>
        {showQuestion && <div className="article-question">{d.question}</div>}
        <div className="article-summary">{d.summary}</div>
        <div className="article-actions">
          <button className="btn-read" onClick={goToArticle}>{t.readMore}</button>
          {!hideShare && (
            <ShareButtons title={d.title} shareUrl={`${window.location.origin}/article/${articleSlug(article)}`} t={t} />
          )}
        </div>
      </div>
    </article>
  )
}
