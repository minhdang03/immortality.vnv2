import { useState } from 'react'
import { clearAllCaches } from '../lib/swr-cache'
import { ADMIN_TABS } from '../config/pages'
import ArticlesTab from './admin/ArticlesTab'
import TopicsTab from './admin/TopicsTab'
import TranslationsTab from './admin/TranslationsTab'
import StoriesTab from './admin/StoriesTab'
import KhaiTriTab from './admin/KhaiTriTab'
import TeachingsTab from './admin/TeachingsTab'
import PracticesTab from './admin/PracticesTab'
import SettingsTab from './admin/SettingsTab'
import HomeSettingsTab from './admin/HomeSettingsTab'
import DonationsTab from './admin/DonationsTab'
import ContactsTab from './admin/ContactsTab'
import AdminUsersTab from './admin/AdminUsersTab'
import AgentLogTab from './admin/AgentLogTab'
import CategoriesTab from './admin/CategoriesTab'
import ContentAnalyticsTab from './admin/ContentAnalyticsTab'

// Tabs each non-admin role may access. Admin sees everything (no entry needed).
// Supabase profiles.role is 3-tier: 'admin' | 'mod' | 'user'. Mods moderate content.
const ROLE_TABS = {
  'mod': new Set(['articles', 'khaitri', 'stories', 'contacts', 'ungho']),
}

export default function AdminPanel({
  t, lang, user, userRole, articles, topics, stories, viStrings, enStrings,
  khaitri, teachings, practices,
  onAddArticle, onUpdateArticle, onDeleteArticle,
  onAddTopic, onUpdateTopic, onDeleteTopic,
  onAddStory, onUpdateStory, onDeleteStory,
  onAddKhaiTri, onUpdateKhaiTri, onDeleteKhaiTri,
  onAddTeaching, onUpdateTeaching, onDeleteTeaching,
  onAddPractice, onUpdatePractice, onDeletePractice,
  onUpdateTranslations,
  siteSettings, onUpdateSettings,
  // Supabase auth helpers.
  supabaseSignIn, supabaseSignOut,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState(() => localStorage.getItem('adminTab') || 'articles')

  const switchTab = (id) => { setTab(id); localStorage.setItem('adminTab', id) }
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { error } = await supabaseSignIn(email, password)
      if (error) setError(t.loginError)
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

  // Per-role tab visibility — FAIL-CLOSED: chỉ 'admin' thấy hết;
  // role có trong ROLE_TABS thấy đúng tab của mình; role lạ/'user' không thấy gì
  // (trước đây role lạ rơi vào nhánh "thấy tất cả" — lỗ hổng audit P0 #5).
  const allowed = ROLE_TABS[userRole]
  const visibleTabs = userRole === 'admin'
    ? ADMIN_TABS
    : allowed
      ? ADMIN_TABS.filter(tb => allowed.has(tb.id))
      : []

  // If current tab is hidden for this role, fall back to first visible
  const activeTab = visibleTabs.find(tb => tb.id === tab) || visibleTabs[0]
  const effectiveTab = activeTab?.id

  // Role không có quyền tab nào → thông báo rõ thay vì panel trống
  if (visibleTabs.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign: 'center', padding: '64px 20px' }}>
        <p style={{ color: 'var(--text-dim)' }}>
          {lang === 'vi'
            ? 'Tài khoản của bạn chưa được cấp quyền quản trị. Liên hệ admin để được cấp role.'
            : 'Your account has no admin permissions. Contact an admin to be granted a role.'}
        </p>
      </div>
    )
  }

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
            <button className="admin-sidebar-signout" onClick={async () => {
              clearAllCaches()
              await supabaseSignOut()  // clearAllCaches also called via onAuthStateChange
            }}>
              {t.adminSignOut}
            </button>
          </div>
          {userRole && (
            <div style={{ padding: '8px 16px', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {userRole === 'admin' ? '🛡 Admin' :
               userRole === 'agent' ? '🤖 Agent' :
               (userRole === 'mod-articles' || userRole === 'moderator') ? '✍️ Mod Articles' :
               userRole === 'mod-khaitri' ? '💡 Mod Khai Trí' :
               `👤 ${userRole}`}
            </div>
          )}
          <nav className="admin-nav">
            {visibleTabs.map(tb => (
              <button
                key={tb.id}
                className={`admin-nav-item ${effectiveTab === tb.id ? 'active' : ''}`}
                onClick={() => { switchTab(tb.id); setSidebarOpen(false) }}
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

          {effectiveTab === 'articles' && <ArticlesTab t={t} lang={lang} articles={articles} topics={topics} onAdd={onAddArticle} onUpdate={onUpdateArticle} onDelete={onDeleteArticle} />}
          {effectiveTab === 'stories' && <StoriesTab t={t} lang={lang} stories={stories} onAdd={onAddStory} onUpdate={onUpdateStory} onDelete={onDeleteStory} />}
          {effectiveTab === 'khaitri' && <KhaiTriTab t={t} lang={lang} items={khaitri} onAdd={onAddKhaiTri} onUpdate={onUpdateKhaiTri} onDelete={onDeleteKhaiTri} />}
          {effectiveTab === 'teachings' && <TeachingsTab t={t} lang={lang} items={teachings} onAdd={onAddTeaching} onUpdate={onUpdateTeaching} onDelete={onDeleteTeaching} />}
          {effectiveTab === 'practices' && <PracticesTab t={t} lang={lang} items={practices} onAdd={onAddPractice} onUpdate={onUpdatePractice} onDelete={onDeletePractice} />}
          {effectiveTab === 'topics' && <TopicsTab t={t} lang={lang} topics={topics} onAdd={onAddTopic} onUpdate={onUpdateTopic} onDelete={onDeleteTopic} />}
          {effectiveTab === 'translations' && <TranslationsTab lang={lang} viStrings={viStrings} enStrings={enStrings} onUpdate={onUpdateTranslations} />}
          {effectiveTab === 'homepage' && <HomeSettingsTab lang={lang} settings={siteSettings} onUpdate={onUpdateSettings} />}
          {effectiveTab === 'ungho' && <DonationsTab t={t} lang={lang} />}
          {effectiveTab === 'contacts' && <ContactsTab lang={lang} />}
          {effectiveTab === 'settings' && <SettingsTab lang={lang} settings={siteSettings} onUpdate={onUpdateSettings} />}
          {effectiveTab === 'admins' && <AdminUsersTab lang={lang} currentUser={user} />}
          {effectiveTab === 'agentlog' && <AgentLogTab lang={lang} />}
          {effectiveTab === 'categories' && <CategoriesTab lang={lang} />}
          {effectiveTab === 'analytics' && <ContentAnalyticsTab lang={lang} />}
        </div>
      </div>
    </div>
  )
}
