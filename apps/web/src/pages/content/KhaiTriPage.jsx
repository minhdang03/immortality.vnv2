import { useState, useEffect } from 'react'
import { khaitriSlug } from '../../utils/slug'
import { updateCanonical } from '../../hooks/useSEO'
import KhaiTriList from '../../components/khaitri/KhaiTriList'
import KhaiTriDetail from '../../components/khaitri/KhaiTriDetail'
import { DetailSkeleton } from '../../components/shared/Skeleton'

export default function KhaiTriPage({ t, lang, items, fresh, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, user, onUpdateKhaiTri }) {
  const [selected, setSelected] = useState(null)

  // Sync selected from URL pathname — re-runs when items grow (cache → Firestore) and on browser back/forward.
  // Replaces the old hashApplied 1-shot ref which got stuck when stale localStorage cache had no matching item.
  useEffect(() => {
    const sync = () => {
      const path = window.location.pathname
      if (path.startsWith('/khaitri/')) {
        const slug = path.slice(9)
        const found = items.find(it => khaitriSlug(it) === slug || String(it.order) === slug || it.id === slug)
        if (found) setSelected(found)
        // Not found yet → effect will re-run when items grow; do NOT clear selected (avoid flash)
      } else {
        setSelected(null) // path is /khaitri (list) or unrelated
      }
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [items])

  // Update document title and og:url when viewing a detail
  useEffect(() => {
    if (selected) {
      const d = selected[lang === 'vi' ? 'vi' : 'en'] || {}
      const title = d.question
      if (title) document.title = `${title} | ${t.siteName}`
    } else {
      document.title = `${lang === 'vi' ? 'Khai Trí' : 'Khai Trí'} | ${t.siteName}`
    }
    updateCanonical()
  }, [selected, lang])

  const selectItem = (item) => {
    setSelected(item)
    history.pushState({}, '', `/khaitri/${khaitriSlug(item)}`)
    window.scrollTo(0, 0)
  }

  const goBack = (nextItem) => {
    if (nextItem && nextItem.id) {
      selectItem(nextItem)
    } else {
      setSelected(null)
      history.pushState({}, '', '/khaitri')
    }
  }

  if (selected) {
    return (
      <KhaiTriDetail
        item={selected} lang={lang} t={t} navigate={navigate}
        fontSize={fontSize} onFontIncrease={onFontIncrease} onFontDecrease={onFontDecrease} onFontReset={onFontReset}
        onBack={goBack} allItems={items}
        user={user} onUpdate={onUpdateKhaiTri}
      />
    )
  }

  // Deep-link refresh: URL says /khaitri/<slug> but the slug isn't matched yet.
  // Hold the skeleton until Firestore confirms a fresh snapshot — otherwise a
  // stale SWR cache (length > 0, missing the new slug) would flash the list view.
  const isDeepLink = typeof window !== 'undefined' && window.location.pathname.startsWith('/khaitri/')
  if (isDeepLink && !fresh) return <DetailSkeleton />


  return <KhaiTriList items={items} lang={lang} onSelect={selectItem} />
}
