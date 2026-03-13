import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { TOPICS } from '../data'

const EMPTY_FORM = {
  topic: 'mat-ngu',
  date: new Date().toISOString().split('T')[0],
  tagVi: '', tagEn: '',
  titleVi: '', titleEn: '',
  questionVi: '', questionEn: '',
  summaryVi: '', summaryEn: '',
  bodyVi: '', bodyEn: '',
}

export default function AdminPanel({ t, user, articles, onAdd, onUpdate, onDelete }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | article id
  const [form, setForm] = useState(EMPTY_FORM)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError(t.loginError)
    }
  }

  const handleLogout = () => signOut(auth)

  const startNew = () => {
    setForm(EMPTY_FORM)
    setEditing('new')
  }

  const startEdit = (article) => {
    setForm({
      topic: article.topic,
      date: article.date,
      tagVi: article.tag?.vi || '',
      tagEn: article.tag?.en || '',
      titleVi: article.vi?.title || '',
      titleEn: article.en?.title || '',
      questionVi: article.vi?.question || '',
      questionEn: article.en?.question || '',
      summaryVi: article.vi?.summary || '',
      summaryEn: article.en?.summary || '',
      bodyVi: article.vi?.body || '',
      bodyEn: article.en?.body || '',
    })
    setEditing(article.id)
  }

  const handleSave = async () => {
    const articleData = {
      topic: form.topic,
      date: form.date,
      tag: { vi: form.tagVi, en: form.tagEn },
      vi: { title: form.titleVi, question: form.questionVi, summary: form.summaryVi, body: form.bodyVi },
      en: { title: form.titleEn, question: form.questionEn, summary: form.summaryEn, body: form.bodyEn },
    }
    if (editing === 'new') {
      await onAdd(articleData)
    } else {
      await onUpdate(editing, articleData)
    }
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t.adminConfirmDelete)) {
      await onDelete(id)
    }
  }

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Not logged in
  if (!user) {
    return (
      <section className="section fade-up">
        <h2 className="section-title">{t.adminLogin}</h2>
        {error && <div className="admin-error">{error}</div>}
        <form className="admin-login-form" onSubmit={handleLogin}>
          <input type="email" placeholder={t.adminEmail} value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder={t.adminPassword} value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="cta-btn">{t.adminSignIn}</button>
        </form>
      </section>
    )
  }

  // Logged in
  return (
    <section className="section fade-up">
      <div className="admin-header">
        <h2 className="section-title">{t.adminTitle}</h2>
        <div className="admin-actions-top">
          <span className="admin-user">{user.email}</span>
          <button className="btn-read" onClick={startNew}>{t.adminAdd}</button>
          <button className="btn-video" onClick={handleLogout}>{t.adminSignOut}</button>
        </div>
      </div>

      {/* EDIT / NEW FORM */}
      {editing !== null && (
        <div className="admin-form">
          <div className="admin-form-row">
            <label>{t.adminTopic}</label>
            <select value={form.topic} onChange={e => setField('topic', e.target.value)}>
              {TOPICS.map(tp => <option key={tp.id} value={tp.id}>{tp.vi}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <label>{t.adminDate}</label>
            <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
          </div>
          <div className="admin-form-grid">
            <div>
              <label>{t.adminTagVi}</label>
              <input value={form.tagVi} onChange={e => setField('tagVi', e.target.value)} />
            </div>
            <div>
              <label>{t.adminTagEn}</label>
              <input value={form.tagEn} onChange={e => setField('tagEn', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-grid">
            <div>
              <label>{t.adminTitleVi}</label>
              <input value={form.titleVi} onChange={e => setField('titleVi', e.target.value)} />
            </div>
            <div>
              <label>{t.adminTitleEn}</label>
              <input value={form.titleEn} onChange={e => setField('titleEn', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-grid">
            <div>
              <label>{t.adminQuestionVi}</label>
              <textarea value={form.questionVi} onChange={e => setField('questionVi', e.target.value)} rows={2} />
            </div>
            <div>
              <label>{t.adminQuestionEn}</label>
              <textarea value={form.questionEn} onChange={e => setField('questionEn', e.target.value)} rows={2} />
            </div>
          </div>
          <div className="admin-form-grid">
            <div>
              <label>{t.adminSummaryVi}</label>
              <textarea value={form.summaryVi} onChange={e => setField('summaryVi', e.target.value)} rows={3} />
            </div>
            <div>
              <label>{t.adminSummaryEn}</label>
              <textarea value={form.summaryEn} onChange={e => setField('summaryEn', e.target.value)} rows={3} />
            </div>
          </div>
          <div className="admin-form-grid">
            <div>
              <label>{t.adminBodyVi}</label>
              <textarea value={form.bodyVi} onChange={e => setField('bodyVi', e.target.value)} rows={6} />
            </div>
            <div>
              <label>{t.adminBodyEn}</label>
              <textarea value={form.bodyEn} onChange={e => setField('bodyEn', e.target.value)} rows={6} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn-read" onClick={handleSave}>{t.adminSave}</button>
            <button className="btn-video" onClick={() => setEditing(null)}>{t.adminCancel}</button>
          </div>
        </div>
      )}

      {/* ARTICLES LIST */}
      <div className="admin-articles">
        {articles.filter(a => !a.id.startsWith('default-')).map(a => (
          <div key={a.id} className="admin-article-item">
            <div className="admin-article-info">
              <span className="article-tag">{a.tag?.vi}</span>
              <span className="article-date">{a.date}</span>
              <span className="admin-article-title">{a.vi?.title}</span>
            </div>
            <div className="admin-article-actions">
              <button className="btn-sm" onClick={() => startEdit(a)}>{t.adminEdit}</button>
              <button className="btn-sm btn-danger" onClick={() => handleDelete(a.id)}>{t.adminDelete}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
