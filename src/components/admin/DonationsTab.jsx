import { useEffect, useState } from 'react'
import { useAdminDonations } from '../../hooks/useAdminDonations'

const STATUS_LABELS = {
  pending: { vi: 'Chờ duyệt', en: 'Pending' },
  approved: { vi: 'Đã duyệt', en: 'Approved' },
  rejected: { vi: 'Đã từ chối', en: 'Rejected' },
}

function formatAmount(n, lang) {
  if (typeof n !== 'number') return ''
  return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(n) + ' ₫'
}

function formatDate(ts, lang) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')
}

function DonationRow({ donation, lang, fetchContact, approve, reject, remove, updateAdminNote, t }) {
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open && !contact) {
      fetchContact(donation.id).then(c => {
        setContact(c)
        setNote(c?.adminNote || '')
      })
    }
  }, [open, contact, donation.id, fetchContact])

  const onApprove = () => approve(donation.id)
  const onReject = () => reject(donation.id)
  const onDelete = () => {
    if (window.confirm(t.adminConfirmDelete)) remove(donation.id)
  }
  const onSaveNote = () => updateAdminNote(donation.id, note)

  const displayName = donation.isAnonymous
    ? `(${lang === 'vi' ? 'Ẩn danh' : 'Anonymous'})`
    : (donation.displayName || '—')

  return (
    <div className="admin-article-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
          <span style={{ fontWeight: 600, color: 'var(--white)' }}>{displayName}</span>
          <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
            {formatAmount(donation.amount, lang)}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            {formatDate(donation.createdAt, lang)}
          </span>
        </div>
        <div className="admin-article-actions" style={{ gap: 4 }}>
          <button className="btn-sm" onClick={() => setOpen(!open)}>
            {open ? '−' : '+'}
          </button>
          {donation.status !== 'approved' && (
            <button className="btn-sm" onClick={onApprove} title={lang === 'vi' ? 'Duyệt' : 'Approve'}>✓</button>
          )}
          {donation.status !== 'rejected' && (
            <button className="btn-sm" onClick={onReject} title={lang === 'vi' ? 'Từ chối' : 'Reject'}>✗</button>
          )}
          <button className="btn-sm btn-danger" onClick={onDelete}>{t.adminDelete}</button>
        </div>
      </div>

      {donation.message && (
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontStyle: 'italic', opacity: 0.85 }}>
          "{donation.message}"
        </div>
      )}

      {open && (
        <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: '0.85rem', display: 'grid', gap: 8 }}>
          <div><strong>{lang === 'vi' ? 'Tên thật' : 'Real name'}:</strong> {contact?.realName || '—'}</div>
          <div><strong>Email:</strong> {contact?.email || '—'}</div>
          <div><strong>{lang === 'vi' ? 'SĐT' : 'Phone'}:</strong> {contact?.phone || '—'}</div>
          <div>
            <strong>{lang === 'vi' ? 'Ghi chú admin' : 'Admin note'}:</strong>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input
                value={note} onChange={e => setNote(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text)', fontSize: '0.85rem' }}
              />
              <button className="btn-sm" onClick={onSaveNote}>{t.adminSave}</button>
            </div>
          </div>
          {donation.approvedAt && (
            <div style={{ color: 'var(--text-dim)' }}>
              {lang === 'vi' ? 'Duyệt lúc' : 'Approved at'}: {formatDate(donation.approvedAt, lang)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DonationsTab({ t, lang }) {
  const { donations, loading, fetchContact, approve, reject, remove, updateAdminNote } = useAdminDonations()
  const [filter, setFilter] = useState('pending')

  const filtered = donations.filter(d => d.status === filter)
  const counts = {
    pending: donations.filter(d => d.status === 'pending').length,
    approved: donations.filter(d => d.status === 'approved').length,
    rejected: donations.filter(d => d.status === 'rejected').length,
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            className={`btn-sm ${filter === s ? '' : 'btn-video'}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s][lang]} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="admin-articles">
        {loading && <div style={{ color: 'var(--text-dim)', padding: 24 }}>{t.loading}</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có ủng hộ nào.' : 'No donations yet.'}
          </div>
        )}
        {filtered.map(d => (
          <DonationRow
            key={d.id} donation={d} lang={lang} t={t}
            fetchContact={fetchContact}
            approve={approve} reject={reject} remove={remove}
            updateAdminNote={updateAdminNote}
          />
        ))}
      </div>
    </>
  )
}
