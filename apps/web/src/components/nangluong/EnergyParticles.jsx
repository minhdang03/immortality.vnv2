import { useEffect, useRef } from 'react'

/**
 * Canvas hạt sáng chảy dọc đường năng lượng (SVG path) + sóng xung kích khi node kích hoạt.
 * - pathRef: ref tới <path> SVG (viewBox 1024x1536) để sample toạ độ
 * - progressRef: ref số 0..1 — hạt chỉ chảy trong phần path đã lộ ra
 * - burstsRef: ref mảng {x,y (%), at, sparks[]} — parent push khi đổi bước/chạm node,
 *   vẽ vòng sóng + tia lửa toé ra trong ~0.75s rồi tự xoá
 * - active: bật/tắt vòng lặp rAF (tắt khi scene ngoài viewport để tiết kiệm pin)
 */
export default function EnergyParticles({ pathRef, progressRef, burstsRef, active = true, count = 36 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const path = pathRef.current
    if (!canvas || !path) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    let raf, w, h, scaleX, scaleY
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const totalLen = path.getTotalLength()

    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scaleX = w / 1024; scaleY = h / 1536
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Hạt: t = vị trí trên path (0..1); vài hạt "comet" to hơn, có đuôi dài
    const particles = Array.from({ length: count }, (_, i) => ({
      t: Math.random(), speed: 0.0012 + Math.random() * 0.0025,
      size: 1 + Math.random() * 2.4, drift: (Math.random() - 0.5) * 26,
      phase: Math.random() * Math.PI * 2,
      comet: i < 5, px: 0, py: 0, // 5 hạt đầu là comet dẫn dòng
    }))

    const tick = (now) => {
      const progress = progressRef ? progressRef.current : 1
      ctx.clearRect(0, 0, w, h)
      if (progress > 0.01) {
        for (const p of particles) {
          p.t += p.speed * (p.comet ? 1.8 : 1)
          if (p.t > progress) { p.t = Math.random() * 0.05; p.px = 0 }
          const pt = path.getPointAtLength(p.t * totalLen)
          const x = pt.x * scaleX + Math.sin(p.t * 40 + p.phase) * p.drift * scaleX
          const y = pt.y * scaleY
          const fade = Math.min(1, (progress - p.t) * 12)
          if (p.comet && p.px) {
            // Đuôi comet: vệt gradient từ vị trí frame trước
            const grad = ctx.createLinearGradient(x, y, p.px, p.py - 14)
            grad.addColorStop(0, `rgba(255,236,180,${0.75 * fade})`)
            grad.addColorStop(1, 'rgba(255,236,180,0)')
            ctx.strokeStyle = grad
            ctx.lineWidth = p.size * 1.4
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(p.px, p.py - 14); ctx.stroke()
          }
          ctx.beginPath()
          ctx.arc(x, y, p.size * (p.comet ? 1.5 : 1), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 216, 120, ${(p.comet ? 0.85 : 0.55) * fade})`
          ctx.shadowColor = 'rgba(255, 190, 80, 0.9)'
          ctx.shadowBlur = p.comet ? 14 : 8
          ctx.fill()
          ctx.shadowBlur = 0
          p.px = x; p.py = y
        }
      }

      // Sóng xung kích khi node kích hoạt: vòng lan + tia lửa + lõi flash
      const bursts = burstsRef?.current
      if (bursts?.length) {
        for (const b of bursts) {
          const age = (now - b.at) / 750
          if (age >= 1) continue
          const bx = (b.x / 100) * w, by = (b.y / 100) * h
          const out = 1 - Math.pow(1 - age, 2.4)
          ctx.strokeStyle = `rgba(255,206,120,${0.8 * (1 - age)})`
          ctx.lineWidth = 2.5
          ctx.beginPath(); ctx.arc(bx, by, 8 + out * 74, 0, Math.PI * 2); ctx.stroke()
          ctx.fillStyle = `rgba(255,246,216,${0.9 * (1 - age)})`
          ctx.beginPath(); ctx.arc(bx, by, 13 * (1 - age), 0, Math.PI * 2); ctx.fill()
          for (const s of b.sparks) {
            const sx = bx + Math.cos(s.ang) * s.sp * out * 84
            const sy2 = by + Math.sin(s.ang) * s.sp * out * 84
            ctx.fillStyle = `rgba(255,${190 + (s.sp * 50) | 0},130,${0.85 * (1 - age)})`
            ctx.beginPath(); ctx.arc(sx, sy2, 1.3 + s.sp, 0, Math.PI * 2); ctx.fill()
          }
        }
        burstsRef.current = bursts.filter(b => (now - b.at) / 750 < 1)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [active, count, pathRef, progressRef, burstsRef])

  return <canvas ref={canvasRef} className="nl-particles" aria-hidden="true" />
}
