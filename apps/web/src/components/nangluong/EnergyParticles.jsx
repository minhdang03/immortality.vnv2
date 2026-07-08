import { useEffect, useRef } from 'react'

/**
 * Canvas hạt sáng chảy dọc đường năng lượng (SVG path).
 * - pathRef: ref tới <path> SVG (viewBox 1024x1536) để sample toạ độ
 * - progressRef: ref số 0..1 — hạt chỉ chảy trong phần path đã lộ ra
 * - active: bật/tắt vòng lặp rAF (tắt khi scene ngoài viewport để tiết kiệm pin)
 */
export default function EnergyParticles({ pathRef, progressRef, active = true, count = 36 }) {
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

    // Hạt: t = vị trí trên path (0..1), tốc độ + kích thước + dao động ngang ngẫu nhiên
    const particles = Array.from({ length: count }, () => ({
      t: Math.random(), speed: 0.0012 + Math.random() * 0.0025,
      size: 1 + Math.random() * 2.4, drift: (Math.random() - 0.5) * 26,
      phase: Math.random() * Math.PI * 2,
    }))

    const tick = () => {
      const progress = progressRef ? progressRef.current : 1
      ctx.clearRect(0, 0, w, h)
      if (progress > 0.01) {
        for (const p of particles) {
          p.t += p.speed
          if (p.t > progress) p.t = Math.random() * 0.05 // quay về đầu dòng chảy
          const pt = path.getPointAtLength(p.t * totalLen)
          const x = pt.x * scaleX + Math.sin(p.t * 40 + p.phase) * p.drift * scaleX
          const y = pt.y * scaleY
          const fade = Math.min(1, (progress - p.t) * 12) // mờ dần gần đầu tia
          ctx.beginPath()
          ctx.arc(x, y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 216, 120, ${0.55 * fade})`
          ctx.shadowColor = 'rgba(255, 190, 80, 0.9)'
          ctx.shadowBlur = 8
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [active, count, pathRef, progressRef])

  return <canvas ref={canvasRef} className="nl-particles" aria-hidden="true" />
}
