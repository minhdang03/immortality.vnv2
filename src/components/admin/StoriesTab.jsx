import { useState, useRef, useEffect } from 'react'
import { STORY_TAGS, STORIES, STORY_CONTENT, STORY_LESSONS, STORY_HIGHLIGHTS } from '../../data/stories'

const TAGS = Object.keys(STORY_TAGS)

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

export default function StoriesTab({ t, lang, stories, onAdd, onUpdate, onDelete }) {
  const EMPTY = {
    order: stories.length + 1,
    tag: 'escape',
    titleVi: '', titleEn: '',
    contentVi: '', contentEn: '',
    lessonVi: '', lessonEn: '',
    highlightsVi: '', highlightsEn: '',
  }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLang, setFormLang] = useState('vi')
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const startNew = () => { setForm({ ...EMPTY, order: stories.length + 1 }); setEditing('new') }
  const startEdit = (s) => {
    setForm({
      order: s.order ?? 0,
      tag: s.tag || 'escape',
      titleVi: s.titleVi || '', titleEn: s.titleEn || '',
      contentVi: s.contentVi || '', contentEn: s.contentEn || '',
      lessonVi: s.lessonVi || '', lessonEn: s.lessonEn || '',
      highlightsVi: s.highlightsVi || '', highlightsEn: s.highlightsEn || '',
    })
    setEditing(s.id)
  }

  const handleSave = async () => {
    const data = {
      order: Number(form.order),
      tag: form.tag,
      titleVi: form.titleVi, titleEn: form.titleEn,
      contentVi: form.contentVi, contentEn: form.contentEn,
      lessonVi: form.lessonVi, lessonEn: form.lessonEn,
      highlightsVi: form.highlightsVi, highlightsEn: form.highlightsEn,
    }
    if (editing === 'new') await onAdd(data)
    else await onUpdate(editing, data)
    setEditing(null); setForm(EMPTY)
  }

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'vi' ? 'Xoá câu chuyện này?' : 'Delete this story?')) await onDelete(id)
  }

  const viHasContent = form.contentVi.trim().length > 0
  const enHasContent = form.contentEn.trim().length > 0

  const [seeding, setSeeding] = useState(false)

  const handleSeed = async () => {
    if (!window.confirm(lang === 'vi'
      ? 'Đẩy 37 câu chuyện từ data mặc định lên Firestore? (Chỉ cần làm 1 lần)'
      : 'Seed 37 stories from default data to Firestore? (Only needed once)'))
      return
    setSeeding(true)
    for (const s of STORIES) {
      const hl = STORY_HIGHLIGHTS[s.id]
      await onAdd({
        order: s.id,
        tag: s.tag,
        titleVi: s.vi,
        titleEn: s.en,
        contentVi: STORY_CONTENT[s.id]?.vi || '',
        contentEn: STORY_CONTENT[s.id]?.en || '',
        lessonVi: STORY_LESSONS[s.id]?.vi || '',
        lessonEn: STORY_LESSONS[s.id]?.en || '',
        highlightsVi: hl?.vi?.join('\n') || '',
        highlightsEn: hl?.en?.join('\n') || '',
      })
    }
    setSeeding(false)
  }

  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    // Count how many stories have updated content in hardcoded data
    const updatable = STORIES.filter(s => {
      const hasContent = !!(STORY_CONTENT[s.id]?.vi || STORY_LESSONS[s.id]?.vi || STORY_HIGHLIGHTS[s.id])
      return hasContent
    })
    if (!window.confirm(lang === 'vi'
      ? `Cập nhật ${updatable.length} câu chuyện từ dữ liệu code mới nhất? (Ghi đè nội dung, bài học, điểm nhấn)`
      : `Update ${updatable.length} stories from latest code data? (Overwrites content, lessons, highlights)`))
      return
    setSyncing(true)
    for (const s of STORIES) {
      const existing = stories.find(fs => Number(fs.order) === s.id)
      const hl = STORY_HIGHLIGHTS[s.id]
      const data = {
        tag: s.tag,
        titleVi: s.vi,
        titleEn: s.en,
        contentVi: STORY_CONTENT[s.id]?.vi || '',
        contentEn: STORY_CONTENT[s.id]?.en || '',
        lessonVi: STORY_LESSONS[s.id]?.vi || '',
        lessonEn: STORY_LESSONS[s.id]?.en || '',
        highlightsVi: hl?.vi?.join('\n') || '',
        highlightsEn: hl?.en?.join('\n') || '',
      }
      if (existing) {
        await onUpdate(existing.id, data)
      } else {
        await onAdd({ order: s.id, ...data })
      }
    }
    setSyncing(false)
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-read" onClick={startNew}>{lang === 'vi' ? 'Thêm câu chuyện' : 'Add story'}</button>
        {stories.length === 0 && (
          <button className="btn-video" onClick={handleSeed} disabled={seeding}>
            {seeding
              ? (lang === 'vi' ? 'Đang tải...' : 'Seeding...')
              : (lang === 'vi' ? 'Tải 37 chuyện mặc định' : 'Seed 37 default stories')
            }
          </button>
        )}
        {stories.length > 0 && (
          <button className="btn-video" onClick={handleSync} disabled={syncing}>
            {syncing
              ? (lang === 'vi' ? 'Đang cập nhật...' : 'Syncing...')
              : (lang === 'vi' ? 'Cập nhật từ code mới' : 'Sync from latest code')
            }
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="admin-form">
          <div className="admin-form-grid">
            <div>
              <label>{lang === 'vi' ? 'Thứ tự' : 'Order'}</label>
              <input type="number" value={form.order} onChange={e => setField('order', e.target.value)} />
            </div>
            <div>
              <label>Tag</label>
              <select value={form.tag} onChange={e => setField('tag', e.target.value)}>
                {TAGS.map(tag => (
                  <option key={tag} value={tag}>{lang === 'vi' ? STORY_TAGS[tag].vi : STORY_TAGS[tag].en}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-editor-toolbar">
            <div className="admin-lang-tabs">
              {['vi', 'en'].map(l => (
                <button
                  key={l}
                  className={`admin-lang-tab ${formLang === l ? 'active' : ''}`}
                  onClick={() => setFormLang(l)}
                >
                  <span className={`admin-lang-dot ${l === 'vi' ? (viHasContent ? 'filled' : 'empty') : (enHasContent ? 'filled' : 'empty')}`} />
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
                placeholder={formLang === 'vi' ? 'Tiêu đề câu chuyện...' : 'Story title...'}
              />
            </div>

            <div className="admin-field">
              <label>{lang === 'vi' ? 'Nội dung' : 'Content'}</label>
              <AutoTextarea
                value={formLang === 'vi' ? form.contentVi : form.contentEn}
                onChange={e => setField(formLang === 'vi' ? 'contentVi' : 'contentEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Nội dung câu chuyện...' : 'Story content...'}
              />
            </div>

            <div className="admin-field">
              <label>{lang === 'vi' ? 'Điểm nhấn (mỗi dòng 1 điểm)' : 'Highlights (one per line)'}</label>
              <AutoTextarea
                value={formLang === 'vi' ? form.highlightsVi : form.highlightsEn}
                onChange={e => setField(formLang === 'vi' ? 'highlightsVi' : 'highlightsEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Mỗi dòng là 1 điểm nhấn...' : 'One highlight per line...'}
                minHeight={80}
              />
            </div>

            <div className="admin-field">
              <label>{lang === 'vi' ? 'Bài học siêu trí tuệ' : 'Deep wisdom lesson'}</label>
              <AutoTextarea
                value={formLang === 'vi' ? form.lessonVi : form.lessonEn}
                onChange={e => setField(formLang === 'vi' ? 'lessonVi' : 'lessonEn', e.target.value)}
                placeholder={formLang === 'vi' ? 'Bài học từ câu chuyện (mỗi đoạn cách 1 dòng trống)...' : 'Lesson from the story (separate paragraphs with blank lines)...'}
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
        {stories.map(s => {
          const tag = STORY_TAGS[s.tag]
          return (
            <div key={s.id} className="admin-article-item">
              <div className="admin-article-info">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)', opacity: 0.5, minWidth: 28 }}>
                  {String(s.order).padStart(2, '0')}
                </span>
                <span className="admin-article-title">{lang === 'vi' ? s.titleVi : s.titleEn}</span>
                {tag && <span className={`story-tag tag-${s.tag}`} style={{ marginLeft: 8 }}>{lang === 'vi' ? tag.vi : tag.en}</span>}
                {s.contentVi && <span style={{ marginLeft: 8, fontSize: '0.65rem', color: 'var(--gold)', opacity: 0.5 }}>VI</span>}
                {s.contentEn && <span style={{ marginLeft: 4, fontSize: '0.65rem', color: 'var(--gold)', opacity: 0.5 }}>EN</span>}
              </div>
              <div className="admin-article-actions">
                <button className="btn-sm" onClick={() => startEdit(s)}>{t.adminEdit}</button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(s.id)}>{t.adminDelete}</button>
              </div>
            </div>
          )
        })}
        {stories.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 32 }}>
            {lang === 'vi' ? 'Chưa có câu chuyện. Bấm "Thêm câu chuyện" để bắt đầu.' : 'No stories yet. Click "Add story" to start.'}
          </div>
        )}
      </div>
    </>
  )
}
