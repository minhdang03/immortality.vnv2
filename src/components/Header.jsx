import SunIcon from './SunIcon'

export default function Header({ t, lang, dark, page, menuOpen, navigate, toggleTheme, setLang, setMenuOpen, user }) {
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('home')}>
            <SunIcon size={28} />
            <span className="logo-text">{t.siteName}</span>
          </div>
          <div className="desktop-nav">
            <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>{t.navHome}</button>
            <button className={page === 'about' ? 'active' : ''} onClick={() => navigate('about')}>{lang === 'vi' ? 'Giới thiệu' : 'About'}</button>
            <button className={page === 'search' ? 'active' : ''} onClick={() => navigate('search')}>{t.navSearch}</button>
            <button className={page === 'contact' ? 'active' : ''} onClick={() => navigate('contact')}>{t.navContact}</button>
          </div>
          <div className="header-actions">
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
          <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>{t.navHome}</button>
          <button className={page === 'about' ? 'active' : ''} onClick={() => navigate('about')}>{lang === 'vi' ? 'Giới thiệu' : 'About'}</button>
          <button className={page === 'search' ? 'active' : ''} onClick={() => navigate('search')}>{t.navSearch}</button>
          <button className={page === 'contact' ? 'active' : ''} onClick={() => navigate('contact')}>{t.navContact}</button>
          <div className="overlay-divider" />
          <button className={`overlay-login ${page === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')}>
            {user ? (lang === 'vi' ? 'Quản trị' : 'Admin') : (lang === 'vi' ? 'Đăng nhập' : 'Sign in')}
          </button>
        </nav>
      </div>
    </>
  )
}
