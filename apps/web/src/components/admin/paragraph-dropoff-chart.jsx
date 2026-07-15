/**
 * ParagraphDropoffChart — plain CSS bar chart for per-paragraph retention.
 *
 * Props:
 *   rows  — Array<{ para_index, sessions_reached, pct_of_total, median_dwell_ms }>
 *   lang  — 'vi' | 'en'
 *
 * No external chart library — CSS bars only, keeps bundle lean.
 */
import { formatDwell } from './format-dwell'

export default function ParagraphDropoffChart({ rows, lang }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ color: 'var(--text-dim)', padding: '16px 0', fontSize: '0.85rem' }}>
        {lang === 'vi' ? 'Chưa có dữ liệu đoạn văn.' : 'No paragraph data yet.'}
      </div>
    )
  }

  const maxPct = Math.max(...rows.map(r => Number(r.pct_of_total)), 1)

  return (
    <div className="dropoff-chart" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ color: 'var(--text-dim)', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
              {lang === 'vi' ? 'Đoạn' : 'Para'}
            </th>
            <th style={{ padding: '4px 8px', width: '100%' }}>
              {lang === 'vi' ? '% lượt đọc tới đoạn này' : '% of reads reaching here'}
            </th>
            <th style={{ padding: '4px 8px', whiteSpace: 'nowrap', textAlign: 'right' }}>
              {lang === 'vi' ? 'Thời gian dừng' : 'Time on paragraph'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const pct = Number(row.pct_of_total)
            const barWidth = maxPct > 0 ? (pct / maxPct) * 100 : 0
            const isLow = pct < 30
            return (
              <tr key={row.para_index} style={{ borderTop: '1px solid var(--border, #eee)' }}>
                <td style={{ padding: '4px 8px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {row.para_index + 1}
                </td>
                <td style={{ padding: '4px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        height: 14,
                        width: `${barWidth}%`,
                        minWidth: 2,
                        background: isLow ? 'var(--danger, #ef4444)' : 'var(--accent, #f59e0b)',
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                      }}
                    />
                    <span style={{ whiteSpace: 'nowrap', color: isLow ? 'var(--danger, #ef4444)' : 'inherit' }}>
                      {pct}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {formatDwell(row.median_dwell_ms, lang)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
