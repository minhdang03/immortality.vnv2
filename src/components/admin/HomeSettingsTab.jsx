import { useState } from 'react'
import { DEFAULT_HOME_CARDS, DEFAULT_HERO } from '../../hooks/useFirestore'

const ICON_OPTIONS = [
  { id: 'book', label: '📖 Book' },
  { id: 'layers', label: '📚 Layers' },
  { id: 'info', label: 'ℹ️ Info' },
  { id: 'sun', label: '☀️ Sun' },
  { id: 'star', label: '⭐ Star' },
  { id: 'heart', label: '❤️ Heart' },
  { id: 'compass', label: '🧭 Compass' },
  { id: 'lightning', label: '⚡ Lightning' },
]

const PAGE_OPTIONS = [
  { id: 'home', vi: 'Trang Chủ', en: 'Home' },
  { id: 'stories', vi: '37 Chuyện', en: 'Stories' },
  { id: 'khaitri', vi: 'Khai Trí', en: 'Khai Trí' },
  { id: 'about', vi: 'Giới Thiệu', en: 'About' },
  { id: 'practice', vi: 'Thái Dương Quyền', en: 'Solar Fist' },
  { id: 'contact', vi: 'Liên Hệ', en: 'Contact' },
  { id: 'search', vi: 'Tìm kiếm', en: 'Search' },
]

