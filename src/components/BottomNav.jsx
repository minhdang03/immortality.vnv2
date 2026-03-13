export default function BottomNav({ t, page, navigate }) {
  return (
    <nav className="bottom-nav">
      <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        {t.navHome}
      </button>
      <button className={page === 'about' ? 'active' : ''} onClick={() => navigate('about')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        {t.navAbout || 'About'}
      </button>
      <button className={page === 'search' ? 'active' : ''} onClick={() => navigate('search')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        {t.navSearch}
      </button>
      <button className={page === 'contact' ? 'active' : ''} onClick={() => navigate('contact')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        {t.navContact}
      </button>
    </nav>
  )
}
