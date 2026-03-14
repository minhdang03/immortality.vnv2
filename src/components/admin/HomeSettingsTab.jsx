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
      descVi: '', descEn: '',
      visible: true,
    }])
  }

  const removeCard = (idx) => {
    setCards(cards.filter((_, i) => i !== idx))
  }

  const updateHero = (field, value) => {
    setHero({ ...hero, [field]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate({ homeCards: cards, hero })
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const handleReset = () => {
    setCards([...DEFAULT_HOME_CARDS])
    setHero({ ...DEFAULT_HERO })
  }

  const inputStyle = {
    flex: 1, minWidth: 100, padding: '6px 10px', fontSize: '0.85rem',
    background: 'var(--card)', border: '1px solid var(--text-dim)',
    borderRadius: 4, color: 'var(--text)',
  }

  return (
    <>
      {/* Hero Section */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--gold)', margin: '0 0 12px', fontSize: '1rem' }}>
          {vi ? '🏠 Cấu hình Hero' : '🏠 Hero Config'}
        </h3>

        {/* Visibility toggles */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { key: 'showSun', vi: 'Icon Mặt Trời', en: 'Sun Icon' },
            { key: 'showTitle', vi: 'Tiêu đề', en: 'Title' },
            { key: 'showSubtitle', vi: 'Phụ đề', en: 'Subtitle' },
            { key: 'showCtaPrimary', vi: 'Nút chính', en: 'Primary CTA' },
            { key: 'showCtaSecondary', vi: 'Nút phụ', en: 'Secondary CTA' },
          ].map(item => (
            <button
              key={item.key}
              className={`btn-sm ${hero[item.key] !== false ? '' : 'btn-danger'}`}
              onClick={() => updateHero(item.key, hero[item.key] === false)}
              style={{ fontSize: '0.75rem' }}
            >
              {hero[item.key] !== false ? '👁' : '🚫'} {vi ? item.vi : item.en}
            </button>
          ))}
        </div>

        <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: hero.showCtaPrimary !== false ? 1 : 0.4 }}>
            <label style={{ flex: 1, minWidth: 150 }}>
              <small style={{ color: 'var(--text-dim)' }}>{vi ? 'Nút chính VI' : 'Primary CTA VI'}</small>
              <input style={inputStyle} value={hero.ctaPrimaryVi} onChange={e => updateHero('ctaPrimaryVi', e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 150 }}>
              <small style={{ color: 'var(--text-dim)' }}>{vi ? 'Nút chính EN' : 'Primary CTA EN'}</small>
              <input style={inputStyle} value={hero.ctaPrimaryEn} onChange={e => updateHero('ctaPrimaryEn', e.target.value)} />
            </label>
            <label style={{ minWidth: 100 }}>
              <small style={{ color: 'var(--text-dim)' }}>Link</small>
              <select style={inputStyle} value={hero.ctaPrimaryLink} onChange={e => updateHero('ctaPrimaryLink', e.target.value)}>
                {PAGE_OPTIONS.map(p => <option key={p.id} value={p.id}>{vi ? p.vi : p.en}</option>)}
              </select>
            </label>
          </div>
          {/* Secondary CTA */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: hero.showCtaSecondary !== false ? 1 : 0.4 }}>
            <label style={{ flex: 1, minWidth: 150 }}>
              <small style={{ color: 'var(--text-dim)' }}>{vi ? 'Nút phụ VI' : 'Secondary CTA VI'}</small>
              <input style={inputStyle} value={hero.ctaSecondaryVi} onChange={e => updateHero('ctaSecondaryVi', e.target.value)} placeholder={vi ? '(dùng mặc định)' : '(use default)'} />
            </label>
            <label style={{ flex: 1, minWidth: 150 }}>
              <small style={{ color: 'var(--text-dim)' }}>{vi ? 'Nút phụ EN' : 'Secondary CTA EN'}</small>
              <input style={inputStyle} value={hero.ctaSecondaryEn} onChange={e => updateHero('ctaSecondaryEn', e.target.value)} placeholder={vi ? '(dùng mặc định)' : '(use default)'} />
            </label>
            <label style={{ minWidth: 100 }}>
              <small style={{ color: 'var(--text-dim)' }}>Link</small>
              <select style={inputStyle} value={hero.ctaSecondaryLink} onChange={e => updateHero('ctaSecondaryLink', e.target.value)}>
                {PAGE_OPTIONS.map(p => <option key={p.id} value={p.id}>{vi ? p.vi : p.en}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Home Cards */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <h3 style={{ color: 'var(--gold)', margin: 0, fontSize: '1rem' }}>
          {vi ? '🃏 Thẻ trang chủ' : '🃏 Home Cards'}
        </h3>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>({cards.length} {vi ? 'thẻ' : 'cards'})</span>
        <button className="btn-sm" onClick={addCard} style={{ marginLeft: 'auto' }}>+ {vi ? 'Thêm' : 'Add'}</button>
      </div>

      <div className="admin-articles">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="admin-article-item"
            style={{
              opacity: card.visible ? 1 : 0.5,
              background: dragIdx === idx ? 'var(--gold-bright)' : undefined,
              flexDirection: 'column', gap: 8, alignItems: 'stretch',
            }}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveCard(dragIdx, idx); setDragIdx(null) }}
            onDragEnd={() => setDragIdx(null)}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ cursor: 'grab', userSelect: 'none' }}>⠿</span>
              <select style={{ ...inputStyle, flex: 'none', width: 80 }} value={card.icon} onChange={e => updateCard(idx, 'icon', e.target.value)}>
                {ICON_OPTIONS.map(ic => <option key={ic.id} value={ic.id}>{ic.label}</option>)}
              </select>
              <select style={{ ...inputStyle, flex: 'none', width: 100 }} value={card.id} onChange={e => updateCard(idx, 'id', e.target.value)}>
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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input style={inputStyle} value={card.labelVi} onChange={e => updateCard(idx, 'labelVi', e.target.value)} placeholder="Label VI" />
              <input style={inputStyle} value={card.labelEn} onChange={e => updateCard(idx, 'labelEn', e.target.value)} placeholder="Label EN" />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input style={inputStyle} value={card.descVi} onChange={e => updateCard(idx, 'descVi', e.target.value)} placeholder={vi ? 'Mô tả VI' : 'Desc VI'} />
              <input style={inputStyle} value={card.descEn} onChange={e => updateCard(idx, 'descEn', e.target.value)} placeholder={vi ? 'Mô tả EN' : 'Desc EN'} />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-form-actions" style={{ marginTop: 16 }}>
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
