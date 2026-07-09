import { useRef } from 'react'
import EnergyParticles from './EnergyParticles'
import useStepCamera from './use-step-camera'
import { ENERGY_STEPS, ENERGY_PATH } from '../../data/nang-luong-steps'

/**
 * Artwork + lớp motion: đường năng lượng SVG (lộ dần theo scroll) + glow node + hạt sáng.
 * Mọi overlay nằm trong .nl-art-fit — layer LUÔN đúng tỉ lệ artwork (desktop: inset 0
 * vì .nl-art đã khoá aspect-ratio; mobile story: useStepCamera tính cover + zoom theo bước)
 * → node/tia không bao giờ lệch khỏi cơ thể dù màn hình nào.
 * - activeIndex: bước hiện tại (-1 = chưa bắt đầu); node <= activeIndex được thắp sáng
 * - pathRef/progressRef: do parent điều khiển trực tiếp (không re-render theo scroll)
 * - mode 'story': node hiện theo tiến trình · mode 'explore': tất cả node sáng, bấm được
 */
export default function EnergyArtwork({
  activeIndex = -1, mode = 'story', pathRef, progressRef, burstsRef,
  particlesActive = true, onNodeClick, selectedId,
}) {
  const artRef = useRef(null)
  const camStyle = useStepCamera({
    artRef,
    step: ENERGY_STEPS[Math.max(0, activeIndex)],
    enabled: mode === 'story',
  })

  return (
    <div className="nl-art" ref={artRef}>
      <div className="nl-art-fit" style={camStyle || undefined}>
        <img src="/nang-luong/energy-body.webp" alt="" className="nl-art-img"
          width="1024" height="1536" loading="eager" decoding="async" />

        {/* Đường năng lượng — pathLength=1 để dashoffset = 1-progress */}
        <svg className="nl-art-svg" viewBox="0 0 1024 1536" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="nl-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff6d8" />
              <stop offset="0.5" stopColor="#ffd878" />
              <stop offset="1" stopColor="#ff9d3c" />
            </linearGradient>
            <filter id="nl-glow" x="-200%" y="-20%" width="500%" height="140%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path ref={pathRef} d={ENERGY_PATH} pathLength="1"
            fill="none" stroke="url(#nl-beam)" strokeLinecap="round"
            filter="url(#nl-glow)" className="nl-beam-path"
            style={{ strokeDasharray: 1, strokeDashoffset: mode === 'explore' ? 0 : 1 }} />
        </svg>

        <EnergyParticles pathRef={pathRef} progressRef={progressRef} burstsRef={burstsRef} active={particlesActive} />

        {/* Bước cuối: vòng sóng vàng lan toả từ rễ xuống lòng đất */}
        {mode === 'story' && activeIndex === ENERGY_STEPS.length - 1 && (
          <span className="nl-earth-pulse" aria-hidden="true"
            style={{ left: `${ENERGY_STEPS[ENERGY_STEPS.length - 1].pos.x}%`, top: `${ENERGY_STEPS[ENERGY_STEPS.length - 1].pos.y + 6}%` }} />
        )}

        {/* Glow nodes — toạ độ % từ data; số chỉ hiện ở node đang active (tránh chồng chữ 2-3-4) */}
        {ENERGY_STEPS.map((s, i) => {
          const lit = mode === 'explore' || i <= activeIndex
          const current = mode === 'explore' ? selectedId === s.id : i === activeIndex
          const cls = `nl-node${lit ? ' lit' : ''}${current ? ' current' : ''}${mode === 'explore' ? ' tappable' : ''}`
          const style = { left: `${s.pos.x}%`, top: `${s.pos.y}%` }
          const num = (mode === 'explore' || current) && <span className="nl-node-num">{s.num}</span>
          return mode === 'explore' ? (
            <button key={s.id} className={cls} style={style} onClick={() => onNodeClick?.(s)}
              aria-label={s.vi.title}>
              {num}
            </button>
          ) : (
            <span key={s.id} className={cls} style={style} aria-hidden="true">
              {num}
            </span>
          )
        })}
      </div>
    </div>
  )
}
