import { useState, useEffect, useRef } from 'react'
import SunIcon from '../../components/shared/SunIcon'
import ArticleCard from '../../components/shared/ArticleCard'
import { trackSearch } from '../../hooks/useAnalytics'

export default function SearchPage({ t, lang, articles, navigate }) {
  const [search, setSearch] = useState('')
  const debounceRef = useRef(null)

  const results = articles.filter(a => {
    const q = search.toLowerCase()
    const d = a[lang]
    return d && (d.title.toLowerCase().includes(q) || d.question.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q))
  })

  // Track search with debounce
  useEffect(() => {
    if (!search || search.length < 2) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      trackSearch(search, results.length)
    }, 1000)
    return () => clearTimeout(debounceRef.current)
  }, [search, results.length])

  return (
    <section className="section">
      <h2 className="section-title fade-up"><SunIcon size={20} /> {t.searchTitle}</h2>
      <input
        className="search-input fade-up fade-up-d1"
        type="text"
        placeholder={t.searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {search && results.length === 0 && <div className="no-results">{t.noResults}</div>}
      {(search ? results : articles).map((a, i) => (
        <ArticleCard key={a.id} article={a} lang={lang} t={t} index={i} navigate={navigate} />
      ))}
    </section>
  )
}
