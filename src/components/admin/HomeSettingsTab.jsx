import { useState } from 'react'
import { DEFAULT_HOME_CARDS, DEFAULT_HERO } from '../../hooks/useFirestore'
import HomeCardsGrid from './HomeCardsGrid'

const PAGE_OPTIONS = [
  { id: 'home', vi: 'Trang Chủ', en: 'Home' },
  { id: 'stories', vi: '37 Chuyện', en: 'Stories' },
  { id: 'khaitri', vi: 'Khai Trí', en: 'Khai Trí' },
  { id: 'about', vi: 'Giới Thiệu', en: 'About' },
  { id: 'practice', vi: 'Thái Dương Quyền', en: 'Solar Fist' },
  { id: 'contact', vi: 'Liên Hệ', en: 'Contact' },
  { id: 'search', vi: 'Tìm kiếm', en: 'Search' },
]

const inputStyle = {
  flex: 1, minWidth: 100, padding: '5px 10px', fontSize: '0.82rem',
  background: 'var(--bg)', border: '1px solid rgba(201,168,108,0.1)',
  borderRadius: 6, color: 'var(--text)',
}

export default function HomeSettingsTab({ lang, settings, onUpdate }) {
  const [cards, setCards] = useState(() => settings.homeCards || DEFAULT_HOME_CARDS)
  const [hero, setHero] = useState(() => settings.hero || DEFAULT_HERO)
  const [saving, setSaving] = useState(false)

  const vi = lang === 'vi'
  const updateHero = (field, value) => setHero(h => ({ ...h, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try { await onUpdate({ homeCards: cards, hero }) }
    catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleReset = () => { setCards([...DEFAULT_HOME_CARDS]); setHero({ ...DEFAULT_HERO }) }

  return (
    <>
      {/* Hero Section */}
      <div className="admin-settings-section">
        <h3 className="admin-settings-title">{vi ? '🏠 Hero' : '🏠 Hero Section'}</h3>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { key: 'showSun', vi: 'Mặt Trời', en: 'Sun' },
            { key: 'showTitle', vi: 'Tiêu đề', en: 'Title' },
            { key: 'showSubtitle', vi: 'Phụ đề', en: 'Subtitle' },
            { key: 'showCtaPrimary', vi: 'Nút chính', en: 'CTA 1' },
            { key: 'showCtaSecondary', vi: 'Nút phụ', en: 'CTA 2' },
          ].map(item => (
            <button key={item.key} className={`btn-sm ${hero[item.key] !== false ? '' : 'btn-danger'}`}
              onClick={() => updateHero(item.key, hero[item.key] === false)} style={{ fontSize: '0.72rem' }}>
              {hero[item.key] !== false ? '✓' : '✕'} {vi ? item.vi : item.en}
            </button>
          ))}
        </div>

        <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

      <HomeCardsGrid cards={cards} setCards={setCards} lang={lang} />

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
