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

/* Home page — matches: cinematic hero → wisdom → featured → latest grid → explore */
export function HomeSkeleton() {
  return (
    <div className="fade-up">
      {/* Cinematic hero — full-bleed dark */}
      <div className="skeleton-hero-cinematic">
        <div className="skeleton-hero-cinematic-inner">
          <Line w={20} h={10} style={{ margin: '0 auto 32px', background: 'rgba(230,200,137,0.25)' }} />
          <Line w={70} h={48} style={{ margin: '0 auto 24px', background: 'rgba(248,243,234,0.12)' }} />
          <Line w={55} h={16} style={{ margin: '0 auto 40px', background: 'rgba(248,243,234,0.08)' }} />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div className={`skeleton-btn ${S}`} style={{ width: 160, height: 46, background: 'rgba(230,200,137,0.18)' }} />
            <div className={`skeleton-btn ${S}`} style={{ width: 150, height: 46, background: 'rgba(248,243,234,0.08)' }} />
          </div>
        </div>
      </div>

      {/* Wisdom quotes */}
      <div style={{ textAlign: 'center', padding: '40px 20px 24px', maxWidth: 'var(--max-w)', margin: '0 auto' }}>
        <Line w={15} h={12} style={{ margin: '0 auto 20px' }} />
        <div className="skeleton-wisdom">
          <Line w={85} h={16} style={{ margin: '20px auto 12px' }} />
          <Line w={70} h={16} style={{ margin: '0 auto 12px' }} />
          <Line w={50} h={12} style={{ margin: '16px auto 0' }} />
        </div>
      </div>

      {/* Featured article */}
      <section className="section">
        <Line w={16} h={10} style={{ marginBottom: 24 }} />
        <div className="skeleton-featured-card">
          <div className={`skeleton-featured-img ${S}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Line w={20} h={10} />
            <Line w={85} h={28} />
            <Line w={70} h={16} />
            <Line w={45} h={12} style={{ marginTop: 8 }} />
          </div>
        </div>
      </section>

      {/* Latest articles grid */}
      <section className="section">
        <Line w={16} h={10} style={{ marginBottom: 12 }} />
        <Line w={45} h={28} style={{ marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {[1,2,3,4].map(i => <div key={i} className={`skeleton-btn ${S}`} style={{ width: 70 + i * 10, height: 32 }} />)}
        </div>
        <div className="skeleton-grid-cards">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-grid-card">
              <div className={`skeleton-grid-card-img ${S}`} />
              <Line w={20} h={10} style={{ marginTop: 4 }} />
              <Line w={85} h={20} />
              <Line w={70} h={12} />
            </div>
          ))}
        </div>
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
