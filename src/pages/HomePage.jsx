import SunIcon from '../components/SunIcon'
import ArticleCard from '../components/ArticleCard'

export default function HomePage({ t, lang, topics, articles, loading, navigate }) {
  return (
    <>
      <section className="hero fade-up">
        <div className="hero-sun"><SunIcon size={80} /></div>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroSub}</p>
        <button className="cta-btn" onClick={() => navigate('search')}>{t.heroCta}</button>
      </section>

      {/* Topics - chỉ hiện khi có topics */}
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
        {!loading && articles.map((a, i) => (
          <ArticleCard key={a.id} article={a} lang={lang} t={t} index={i} navigate={navigate} />
        ))}
      </section>
    </>
  )
}
