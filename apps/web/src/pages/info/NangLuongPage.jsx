import BigBangIntro from '../../components/nangluong/BigBangIntro'
import ScrollStory from '../../components/nangluong/ScrollStory'
import ExploreMode from '../../components/nangluong/ExploreMode'
import { ENERGY_OUTRO } from '../../data/nang-luong-steps'

/**
 * Trang /nang-luong — đồ hình "Hấp Thu Năng Lượng — Nuôi Dưỡng Toàn Thân".
 * Bố cục: Big Bang intro (cinematic) → scroll story (10 bước, pin) → explore mode → lợi ích/lưu ý + mantra.
 */
export default function NangLuongPage({ lang }) {
  const o = ENERGY_OUTRO[lang] || ENERGY_OUTRO.vi

  return (
    <div className="nl-page">
      {/* Intro "Khai Thiên" — Big Bang → ánh sáng chiếu vào não (kèm strip nguồn năng lượng) */}
      <BigBangIntro lang={lang} />

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
