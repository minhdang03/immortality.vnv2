// PageHero — hero chuẩn cho mọi content page (audit 260711: hero mỗi trang một kiểu).
// Variant editorial duy nhất; Năng Lượng giữ hero immersive riêng có chủ đích.
export default function PageHero({ eyebrow, title, titleEm, subtitle, icon, className = '' }) {
  return (
    <header className={`page-hero ${className}`.trim()}>
      {icon && <div className="page-hero-icon">{icon}</div>}
      {eyebrow && <div className="page-hero-eyebrow">{eyebrow}</div>}
      <h1 className="page-hero-title">
        {title}
        {titleEm && <> <em>{titleEm}</em></>}
      </h1>
      {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
    </header>
  )
}
