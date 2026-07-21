import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase-client'

const STATUS_LABELS = {
  new: { vi: 'Mới', en: 'New' },
  read: { vi: 'Đã đọc', en: 'Read' },
  replied: { vi: 'Đã trả lời', en: 'Replied' },
  archived: { vi: 'Lưu trữ', en: 'Archived' },
}

function formatDate(ts, lang) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')
}

export default function ContactsTab({ lang = 'vi' }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let cancelled = false
    supabase
      .from('contacts')
      .select('id, name, email, message, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error('contacts load failed', error)
        // No `status` column in Supabase — track moderation state locally per session.
        else setContacts((data ?? []).map(c => ({ ...c, createdAt: c.created_at, status: 'new' })))
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Status is local-only (no backing column); persists for the current session.
  const setStatus = (id, status) => {
    setContacts(cs => cs.map(c => (c.id === id ? { ...c, status } : c)))
  }
  const remove = async (id) => {
    if (!window.confirm(lang === 'vi' ? 'Xoá tin nhắn này?' : 'Delete this message?')) return
    if (!supabase) return
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) { console.error(error); return }
    setContacts(cs => cs.filter(c => c.id !== id))
  }

  const counts = contacts.reduce((acc, c) => {
    acc.all = (acc.all || 0) + 1
    acc[c.status || 'new'] = (acc[c.status || 'new'] || 0) + 1
    return acc
  }, {})

  const filtered = filter === 'all' ? contacts : contacts.filter(c => (c.status || 'new') === filter)
  const vi = lang === 'vi'

  if (loading) return <div className="admin-form" style={{ padding: 24 }}>{vi ? 'Đang tải...' : 'Loading...'}</div>

  return (
    <>
      <div className="admin-settings-section">
        <h3 className="admin-settings-title">
          {vi ? '✉ Tin nhắn liên hệ' : '✉ Contact messages'}
          <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: 8 }}>
            ({counts.all || 0})
          </span>
        </h3>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0 16px' }}>
          {['all', 'new', 'read', 'replied', 'archived'].map(f => (
            <button
              key={f}
              className={`btn-sm ${filter === f ? '' : 'btn-danger'}`}
              onClick={() => setFilter(f)}
              style={{ minWidth: 70 }}
            >
              {f === 'all' ? (vi ? 'Tất cả' : 'All') : STATUS_LABELS[f][lang]}
              {counts[f] ? ` (${counts[f]})` : ''}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="admin-form" style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)' }}>
            {vi ? 'Không có tin nhắn nào.' : 'No messages.'}
          </div>
        )}

        <div className="admin-articles">
          {filtered.map(c => {
            const status = c.status || 'new'
            const isUnread = status === 'new'
            return (
              <div
                key={c.id}
                className="admin-article-item"
                style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, padding: 14, opacity: status === 'archived' ? 0.55 : 1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
                    {isUnread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />}
                    <strong style={{ color: 'var(--white)', fontSize: '0.95rem' }}>{c.name || '—'}</strong>
                    <a
                      href={`mailto:${c.email}`}
                      style={{ fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'underline' }}
                    >
                      {c.email}
                    </a>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      {STATUS_LABELS[status][lang]} · {formatDate(c.createdAt, lang)}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg)', padding: 12, borderRadius: 6,
                  border: '1px solid rgba(201,168,108,0.10)',
                  whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.55, color: 'var(--text)',
                }}>
                  {c.message}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {status !== 'read' && (
                    <button className="btn-sm" onClick={() => setStatus(c.id, 'read')}>
                      {vi ? '✓ Đã đọc' : '✓ Mark read'}
                    </button>
                  )}
                  {status !== 'replied' && (
                    <button className="btn-sm" onClick={() => setStatus(c.id, 'replied')}>
                      {vi ? '↩ Đã trả lời' : '↩ Replied'}
                    </button>
                  )}
                  {status !== 'archived' && (
                    <button className="btn-sm" onClick={() => setStatus(c.id, 'archived')}>
                      {vi ? '📦 Lưu trữ' : '📦 Archive'}
                    </button>
                  )}
                  <a className="btn-sm" href={`mailto:${c.email}?subject=Re: Bất Tử Đạo&body=Chào ${c.name},%0A%0A`}>
                    {vi ? '✉ Trả lời' : '✉ Reply'}
                  </a>
                  <button className="btn-sm btn-danger" onClick={() => remove(c.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
