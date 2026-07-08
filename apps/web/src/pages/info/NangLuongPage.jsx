import ScrollStory from '../../components/nangluong/ScrollStory'
import ExploreMode from '../../components/nangluong/ExploreMode'
import { ENERGY_INTRO, ENERGY_OUTRO } from '../../data/nang-luong-steps'

/**
 * Trang /nang-luong — đồ hình "Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân".
 * Bố cục: hero intro → scroll story (10 bước, pin) → explore mode → lợi ích/lưu ý + mantra.
 */
export default function NangLuongPage({ lang }) {
  const i = ENERGY_INTRO[lang] || ENERGY_INTRO.vi
  const o = ENERGY_OUTRO[lang] || ENERGY_OUTRO.vi

  return (
    <div className="nl-page">
      {/* Hero */}
      <header className="nl-hero">
        <p className="nl-hero-tagline">{i.tagline}</p>
        <h1 className="nl-hero-title">{i.title}</h1>
        <p className="nl-hero-subtitle">{i.subtitle}</p>
        <div className="nl-sources">
          <h2 className="nl-sources-title">{i.sourcesTitle}</h2>
          <ul className="nl-sources-list">
            {i.sources.map((s, idx) => <li key={idx}>{s}</li>)}
          </ul>
        </div>
        <p className="nl-scroll-hint" aria-hidden="true">{i.scrollHint} <span className="nl-scroll-arrow">↓</span></p>
      </header>

      {/* Scroll story — 11 bước ghim màn hình */}
      <ScrollStory lang={lang} />

      {/* Explore tự do */}
      <ExploreMode lang={lang} />

      {/* Lợi ích & lưu ý */}
      <section className="nl-outro">
        <div className="nl-outro-cols">
          <div className="nl-outro-box">
            <h2>{o.benefitsTitle}</h2>
            <ul>{o.benefits.map((b, idx) => <li key={idx}>{b}</li>)}</ul>
          </div>
          <div className="nl-outro-box">
            <h2>{o.notesTitle}</h2>
            <ul>{o.notes.map((n, idx) => <li key={idx}>{n}</li>)}</ul>
          </div>
        </div>
        <p className="nl-mantra">{o.mantra}</p>
      </section>
    </div>
  )
}
