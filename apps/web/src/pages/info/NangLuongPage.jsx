import ScrollStory from '../../components/nangluong/ScrollStory'
import CosmicBackdrop from '../../components/nangluong/cosmic-backdrop'
import { ENERGY_INTRO } from '../../data/nang-luong-steps'

/**
 * Trang /nang-luong — đồ hình "Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân".
 * Bố cục tối giản: big bang + nền sao → hero → scroll story (10 bước, pin). Hết.
 */
export default function NangLuongPage({ lang }) {
  const i = ENERGY_INTRO[lang] || ENERGY_INTRO.vi

  return (
    <div className="nl-page">
      {/* Vũ trụ: sao parallax + hyperspace + sao băng; flash big bang khi vào trang */}
      <CosmicBackdrop />
      <div className="nl-bigbang" aria-hidden="true" />

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

      {/* Scroll story — 10 bước ghim màn hình */}
      <ScrollStory lang={lang} />
    </div>
  )
}
