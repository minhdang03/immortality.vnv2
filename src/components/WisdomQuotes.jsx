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
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (quotes.length <= 1 || paused) return
    const timer = setInterval(() => setActive(i => (i + 1) % quotes.length), 15000)
    return () => clearInterval(timer)
  }, [quotes.length, paused])

  if (quotes.length === 0) return null

  const q = quotes[active]
  const fullThread = lang === 'vi' ? q.threadVi : q.threadEn
  const thread = fullThread.length > 180 ? fullThread.slice(0, 180).replace(/\s\S*$/, '') + '…' : fullThread

  return (
    <section className="wisdom-section fade-up">
      <h2 className="wisdom-header">
        <SunIcon size={18} />
        {lang === 'vi' ? 'Loài người Kim Cương, bình đẳng Tự do Hạnh phúc Thiên Đường tại thế' : 'Diamond Humanity, Equality, Freedom, Happiness, Paradise on Earth'}
      </h2>
      <div className="wisdom-card" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
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
