import { useEffect, useLayoutEffect, useState } from 'react'

const RATIO = 1024 / 1536 // viewBox artwork
const COMPACT_QUERY = '(max-width: 1180px)'

/**
 * Camera cho scroll story trên viewport hẹp (mobile/tablet).
 *
 * Vấn đề gốc: mobile dùng object-fit:cover trên <img> nhưng node/tia SVG định vị
 * theo % của khung → lệch khỏi cơ thể. Hook này thay thế: tự tính layer phủ
 * (.nl-art-fit) ĐÚNG tỉ lệ artwork (cover bằng JS), mọi overlay nằm trong layer
 * nên luôn khớp hình; rồi zoom + pan quanh node của bước hiện tại để người xem
 * thấy cận cảnh từng tuyến ("năng lượng chảy tới đâu, camera theo tới đó").
 *
 * Trả về style inline cho .nl-art-fit — null khi desktop (CSS inset:0 xử lý,
 * vì lúc đó khung .nl-art đã khoá đúng tỉ lệ artwork).
 */
export default function useStepCamera({ artRef, step, enabled }) {
  const [style, setStyle] = useState(null)
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY)
    const onChange = e => setCompact(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const active = enabled && compact

  useLayoutEffect(() => {
    if (!active || !step) { setStyle(null); return }
    const el = artRef.current
    if (!el) return

    const apply = () => {
      const aw = el.clientWidth
      const ah = el.clientHeight
      if (!aw || !ah) return

      // Layer phủ (cover) giữ nguyên tỉ lệ artwork
      const fw = Math.max(aw, ah * RATIO)
      const fh = fw / RATIO
      const left = (aw - fw) / 2
      const top = (ah - fh) / 2

      const s = step.zoom || 1
      // Vị trí node (px) trước transform
      const nx = left + (fw * step.pos.x) / 100
      const ny = top + (fh * step.pos.y) / 100
      // Điểm đích: giữa ngang; dọc mặc định ~36% chiều cao (nửa dưới bị card che).
      // Bước có focusY riêng (vd bước 10 card nằm trên) neo node thấp hơn.
      let dx = aw * 0.5 - nx
      let dy = ah * (step.focusY || 0.36) - ny
      // Clamp: sau khi scale quanh node + tịnh tiến, artwork vẫn phủ kín khung
      const dxMax = (s - 1) * nx - s * left
      const dxMin = aw - nx - s * (left + fw - nx)
      const dyMax = (s - 1) * ny - s * top
      const dyMin = ah - ny - s * (top + fh - ny)
      dx = Math.min(dxMax, Math.max(dxMin, dx))
      dy = Math.min(dyMax, Math.max(dyMin, dy))

      setStyle({
        left, top, width: fw, height: fh,
        transformOrigin: `${step.pos.x}% ${step.pos.y}%`,
        transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s})`,
        // Node/tia counter-scale để giữ kích thước cố định trên màn hình
        '--cam-inv': String(1 / s),
      })
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [active, step, artRef])

  return style
}
