import { useState, useMemo } from 'react'
import SunIcon from '../SunIcon'

const PAGE_SIZE = 20

export default function KhaiTriList({ items, lang, onSelect }) {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Collect unique tags
  const tags = useMemo(() => {
    const set = new Set()
    items.forEach(item => {
      const tag = lang === 'vi' ? item.tag?.vi : item.tag?.en
      if (tag) set.add(tag)
    })
    return Array.from(set)
  }, [items, lang])

  // Filter + search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return items.filter(item => {
      const d = item[lang === 'vi' ? 'vi' : 'en'] || {}
      const tag = lang === 'vi' ? item.tag?.vi : item.tag?.en

      // Tag filter
      if (tagFilter !== 'all' && tag !== tagFilter) return false

      // Search filter
      if (q) {
        const haystack = [d.title, d.question, d.summary].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(q)
      }
      return true
    })
  }, [items, lang, search, tagFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <section className="khaitri-page fade-up">
      <div className="khaitri-header">
        <div className="khaitri-sun"><SunIcon size={60} /></div>
        <h1 className="khaitri-title">
          {lang === 'vi' ? 'Khai Trí' : 'Enlightenment Q&A'}
        </h1>
        <p className="khaitri-subtitle">
          {lang === 'vi'
            ? 'Hỏi đáp trực tiếp với Người Bất Tử'
            : 'Direct Q&A with The Immortal'}
        </p>
      </div>

      {/* Search */}
      <div className="khaitri-search">
        <input
          type="text"
          className="khaitri-search-input"
          placeholder={lang === 'vi' ? 'Tìm kiếm câu hỏi...' : 'Search questions...'}
          value={search}
          onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
        />
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="khaitri-filters">
          <button
            className={`khaitri-filter ${tagFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setTagFilter('all'); setVisibleCount(PAGE_SIZE) }}
          >
            {lang === 'vi' ? 'Tất cả' : 'All'} ({items.length})
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              className={`khaitri-filter ${tagFilter === tag ? 'active' : ''}`}
              onClick={() => { setTagFilter(tag); setVisibleCount(PAGE_SIZE) }}
            >
              {tag} ({items.filter(it => (lang === 'vi' ? it.tag?.vi : it.tag?.en) === tag).length})
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="khaitri-count">
        {filtered.length} {lang === 'vi' ? 'câu hỏi' : 'questions'}
        {search && ` — "${search}"`}
      </div>

      {/* List */}
      <div className="khaitri-list">
        {visible.map((item, i) => {
          const d = item[lang === 'vi' ? 'vi' : 'en'] || {}
          const tag = lang === 'vi' ? item.tag?.vi : item.tag?.en
          const snippet = d.summary
            ? (d.summary.length > 80 ? d.summary.slice(0, 80) + '...' : d.summary)
            : ''
          return (
            <div
              key={item.id}
              className={`khaitri-item fade-up fade-up-d${(i % 4) + 1}`}
              onClick={() => onSelect(item)}
            >
              <span className="khaitri-num">{String(item.order || i + 1).padStart(2, '0')}</span>
              <div className="khaitri-item-content">
                {tag && <span className="khaitri-tag">{tag}</span>}
                <span className="khaitri-item-title">{d.title || d.question || '(No title)'}</span>
                {snippet && <span className="khaitri-snippet">{snippet}</span>}
              </div>
              <span className="khaitri-arrow">&rsaquo;</span>
            </div>
          )
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="khaitri-loadmore">
          <button className="cta-btn-outline" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
            {lang === 'vi'
              ? `Xem thêm (${filtered.length - visibleCount} còn lại)`
              : `Load more (${filtered.length - visibleCount} remaining)`}
          </button>
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="khaitri-empty">
          {search
            ? (lang === 'vi' ? 'Không tìm thấy kết quả.' : 'No results found.')
            : (lang === 'vi' ? 'Nội dung đang cập nhật...' : 'Content being updated...')}
        </div>
      )}
    </section>
  )
}
