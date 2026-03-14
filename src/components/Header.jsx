import SunIcon from './SunIcon'
import { DEFAULT_NAV_ITEMS } from '../config/pages'

// Items that go in the right actions group instead of main nav
const ACTION_IDS = ['contact']

export default function Header({ t, lang, dark, page, menuOpen, navigate, toggleTheme, setLang, setMenuOpen, user, navItems }) {
  const allItems = (navItems || DEFAULT_NAV_ITEMS).filter(i => i.visible)
  const mainNav = allItems.filter(i => !ACTION_IDS.includes(i.id))
  const actionNav = allItems.filter(i => ACTION_IDS.includes(i.id))

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('home')}>
            <SunIcon size={28} />
            <span className="logo-text">{t.siteName}</span>
          </div>
          <div className="desktop-nav">
            {mainNav.map(item => (
              <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
                {lang === 'vi' ? item.labelVi : item.labelEn}
              </button>
            ))}
          </div>
          <div className="header-actions">
            {actionNav.map(item => (
              <button key={item.id} className={`header-action-nav ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                {lang === 'vi' ? item.labelVi : item.labelEn}
              </button>
            ))}
            <button
              className={`login-btn ${page === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('admin')}
              title={user ? 'Admin' : (lang === 'vi' ? 'Đăng nhập' : 'Sign in')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {user
                  ? <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>
                  : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
                }
              </svg>
            </button>
            <button className="theme-btn" onClick={toggleTheme} title={dark ? t.lightMode : t.darkMode}>
              {dark ? '☀' : '☾'}
            </button>
            <button className="lang-btn" onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}>
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
            <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label={t.menuOpen}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`overlay-nav ${menuOpen ? 'open' : ''}`}>
        <button className="overlay-close" onClick={() => setMenuOpen(false)} aria-label="Close">✕</button>
        <nav className="overlay-links">
          {allItems.map(item => (
            <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
              {lang === 'vi' ? item.labelVi : item.labelEn}
            </button>
          ))}
          <div className="overlay-divider" />
          <button className={`overlay-login ${page === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')}>
            {user ? (lang === 'vi' ? 'Quản trị' : 'Admin') : (lang === 'vi' ? 'Đăng nhập' : 'Sign in')}
          </button>
        </nav>
      </div>
    </>
  )
}
