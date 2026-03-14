import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import ArticlesTab from './admin/ArticlesTab'
import TopicsTab from './admin/TopicsTab'
import TranslationsTab from './admin/TranslationsTab'
import StoriesTab from './admin/StoriesTab'
import KhaiTriTab from './admin/KhaiTriTab'
import TeachingsTab from './admin/TeachingsTab'
import PracticesTab from './admin/PracticesTab'
import SettingsTab from './admin/SettingsTab'
import HomeSettingsTab from './admin/HomeSettingsTab'

const TABS = [
  { id: 'articles', icon: '📝', vi: 'Bài viết', en: 'Articles' },
  { id: 'stories', icon: '📖', vi: 'Câu chuyện', en: 'Stories' },
  { id: 'khaitri', icon: '💡', vi: 'Khai Trí', en: 'Khai Trí' },
  { id: 'teachings', icon: 'ℹ️', vi: 'Giới Thiệu', en: 'Teachings' },
  { id: 'practices', icon: '☀️', vi: 'Thái Dương Quyền', en: 'Solar Fist' },
  { id: 'topics', icon: '🏷️', vi: 'Chủ đề', en: 'Topics' },
  { id: 'translations', icon: '🌐', vi: 'Ngôn ngữ', en: 'Translations' },
  { id: 'homepage', icon: '🏠', vi: 'Trang chủ', en: 'Home Page' },
  { id: 'settings', icon: '⚙️', vi: 'Cài đặt', en: 'Settings' },
]

export default function AdminPanel({
  t, lang, user, articles, topics, stories, firestoreVi, firestoreEn,
  khaitri, teachings, practices,
  onAddArticle, onUpdateArticle, onDeleteArticle,
  onAddTopic, onUpdateTopic, onDeleteTopic,
  onAddStory, onUpdateStory, onDeleteStory,
  onAddKhaiTri, onUpdateKhaiTri, onDeleteKhaiTri,
  onAddTeaching, onUpdateTeaching, onDeleteTeaching,
  onAddPractice, onUpdatePractice, onDeletePractice,
  onUpdateTranslations,
  siteSettings, onUpdateSettings,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('articles')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <div className="admin-login-wrap fade-up">
        <div className="admin-login-card">
          <h2>{t.adminLogin}</h2>
          <p className="admin-login-subtitle">
            {lang === 'vi' ? 'Đăng nhập để quản lý nội dung' : 'Sign in to manage content'}
          </p>
          {error && <div className="admin-error">{error}</div>}
          <form className="admin-login-form" onSubmit={handleLogin}>
            <input type="email" placeholder={t.adminEmail} value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder={t.adminPassword} value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="cta-btn">{t.adminSignIn}</button>
          </form>
        </div>
      </div>
    )
  }

  const counts = {
    articles: articles.length,
    stories: stories.length,
    khaitri: khaitri.length,
    teachings: teachings.length,
    practices: practices.length,
    topics: topics.length,
  }

  const activeTab = TABS.find(tb => tb.id === tab)

  return (
    <div className="fade-up">
      {/* Mobile toggle */}
      <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span>{activeTab?.icon}</span>
        <span>{lang === 'vi' ? activeTab?.vi : activeTab?.en}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>{sidebarOpen ? '▲' : '▼'}</span>
      </button>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-email">{user.email}</span>
            <button className="admin-sidebar-signout" onClick={() => signOut(auth)}>
              {t.adminSignOut}
            </button>
          </div>
          <nav className="admin-nav">
            {TABS.map(tb => (
              <button
                key={tb.id}
                className={`admin-nav-item ${tab === tb.id ? 'active' : ''}`}
                onClick={() => { setTab(tb.id); setSidebarOpen(false) }}
              >
                <span className="admin-nav-icon">{tb.icon}</span>
                <span className="admin-nav-label">{lang === 'vi' ? tb.vi : tb.en}</span>
                {counts[tb.id] != null && <span className="admin-nav-count">{counts[tb.id]}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="admin-content">
          <div className="admin-content-header">
            <h2 className="admin-content-title">
              {lang === 'vi' ? activeTab?.vi : activeTab?.en}
            </h2>
          </div>

          {tab === 'articles' && <ArticlesTab t={t} lang={lang} articles={articles} topics={topics} onAdd={onAddArticle} onUpdate={onUpdateArticle} onDelete={onDeleteArticle} />}
          {tab === 'stories' && <StoriesTab t={t} lang={lang} stories={stories} onAdd={onAddStory} onUpdate={onUpdateStory} onDelete={onDeleteStory} />}
          {tab === 'khaitri' && <KhaiTriTab t={t} lang={lang} items={khaitri} onAdd={onAddKhaiTri} onUpdate={onUpdateKhaiTri} onDelete={onDeleteKhaiTri} />}
          {tab === 'teachings' && <TeachingsTab t={t} lang={lang} items={teachings} onAdd={onAddTeaching} onUpdate={onUpdateTeaching} onDelete={onDeleteTeaching} />}
          {tab === 'practices' && <PracticesTab t={t} lang={lang} items={practices} onAdd={onAddPractice} onUpdate={onUpdatePractice} onDelete={onDeletePractice} />}
          {tab === 'topics' && <TopicsTab t={t} lang={lang} topics={topics} onAdd={onAddTopic} onUpdate={onUpdateTopic} onDelete={onDeleteTopic} />}
          {tab === 'translations' && <TranslationsTab lang={lang} firestoreVi={firestoreVi} firestoreEn={firestoreEn} onUpdate={onUpdateTranslations} />}
          {tab === 'homepage' && <HomeSettingsTab lang={lang} settings={siteSettings} onUpdate={onUpdateSettings} />}
          {tab === 'settings' && <SettingsTab lang={lang} settings={siteSettings} onUpdate={onUpdateSettings} />}
        </div>
      </div>
    </div>
  )
}
