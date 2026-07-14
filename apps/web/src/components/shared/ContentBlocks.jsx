// Khung trình bày chống wall-of-text (audit 260711): Callout, KeyPoints, ComingSoon.
// Chỉ là khung — nội dung truyền vào từ dữ liệu hiện có, không sinh chữ mới.

export function Callout({ children, icon = '✦' }) {
  return (
    <aside className="callout">
      <span className="callout-icon" aria-hidden="true">{icon}</span>
      <div className="callout-body">{children}</div>
    </aside>
  )
}

export function KeyPoints({ points = [] }) {
  if (!points.length) return null
  return (
    <ul className="key-points">
      {points.map((p, i) => (
        <li key={i}><span className="key-point-bullet" aria-hidden="true">✦</span>{p}</li>
      ))}
    </ul>
  )
}

// Trạng thái "sắp có" dùng chung — thay việc lặp câu "đang cập nhật..." trên từng card
export function ComingSoon({ lang = 'vi' }) {
  return (
    <span className="coming-soon-badge">
      {lang === 'vi' ? 'Sắp có hướng dẫn' : 'Guide coming soon'}
    </span>
  )
}
