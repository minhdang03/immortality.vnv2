import { useState } from 'react'
import { DEFAULT_T, TRANSLATION_GROUPS } from '../../data/translations'

export default function TranslationsTab({ lang, viStrings, enStrings, onUpdate }) {
  const allKeys = Object.keys(DEFAULT_T.vi)
  const initForm = {}
  allKeys.forEach(k => {
    initForm[`vi_${k}`] = viStrings?.[k] || DEFAULT_T.vi[k] || ''
    initForm[`en_${k}`] = enStrings?.[k] || DEFAULT_T.en[k] || ''
  })

  const [form, setForm] = useState(initForm)
  const [saved, setSaved] = useState(false)
  const [openGroup, setOpenGroup] = useState(TRANSLATION_GROUPS[0].id)
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    const viData = {}, enData = {}
    allKeys.forEach(k => { viData[k] = form[`vi_${k}`]; enData[k] = form[`en_${k}`] })
    await onUpdate('vi', viData)
    await onUpdate('en', enData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="admin-form">
      <div style={{ marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        {lang === 'vi'
          ? 'Sửa text hiển thị trên website. Cột trái: Tiếng Việt. Cột phải: English.'
          : 'Edit displayed text on website. Left: Vietnamese. Right: English.'}
      </div>

      {TRANSLATION_GROUPS.map(group => (
        <div key={group.id} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 14px',
              background: openGroup === group.id ? 'rgba(201,168,108,0.12)' : 'transparent',
              border: '1px solid rgba(201,168,108,0.15)', borderRadius: 10,
              color: 'var(--gold-bright)', cursor: 'pointer', fontFamily: 'var(--font-display)',
              fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.3s',
            }}
          >
            {openGroup === group.id ? '▾' : '▸'} {group.label}
          </button>
          {openGroup === group.id && (
            <div style={{ padding: '12px 0' }}>
              {group.keys.map(key => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 4 }}>{key}</label>
                  <div className="admin-form-grid">
                    <div><input value={form[`vi_${key}`]} onChange={e => setField(`vi_${key}`, e.target.value)} placeholder={DEFAULT_T.vi[key]} style={{ fontSize: '0.82rem' }} /></div>
                    <div><input value={form[`en_${key}`]} onChange={e => setField(`en_${key}`, e.target.value)} placeholder={DEFAULT_T.en[key]} style={{ fontSize: '0.82rem', opacity: form[`en_${key}`] ? 1 : 0.5 }} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="admin-form-actions" style={{ marginTop: 24 }}>
        <button className="btn-read" onClick={handleSave}>{lang === 'vi' ? 'Lưu tất cả' : 'Save all'}</button>
        {saved && <span style={{ color: 'var(--gold-bright)', fontSize: '0.85rem' }}>{lang === 'vi' ? 'Đã lưu!' : 'Saved!'}</span>}
      </div>
    </div>
  )
}
