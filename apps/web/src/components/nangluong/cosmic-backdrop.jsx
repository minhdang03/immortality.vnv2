import { useEffect, useRef } from 'react'

/**
 * Nền vũ trụ toàn trang /nang-luong — canvas fixed nằm sau nội dung.
 * - Big bang khi vào trang: sao bùng nổ từ tâm ra + vòng sóng vàng (1.6s)
 * - 3 lớp sao parallax theo scroll, twinkle lệch pha
 * - Cuộn nhanh → sao kéo vệt dọc (hiệu ứng hyperspace theo vận tốc)
 * - Sao băng ngẫu nhiên
 * - prefers-reduced-motion: vẽ 1 frame tĩnh, không chạy vòng lặp
 */
const LAYERS = [
  { par: 0.04, size: 0.9, alpha: 0.5, share: 0.5 },
  { par: 0.10, size: 1.4, alpha: 0.7, share: 0.32 },
  { par: 0.22, size: 2.1, alpha: 0.95, share: 0.18 },
]

export default function CosmicBackdrop({ delay = 0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w, h, raf
    let stars = []
    let meteors = []
    let lastY = window.scrollY
    let vel = 0
    const born = performance.now()

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const total = Math.min(180, Math.round((w * h) / 8500))
      stars = []
      LAYERS.forEach((L, li) => {
        for (let i = 0; i < total * L.share; i++) {
          stars.push({
            li,
            x: Math.random() * w, y: Math.random() * h,
            tw: Math.random() * Math.PI * 2,       // pha twinkle
            tws: 0.5 + Math.random() * 2,          // tốc độ twinkle
            gold: Math.random() < 0.18,            // 18% sao vàng
          })
        }
      })
    }
    resize()

    const drawStar = (x, y, r, color, streak) => {
      if (streak > 3) {
        ctx.strokeStyle = color
        ctx.lineWidth = r
        ctx.beginPath()
        ctx.moveTo(x, y - streak / 2)
        ctx.lineTo(x, y + streak / 2)
        ctx.stroke()
      } else {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const frame = (now) => {
      const sy = window.scrollY
      vel = vel * 0.88 + (sy - lastY) * 0.12 // làm mượt vận tốc cuộn
      lastY = sy
      ctx.clearRect(0, 0, w, h)

      // delay: chờ intro cinematic tới khoảnh khắc nổ rồi sao mới bùng ra
      const t = (now - born - delay) / 1600 // pha big bang 0..1
      if (!reduced && t < 0) { raf = requestAnimationFrame(frame); return }
      const intro = !reduced && t < 1
      const k = intro ? 1 - Math.pow(1 - t, 3) : 1 // easeOutCubic
      const cx = w / 2, cy = h * 0.42

      for (const s of stars) {
        const L = LAYERS[s.li]
        let x = s.x, y = s.y
        if (intro) {
          x = cx + (s.x - cx) * k
          y = cy + (s.y - cy) * k
        } else {
          y = (s.y - sy * L.par) % h
          if (y < 0) y += h
        }
        const twk = reduced ? 1 : 0.55 + 0.45 * Math.sin((now / 1000) * s.tws + s.tw)
        const a = L.alpha * twk * (intro ? 0.3 + 0.7 * k : 1)
        const color = s.gold ? `rgba(255,214,140,${a})` : `rgba(214,224,255,${a})`
        const streak = reduced ? 0 : Math.min(36, Math.abs(vel) * L.par * 7)
        drawStar(x, y, L.size, color, streak)
      }

      // Vòng sóng + lõi sáng big bang
      if (intro) {
        const r = k * Math.max(w, h) * 0.55
        ctx.strokeStyle = `rgba(255,206,120,${0.55 * (1 - t)})`
        ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 * (1 - t) + 10)
        g.addColorStop(0, `rgba(255,246,216,${0.9 * (1 - t)})`)
        g.addColorStop(1, 'rgba(255,246,216,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(cx, cy, 100, 0, Math.PI * 2); ctx.fill()
      }

      // Sao băng: hiếm, tối đa 2 cùng lúc
      if (!reduced && !intro && meteors.length < 2 && Math.random() < 0.004) {
        meteors.push({
          x: w * (0.2 + Math.random() * 0.7), y: h * Math.random() * 0.35,
          vx: -(2.5 + Math.random() * 3), vy: 1.2 + Math.random() * 1.6, life: 1,
        })
      }
      for (const m of meteors) {
        m.x += m.vx; m.y += m.vy; m.life -= 0.012
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 16, m.y - m.vy * 16)
        grad.addColorStop(0, `rgba(255,240,200,${0.85 * m.life})`)
        grad.addColorStop(1, 'rgba(255,240,200,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(m.x - m.vx * 16, m.y - m.vy * 16)
        ctx.stroke()
      }
      meteors = meteors.filter(m => m.life > 0 && m.x > -60 && m.y < h + 60)

      if (!reduced) raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [delay])

  return <canvas ref={canvasRef} className="nl-cosmic" aria-hidden="true" />
}
