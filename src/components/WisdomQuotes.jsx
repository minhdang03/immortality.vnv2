import { useState, useEffect, useMemo } from 'react'
import SunIcon from './SunIcon'

export default function WisdomQuotes({ stories, lang }) {
  const quotes = useMemo(() => {
    if (!stories?.length) return []
    const filtered = stories.filter(s => (lang === 'vi' ? s.threadVi : s.threadEn))
    const arr = [...filtered]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [stories, lang])

  const [active, setActive] = useState(0)

  useEffect(() => {
    if (quotes.length <= 1) return
    const timer = setInterval(() => setActive(i => (i + 1) % quotes.length), 8000)
    return () => clearInterval(timer)
  }, [quotes.length])

  if (quotes.length === 0) return null

  const q = quotes[active]
  const thread = lang === 'vi' ? q.threadVi : q.threadEn

  return (
    <section className="wisdom-section fade-up">
      <h2 className="wisdom-header">
        <SunIcon size={18} />
        {lang === 'vi' ? 'Loài người Kim Cương, bình đẳng Tự do Hạnh phúc Thiên Đường tại thế' : 'Diamond Humanity, Equality, Freedom, Happiness, Paradise on Earth'}
      </h2>
      <div className="wisdom-card">
        <div className="wisdom-quote-mark">&ldquo;</div>
        <blockquote className="wisdom-text" key={active}>{thread}</blockquote>
      </div>
      <div className="wisdom-dots">
        {quotes.map((_, i) => (
          <button key={i} className={`wisdom-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} aria-label={`Quote ${i + 1}`} />
        ))}
      </div>
    </section>
  )
}
