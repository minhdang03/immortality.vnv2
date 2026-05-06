import { useState } from 'react'
import { useAdmins } from '../../hooks/useAdmins'

export default function AdminUsersTab({ lang, currentUser }) {
  const { admins, loading, grantAdmin, revokeAdmin } = useAdmins()
  const [uid, setUid] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('mod-articles')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const vi = lang === 'vi'

  const handleGrant = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!uid.trim()) { setMsg(vi ? 'UID không được trống' : 'UID required'); return }
    setBusy(true)
    try {
      await grantAdmin(uid, email, currentUser?.uid, role)
      setUid(''); setEmail(''); setRole('mod-articles')
      setMsg(vi ? `✓ Đã cấp quyền ${role}` : `✓ ${role} granted`)
    } catch (err) {
      setMsg(`✗ ${err?.message || 'Failed'}`)
    }
    setBusy(false)
  }

  const handleRevoke = async (a) => {
    if (a.id === currentUser?.uid) {
      setMsg(vi ? 'Không thể tự xoá quyền của chính mình' : 'Cannot revoke own admin')
      return
    }
    if (!confirm(vi ? `Xoá quyền admin của ${a.email || a.id}?` : `Revoke admin for ${a.email || a.id}?`)) return
    setBusy(true)
    try {
      await revokeAdmin(a.id)
      setMsg(vi ? '✓ Đã xoá' : '✓ Revoked')
    } catch (err) {
      setMsg(`✗ ${err?.message || 'Failed'}`)
    }
    setBusy(false)
  }

  return (
    <>
      <div className="admin-settings-section">
        <h3 className="admin-settings-title">
          {vi ? '🔑 Cấp quyền truy cập' : '🔑 Grant Access'}
        </h3>
        <div className="admin-form" style={{ padding: '16px 18px' }}>
          <p className="admin-settings-hint" style={{ marginBottom: 12 }}>
            {vi
              ? 'Lấy UID từ Firebase Console → Authentication → Users → cột User UID. Email là tuỳ chọn (chỉ để dễ nhận diện).'
              : 'Get UID from Firebase Console → Authentication → Users → User UID column. Email is optional (display only).'}
          </p>
          <form onSubmit={handleGrant} style={{ display: 'grid', gap: 8 }}>
            <input
              type="text"
              placeholder="UID (required)"
              value={uid}
              onChange={e => setUid(e.target.value)}
              disabled={busy}
            />
            <input
              type="email"
              placeholder={vi ? 'Email (tuỳ chọn)' : 'Email (optional)'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={busy}
            />
            <select value={role} onChange={e => setRole(e.target.value)} disabled={busy}>
              <option value="admin">{vi ? 'Admin (toàn quyền)' : 'Admin (full access)'}</option>
              <option value="agent">{vi ? 'Agent (đăng cả articles + khai trí)' : 'Agent (post articles + khaitri)'}</option>
              <option value="mod-articles">{vi ? 'Mod Articles (chỉ articles + comments)' : 'Mod Articles only'}</option>
              <option value="mod-khaitri">{vi ? 'Mod Khai Trí (chỉ hỏi đáp)' : 'Mod Khai Trí only'}</option>
            </select>
            <button type="submit" className="btn-read" disabled={busy || !uid.trim()}>
              {busy ? '...' : (vi ? 'Cấp quyền' : 'Grant')}
            </button>
            {msg && <div style={{ fontSize: '0.85rem', color: msg.startsWith('✓') ? 'var(--gold)' : '#e74c3c' }}>{msg}</div>}
          </form>
        </div>
      </div>

      <div className="admin-settings-section">
        <h3 className="admin-settings-title">
          {vi ? `🛡 Admin hiện tại (${admins?.length || 0})` : `🛡 Current admins (${admins?.length || 0})`}
        </h3>
        <div className="admin-articles">
          {loading && <div style={{ padding: 16, color: 'var(--text-dim)' }}>{vi ? 'Đang tải...' : 'Loading...'}</div>}
          {!loading && admins?.length === 0 && (
            <div style={{ padding: 16, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              <strong style={{ color: '#e74c3c' }}>
                {vi ? '⚠ Chưa có admin/grant nào' : '⚠ No grants yet'}
              </strong>
              <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                {vi
                  ? 'Form trên có thể không hoạt động vì rules yêu cầu bạn là admin để cấp quyền cho người khác. Bootstrap admin đầu tiên qua một trong các cách sau:'
                  : 'The form above won\'t work because rules require you to already be admin. Bootstrap the first admin via one of:'}
              </div>
              <ul style={{ marginTop: 6, fontSize: '0.85rem', paddingLeft: 20 }}>
                <li>{vi ? 'Firebase Console → Firestore → tạo doc' : 'Firebase Console → Firestore → create doc'} <code>/admins/{'<your-uid>'}</code> {vi ? 'với field' : 'with field'} <code>{'{ role: "admin" }'}</code></li>
                <li>{vi ? 'CLI script:' : 'CLI script:'} <code>node functions/scripts/bootstrap-agent.js --email you@x.com --password ... --role admin</code></li>
              </ul>
            </div>
          )}
          {admins?.map(a => {
            const isSelf = a.id === currentUser?.uid
            const effectiveRole = a.role || 'admin'  // legacy doc with no role = admin
            const roleColor = effectiveRole === 'admin' ? 'var(--gold)' : '#6ab8ff'
            return (
              <div key={a.id} className="admin-article-item">
                <div className="admin-article-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4,
                      background: `${roleColor}25`, color: roleColor,
                      textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700
                    }}>
                      {effectiveRole}
                    </span>
                    {a.email || a.id}
                    {isSelf && <span style={{ color: 'var(--gold)', fontSize: '0.72rem' }}>(you)</span>}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                    {a.id}
                  </span>
                  {a.grantedAt && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {vi ? 'Cấp:' : 'Granted:'} {a.grantedAt.toDate ? a.grantedAt.toDate().toLocaleString() : '(pending)'}
                      {a.grantedBy && ` ${vi ? 'bởi' : 'by'} ${a.grantedBy.slice(0, 8)}...`}
                    </span>
                  )}
                </div>
                <div className="admin-article-actions">
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => handleRevoke(a)}
                    disabled={busy || isSelf}
                    title={isSelf ? (vi ? 'Không thể tự xoá' : 'Cannot revoke self') : (vi ? 'Xoá quyền' : 'Revoke')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
