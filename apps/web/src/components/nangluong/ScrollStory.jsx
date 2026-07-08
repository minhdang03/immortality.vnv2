import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import EnergyArtwork from './EnergyArtwork'
import StepCard from './StepCard'
import { ENERGY_STEPS } from '../../data/nang-luong-steps'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isCompactViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 1180px)').matches

const getActiveStepIndex = (progress, count) =>
  Math.min(count - 1, Math.round(progress * (count - 1)))

const getStepScrollPercent = () => (
  isCompactViewport() ? 155 : 90
)

/**
 * Scroll story: scene ghim (pin) toàn màn hình, cuộn qua 10 bước.
 * - Card đổi theo tâm của 10 mốc đều; mobile snap theo từng mốc để không nhảy mất bước
 * - React state chỉ đổi khi CHỈ SỐ bước đổi
 * - prefers-reduced-motion: bỏ pin, hiển thị artwork + list bước tĩnh
 */
export default function ScrollStory({ lang }) {
  const sceneRef = useRef(null)
  const pathRef = useRef(null)
  const progressRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [inView, setInView] = useState(false) // chỉ chạy particles khi scene trên màn hình
  const [reduced] = useState(reducedMotion)

  useLayoutEffect(() => {
    if (reduced) { progressRef.current = 1; return }
    const N = ENERGY_STEPS.length
    const ctx = gsap.context(() => {
      const compact = isCompactViewport()
      ScrollTrigger.create({
        trigger: sceneRef.current,
        start: 'top top',
        end: () => `+=${N * getStepScrollPercent()}%`,
        pin: true,
        anticipatePin: 1,
        fastScrollEnd: false,
        invalidateOnRefresh: true,
        snap: compact ? {
          snapTo: 1 / (N - 1),
          duration: { min: 0.12, max: 0.28 },
          delay: 0.04,
          ease: 'power1.inOut',
        } : false,
        onToggle: self => setInView(self.isActive),
        onUpdate: self => {
          const p = self.progress
          const idx = getActiveStepIndex(p, N)
          progressRef.current = p
          if (pathRef.current) pathRef.current.style.strokeDashoffset = String(1 - p)
          setActiveIndex(prev => (prev === idx ? prev : idx)) // guard re-render
        },
      })
    }, sceneRef)
    return () => ctx.revert()
  }, [reduced])

  // Preload hình cận cảnh các bước ngay khi scene vào màn hình → crossfade không giật
  useEffect(() => {
    if (!inView) return
    ENERGY_STEPS.forEach(s => {
      if (s.img) { const im = new Image(); im.src = s.img }
    })
  }, [inView])

  // Fallback tĩnh cho người dùng giảm chuyển động
  if (reduced) {
    return (
      <section className="nl-scene nl-scene-static">
        <EnergyArtwork mode="explore" pathRef={pathRef} progressRef={progressRef} particlesActive={false} />
        <div className="nl-static-list">
          {ENERGY_STEPS.map(s => <StepCard key={s.id} step={s} lang={lang} />)}
        </div>
      </section>
    )
  }

  const step = ENERGY_STEPS[activeIndex]

  return (
    <section className="nl-scene" ref={sceneRef}>
      <div className="nl-stage">
        <div className="nl-art-col">
          <EnergyArtwork
            mode="story" activeIndex={activeIndex}
            pathRef={pathRef} progressRef={progressRef}
            particlesActive={inView}
          />
        </div>
        {/* Bước cuối: card đảo lên đỉnh màn hình để nhường chỗ cho rễ sáng phía dưới (mobile) */}
        <div className={`nl-card-col${step.cardTop ? ' nl-card-col--top' : ''}`}>
          <StepCard step={step} lang={lang} />
          <div className="nl-progress" aria-hidden="true">
            {ENERGY_STEPS.map((s, i) => (
              <span key={s.id} className={`nl-progress-dot${i <= activeIndex ? ' on' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
