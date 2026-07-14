/**
 * Canvas engine cho cảnh Big Bang (/nang-luong) — hạt qua 3 pha:
 *  'in'   → bụi sáng bị hút về điểm kỳ dị (trước vụ nổ)
 *  'out'  → bắn toả tròn từ tâm, trắng nóng → vàng → cam tàn dần
 *  'star' → tàn dư thành sao trôi lấp lánh (vĩnh viễn)
 * Nền: lớp sao tĩnh twinkle. origin = toạ độ tâm nổ theo tỉ lệ canvas (0..1).
 * API: { bang, skip, setActive, destroy }
 */
export default function createBigBangCanvas(canvas, origin = { x: 0.5, y: 0.37 }) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const compact = Math.min(window.innerWidth, window.innerHeight) < 700
  const N = compact ? 150 : 240

  let w = 0, h = 0, raf = 0, running = false, exploded = false, t = 0

  const resize = () => {
    w = canvas.offsetWidth; h = canvas.offsetHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const rnd = (a, b) => a + Math.random() * (b - a)
  const ox = () => w * origin.x
  const oy = () => h * origin.y
  const dMax = () => Math.min(w, h) * 0.55

  // Sao nền — rất mờ trong pha hư không, rõ hơn sau vụ nổ
  const stars = Array.from({ length: compact ? 60 : 100 }, () => ({
    x: Math.random(), y: Math.random(), r: rnd(0.4, 1.4),
    tw: rnd(0, Math.PI * 2), sp: rnd(0.5, 1.6),
  }))

  // Bụi sáng bị hút vào tâm — respawn ở rìa khi chạm điểm kỳ dị
  const spawnIn = p => Object.assign(p || {}, {
    m: 'in', a: rnd(0, Math.PI * 2), d: rnd(0.35, 1) * dMax(),
    sp: rnd(0.35, 0.9), size: rnd(0.5, 1.6), tw: rnd(0, Math.PI * 2),
  })
  const parts = Array.from({ length: N }, () => spawnIn())

  // Hạt aura — đom đóm năng lượng bay quanh hình thể (vùng đáy-giữa scene),
  // chỉ sống sau vụ nổ. Bay lên chậm, lượn sin, fade theo vòng đời.
  const AURA_N = compact ? 26 : 44
  const spawnAura = (p, warm = false) => Object.assign(p || {}, {
    x: w * 0.5 + rnd(-w * 0.17, w * 0.17),
    y: warm ? h - rnd(0, h * 0.4) : h + rnd(2, 30),
    vy: rnd(0.12, 0.4), sway: rnd(6, 22), sp: rnd(0.4, 1.1),
    tw: rnd(0, Math.PI * 2), size: rnd(0.5, 1.9),
    life: warm ? rnd(0.2, 0.9) : 0, grow: rnd(0.003, 0.007),
  })
  const aura = Array.from({ length: AURA_N }, () => ({ life: -1 }))
  const igniteAura = () => aura.forEach(p => spawnAura(p, true))

  // Sao băng hiếm — chỉ ở kỷ nguyên sao (sau nổ), ~8-15s một lần
  let meteor = null, meteorAt = 0
  const spawnMeteor = () => {
    const fromLeft = Math.random() < 0.5
    meteor = {
      x: fromLeft ? -20 : w + 20, y: rnd(h * 0.06, h * 0.4),
      vx: (fromLeft ? 1 : -1) * rnd(9, 14), vy: rnd(1.5, 3.2), life: 1,
    }
  }

  const toStar = p => {
    p.m = 'star'
    p.vx = rnd(-0.05, 0.05); p.vy = rnd(-0.03, 0.05)
    p.size = rnd(0.5, 1.7); p.tw = rnd(0, Math.PI * 2)
  }

  /** Kích nổ: mọi hạt bắn toả tròn từ tâm */
  const bang = () => {
    exploded = true
    meteorAt = t + rnd(5, 9)
    igniteAura()
    for (const p of parts) {
      p.m = 'out'
      p.x = ox(); p.y = oy(); p.px = p.x; p.py = p.y
      const a = rnd(0, Math.PI * 2)
      const v = (0.18 + Math.random() ** 2 * 0.85) * Math.min(w, h) / 55
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v
      p.life = 1; p.size = rnd(0.8, 2.6); p.decay = rnd(0.004, 0.011)
    }
  }

  /** Nhảy thẳng tới trạng thái cuối (user cuộn/chạm để skip) */
  const skip = () => {
    exploded = true
    meteorAt = t + rnd(4, 8)
    igniteAura()
    for (const p of parts) {
      toStar(p)
      p.x = Math.random() * w; p.y = Math.random() * h
    }
  }

  const draw = (x, y, r, color) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = color; ctx.fill()
  }

  const tick = () => {
    if (!running) return
    t += 0.016
    ctx.clearRect(0, 0, w, h)

    // Sao nền twinkle + trôi cực chậm (parallax sống động, không nhận ra hướng)
    const base = exploded ? 0.5 : 0.26
    for (const s of stars) {
      s.x += 0.000012 * s.sp
      if (s.x > 1.005) s.x = -0.005
      const a = base * (0.45 + 0.55 * Math.abs(Math.sin(t * s.sp + s.tw)))
      draw(s.x * w, s.y * h, s.r, `rgba(235,230,214,${a})`)
    }

    ctx.globalCompositeOperation = 'lighter'

    // Nebula tàn dư — quầng khí ấm thở chậm quanh tâm nổ (chỉ sau big bang)
    if (exploded) {
      const na = 0.05 + 0.03 * Math.sin(t * 0.45)
      const nr = dMax() * (1.15 + 0.06 * Math.sin(t * 0.3))
      const g = ctx.createRadialGradient(ox(), oy(), 0, ox(), oy(), nr)
      g.addColorStop(0, `rgba(255,214,130,${na})`)
      g.addColorStop(0.5, `rgba(255,170,80,${na * 0.4})`)
      g.addColorStop(1, 'rgba(255,150,60,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    for (const p of parts) {
      if (p.m === 'in') {
        // Hút nhanh dần khi gần tâm — cảm giác "tụ khí"
        p.d -= p.sp * (1.6 + (1 - p.d / dMax()) * 4.5)
        if (p.d < 4) spawnIn(p)
        const x = ox() + Math.cos(p.a) * p.d
        const y = oy() + Math.sin(p.a) * p.d
        const a = (1 - p.d / dMax()) * 0.6
        draw(x, y, p.size, `rgba(255,224,150,${a})`)
      } else if (p.m === 'out') {
        p.px = p.x; p.py = p.y
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.986; p.vy *= 0.986
        p.life -= p.decay
        if (p.life <= 0.3) { toStar(p); continue }
        const color = p.life > 0.75
          ? `rgba(255,250,238,${p.life})`
          : p.life > 0.5 ? `rgba(255,214,120,${p.life})` : `rgba(255,150,60,${p.life})`
        // Vệt trail theo hướng bay — vụ nổ mượt thay vì chấm rời
        ctx.beginPath()
        ctx.moveTo(p.px - p.vx * 2.2, p.py - p.vy * 2.2)
        ctx.lineTo(p.x, p.y)
        ctx.lineWidth = p.size * (0.4 + p.life * 0.6)
        ctx.strokeStyle = color
        ctx.lineCap = 'round'
        ctx.stroke()
        draw(p.x, p.y, p.size * (0.5 + p.life * 0.8), color)
      } else {
        p.x += p.vx; p.y += p.vy
        if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5
        if (p.y < -5) p.y = h + 5; else if (p.y > h + 5) p.y = -5
        const a = 0.55 * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + p.tw)))
        draw(p.x, p.y, p.size, `rgba(240,230,205,${a})`)
      }
    }

    // Aura — đom đóm năng lượng bay lên quanh hình thể
    if (exploded) {
      for (const p of aura) {
        if (p.life < 0) continue
        p.life += p.grow
        p.y -= p.vy
        const x = p.x + Math.sin(t * p.sp + p.tw) * p.sway
        // fade-in nửa đầu đời, fade-out nửa cuối
        const a = Math.sin(Math.min(p.life, 1) * Math.PI) * 0.5
        draw(x, p.y, p.size, `rgba(255,232,170,${a})`)
        if (p.life >= 1 || p.y < h * 0.32) spawnAura(p)
      }
      // Sao băng hiếm
      if (!meteor && t > meteorAt) spawnMeteor()
      if (meteor) {
        meteor.x += meteor.vx; meteor.y += meteor.vy; meteor.life -= 0.016
        ctx.beginPath()
        ctx.moveTo(meteor.x - meteor.vx * 6, meteor.y - meteor.vy * 6)
        ctx.lineTo(meteor.x, meteor.y)
        ctx.lineWidth = 1.4
        ctx.strokeStyle = `rgba(255,246,220,${Math.max(meteor.life, 0) * 0.8})`
        ctx.lineCap = 'round'
        ctx.stroke()
        if (meteor.life <= 0 || meteor.x < -40 || meteor.x > w + 40) {
          meteor = null; meteorAt = t + rnd(8, 15)
        }
      }
    }

    ctx.globalCompositeOperation = 'source-over'
    raf = requestAnimationFrame(tick)
  }

  const setActive = v => {
    if (v === running) return
    running = v
    if (v) raf = requestAnimationFrame(tick)
    else cancelAnimationFrame(raf)
  }
  setActive(true)

  return {
    bang, skip, setActive,
    destroy() { running = false; cancelAnimationFrame(raf); ro.disconnect() },
  }
}
