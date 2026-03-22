import { useState } from 'react'
import { useComments } from '../../hooks/useComments'

export default function Comments({ articleId, t, user }) {
  const isAdmin = !!user
  const { comments, addComment, approveComment, deleteComment } = useComments(articleId, isAdmin)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setSending(true)
    const result = await addComment(name.trim(), text.trim())
    setSending(false)
    if (result?.error === 'rate_limited') {
      setRateLimited(true)
      return
    }
    setName('')
    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">{t.comments} ({comments.length})</h3>

      {comments.length === 0 && !isAdmin && (
        <p className="comments-empty">{t.commentEmpty}</p>
      )}

      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className={`comment-item${c.status === 'pending' ? ' comment-pending' : ''}`}>
            <div className="comment-header">
              <span className="comment-author">{c.name}</span>
              <span className="comment-date">
                {c.createdAt ? new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleDateString('vi-VN') : ''}
              </span>
              {isAdmin && c.status === 'pending' && (
                <span className="comment-badge-pending">Chờ duyệt</span>
              )}
              {isAdmin && (
                <div className="comment-admin-actions">
                  {c.status === 'pending' && (
                    <button className="comment-approve-btn" onClick={() => approveComment(c.id)} title="Duyệt">✓ Duyệt</button>
                  )}
                  <button className="comment-delete-btn" onClick={() => deleteComment(c.id)} title="Xóa">✕ Xóa</button>
                </div>
              )}
            </div>
            <p className="comment-text">{c.text}</p>
          </div>
        ))}
        {isAdmin && comments.length === 0 && (
          <p className="comments-empty">Chưa có bình luận nào.</p>
        )}
      </div>

      {submitted && (
        <p className="comment-success">Bình luận của bạn đang chờ duyệt. Cảm ơn!</p>
      )}

      {rateLimited ? (
        <p className="comment-rate-limit">Bạn đã gửi quá nhiều bình luận. Vui lòng thử lại sau 1 giờ.</p>
      ) : (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t.commentName}
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            required
          />
          <textarea
            placeholder={t.commentText}
            value={text}
            onChange={e => setText(e.target.value)}
            required
            rows={3}
            maxLength={1000}
          />
          <button type="submit" disabled={sending}>
            {sending ? '...' : t.commentSend}
          </button>
        </form>
      )}
    </div>
  )
}
