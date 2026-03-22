export default function SunIcon({ size = 28 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="sun-icon" aria-hidden="true">
      <defs>
        <radialGradient id={`sg${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e4c78a" />
          <stop offset="100%" stopColor="#c9a86c" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#c9a86c" strokeWidth="0.8" opacity="0.25" className="sun-glow" />
      <circle cx="50" cy="50" r="18" fill={`url(#sg${size})`} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * Math.PI / 180
        const x1 = 50 + Math.cos(angle) * 24
        const y1 = 50 + Math.sin(angle) * 24
        const x2 = 50 + Math.cos(angle) * 38
        const y2 = 50 + Math.sin(angle) * 38
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a86c" strokeWidth="2" strokeLinecap="round" className="sun-ray" style={{ animationDelay: `${i * 0.15}s` }} />
      })}
    </svg>
  )
}
