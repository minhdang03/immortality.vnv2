/**
 * ContentAnalyticsTab — admin reading analytics dashboard.
 * Supabase-only: queries reading_events via RPC (admin SELECT via security definer).
 * Shows: article picker → per-paragraph drop-off chart + completion % + median dwell
 *        + cross-article comparison table.
 */
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import ParagraphDropoffChart from './paragraph-dropoff-chart'
import { formatDwell } from './format-dwell'

// The RPC only knows content_id; titles live in `content`, so resolve them in a
// second query rather than widening the function signature.
async function fetchTopArticles(lang) {
  const { data, error } = await supabase.rpc('top_articles_by_completion', { p_limit: 20 })
  if (error) throw error

  const rows = data ?? []
  if (rows.length === 0) return rows

  const { data: titles, error: titleError } = await supabase
    .from('content')
    .select('id, vi_title, en_title')
    .in('id', rows.map(r => r.content_id))
  if (titleError) throw titleError

  const byId = new Map((titles ?? []).map(c => [c.id, c]))
  return rows.map(row => {
    const match = byId.get(row.content_id)
    const title = lang === 'vi' ? match?.vi_title : match?.en_title
    return { ...row, title: title || match?.vi_title || match?.en_title || null }
  })
}

async function fetchParaStats(contentId) {
  const { data, error } = await supabase.rpc('article_reading_stats', { p_content_id: contentId })
  if (error) throw error
  return data ?? []
}

async function fetchSummary(contentId) {
  const { data, error } = await supabase.rpc('article_completion_summary', { p_content_id: contentId })
  if (error) throw error
  // RPC returns array with one row
  return Array.isArray(data) ? data[0] : data
}

export default function ContentAnalyticsTab({ lang }) {
  const [topArticles, setTopArticles] = useState([])
  const [topLoading, setTopLoading] = useState(false)
  const [topError, setTopError] = useState('')

  const [selectedId, setSelectedId] = useState('')
  const [paraRows, setParaRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  // Load cross-article comparison on mount, and re-resolve titles when lang flips
  useEffect(() => {
    if (!supabase) return
    setTopLoading(true)
    fetchTopArticles(lang)
      .then(setTopArticles)
      .catch(e => setTopError(e.message))
      .finally(() => setTopLoading(false))
  }, [lang])

  // Load per-article detail when article selected
  useEffect(() => {
    if (!selectedId || !supabase) return
    setDetailLoading(true)
    setDetailError('')
    Promise.all([fetchParaStats(selectedId), fetchSummary(selectedId)])
      .then(([rows, sum]) => { setParaRows(rows); setSummary(sum) })
      .catch(e => setDetailError(e.message))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  return (
    <div>
      {/* Cross-article comparison */}
      <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>
        {lang === 'vi' ? 'So sánh bài viết — tỷ lệ đọc hết' : 'Article comparison — completion rate'}
      </h3>

      {topError && <div className="admin-error" style={{ marginBottom: 12 }}>{topError}</div>}

      {topLoading ? (
        <div style={{ color: 'var(--text-dim)', padding: '12px 0' }}>
          {lang === 'vi' ? 'Đang tải…' : 'Loading…'}
        </div>
      ) : topArticles.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '12px 0' }}>
          {lang === 'vi'
            ? 'Chưa có dữ liệu. Đọc một số bài viết để tạo sự kiện.'
            : 'No data yet. Read some articles to generate events.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px' }}>{lang === 'vi' ? 'Bài viết' : 'Article'}</th>
                <th style={{ padding: '4px 8px', textAlign: 'right' }}>{lang === 'vi' ? 'Lượt đọc' : 'Reads'}</th>
                <th style={{ padding: '4px 8px', textAlign: 'right' }}>{lang === 'vi' ? 'Đọc hết' : 'Finished'}</th>
                <th style={{ padding: '4px 8px' }} />
              </tr>
            </thead>
            <tbody>
              {topArticles.map(row => (
                <tr
                  key={row.content_id}
                  style={{
                    borderTop: '1px solid var(--border, #eee)',
                    background: selectedId === row.content_id ? 'var(--accent, #f59e0b22)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedId(row.content_id)}
                >
                  <td
                    style={{ padding: '5px 8px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={row.content_id}
                  >
                    {row.title || (
                      <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        {lang === 'vi' ? '(không rõ tên) ' : '(untitled) '}
                        {row.content_id}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.total_sessions}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.completion_pct}%
                  </td>
                  <td style={{ padding: '5px 8px' }}>
                    <button className="btn-sm" onClick={e => { e.stopPropagation(); setSelectedId(row.content_id) }}>
                      {lang === 'vi' ? 'Chi tiết' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-article detail */}
      {selectedId && (
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1rem' }}>
            {lang === 'vi' ? 'Chi tiết: ' : 'Detail: '}
            <span style={{ fontWeight: 400, fontSize: '0.9rem' }}>
              {topArticles.find(r => r.content_id === selectedId)?.title || selectedId}
            </span>
          </h3>

          {detailError && <div className="admin-error" style={{ marginBottom: 8 }}>{detailError}</div>}

          {detailLoading ? (
            <div style={{ color: 'var(--text-dim)', padding: '12px 0' }}>
              {lang === 'vi' ? 'Đang tải chi tiết…' : 'Loading detail…'}
            </div>
          ) : (
            <>
              {summary && (
                <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                  <Stat label={lang === 'vi' ? 'Lượt đọc' : 'Reads'} value={summary.total_sessions ?? 0} />
                  <Stat label={lang === 'vi' ? 'Đọc hết' : 'Finished'} value={summary.completed_sessions ?? 0} />
                  <Stat label={lang === 'vi' ? 'Tỷ lệ đọc hết' : 'Finish rate'} value={`${summary.completion_pct ?? 0}%`} />
                  <Stat
                    label={lang === 'vi' ? 'Thời gian đọc trung vị' : 'Median read time'}
                    value={formatDwell(summary.median_dwell_ms, lang)}
                  />
                </div>
              )}
              <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: 6 }}>
                {lang === 'vi'
                  ? 'Mỗi dòng là một đoạn văn, theo thứ tự trong bài. Cột % cho biết bao nhiêu lượt đọc cuộn được tới đoạn đó — tụt mạnh ở đoạn nào tức là người đọc bỏ ngang ở đó.'
                  : 'One row per paragraph, in article order. The % column is how many reads scrolled that far — a sharp drop marks where readers leave.'}
              </div>
              <ParagraphDropoffChart rows={paraRows} lang={lang} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ background: 'var(--surface, #f9f9f9)', borderRadius: 8, padding: '10px 16px', minWidth: 100 }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  )
}
