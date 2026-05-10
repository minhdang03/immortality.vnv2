import { useState, useMemo } from 'react'
import { useAgentLog } from '../../hooks/useAgentLog'

const STATUS_COLOR = { success: 'var(--gold)', failure: '#e74c3c', error: '#e74c3c' }

export default function AgentLogTab({ lang }) {
  const { entries, loading } = useAgentLog(100)
  const [actionFilter, setActionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const vi = lang === 'vi'

  const actions = useMemo(() => {
    const set = new Set(entries?.map(e => e.action) || [])
    return Array.from(set).sort()
  }, [entries])

  const filtered = useMemo(() => (entries || []).filter(e => {
    if (actionFilter && e.action !== actionFilter) return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    return true
  }), [entries, actionFilter, statusFilter])

  return (
    <>
      <div className="admin-settings-section">
        <h3 className="admin-settings-title">
          {vi ? `📋 Nhật ký Agent (${filtered.length}/${entries?.length || 0})` : `📋 Agent Log (${filtered.length}/${entries?.length || 0})`}
        </h3>
        <p className="admin-settings-hint" style={{ padding: '0 18px 8px' }}>
          {vi
            ? 'Mỗi op privileged của agent (deploy rules, migration, grant role) ghi 1 dòng.'
            : 'Each privileged agent op (deploy rules, migration, grant role) writes a row.'}
        </p>

        <div style={{ display: 'flex', gap: 8, padding: '0 18px 12px', flexWrap: 'wrap' }}>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{ padding: '5px 8px', fontSize: '0.78rem', background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.2)', borderRadius: 6, color: 'var(--text)' }}
          >
            <option value="">{vi ? 'Tất cả action' : 'All actions'}</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '5px 8px', fontSize: '0.78rem', background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.2)', borderRadius: 6, color: 'var(--text)' }}
          >
            <option value="all">{vi ? 'Tất cả status' : 'All status'}</option>
            <option value="success">success</option>
            <option value="failure">failure</option>
            <option value="error">error</option>
          </select>
        </div>

        <div className="admin-articles">
          {loading && <div style={{ padding: 16, color: 'var(--text-dim)' }}>{vi ? 'Đang tải...' : 'Loading...'}</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 16, color: 'var(--text-dim)' }}>
              {vi ? 'Chưa có log nào.' : 'No log entries.'}
            </div>
          )}
          {filtered.map(e => (
            <div key={e.id} className="admin-article-item" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{e.action}</span>
                <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(201,168,108,0.1)', color: STATUS_COLOR[e.status] || 'var(--text-dim)' }}>
                  {e.status}
                </span>
                {e.actor && <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{e.actor}</span>}
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {e.timestamp?.toDate ? e.timestamp.toDate().toLocaleString() : '(pending)'}
                </span>
              </div>
              {e.params && Object.keys(e.params).length > 0 && (
                <pre style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxWidth: '100%' }}>
                  {JSON.stringify(e.params, null, 2)}
                </pre>
              )}
              {e.error && (
                <div style={{ fontSize: '0.75rem', color: '#e74c3c', fontFamily: 'monospace' }}>
                  ⚠ {e.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
