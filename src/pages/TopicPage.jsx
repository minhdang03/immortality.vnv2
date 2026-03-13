import SunIcon from '../components/SunIcon'
import ArticleCard from '../components/ArticleCard'

export default function TopicPage({ t, lang, topics, articles, selectedTopic, navigate }) {
  const tp = topics.find(x => x.id === selectedTopic)
  const filtered = articles.filter(a => a.topic === selectedTopic)

  return (
    <section className="section">
      <button className="detail-back" onClick={() => navigate('home')}>{t.back}</button>
      <h2 className="section-title fade-up">
        <SunIcon size={20} />
        {tp ? (lang === 'vi' ? tp.vi : tp.en) : ''}
      </h2>
      {filtered.length === 0 && <div className="no-results">{t.noResults}</div>}
      {filtered.map((a, i) => (
        <ArticleCard key={a.id} article={a} lang={lang} t={t} index={i} navigate={navigate} />
      ))}
    </section>
  )
}
