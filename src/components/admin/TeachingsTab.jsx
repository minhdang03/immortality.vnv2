import { useState } from 'react'
import AutoTextarea from './AutoTextarea'

export default function TeachingsTab({ t, lang, items, onAdd, onUpdate, onDelete }) {
  const EMPTY = { order: items.length + 1, titleVi: '', titleEn: '', bodyVi: '', bodyEn: '' }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLang, setFormLang] = useState('vi')
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: items.length + 1 }); setEditing('new') }
  const startEdit = (item) => {
    setForm({
      order: item.order ?? 0,
      titleVi: item.titleVi || '', titleEn: item.titleEn || '',
      bodyVi: item.bodyVi || '', bodyEn: item.bodyEn || '',
    })
    setEditing(item.id)
  }

  const handleSave = async () => {
    const data = { order: Number(form.order), titleVi: form.titleVi, titleEn: form.titleEn, bodyVi: form.bodyVi, bodyEn: form.bodyEn }
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing, data)
    setEditing(null); setForm(EMPTY)
  }

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'vi' ? 'Xoá mục này?' : 'Delete this section?')) await onDelete(id)
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button className="btn-read" onClick={startNew}>{lang === 'vi' ? 'Thêm mục' : 'Add section'}</button>
      </div>

      {editing !== null && (
        <div className="admin-form">
          <div className="admin-form-row">
            <label>{lang === 'vi' ? 'Thứ tự' : 'Order'}</label>
            <input type="number" value={form.order} onChange={e => setField('order', e.target.value)} style={{ maxWidth: 80 }} />
          </div>

          <div className="admin-editor-toolbar">
            <div className="admin-lang-tabs">
              {['vi', 'en'].map(l => (
                <button key={l} className={`admin-lang-tab ${formLang === l ? 'active' : ''}`} onClick={() => setFormLang(l)}>
                  {l === 'vi' ? 'Tiếng Việt' : 'English'}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-editor-fields">
            <div className="admin-field">
              <label>{lang === 'vi' ? 'Tiêu đề' : 'Title'}</label>
              <input
                className="admin-input-title"
                value={formLang === 'vi' ? form.titleVi : form.titleEn}
                onChange={e => setField(formLang === 'vi' ? 'titleVi' : 'titleEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Tiêu đề...' : 'Title...'}
              />
            </div>
            <div className="admin-field">
              <label>{lang === 'vi' ? 'Nội dung' : 'Content'}</label>
              <AutoTextarea
                value={formLang === 'vi' ? form.bodyVi : form.bodyEn}
                onChange={e => setField(formLang === 'vi' ? 'bodyVi' : 'bodyEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Nội dung (mỗi đoạn cách 1 dòng trống)...' : 'Content (separate paragraphs with blank lines)...'}
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button className="btn-read" onClick={handleSave}>{t.adminSave}</button>
            <button className="btn-video" onClick={() => setEditing(null)}>{t.adminCancel}</button>
          </div>
        </div>
      )}

      <div className="admin-articles">
        {items.map(item => (
          <div key={item.id} className="admin-article-item">
            <div className="admin-article-info">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)', opacity: 0.5, minWidth: 28 }}>
                {String(item.order).padStart(2, '0')}
              </span>
              <span className="admin-article-title">{lang === 'vi' ? item.titleVi : item.titleEn}</span>
            </div>
            <div className="admin-article-actions">
              <button className="btn-sm" onClick={() => startEdit(item)}>{t.adminEdit}</button>
              <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>{t.adminDelete}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có mục. Bấm "Thêm mục" để bắt đầu.' : 'No sections yet. Click "Add section" to start.'}
          </div>
        )}
      </div>
    </>
  )
}
