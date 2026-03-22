import { useState, useMemo } from 'react'
import SunIcon from '../../components/shared/SunIcon'
import ArticleCard from '../../components/shared/ArticleCard'

export default function ArticlesPage({ t, lang, articles, topics, navigate }) {
  const [filter, setFilter] = useState('all')

  const sorted = useMemo(() =>
    (articles || []).slice().sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date)
      return 0
    }),
    [articles]
  )

  const filtered = filter === 'all' ? sorted : sorted.filter(a => a.topic === filter)

  return (
    <section className="section">
      <h2 className="section-title fade-up">
        <SunIcon size={20} />
        {lang === 'vi' ? 'Tất Cả Bài Viết' : 'All Articles'}
      </h2>

      {/* Filter by topic */}
      {topics.length > 0 && (
        <div className="story-filters fade-up">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            {lang === 'vi' ? 'Tất cả' : 'All'} ({sorted.length})
          </button>
          {topics.map(tp => {
            const count = sorted.filter(a => a.topic === tp.id).length
            if (count === 0) return null
            return (
              <button key={tp.id} className={`filter-btn ${filter === tp.id ? 'active' : ''}`} onClick={() => setFilter(tp.id)}>
                {tp.icon} {lang === 'vi' ? tp.vi : tp.en} ({count})
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && <div className="no-results">{t.noResults}</div>}
      {filtered.map((a, i) => (
        <ArticleCard key={a.id} article={a} lang={lang} t={t} index={i} navigate={navigate} />
      ))}
    </section>
  )
}
