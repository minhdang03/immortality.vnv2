import { useState } from 'react'
import AutoTextarea from './AutoTextarea'

export default function KhaiTriTab({ t, lang, items, onAdd, onUpdate, onDelete }) {
  const nextOrder = () => (items.reduce((max, i) => Math.max(max, Number(i.order) || 0), 0)) + 1
  const EMPTY = {
    order: nextOrder(), date: new Date().toISOString().split('T')[0],
    tagVi: '', tagEn: '', titleVi: '', titleEn: '',
    questionVi: '', questionEn: '', summaryVi: '', summaryEn: '', bodyVi: '', bodyEn: '',
  }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLang, setFormLang] = useState('vi')
  const [preview, setPreview] = useState(false)
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: nextOrder() }); setEditing('new'); setFormLang('vi'); setPreview(false) }
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

  // Split long Q&A body into separate items
  const splitQA = () => {
    const body = form.bodyVi || form.bodyEn || ''
    const blocks = body.split('\n\n').map(b => b.trim()).filter(Boolean)

    // Group blocks into Q&A pairs
    const pairs = []
    let currentQ = ''
    let currentA = ''

    for (const block of blocks) {
      const isQ = /^(Hỏi|Question|Q)\s*[:：]/i.test(block)
      const isA = /^(Đáp|Trả lời|Answer|A)\s*[:：]/i.test(block)

      if (isQ) {
        if (currentQ && currentA) {
          pairs.push({ q: currentQ, a: currentA })
          currentA = ''
        }
        currentQ = block.replace(/^(Hỏi|Question|Q)\s*[:：]\s*/i, '').trim()
      } else if (isA) {
        currentA = block.replace(/^(Đáp|Trả lời|Answer|A)\s*[:：]\s*/i, '').trim()
      } else {
        // Continuation of previous block
        if (currentA) currentA += '\n\n' + block
        else if (currentQ) currentQ += '\n\n' + block
      }
    }
    if (currentQ && currentA) pairs.push({ q: currentQ, a: currentA })

    if (pairs.length < 2) {
      alert(lang === 'vi'
        ? 'Không tìm thấy nhiều cặp Hỏi/Đáp để tách. Cần ít nhất 2 cặp "Hỏi:" và "Đáp:" trong nội dung.'
        : 'Not enough Q&A pairs found. Need at least 2 "Hỏi:/Đáp:" pairs in the body.')
      return
    }

    const baseTitle = form.titleVi || form.titleEn || ''
    const msg = lang === 'vi'
      ? `Tìm thấy ${pairs.length} cặp Hỏi/Đáp. Tách thành ${pairs.length} items riêng?\n\nItem gốc sẽ giữ cặp đầu tiên, còn lại tạo mới.`
      : `Found ${pairs.length} Q&A pairs. Split into ${pairs.length} separate items?\n\nOriginal keeps first pair, rest are created new.`

    if (!window.confirm(msg)) return

    // Update current item with first pair
    setField('questionVi', pairs[0].q)
    setField('bodyVi', `Hỏi: ${pairs[0].q}\n\nĐáp: ${pairs[0].a}`)
    if (form.summaryVi) setField('summaryVi', pairs[0].a.slice(0, 150) + (pairs[0].a.length > 150 ? '...' : ''))

    // Create new items for remaining pairs — start from max+1 to avoid colliding with existing orders
    const baseOrder = nextOrder()
    pairs.slice(1).forEach(async (pair, i) => {
      const newOrder = baseOrder + i
      const shortTitle = pair.q.length > 80 ? pair.q.slice(0, 80) + '...' : pair.q
      await onAdd({
        order: newOrder,
        date: form.date,
        tag: { vi: form.tagVi, en: form.tagEn },
        vi: {
          title: `${baseTitle} (${i + 2})`,
          question: pair.q,
          summary: pair.a.slice(0, 150) + (pair.a.length > 150 ? '...' : ''),
          body: `Hỏi: ${pair.q}\n\nĐáp: ${pair.a}`
        },
        en: { title: '', question: '', summary: '', body: '' }
      })
    })

    alert(lang === 'vi'
      ? `Đã tách thành ${pairs.length} items. Nhấn Lưu để cập nhật item gốc.`
      : `Split into ${pairs.length} items. Click Save to update the original.`)
  }

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
            {(form.bodyVi || form.bodyEn || '').includes('Hỏi:') && (
              <button className="btn-sm" onClick={splitQA} title={lang === 'vi' ? 'Tách các cặp Hỏi/Đáp thành items riêng' : 'Split Q&A pairs into separate items'}>
                {lang === 'vi' ? 'Tách Hỏi/Đáp' : 'Split Q&A'}
              </button>
            )}
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
