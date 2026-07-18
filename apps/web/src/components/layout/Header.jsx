import { useEffect, useRef, useState } from 'react'
import SunIcon from '../shared/SunIcon'
import { DEFAULT_NAV_ITEMS, PAGE_MAP, PRIMARY_NAV_IDS } from '../../config/pages'

const pageHref = id => {
  const pageConfig = PAGE_MAP[id]
  if (!pageConfig) return `/${id}`
  return pageConfig.path ? `/${pageConfig.path}` : '/'
}

const isModifiedClick = event =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

export default function Header({ t, lang, dark, page, menuOpen, navigate, toggleTheme, setLang, setMenuOpen, user, navItems }) {
  const allItems = (navItems || DEFAULT_NAV_ITEMS).filter(i => i.visible)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  // Dropdown "Thêm": đóng khi click ra ngoài hoặc Escape
  useEffect(() => {
    if (!moreOpen) return
    const onDown = e => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setMoreOpen(false) }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  // Menu mở: Escape để đóng + khoá scroll nền
  useEffect(() => {
    if (!menuOpen) return
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [menuOpen, setMenuOpen])
  // 5 primary destinations; phần còn lại gom vào "Thêm" (audit: header quá nhiều mục)
  const mainNav = allItems.filter(i => PRIMARY_NAV_IDS.includes(i.id))
  const moreNav = allItems.filter(i => !PRIMARY_NAV_IDS.includes(i.id))
  const go = (event, id, beforeNavigate) => {
    if (event.defaultPrevented || isModifiedClick(event)) return
    event.preventDefault()
    beforeNavigate?.()
    navigate(id)
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <a className="logo" href="/" aria-label={t.siteName} onClick={event => go(event, 'home')}>
            <SunIcon size={28} />
            <span className="logo-text">{t.siteName}</span>
          </a>
          <nav className="desktop-nav" aria-label={lang === 'vi' ? 'Điều hướng chính' : 'Main navigation'}>
            {mainNav.map(item => (
              <a
                key={item.id}
                href={pageHref(item.id)}
                className={page === item.id ? 'active' : ''}
                aria-current={page === item.id ? 'page' : undefined}
                onClick={event => go(event, item.id)}
              >
                {lang === 'vi' ? item.labelVi : item.labelEn}
              </a>
            ))}
            {moreNav.length > 0 && (
              <div className="nav-more" ref={moreRef}>
                <button
                  className={moreNav.some(i => i.id === page) ? 'active' : ''}
                  onClick={() => setMoreOpen(o => !o)}
                  aria-haspopup="menu" aria-expanded={moreOpen}
                >
                  {lang === 'vi' ? 'Thêm' : 'More'} <span className="nav-more-caret" aria-hidden="true">▾</span>
                </button>
                {moreOpen && (
                  <div className="nav-more-menu" role="menu">
                    {moreNav.map(item => (
                      <a
                        key={item.id}
                        href={pageHref(item.id)}
                        role="menuitem"
                        className={page === item.id ? 'active' : ''}
                        aria-current={page === item.id ? 'page' : undefined}
                        onClick={event => go(event, item.id, () => setMoreOpen(false))}
                      >
                        {lang === 'vi' ? item.labelVi : item.labelEn}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme} title={dark ? t.lightMode : t.darkMode}
              aria-label={dark ? t.lightMode : t.darkMode}>
              <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
            </button>
            <button className="lang-btn" onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}
              aria-label={lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
            <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)}
              aria-label={t.menuOpen} aria-expanded={menuOpen} aria-controls="overlay-nav">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* inert khi đóng: loại toàn bộ controls khỏi keyboard/accessibility tree
          (opacity 0 + pointer-events none không đủ — vẫn Tab vào được) */}
      <div id="overlay-nav" className={`overlay-nav ${menuOpen ? 'open' : ''}`}
        inert={menuOpen ? undefined : ''}>
        <button className="overlay-close" onClick={() => setMenuOpen(false)}
          aria-label={lang === 'vi' ? 'Đóng menu' : 'Close menu'}>✕</button>
        <nav className="overlay-links">
          {allItems.map(item => (
            <a
              key={item.id}
              href={pageHref(item.id)}
              className={page === item.id ? 'active' : ''}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={event => go(event, item.id)}
            >
              {lang === 'vi' ? item.labelVi : item.labelEn}
            </a>
          ))}
          <div className="overlay-divider" />
          <a href={pageHref('admin')} className={`overlay-login ${page === 'admin' ? 'active' : ''}`}
            aria-current={page === 'admin' ? 'page' : undefined} onClick={event => go(event, 'admin')}>
            {user ? (lang === 'vi' ? 'Quản trị' : 'Admin') : (lang === 'vi' ? 'Đăng nhập' : 'Sign in')}
          </a>
        </nav>
      </div>
    </>
  )
}
