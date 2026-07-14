import { useEffect, useRef, useState } from 'react'
import SunIcon from '../shared/SunIcon'
import { DEFAULT_NAV_ITEMS, PRIMARY_NAV_IDS } from '../../config/pages'

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
  const goMore = (id) => { setMoreOpen(false); navigate(id) }

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
                      <button key={item.id} role="menuitem" className={page === item.id ? 'active' : ''} onClick={() => goMore(item.id)}>
                        {lang === 'vi' ? item.labelVi : item.labelEn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme} title={dark ? t.lightMode : t.darkMode}>
              {dark ? '☀' : '☾'}
            </button>
            <button className="lang-btn" onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}>
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
