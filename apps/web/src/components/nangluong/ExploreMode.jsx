import { useRef, useState, useEffect } from 'react'
import EnergyArtwork from './EnergyArtwork'
import StepCard from './StepCard'
import { ENERGY_STEPS, ENERGY_OUTRO } from '../../data/nang-luong-steps'

/**
 * Explore mode: đồ hình đầy đủ, năng lượng chảy loop, chạm từng điểm sáng để xem chi tiết.
 * Particles chỉ chạy khi section trong viewport (IntersectionObserver).
 */
export default function ExploreMode({ lang }) {
  const pathRef = useRef(null)
  const progressRef = useRef(1) // explore: tia luôn đầy — hạt chảy trọn dòng
  const rootRef = useRef(null)
  const [selected, setSelected] = useState(ENERGY_STEPS[0])
  const [inView, setInView] = useState(false)
  const o = ENERGY_OUTRO[lang] || ENERGY_OUTRO.vi

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 })
    if (rootRef.current) io.observe(rootRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section className="nl-explore" ref={rootRef}>
      <h2 className="nl-explore-title">{o.exploreTitle}</h2>
      <p className="nl-explore-hint">{o.exploreHint}</p>
      <div className="nl-explore-grid">
        <div className="nl-art-col">
          <EnergyArtwork
            mode="explore" pathRef={pathRef} progressRef={progressRef}
            particlesActive={inView} selectedId={selected?.id}
            onNodeClick={setSelected}
          />
        </div>
        <div className="nl-card-col">
          <StepCard step={selected} lang={lang} />
          <nav className="nl-explore-nav" aria-label={o.exploreTitle}>
            {ENERGY_STEPS.map(s => (
              <button key={s.id}
                className={`nl-explore-navbtn${selected?.id === s.id ? ' active' : ''}`}
                onClick={() => setSelected(s)}>
                <span>{s.num}</span> {(s[lang] || s.vi).title}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  )
}
