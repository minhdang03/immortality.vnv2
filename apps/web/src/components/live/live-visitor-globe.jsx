import { aggregateVisitors, projectGlobePoint } from '../../lib/live-visitors'

function buildPoints(visitors) {
  return aggregateVisitors(
    visitors.filter(visitor => visitor.latitude !== null && visitor.longitude !== null),
    visitor => `${visitor.latitude},${visitor.longitude},${visitor.country}`
  ).slice(0, 80).map(group => {
    const [latitude, longitude, country] = group.key.split(',')
    return { ...group, country, ...projectGlobePoint(latitude, longitude) }
  }).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
}

export default function LiveVisitorGlobe({ visitors, lang }) {
  const points = buildPoints(visitors)
  const label = lang === 'en'
    ? `Approximate activity map with ${points.length} active locations`
    : `Bản đồ hoạt động xấp xỉ với ${points.length} vị trí đang hoạt động`

  return (
    <div className="live-globe" role="img" aria-label={label}>
      <svg viewBox="0 0 720 360" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="live-globe-clip"><ellipse cx="360" cy="180" rx="342" ry="162" /></clipPath>
          <radialGradient id="live-globe-fill" cx="45%" cy="38%">
            <stop offset="0" stopColor="var(--surface-2)" />
            <stop offset="1" stopColor="var(--card)" />
          </radialGradient>
        </defs>
        <ellipse className="live-globe-sphere" cx="360" cy="180" rx="342" ry="162" />
        <g className="live-globe-grid" clipPath="url(#live-globe-clip)">
          {[60, 120, 180, 240, 300].map(y => <path key={y} d={`M18 ${y} H702`} />)}
          {[120, 240, 360, 480, 600].map(x => <ellipse key={x} cx="360" cy="180" rx={Math.abs(x - 360)} ry="162" />)}
          <path className="live-globe-land" d="M92 116l68-42 74 12 35 43-26 32-68 8-28 42-58-19-31-42zm210-39 67-24 78 19 41 39-31 31-18 59-42 48-46-27 2-49-55-36zm221 82 54-42 73 11 28 48-39 35-59-12-34 42-35-27z" />
        </g>
        {points.map(point => (
          <g className="live-globe-point" key={point.key} transform={`translate(${point.x} ${point.y})`}>
            <circle className="live-globe-pulse" r={8 + Math.min(point.count, 6)} />
            <circle r={4 + Math.min(point.count, 4) * 0.7} />
          </g>
        ))}
      </svg>
      {points.length === 0 && (
        <p className="live-globe-empty">
          {lang === 'en' ? 'Location will appear with the next visitor.' : 'Vị trí sẽ hiện khi có lượt truy cập tiếp theo.'}
        </p>
      )}
    </div>
  )
}
