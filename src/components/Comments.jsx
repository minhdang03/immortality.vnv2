import { useState } from 'react'
import { useComments } from '../hooks/useFirestore'

export default function Comments({ articleId, t }) {
  const { comments, addComment } = useComments(articleId)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setSending(true)
    await addComment(name.trim(), text.trim())
    setName('')
    setText('')
    setSending(false)
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">{t.comments} ({comments.length})</h3>

      {comments.length === 0 && (
        <p className="comments-empty">{t.commentEmpty}</p>
      )}

      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{c.name}</span>
              <span className="comment-date">
                {c.createdAt ? new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="comment-text">{c.text}</p>
          </div>
        ))}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t.commentName}
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <textarea
          placeholder={t.commentText}
          value={text}
          onChange={e => setText(e.target.value)}
          required
          rows={3}
        />
        <button type="submit" disabled={sending}>
          {sending ? '...' : t.commentSend}
        </button>
      </form>
    </div>
  )
}
