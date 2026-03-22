import { useState, useRef, useEffect, useCallback } from 'react'

export default function InlineEdit({ value, onSave, lang, label }) {
  const [text, setText] = useState(value || '')
  const [saving, setSaving] = useState(false)
  const dialogRef = useRef(null)
  const textareaRef = useRef(null)

  const open = () => {
    setText(value || '')
    dialogRef.current?.showModal()
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(0, 0)
    }, 50)
  }

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // Backdrop click to close (native dialog puts ::backdrop behind, click on dialog = backdrop)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClick = (e) => { if (e.target === dialog) close() }
    dialog.addEventListener('click', onClick)
    return () => dialog.removeEventListener('click', onClick)
  }, [close])

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

  return (
    <>
      <button
        className="inline-edit-trigger"
        onClick={open}
        title={lang === 'vi' ? 'Chỉnh sửa' : 'Edit'}
      >
        ✏️
      </button>

      {/* Native <dialog> — automatic backdrop, escape, focus trap, z-index, scroll lock */}
      <dialog ref={dialogRef} className="ie-dialog">
        <div className="ie-drag" onClick={close}><span className="ie-drag-bar" /></div>
        <div className="ie-header">
          <span className="ie-label">{label || (lang === 'vi' ? 'Chỉnh sửa' : 'Edit')}</span>
          <button className="ie-close" onClick={close}>&times;</button>
        </div>
        <div className="ie-hint">
          {lang === 'vi' ? 'Xuống 2 dòng để tách đoạn' : 'Double line break = new paragraph'}
        </div>
        <textarea
          ref={textareaRef}
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
      </dialog>
    </>
  )
}
