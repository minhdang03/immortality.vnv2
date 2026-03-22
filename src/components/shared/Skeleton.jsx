/* Skeleton placeholders for perceived-fast loading */

const S = 'skeleton-shimmer' // shorthand for shimmer class

function Line({ w = 100, h = 14, style }) {
  return <div className="skeleton-line" style={{ width: `${w}%`, height: h, ...style }} />
}

/* Article card skeleton — matches .article-card layout */
function CardSkeleton({ style }) {
  return (
    <div className="skeleton-card" style={style}>
      <Line w={35} h={10} />
      <Line w={75} h={20} />
      <Line w={100} />
      <Line w={55} />
    </div>
  )
}

/* Home page — matches: .hero → WisdomQuotes → .home-grid → .topics-grid → articles */
export function HomeSkeleton() {
  return (
    <div className="fade-up">
      {/* Hero — matches .hero: padding 70px 20px 50px */}
      <div className="skeleton-hero">
        <div className={`skeleton-sun-circle ${S}`} />
        <Line w={50} h={28} style={{ margin: '0 auto 16px' }} />
        <Line w={70} h={14} style={{ margin: '0 auto 32px' }} />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <div className={`skeleton-btn ${S}`} style={{ width: 160, padding: '13px 32px' }} />
          <div className={`skeleton-btn ${S}`} style={{ width: 140, padding: '12px 28px' }} />
        </div>
      </div>

      {/* Wisdom quotes — matches .wisdom-card: border-radius 20px, min-height 200px */}
      <div style={{ textAlign: 'center', padding: '0 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <Line w={15} h={12} style={{ margin: 0 }} />
        </div>
        <div className="skeleton-wisdom">
          <Line w={85} h={16} style={{ margin: '20px auto 12px' }} />
          <Line w={70} h={16} style={{ margin: '0 auto 12px' }} />
          <Line w={50} h={12} style={{ margin: '16px auto 0' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {[1,2,3].map(i => <div key={i} className={S} style={{ width: 6, height: 6, borderRadius: '50%' }} />)}
        </div>
      </div>

      {/* Home cards grid — matches .home-grid: 1fr 1fr, desktop repeat(4, 1fr) */}
      <section className="section">
        <div className="skeleton-home-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-home-card">
              <div className={`skeleton-circle ${S}`} />
              <Line w={60} h={16} style={{ margin: '12px auto 8px' }} />
              <Line w={85} h={10} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Topics grid — matches .topics-grid: repeat(2, 1fr), desktop repeat(3, 1fr) */}
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div className={S} style={{ width: 20, height: 20, borderRadius: '50%' }} />
          <Line w={25} h={22} style={{ margin: 0 }} />
        </div>
        <div className="skeleton-topics-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-topic-card">
              <div className={S} style={{ width: 32, height: 32, borderRadius: 8, margin: '0 auto 10px' }} />
              <Line w={60} h={14} style={{ margin: '0 auto 6px' }} />
              <Line w={80} h={10} style={{ margin: '0 auto 8px' }} />
              <div className={S} style={{ width: 60, height: 18, borderRadius: 12, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Latest articles — matches .article-card layout */}
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div className={S} style={{ width: 20, height: 20, borderRadius: '50%' }} />
          <Line w={25} h={22} style={{ margin: 0 }} />
        </div>
        {[1,2,3].map(i => <CardSkeleton key={i} />)}
      </section>
    </div>
  )
}

/* List pages: stories, articles, khaitri */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Line w={25} h={22} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[1,2,3,4].map(i => <div key={i} className={`skeleton-btn ${S}`} style={{ width: 70 + i * 10 }} />)}
      </div>
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}

/* Detail page: article/story/khaitri detail */
export function DetailSkeleton() {
  return (
    <div className="fade-up">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <Line w={8} h={12} />
        <Line w={12} h={12} />
        <Line w={20} h={12} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Line w={10} h={12} />
        <Line w={12} h={12} />
        <Line w={10} h={12} />
      </div>

      {/* Title */}
      <Line w={80} h={28} style={{ marginBottom: 16 }} />

      {/* Question */}
      <div className="skeleton-card" style={{ borderLeft: '3px solid rgba(201,168,108,0.15)', borderRadius: '0 12px 12px 0' }}>
        <Line w={90} />
        <Line w={70} />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <div className={`skeleton-btn ${S}`} style={{ width: 32 }} />
          <div className={`skeleton-btn ${S}`} style={{ width: 40 }} />
          <div className={`skeleton-btn ${S}`} style={{ width: 32 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className={`skeleton-circle-sm ${S}`} />
          <div className={`skeleton-circle-sm ${S}`} />
          <div className={`skeleton-circle-sm ${S}`} />
        </div>
      </div>

      {/* Body paragraphs */}
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ marginBottom: 24 }}>
          <Line w={100} />
          <Line w={95} />
          <Line w={88} />
          <Line w={60} />
        </div>
      ))}
    </div>
  )
}

/* Generic page skeleton */
export function PageSkeleton() {
  return (
    <div className="fade-up">
      <Line w={30} h={24} style={{ marginBottom: 20 }} />
      <Line w={70} style={{ marginBottom: 8 }} />
      <Line w={85} style={{ marginBottom: 8 }} />
      <Line w={50} style={{ marginBottom: 24 }} />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}
