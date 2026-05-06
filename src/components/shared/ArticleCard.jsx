import ShareButtons from './ShareButtons'
import { articleSlug } from '../../utils/slug'

export default function ArticleCard({ article, lang, t, index, navigate }) {
  const d = article[lang] || article[lang === 'vi' ? 'en' : 'vi']
  if (!d) return null
  const goToArticle = () => navigate('article', article)
  return (
    <div className={`article-card fade-up fade-up-d${Math.min(index + 1, 6)}`}>
      {article.image && (
        <div className="article-card-image" onClick={goToArticle}>
          <img src={article.image} alt={d.title} loading="lazy" onError={e => { e.target.parentElement.style.display = 'none' }} />
        </div>
      )}
      <div className="article-meta">
        <span className="article-tag">{article.tag?.[lang]}</span>
        <span className="article-date">{article.date}</span>
      </div>
      <div className="article-title article-title-link" onClick={goToArticle}>{d.title}</div>
      <div className="article-question">{d.question}</div>
      <div className="article-summary">{d.summary}</div>
      <div className="article-actions">
        <button className="btn-read" onClick={goToArticle}>{t.readMore}</button>
        <button className="btn-video">{t.watchVideo}</button>
        <ShareButtons title={d.title} shareUrl={`${window.location.origin}/article/${articleSlug(article)}`} t={t} />
      </div>
    </div>
  )
}
