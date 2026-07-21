import { useMemo } from 'react'
import LiveVisitorGlobe from '../../components/live/live-visitor-globe'
import { PAGE_MAP } from '../../config/pages'
import { aggregateVisitors, routeIdFromPath } from '../../lib/live-visitors'

function countryName(code, lang) {
  if (code === 'unknown') return lang === 'en' ? 'Unknown location' : 'Chưa rõ vị trí'
  try { return new Intl.DisplayNames([lang], { type: 'region' }).of(code) || code }
  catch { return code }
}

function pageName(routeId, lang) {
  const page = PAGE_MAP[routeId]
  return (lang === 'en' ? page?.labelEn : page?.labelVi)
    || (lang === 'en' ? 'Other page' : 'Trang khác')
}

function MetricList({ title, items, empty, renderLabel }) {
  return (
    <section className="live-panel">
      <h2>{title}</h2>
      {items.length ? (
        <ol className="live-ranking">
          {items.slice(0, 6).map(item => (
            <li key={item.key}>
              <span>{renderLabel(item.key)}</span>
              <strong>{item.count}</strong>
            </li>
          ))}
        </ol>
      ) : <p className="live-empty-copy">{empty}</p>}
    </section>
  )
}

export default function LiveVisitorsPage({ lang = 'vi', visitors = [], status = 'connecting' }) {
  const copy = lang === 'en' ? {
    eyebrow: '— Live now', title: 'The path is', titleEm: 'being visited',
    subtitle: 'An anonymous, real-time view of people exploring Bất Tử Đạo right now.',
    visitors: 'Visitors right now', connected: 'Connected live', connecting: 'Connecting…',
    pages: 'Pages being viewed', countries: 'Approximate locations',
    recent: 'Recent live activity', visit: 'Viewing',
    noPages: 'No public page is being viewed yet.', noCountries: 'No location data yet.',
    noRecent: 'New visits will appear here.', reconnecting: 'Reconnecting…', offline: 'Connection paused',
    note: 'Counts visible, connected browser tabs. This dashboard and admin pages are excluded.',
  } : {
    eyebrow: '— Đang diễn ra', title: 'Đạo đang có người', titleEm: 'ghé thăm',
    subtitle: 'Góc nhìn ẩn danh, theo thời gian thực về những người đang khám phá Bất Tử Đạo.',
    visitors: 'Khách đang xem', connected: 'Kết nối trực tiếp', connecting: 'Đang kết nối…',
    pages: 'Trang đang được xem', countries: 'Vị trí xấp xỉ',
    recent: 'Hoạt động trực tiếp gần đây', visit: 'Đang xem',
    noPages: 'Chưa có ai đang xem trang công khai.', noCountries: 'Chưa có dữ liệu vị trí.',
    noRecent: 'Lượt ghé mới sẽ xuất hiện tại đây.', reconnecting: 'Đang kết nối lại…', offline: 'Kết nối tạm dừng',
    note: 'Đếm tab trình duyệt đang hiển thị và còn kết nối. Trang này và trang quản trị không được tính.',
  }

  const pages = useMemo(() => aggregateVisitors(visitors, visitor => routeIdFromPath(visitor.path)), [visitors])
  const countries = useMemo(() => aggregateVisitors(visitors, visitor => visitor.country), [visitors])
  const recent = useMemo(() => [...visitors]
    .sort((a, b) => Date.parse(b.updatedAt || b.joinedAt || 0) - Date.parse(a.updatedAt || a.joinedAt || 0))
    .slice(0, 6), [visitors])
  const connected = status === 'connected'
  const statusCopy = connected
    ? copy.connected
    : status === 'offline' ? copy.offline : status === 'reconnecting' ? copy.reconnecting : copy.connecting

  return (
    <article className="live-page">
      <header className="live-hero">
        <p className="live-eyebrow"><span className={`live-status-dot ${connected ? 'is-connected' : ''}`} />{copy.eyebrow}</p>
        <h1>{copy.title} <em>{copy.titleEm}</em></h1>
        <p>{copy.subtitle}</p>
      </header>

      <section className="live-stage" aria-live="polite">
        <div className="live-count-card">
          <span>{copy.visitors}</span>
          <strong>{connected ? visitors.length : '—'}</strong>
          <small>{statusCopy}</small>
        </div>
        <LiveVisitorGlobe visitors={connected ? visitors : []} lang={lang} />
      </section>

      <div className="live-grid">
        <MetricList title={copy.pages} items={pages} empty={copy.noPages} renderLabel={key => pageName(key, lang)} />
        <MetricList title={copy.countries} items={countries} empty={copy.noCountries} renderLabel={key => countryName(key, lang)} />
      </div>
      <section className="live-panel live-recent-panel">
        <h2>{copy.recent}</h2>
        {recent.length ? (
          <ul className="live-activity-list">
            {recent.map(visitor => (
              <li key={visitor.key}>
                <span className="live-activity-pulse" aria-hidden="true" />
                <span>{copy.visit} <strong>{pageName(routeIdFromPath(visitor.path), lang)}</strong></span>
                <small>{countryName(visitor.country, lang)}</small>
              </li>
            ))}
          </ul>
        ) : <p className="live-empty-copy">{copy.noRecent}</p>}
      </section>
      <p className="live-privacy-note">{copy.note}</p>
    </article>
  )
}
