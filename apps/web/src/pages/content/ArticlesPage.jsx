import { useState, useMemo } from 'react'
import SunIcon from '../../components/shared/SunIcon'
import ArticleCard from '../../components/shared/ArticleCard'
import PageHero from '../../components/shared/PageHero'

const PAGE_SIZE = 12

export default function ArticlesPage({ t, lang, articles, topics, navigate }) {
  const [filter, setFilter] = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const sorted = useMemo(() =>
    (articles || []).slice().sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date)
      return 0
    }),
    [articles]
  )

  const filtered = useMemo(
    () => filter === 'all' ? sorted : sorted.filter(a => a.topic === filter),
    [sorted, filter]
  )

  const onSelectFilter = (id) => { setFilter(id); setVisible(PAGE_SIZE) }

  const visibleItems = filtered.slice(0, visible)
  const hasMore = filtered.length > visibleItems.length

  return (
    <section className="section articles-page">
      <PageHero
        icon={<SunIcon size={40} />}
        eyebrow={lang === 'vi' ? 'Thư Viện' : 'Library'}
        title={lang === 'vi' ? 'Tất Cả Bài Viết' : 'All Articles'}
      />

      {/* Filter by topic */}
      {topics.length > 0 && (
        <div className="story-filters fade-up" role="tablist" aria-label={lang === 'vi' ? 'Lọc theo chủ đề' : 'Filter by topic'}>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onSelectFilter('all')}
          >
            {lang === 'vi' ? 'Tất cả' : 'All'} ({sorted.length})
          </button>
          {topics.map(tp => {
            const count = sorted.filter(a => a.topic === tp.id).length
            if (count === 0) return null
            return (
              <button
                key={tp.id}
                type="button"
                role="tab"
                aria-selected={filter === tp.id}
                className={`filter-btn ${filter === tp.id ? 'active' : ''}`}
                onClick={() => onSelectFilter(tp.id)}
              >
                {tp.icon} {lang === 'vi' ? tp.vi : tp.en} ({count})
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="no-results no-results-rich">
          <SunIcon size={32} />
          <p>{t.noResults}</p>
          {filter !== 'all' && (
            <button type="button" className="btn-read" onClick={() => onSelectFilter('all')}>
              {lang === 'vi' ? 'Xem tất cả bài viết' : 'View all articles'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="article-grid">
            {visibleItems.map((a, i) => (
              <ArticleCard
                key={a.id}
                article={a}
                lang={lang}
                t={t}
                index={i}
                navigate={navigate}
                onTagClick={onSelectFilter}
                hideShare
              />
            ))}
          </div>
          {hasMore && (
            <div className="load-more-row">
              <button type="button" className="btn-read" onClick={() => setVisible(v => v + PAGE_SIZE)}>
                {lang === 'vi' ? `Xem thêm (${filtered.length - visibleItems.length})` : `Load more (${filtered.length - visibleItems.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
