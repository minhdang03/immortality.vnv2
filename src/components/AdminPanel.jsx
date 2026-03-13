import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import ArticlesTab from './admin/ArticlesTab'
import TopicsTab from './admin/TopicsTab'
import TranslationsTab from './admin/TranslationsTab'
import StoriesTab from './admin/StoriesTab'
import RevelationsTab from './admin/RevelationsTab'
import TeachingsTab from './admin/TeachingsTab'
import PracticesTab from './admin/PracticesTab'

export default function AdminPanel({
  t, lang, user, articles, topics, stories, firestoreVi, firestoreEn,
  revelations, teachings, practices,
  onAddArticle, onUpdateArticle, onDeleteArticle,
  onAddTopic, onUpdateTopic, onDeleteTopic,
  onAddStory, onUpdateStory, onDeleteStory,
  onAddRevelation, onUpdateRevelation, onDeleteRevelation,
  onAddTeaching, onUpdateTeaching, onDeleteTeaching,
  onAddPractice, onUpdatePractice, onDeletePractice,
  onUpdateTranslations,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('articles')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError(t.loginError)
    }
  }

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

  const TABS = [
    { id: 'articles', vi: 'Bài viết', en: 'Articles' },
    { id: 'stories', vi: 'Câu chuyện', en: 'Stories' },
    { id: 'revelations', vi: 'Khai Thị', en: 'Revelations' },
    { id: 'teachings', vi: 'Giới Thiệu', en: 'Teachings' },
    { id: 'practices', vi: 'Thái Dương Quyền', en: 'Solar Fist' },
    { id: 'topics', vi: 'Chủ đề', en: 'Topics' },
    { id: 'translations', vi: 'Ngôn ngữ', en: 'Translations' },
  ]

  return (
    <section className="section fade-up">
      <div className="admin-header">
        <h2 className="section-title">{t.adminTitle}</h2>
        <div className="admin-actions-top">
          <span className="admin-user">{user.email}</span>
          <button className="btn-video" onClick={() => signOut(auth)}>{t.adminSignOut}</button>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map(tb => (
          <button key={tb.id} className={`admin-tab ${tab === tb.id ? 'active' : ''}`} onClick={() => setTab(tb.id)}>
            {lang === 'vi' ? tb.vi : tb.en}
          </button>
        ))}
      </div>

      {tab === 'articles' && <ArticlesTab t={t} lang={lang} articles={articles} topics={topics} onAdd={onAddArticle} onUpdate={onUpdateArticle} onDelete={onDeleteArticle} />}
      {tab === 'stories' && <StoriesTab t={t} lang={lang} stories={stories} onAdd={onAddStory} onUpdate={onUpdateStory} onDelete={onDeleteStory} />}
      {tab === 'revelations' && <RevelationsTab t={t} lang={lang} items={revelations} onAdd={onAddRevelation} onUpdate={onUpdateRevelation} onDelete={onDeleteRevelation} />}
      {tab === 'teachings' && <TeachingsTab t={t} lang={lang} items={teachings} onAdd={onAddTeaching} onUpdate={onUpdateTeaching} onDelete={onDeleteTeaching} />}
      {tab === 'practices' && <PracticesTab t={t} lang={lang} items={practices} onAdd={onAddPractice} onUpdate={onUpdatePractice} onDelete={onDeletePractice} />}
      {tab === 'topics' && <TopicsTab t={t} lang={lang} topics={topics} onAdd={onAddTopic} onUpdate={onUpdateTopic} onDelete={onDeleteTopic} />}
      {tab === 'translations' && <TranslationsTab lang={lang} firestoreVi={firestoreVi} firestoreEn={firestoreEn} onUpdate={onUpdateTranslations} />}
    </section>
  )
}
