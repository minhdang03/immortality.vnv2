import { useState } from 'react'

export default function TopicsTab({ t, lang, topics, onAdd, onUpdate, onDelete }) {
  const EMPTY = { icon: '☀', vi: '', en: '', descVi: '', descEn: '', order: topics.length }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: topics.length }); setEditing('new') }
  const startEdit = (tp) => {
    setForm({ icon: tp.icon || '☀', vi: tp.vi || '', en: tp.en || '', descVi: tp.descVi || '', descEn: tp.descEn || '', order: tp.order ?? 0 })
    setEditing(tp.id)
  }

  const handleSave = async () => {
    const data = { icon: form.icon, vi: form.vi, en: form.en, descVi: form.descVi, descEn: form.descEn, order: Number(form.order) }
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing, data)
    setEditing(null); setForm(EMPTY)
  }

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'vi' ? 'Xoá chủ đề này?' : 'Delete this topic?')) await onDelete(id)
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button className="btn-read" onClick={startNew}>{lang === 'vi' ? 'Thêm chủ đề' : 'Add topic'}</button>
      </div>

      {editing !== null && (
        <div className="admin-form">
          <div className="admin-form-row">
            <label>Icon (emoji)</label>
            <input value={form.icon} onChange={e => setField('icon', e.target.value)} style={{ maxWidth: 80 }} />
          </div>
          <div className="admin-form-grid">
            <div><label>{lang === 'vi' ? 'Tên (VI)' : 'Name (VI)'}</label><input value={form.vi} onChange={e => setField('vi', e.target.value)} /></div>
            <div><label>{lang === 'vi' ? 'Tên (EN)' : 'Name (EN)'}</label><input value={form.en} onChange={e => setField('en', e.target.value)} /></div>
          </div>
          <div className="admin-form-grid">
            <div><label>{lang === 'vi' ? 'Mô tả (VI)' : 'Desc (VI)'}</label><input value={form.descVi} onChange={e => setField('descVi', e.target.value)} /></div>
            <div><label>{lang === 'vi' ? 'Mô tả (EN)' : 'Desc (EN)'}</label><input value={form.descEn} onChange={e => setField('descEn', e.target.value)} /></div>
          </div>
          <div className="admin-form-row">
            <label>{lang === 'vi' ? 'Thứ tự' : 'Order'}</label>
            <input type="number" value={form.order} onChange={e => setField('order', e.target.value)} style={{ maxWidth: 80 }} />
          </div>
          <div className="admin-form-actions">
            <button className="btn-read" onClick={handleSave}>{t.adminSave}</button>
            <button className="btn-video" onClick={() => setEditing(null)}>{t.adminCancel}</button>
          </div>
        </div>
      )}

      <div className="admin-articles">
        {topics.map(tp => (
          <div key={tp.id} className="admin-article-item">
            <div className="admin-article-info">
              <span style={{ fontSize: '1.2rem', marginRight: 8 }}>{tp.icon}</span>
              <span className="admin-article-title">{lang === 'vi' ? tp.vi : tp.en}</span>
              <span className="article-date" style={{ marginLeft: 8 }}>{tp.descVi || tp.descEn}</span>
            </div>
            <div className="admin-article-actions">
              <button className="btn-sm" onClick={() => startEdit(tp)}>{t.adminEdit}</button>
              <button className="btn-sm btn-danger" onClick={() => handleDelete(tp.id)}>{t.adminDelete}</button>
            </div>
          </div>
        ))}
        {topics.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có chủ đề. Bấm "Thêm chủ đề" để bắt đầu.' : 'No topics yet. Click "Add topic" to start.'}
          </div>
        )}
      </div>
    </>
  )
}