export default function HomeSettingsTab({ lang, settings, onUpdate }) {
  const [cards, setCards] = useState(() => settings.homeCards || DEFAULT_HOME_CARDS)
  const [hero, setHero] = useState(() => settings.hero || DEFAULT_HERO)
  const [saving, setSaving] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

  const vi = lang === 'vi'

  const updateCard = (idx, field, value) => {
    const items = [...cards]
    items[idx] = { ...items[idx], [field]: value }
    setCards(items)
  }

  const moveCard = (from, to) => {
    if (to < 0 || to >= cards.length) return
    const items = [...cards]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    setCards(items)
  }

  const addCard = () => {
    setCards([...cards, {
      id: 'stories', icon: 'book',
      labelVi: 'Mới', labelEn: 'New',
      descVi: '', descEn: '', visible: true,
    }])
  }

  const removeCard = (idx) => setCards(cards.filter((_, i) => i !== idx))
  const updateHero = (field, value) => setHero({ ...hero, [field]: value })

  const handleSave = async () => {
    setSaving(true)
    try { await onUpdate({ homeCards: cards, hero }) }
    catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleReset = () => {
    setCards([...DEFAULT_HOME_CARDS])
    setHero({ ...DEFAULT_HERO })
  }

  const inputStyle = {
    flex: 1, minWidth: 100, padding: '5px 10px', fontSize: '0.82rem',
    background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.1)',
    borderRadius: 6, color: 'var(--text)',
  }

  return (
    <>
      {/* Hero Section */}
      <div className="admin-settings-section">
        <h3 className="admin-settings-title">
          {vi ? '🏠 Hero' : '🏠 Hero Section'}
        </h3>

        {/* Visibility toggles */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { key: 'showSun', vi: 'Mặt Trời', en: 'Sun' },
            { key: 'showTitle', vi: 'Tiêu đề', en: 'Title' },
            { key: 'showSubtitle', vi: 'Phụ đề', en: 'Subtitle' },
            { key: 'showCtaPrimary', vi: 'Nút chính', en: 'CTA 1' },
            { key: 'showCtaSecondary', vi: 'Nút phụ', en: 'CTA 2' },
          ].map(item => (
            <button
              key={item.key}
              className={`btn-sm ${hero[item.key] !== false ? '' : 'btn-danger'}`}
              onClick={() => updateHero(item.key, hero[item.key] === false)}
              style={{ fontSize: '0.72rem' }}
            >
              {hero[item.key] !== false ? '✓' : '✕'} {vi ? item.vi : item.en}
            </button>
          ))}
        </div>

        <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', opacity: hero.showCtaPrimary !== false ? 1 : 0.35 }}>
            <label style={{ flex: 1, minWidth: 140 }}>
              <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{vi ? 'Nút chính VI' : 'CTA 1 VI'}</small>
              <input style={inputStyle} value={hero.ctaPrimaryVi} onChange={e => updateHero('ctaPrimaryVi', e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{vi ? 'Nút chính EN' : 'CTA 1 EN'}</small>
              <input style={inputStyle} value={hero.ctaPrimaryEn} onChange={e => updateHero('ctaPrimaryEn', e.target.value)} />
            </label>
            <label style={{ minWidth: 90 }}>
              <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Link</small>
              <select style={inputStyle} value={hero.ctaPrimaryLink} onChange={e => updateHero('ctaPrimaryLink', e.target.value)}>
                {PAGE_OPTIONS.map(p => <option key={p.id} value={p.id}>{vi ? p.vi : p.en}</option>)}
              </select>
            </label>
          </div>
          {/* Secondary CTA */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', opacity: hero.showCtaSecondary !== false ? 1 : 0.35 }}>
            <label style={{ flex: 1, minWidth: 140 }}>
              <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{vi ? 'Nút phụ VI' : 'CTA 2 VI'}</small>
              <input style={inputStyle} value={hero.ctaSecondaryVi} onChange={e => updateHero('ctaSecondaryVi', e.target.value)} placeholder={vi ? '(mặc định)' : '(default)'} />
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{vi ? 'Nút phụ EN' : 'CTA 2 EN'}</small>
              <input style={inputStyle} value={hero.ctaSecondaryEn} onChange={e => updateHero('ctaSecondaryEn', e.target.value)} placeholder={vi ? '(mặc định)' : '(default)'} />
            </label>
            <label style={{ minWidth: 90 }}>
              <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Link</small>
              <select style={inputStyle} value={hero.ctaSecondaryLink} onChange={e => updateHero('ctaSecondaryLink', e.target.value)}>
                {PAGE_OPTIONS.map(p => <option key={p.id} value={p.id}>{vi ? p.vi : p.en}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Home Cards */}
      <div className="admin-settings-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <h3 className="admin-settings-title" style={{ marginBottom: 0 }}>
            {vi ? '🃏 Thẻ trang chủ' : '🃏 Home Cards'}
          </h3>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>({cards.length})</span>
          <button className="btn-sm" onClick={addCard} style={{ marginLeft: 'auto' }}>+ {vi ? 'Thêm' : 'Add'}</button>
        </div>

        <div className="admin-articles">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="admin-article-item"
              style={{
                opacity: card.visible ? 1 : 0.45,
                background: dragIdx === idx ? 'rgba(201,168,108,0.12)' : undefined,
                flexDirection: 'column', gap: 8, alignItems: 'stretch',
              }}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveCard(dragIdx, idx); setDragIdx(null) }}
              onDragEnd={() => setDragIdx(null)}
            >
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ cursor: 'grab', userSelect: 'none', color: 'var(--text-dim)' }}>⠿</span>
                <select style={{ ...inputStyle, flex: 'none', width: 75 }} value={card.icon} onChange={e => updateCard(idx, 'icon', e.target.value)}>
                  {ICON_OPTIONS.map(ic => <option key={ic.id} value={ic.id}>{ic.label}</option>)}
                </select>
                <select style={{ ...inputStyle, flex: 'none', width: 95 }} value={card.id} onChange={e => updateCard(idx, 'id', e.target.value)}>
                  {PAGE_OPTIONS.map(p => <option key={p.id} value={p.id}>{vi ? p.vi : p.en}</option>)}
                </select>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  <button className={`btn-sm ${card.visible ? '' : 'btn-danger'}`} onClick={() => updateCard(idx, 'visible', !card.visible)}>
                    {card.visible ? '👁' : '🚫'}
                  </button>
                  <button className="btn-sm" onClick={() => moveCard(idx, idx - 1)} disabled={idx === 0}>↑</button>
                  <button className="btn-sm" onClick={() => moveCard(idx, idx + 1)} disabled={idx === cards.length - 1}>↓</button>
                  <button className="btn-sm btn-danger" onClick={() => removeCard(idx)}>✕</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <input style={inputStyle} value={card.labelVi} onChange={e => updateCard(idx, 'labelVi', e.target.value)} placeholder="Label VI" />
                <input style={inputStyle} value={card.labelEn} onChange={e => updateCard(idx, 'labelEn', e.target.value)} placeholder="Label EN" />
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <input style={inputStyle} value={card.descVi} onChange={e => updateCard(idx, 'descVi', e.target.value)} placeholder={vi ? 'Mô tả VI' : 'Desc VI'} />
                <input style={inputStyle} value={card.descEn} onChange={e => updateCard(idx, 'descEn', e.target.value)} placeholder={vi ? 'Mô tả EN' : 'Desc EN'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-form-actions">
        <button className="btn-read" onClick={handleSave} disabled={saving}>
          {saving ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Lưu trang chủ' : 'Save home page')}
        </button>
        <button className="btn-video" onClick={handleReset}>
          {vi ? 'Đặt lại mặc định' : 'Reset to default'}
        </button>
      </div>
    </>
  )
}
