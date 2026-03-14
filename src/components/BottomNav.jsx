import { DEFAULT_NAV_ITEMS } from '../config/pages'
import { NAV_SVG_ICONS } from '../config/navIcons'

export default function BottomNav({ t, lang, page, navigate, navItems }) {
  const items = (navItems || DEFAULT_NAV_ITEMS)
    .filter(i => i.visible && i.showInBottom)
    .slice(0, 5)

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
          {NAV_SVG_ICONS[item.id] || NAV_SVG_ICONS.home}
          {lang === 'vi' ? item.labelVi : item.labelEn}
        </button>
      ))}
    </nav>
  )
}
