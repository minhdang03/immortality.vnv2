export default function BackgroundEffects() {
  return (
    <>
      <div className="ambient" />
      <div className="light-rays">
        {[10, 25, 45, 65, 85].map((left, i) => (
          <div key={i} className="light-ray" style={{ left: `${left}%`, animationDelay: `${i * 1.5}s`, transform: `rotate(${-30 + i * 15}deg)` }} />
        ))}
      </div>
      <div className="particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            animationDuration: `${6 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 8}s`,
          }} />
        ))}
      </div>
    </>
  )
}
