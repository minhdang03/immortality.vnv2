import { useState } from 'react'
import { DEFAULT_NAV_ITEMS, ALL_NAV_PAGES, NAV_ICONS } from '../../config/pages'

export default function SettingsTab({ lang, settings, onUpdate }) {
  const [navItems, setNavItems] = useState(() => settings.navItems || DEFAULT_NAV_ITEMS)
  const [defaultFontSize, setDefaultFontSize] = useState(() => settings.defaultFontSize ?? 100)
  const [saving, setSaving] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

  const vi = lang === 'vi'

  const moveItem = (from, to) => {
    if (to < 0 || to >= navItems.length) return
    const items = [...navItems]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    setNavItems(items)
  }

  const toggleField = (idx, field) => {
    const items = [...navItems]
    items[idx] = { ...items[idx], [field]: !items[idx][field] }
    setNavItems(items)
  }

  const updateLabel = (idx, field, value) => {
    const items = [...navItems]
    items[idx] = { ...items[idx], [field]: value }
    setNavItems(items)
  }

  const addItem = (pageId) => {
    const page = ALL_NAV_PAGES.find(p => p.id === pageId)
    if (!page) return
    setNavItems([...navItems, { id: page.id, labelVi: page.labelVi, labelEn: page.labelEn, visible: true, showInBottom: false }])
  }

  const removeItem = (idx) => setNavItems(navItems.filter((_, i) => i !== idx))

  const availablePages = ALL_NAV_PAGES.filter(p => !navItems.some(n => n.id === p.id))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate({ navItems, defaultFontSize })
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const handleReset = () => {
    setNavItems([...DEFAULT_NAV_ITEMS])
    setDefaultFontSize(100)
  }

  const bottomCount = navItems.filter(i => i.visible && i.showInBottom).length

  return (
    <>
      {/* Default Font Size */}
      <div className="admin-settings-section">
        <h3 className="admin-settings-title">
          {vi ? '🔤 Cỡ chữ mặc định' : '🔤 Default Font Size'}
        </h3>
        <div className="admin-form" style={{ padding: '16px 18px' }}>
          <div className="admin-settings-row" style={{ borderBottom: 'none' }}>
            <div style={{ flex: 1 }}>
              <div className="admin-settings-label">
                {vi ? 'Cỡ chữ đọc bài' : 'Reading font size'}
              </div>
              <div className="admin-settings-hint">
                {vi
                  ? 'Người dùng mới sẽ thấy cỡ chữ này. Họ vẫn có thể tự điều chỉnh.'
                  : 'New users will see this size. They can still adjust it manually.'}
              </div>
            </div>
            <div className="admin-font-slider-wrap">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>A</span>
              <input
                type="range"
                className="admin-font-slider"
                min={80} max={150} step={10}
                value={defaultFontSize}
                onChange={e => setDefaultFontSize(Number(e.target.value))}
              />
              <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>A</span>
              <span className="admin-font-value">{defaultFontSize}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="admin-settings-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h3 className="admin-settings-title" style={{ marginBottom: 0 }}>
            {vi ? '🧭 Cấu trúc điều hướng' : '🧭 Navigation Structure'}
            <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {' '}(Bottom: {bottomCount}/5)
            </span>
          </h3>
          {availablePages.length > 0 && (
            <select
              style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '0.78rem', background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.2)', borderRadius: 6, color: 'var(--text)' }}
              value=""
              onChange={e => { if (e.target.value) addItem(e.target.value) }}
            >
              <option value="">+ {vi ? 'Thêm trang' : 'Add page'}</option>
              {availablePages.map(p => (
                <option key={p.id} value={p.id}>{vi ? p.labelVi : p.labelEn}</option>
              ))}
            </select>
          )}
        </div>

        <div className="admin-articles">
          {navItems.map((item, idx) => (
            <div
              key={item.id}
              className="admin-article-item"
              style={{
                opacity: item.visible ? 1 : 0.45,
                background: dragIdx === idx ? 'rgba(201,168,108,0.15)' : undefined,
              }}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveItem(dragIdx, idx); setDragIdx(null) }}
              onDragEnd={() => setDragIdx(null)}
            >
              <div className="admin-article-info" style={{ gap: 8 }}>
                <span style={{ cursor: 'grab', fontSize: '0.9rem', userSelect: 'none', color: 'var(--text-dim)' }}>⠿</span>
                <span style={{ fontSize: '0.85rem', minWidth: 20 }}>{NAV_ICONS[item.id] || '📄'}</span>
                <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                  <input
                    value={item.labelVi} onChange={e => updateLabel(idx, 'labelVi', e.target.value)}
                    placeholder="VI"
                    style={{ flex: 1, minWidth: 70, padding: '5px 8px', fontSize: '0.82rem', background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.1)', borderRadius: 6, color: 'var(--text)' }}
                  />
                  <input
                    value={item.labelEn} onChange={e => updateLabel(idx, 'labelEn', e.target.value)}
                    placeholder="EN"
                    style={{ flex: 1, minWidth: 70, padding: '5px 8px', fontSize: '0.82rem', background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.1)', borderRadius: 6, color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div className="admin-article-actions" style={{ gap: 4 }}>
                <button
                  className={`btn-sm ${item.visible ? '' : 'btn-danger'}`}
                  onClick={() => toggleField(idx, 'visible')}
                  title={vi ? 'Hiện/Ẩn' : 'Show/Hide'}
                >
                  {item.visible ? '👁' : '🚫'}
                </button>
                <button
                  className={`btn-sm ${item.showInBottom ? '' : 'btn-danger'}`}
                  onClick={() => { if (!item.showInBottom && bottomCount >= 5) return; toggleField(idx, 'showInBottom') }}
                  title="Bottom nav"
                  style={{ fontSize: '0.72rem' }}
                >
                  {item.showInBottom ? '📱' : '—'}
                </button>
                <button className="btn-sm" onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0}>↑</button>
                <button className="btn-sm" onClick={() => moveItem(idx, idx + 1)} disabled={idx === navItems.length - 1}>↓</button>
                <button className="btn-sm btn-danger" onClick={() => removeItem(idx)} title={vi ? 'Xóa' : 'Remove'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-form-actions">
        <button className="btn-read" onClick={handleSave} disabled={saving}>
          {saving ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Lưu cài đặt' : 'Save settings')}
        </button>
        <button className="btn-video" onClick={handleReset}>
          {vi ? 'Đặt lại mặc định' : 'Reset to default'}
        </button>
      </div>

      <div className="admin-guide">
        <strong>{vi ? 'Hướng dẫn:' : 'Guide:'}</strong>
        <ul>
          <li>{vi ? 'Kéo thả hoặc dùng ↑↓ để sắp xếp' : 'Drag or use ↑↓ to reorder'}</li>
          <li>{vi ? '👁 = hiện/ẩn trên menu' : '👁 = show/hide in menu'}</li>
          <li>{vi ? '📱 = hiện trên bottom nav (tối đa 5)' : '📱 = show in bottom nav (max 5)'}</li>
        </ul>
      </div>
    </>
  )
}
