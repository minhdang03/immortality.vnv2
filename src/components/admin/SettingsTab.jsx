import { useState } from 'react'
import { DEFAULT_NAV_ITEMS } from '../../hooks/useFirestore'

const NAV_ICONS = {
  home: '🏠', stories: '📖', revelations: '💡', about: 'ℹ️',
  practice: '☀️', contact: '✉️', search: '🔍',
}

export default function SettingsTab({ lang, settings, onUpdate }) {
  const [navItems, setNavItems] = useState(() => settings.navItems || DEFAULT_NAV_ITEMS)
  const [saving, setSaving] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate({ navItems })
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const handleReset = () => {
    setNavItems([...DEFAULT_NAV_ITEMS])
  }

  const bottomCount = navItems.filter(i => i.visible && i.showInBottom).length

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--gold)', margin: 0, fontSize: '1rem' }}>
          {lang === 'vi' ? 'Cấu trúc điều hướng' : 'Navigation Structure'}
        </h3>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          {lang === 'vi' ? `(Bottom nav: ${bottomCount}/5)` : `(Bottom nav: ${bottomCount}/5)`}
        </span>
      </div>

      <div className="admin-articles">
        {navItems.map((item, idx) => (
          <div
            key={item.id}
            className="admin-article-item"
            style={{
              opacity: item.visible ? 1 : 0.5,
              background: dragIdx === idx ? 'var(--gold-bright)' : undefined,
              transition: 'all 0.2s',
            }}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveItem(dragIdx, idx); setDragIdx(null) }}
            onDragEnd={() => setDragIdx(null)}
          >
            <div className="admin-article-info" style={{ gap: 8, flex: 1 }}>
              <span style={{ cursor: 'grab', fontSize: '1rem', userSelect: 'none' }}>⠿</span>
              <span style={{ fontSize: '0.85rem', minWidth: 20 }}>{NAV_ICONS[item.id] || '📄'}</span>

              <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                <input
                  value={item.labelVi}
                  onChange={e => updateLabel(idx, 'labelVi', e.target.value)}
                  placeholder="Label VI"
                  style={{ flex: 1, minWidth: 80, padding: '4px 8px', fontSize: '0.85rem', background: 'var(--card)', border: '1px solid var(--text-dim)', borderRadius: 4, color: 'var(--text)' }}
                />
                <input
                  value={item.labelEn}
                  onChange={e => updateLabel(idx, 'labelEn', e.target.value)}
                  placeholder="Label EN"
                  style={{ flex: 1, minWidth: 80, padding: '4px 8px', fontSize: '0.85rem', background: 'var(--card)', border: '1px solid var(--text-dim)', borderRadius: 4, color: 'var(--text)' }}
                />
              </div>
            </div>

            <div className="admin-article-actions" style={{ gap: 6, flexWrap: 'wrap' }}>
              <button
                className={`btn-sm ${item.visible ? '' : 'btn-danger'}`}
                onClick={() => toggleField(idx, 'visible')}
                title={lang === 'vi' ? 'Hiện/Ẩn' : 'Show/Hide'}
              >
                {item.visible ? '👁' : '🚫'}
              </button>
              <button
                className={`btn-sm ${item.showInBottom ? '' : 'btn-danger'}`}
                onClick={() => {
                  if (!item.showInBottom && bottomCount >= 5) return
                  toggleField(idx, 'showInBottom')
                }}
                title={lang === 'vi' ? 'Bottom nav' : 'Bottom nav'}
                style={{ fontSize: '0.75rem' }}
              >
                {item.showInBottom ? '📱' : '—'}
              </button>
              <button className="btn-sm" onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0}>↑</button>
              <button className="btn-sm" onClick={() => moveItem(idx, idx + 1)} disabled={idx === navItems.length - 1}>↓</button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-form-actions" style={{ marginTop: 16 }}>
        <button className="btn-read" onClick={handleSave} disabled={saving}>
          {saving ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Lưu cấu trúc' : 'Save structure')}
        </button>
        <button className="btn-video" onClick={handleReset}>
          {lang === 'vi' ? 'Đặt lại mặc định' : 'Reset to default'}
        </button>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: 'var(--card)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <strong>{lang === 'vi' ? 'Hướng dẫn:' : 'Guide:'}</strong>
        <ul style={{ marginTop: 4, paddingLeft: 16 }}>
          <li>{lang === 'vi' ? 'Kéo thả hoặc dùng ↑↓ để sắp xếp thứ tự' : 'Drag or use ↑↓ to reorder'}</li>
          <li>{lang === 'vi' ? '👁 = hiện/ẩn trang trên menu' : '👁 = show/hide page in menu'}</li>
          <li>{lang === 'vi' ? '📱 = hiện trên thanh điều hướng dưới cùng (tối đa 5)' : '📱 = show in bottom nav bar (max 5)'}</li>
          <li>{lang === 'vi' ? 'Sửa tên hiển thị cho tiếng Việt và English' : 'Edit display labels for Vietnamese and English'}</li>
        </ul>
      </div>
    </>
  )
}
