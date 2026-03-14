import { useState } from 'react'
import AutoTextarea from './AutoTextarea'

export default function KhaiTriTab({ t, lang, items, onAdd, onUpdate, onDelete }) {
  const EMPTY = {
    order: items.length + 1, date: new Date().toISOString().split('T')[0],
    tagVi: '', tagEn: '', titleVi: '', titleEn: '',
    questionVi: '', questionEn: '', summaryVi: '', summaryEn: '', bodyVi: '', bodyEn: '',
  }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLang, setFormLang] = useState('vi')
  const [preview, setPreview] = useState(false)
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: items.length + 1 }); setEditing('new'); setFormLang('vi'); setPreview(false) }
  const startEdit = (a) => {
    setForm({
      order: a.order ?? 0, date: a.date || '',
      tagVi: a.tag?.vi || '', tagEn: a.tag?.en || '',
      titleVi: a.vi?.title || '', titleEn: a.en?.title || '',
      questionVi: a.vi?.question || '', questionEn: a.en?.question || '',
      summaryVi: a.vi?.summary || '', summaryEn: a.en?.summary || '',
      bodyVi: a.vi?.body || '', bodyEn: a.en?.body || '',
    })
    setEditing(a.id); setFormLang('vi'); setPreview(false)
  }

  const handleSave = async () => {
    const data = {
      order: Number(form.order), date: form.date,
      tag: { vi: form.tagVi, en: form.tagEn },
      vi: { title: form.titleVi, question: form.questionVi, summary: form.summaryVi, body: form.bodyVi },
      en: { title: form.titleEn, question: form.questionEn, summary: form.summaryEn, body: form.bodyEn },
    }
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing, data)
    setEditing(null); setForm(EMPTY)
  }

  const handleDelete = async (id) => { if (window.confirm(t.adminConfirmDelete)) await onDelete(id) }
  const L = formLang === 'vi' ? 'Vi' : 'En'

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button className="btn-read" onClick={startNew}>{lang === 'vi' ? 'Thêm Khai Trí' : 'Add Khai Trí'}</button>
      </div>

      {editing !== null && (
        <div className="admin-form">
          <div className="admin-editor-meta">
            <div className="admin-editor-meta-row">
              <div style={{ width: 80 }}>
                <label>{lang === 'vi' ? 'Thứ tự' : 'Order'}</label>
                <input type="number" value={form.order} onChange={e => setField('order', e.target.value)} />
              </div>
              <div style={{ width: 160 }}>
                <label>{t.adminDate}</label>
                <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Tag (VI)</label>
                <input value={form.tagVi} onChange={e => setField('tagVi', e.target.value)} placeholder="Ví dụ: Sức Khỏe" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Tag (EN)</label>
                <input value={form.tagEn} onChange={e => setField('tagEn', e.target.value)} placeholder="e.g. Health" />
              </div>
            </div>
          </div>

          <div className="admin-editor-toolbar">
            <div className="admin-lang-tabs">
              <button className={`admin-lang-tab ${formLang === 'vi' ? 'active' : ''}`} onClick={() => { setFormLang('vi'); setPreview(false) }}>
                Tiếng Việt {form.titleVi && <span className="admin-lang-dot filled" />}
              </button>
              <button className={`admin-lang-tab ${formLang === 'en' ? 'active' : ''}`} onClick={() => { setFormLang('en'); setPreview(false) }}>
                English {form.titleEn ? <span className="admin-lang-dot filled" /> : <span className="admin-lang-dot empty" />}
              </button>
            </div>
            <button className={`admin-preview-btn ${preview ? 'active' : ''}`} onClick={() => setPreview(!preview)}>
              {lang === 'vi' ? (preview ? 'Soạn thảo' : 'Xem trước') : (preview ? 'Edit' : 'Preview')}
            </button>
          </div>

          {!preview ? (
            <div className="admin-editor-fields">
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Tiêu đề' : 'Title'}</label>
                <input value={form[`title${L}`]} onChange={e => setField(`title${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Nhập tiêu đề...' : 'Enter title...'} className="admin-input-title" />
              </div>
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Câu hỏi' : 'Question'}</label>
                <AutoTextarea value={form[`question${L}`]} onChange={e => setField(`question${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Câu hỏi của người hỏi...' : 'The question being asked...'} minRows={2} />
              </div>
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Tóm tắt' : 'Summary'}</label>
                <AutoTextarea value={form[`summary${L}`]} onChange={e => setField(`summary${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Tóm tắt ngắn gọn...' : 'Brief summary...'} minRows={3} />
              </div>
              <div className="admin-field">
                <label>{formLang === 'vi' ? 'Nội dung trả lời' : 'Answer content'}</label>
                <AutoTextarea value={form[`body${L}`]} onChange={e => setField(`body${L}`, e.target.value)}
                  placeholder={formLang === 'vi' ? 'Câu trả lời đầy đủ...\n\nXuống dòng 2 lần để tạo đoạn mới.' : 'Full answer...\n\nDouble line break for new paragraph.'} minRows={12} />
              </div>
            </div>
          ) : (
            <div className="admin-preview">
              <h1 className="detail-title">{form[`title${L}`] || (formLang === 'vi' ? '(Chưa có tiêu đề)' : '(No title)')}</h1>
              {form[`question${L}`] && <div className="detail-question">{form[`question${L}`]}</div>}
              {form[`summary${L}`] && <div className="article-summary" style={{ marginBottom: 20 }}>{form[`summary${L}`]}</div>}
              <div className="detail-body">{form[`body${L}`] || (formLang === 'vi' ? '(Chưa có nội dung)' : '(No content)')}</div>
            </div>
          )}

          <div className="admin-editor-actions">
            <button className="btn-read" onClick={handleSave}>{t.adminSave}</button>
            <button className="btn-video" onClick={() => setEditing(null)}>{t.adminCancel}</button>
          </div>
        </div>
      )}

      <div className="admin-articles">
        {items.map(a => (
          <div key={a.id} className="admin-article-item" onClick={() => startEdit(a)} style={{ cursor: 'pointer' }}>
            <div className="admin-article-info">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)', opacity: 0.5, minWidth: 28 }}>
                {String(a.order || 0).padStart(2, '0')}
              </span>
              {a.tag?.vi && <span className="article-tag">{a.tag.vi}</span>}
              <span className="admin-article-title">{a.vi?.title || a.en?.title}</span>
            </div>
            <div className="admin-article-actions" onClick={e => e.stopPropagation()}>
              <button className="btn-sm" onClick={() => startEdit(a)}>{t.adminEdit}</button>
              <button className="btn-sm btn-danger" onClick={() => handleDelete(a.id)}>{t.adminDelete}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có nội dung Khai Trí. Bấm "Thêm Khai Trí" để bắt đầu.' : 'No Khai Trí yet. Click "Add Khai Trí" to start.'}
          </div>
        )}
      </div>
    </>
  )
}
