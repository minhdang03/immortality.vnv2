import { useState, useRef, useEffect } from 'react'

function AutoTextarea({ value, onChange, placeholder, className, minHeight = 120 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ minHeight, resize: 'vertical' }}
    />
  )
}

export default function RevelationsTab({ t, lang, items, onAdd, onUpdate, onDelete }) {
  const EMPTY = { order: items.length + 1, questionVi: '', questionEn: '', answerVi: '', answerEn: '' }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLang, setFormLang] = useState('vi')
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: items.length + 1 }); setEditing('new') }
  const startEdit = (item) => {
    setForm({
      order: item.order ?? 0,
      questionVi: item.questionVi || '', questionEn: item.questionEn || '',
      answerVi: item.answerVi || '', answerEn: item.answerEn || '',
    })
    setEditing(item.id)
  }

  const handleSave = async () => {
    const data = {
      order: Number(form.order),
      questionVi: form.questionVi, questionEn: form.questionEn,
      answerVi: form.answerVi, answerEn: form.answerEn,
    }
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing, data)
    setEditing(null); setForm(EMPTY)
  }

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'vi' ? 'Xoá câu hỏi này?' : 'Delete this Q&A?')) await onDelete(id)
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button className="btn-read" onClick={startNew}>{lang === 'vi' ? 'Thêm câu hỏi' : 'Add Q&A'}</button>
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
              <label>{lang === 'vi' ? 'Câu hỏi' : 'Question'}</label>
              <input
                className="admin-input-title"
                value={formLang === 'vi' ? form.questionVi : form.questionEn}
                onChange={e => setField(formLang === 'vi' ? 'questionVi' : 'questionEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Câu hỏi...' : 'Question...'}
              />
            </div>
            <div className="admin-field">
              <label>{lang === 'vi' ? 'Câu trả lời' : 'Answer'}</label>
              <AutoTextarea
                value={formLang === 'vi' ? form.answerVi : form.answerEn}
                onChange={e => setField(formLang === 'vi' ? 'answerVi' : 'answerEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Câu trả lời của Người Bất Tử...' : 'The Immortal\'s answer...'}
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
              <span className="admin-article-title">{lang === 'vi' ? item.questionVi : item.questionEn}</span>
            </div>
            <div className="admin-article-actions">
              <button className="btn-sm" onClick={() => startEdit(item)}>{t.adminEdit}</button>
              <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>{t.adminDelete}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có câu hỏi. Bấm "Thêm câu hỏi" để bắt đầu.' : 'No Q&A yet. Click "Add Q&A" to start.'}
          </div>
        )}
      </div>
    </>
  )
}
