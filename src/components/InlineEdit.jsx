import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function InlineEdit({ value, onSave, lang, label }) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [text, setText] = useState(value || '')
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)

  const close = useCallback(() => {
    setClosing(true)
    setTimeout(() => { setOpen(false); setClosing(false) }, 200)
  }, [])

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus()
      ref.current.setSelectionRange(0, 0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(text)
      close()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const modal = open ? createPortal(
    <div className={`ie-overlay ${closing ? 'ie-closing' : ''}`}>
      {/* Backdrop — separate clickable element */}
      <div className="ie-backdrop" onClick={close} />

      <div className="ie-modal">
        <div className="ie-drag" onClick={close}><span className="ie-drag-bar" /></div>
        <div className="ie-header">
          <span className="ie-label">{label || (lang === 'vi' ? 'Chỉnh sửa' : 'Edit')}</span>
          <button className="ie-close" onClick={close}>&times;</button>
        </div>
        <div className="ie-hint">
          {lang === 'vi' ? 'Xuống 2 dòng để tách đoạn' : 'Double line break = new paragraph'}
        </div>
        <textarea
          ref={ref}
          className="ie-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={10}
        />
        <div className="ie-actions">
          <button className="ie-btn-cancel" onClick={close}>
            {lang === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button className="ie-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '...' : (lang === 'vi' ? 'Lưu thay đổi' : 'Save')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <button
        className="inline-edit-trigger"
        onClick={() => { setText(value || ''); setOpen(true) }}
        title={lang === 'vi' ? 'Chỉnh sửa' : 'Edit'}
      >
        ✏️
      </button>
      {modal}
    </>
  )
}
