import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import createBigBangCanvas from './bigbang-canvas'
import { ENERGY_INTRO } from '../../data/nang-luong-steps'

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Intro "Khai Thiên" cho /nang-luong — cinematic autoplay (~5s):
 *  hư không → điểm kỳ dị tụ khí → BIG BANG (chớp + vòng xung kích + hạt toả)
 *  → tàn dư thành sao → nón sáng đổ xuống → thắp sáng trung tâm não → reveal chữ.
 * - Cuộn / chạm / phím → skip thẳng tới trạng thái cuối
 * - prefers-reduced-motion → hero tĩnh như bản cũ (.nl-hero)
 * - Canvas tự tắt rAF khi scene rời viewport (IntersectionObserver)
 */
export default function BigBangIntro({ lang }) {
  const i = ENERGY_INTRO[lang] || ENERGY_INTRO.vi
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const [reduced] = useState(reducedMotion)

  useLayoutEffect(() => {
    if (reduced) return
    const root = rootRef.current
    const engine = createBigBangCanvas(canvasRef.current)
    let done = false
    let removeSkip = () => {}

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => { done = true },
      })

      // ① Hư không — điểm kỳ dị hiện ra, phập phồng rồi nén lại
      tl.to(q('.nl-bb-dot'), { opacity: 1, scale: 1, duration: 0.7 }, 0.35)
        .to(q('.nl-bb-dot'), { scale: 1.5, duration: 0.3, yoyo: true, repeat: 2, ease: 'sine.inOut' }, 1.05)
        .to(q('.nl-bb-dot'), { scale: 0.2, duration: 0.22, ease: 'power3.in' }, 1.72)

      // ② BIG BANG — chớp sáng, hạt toả, vòng xung kích, rung màn hình
      tl.add(() => engine.bang(), 1.94)
        .to(q('.nl-bb-dot'), { scale: 30, opacity: 0, duration: 0.5, ease: 'power4.out' }, 1.94)
        .fromTo(q('.nl-bb-flash'), { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power4.in' }, 1.9)
        .to(q('.nl-bb-flash'), { opacity: 0, duration: 1.1 }, 2.02)
        .fromTo(q('.nl-bb-ring'),
          { scale: 0.1, opacity: 0.85 },
          { scale: 16, opacity: 0, duration: 1.5, stagger: 0.14 }, 1.96)
        .to(root, { x: 5, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' }, 1.94)
        .set(root, { x: 0 }, 2.35)

      // ③ Tia sáng — rẻ quạt quanh tâm + nón sáng đổ xuống
      tl.to(q('.nl-bb-rays'), { opacity: 0.65, duration: 1.4 }, 2.2)
        .fromTo(q('.nl-bb-beam'), { scaleY: 0 }, { scaleY: 1, opacity: 1, duration: 1, ease: 'power3.inOut' }, 2.75)

      // ④ Ánh sáng chiếu vào não — hình hiện từ đáy, não giữa thắp sáng
      tl.fromTo(q('.nl-bb-figure'), { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1.3 }, 2.85)
        .fromTo(q('.nl-bb-glow'), { opacity: 0, scale: 0.25 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(2.2)' }, 3.55)

      // ⑤ Reveal chữ + gợi ý cuộn
      tl.fromTo(q('.nl-bb-copy > *'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.16 }, 3.9)
        .fromTo(q('.nl-bb-hint'), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 4.7)

      // Skip: tương tác đầu tiên → nhảy tới trạng thái cuối
      const skip = () => {
        if (done) return removeSkip()
        tl.progress(1)
        engine.skip()
        removeSkip()
      }
      const EVENTS = ['wheel', 'touchmove', 'pointerdown', 'keydown']
      removeSkip = () => EVENTS.forEach(e => window.removeEventListener(e, skip))
      EVENTS.forEach(e => window.addEventListener(e, skip, { passive: true }))
    }, root)

    // Tắt canvas khi scene rời màn hình — tiết kiệm pin
    const io = new IntersectionObserver(([e]) => engine.setActive(e.isIntersecting))
    io.observe(root)

    return () => { removeSkip(); ctx.revert(); engine.destroy(); io.disconnect() }
  }, [reduced])

  // Fallback tĩnh — giữ nguyên hero cũ cho người dùng giảm chuyển động
  if (reduced) {
    return (
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
    )
  }

  return (
    <>
      <header className="nl-bb" ref={rootRef}>
        <canvas ref={canvasRef} className="nl-bb-canvas" aria-hidden="true" />
        <div className="nl-bb-rays" aria-hidden="true" />
        <div className="nl-bb-beam" aria-hidden="true" />

        {/* Hình cơ thể năng lượng — crop đầu–ngực, não giữa được thắp sáng */}
        <figure className="nl-bb-figure" aria-hidden="true">
          <img src="/nang-luong/energy-body.webp" alt=""
            width="1024" height="1536" loading="eager" decoding="async" />
          <span className="nl-bb-glow">
            <span className="nl-bb-glow-core" />
            <span className="nl-bb-glow-halo" />
          </span>
        </figure>

        {/* Lớp vụ nổ */}
        <div className="nl-bb-ring" aria-hidden="true" />
        <div className="nl-bb-ring" aria-hidden="true" />
        <div className="nl-bb-ring" aria-hidden="true" />
        <div className="nl-bb-flash" aria-hidden="true" />
        <div className="nl-bb-dot" aria-hidden="true" />

        <div className="nl-bb-copy">
          <p className="nl-hero-tagline">{i.tagline}</p>
          <h1 className="nl-hero-title">{i.title}</h1>
          <p className="nl-hero-subtitle">{i.subtitle}</p>
        </div>
        <p className="nl-bb-hint" aria-hidden="true">{i.scrollHint} <span className="nl-scroll-arrow">↓</span></p>
      </header>

      {/* Nguồn năng lượng — strip riêng dưới scene (trong hero cũ nằm chung) */}
      <section className="nl-sources nl-bb-sources">
        <h2 className="nl-sources-title">{i.sourcesTitle}</h2>
        <ul className="nl-sources-list">
          {i.sources.map((s, idx) => <li key={idx}>{s}</li>)}
        </ul>
      </section>
    </>
  )
}
