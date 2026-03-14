import { useState, useEffect, useRef } from 'react'
import { khaitriSlug } from '../utils/slug'
import KhaiTriList from '../components/khaitri/KhaiTriList'
import KhaiTriDetail from '../components/khaitri/KhaiTriDetail'

export default function KhaiTriPage({ t, lang, items, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, user, onUpdateKhaiTri }) {
  const [selected, setSelected] = useState(null)
  const hashApplied = useRef(false)

  // Sync selected with latest Firestore data
  useEffect(() => {
    if (selected && items.length > 0) {
      const updated = items.find(it => it.id === selected.id)
      if (updated && updated !== selected) setSelected(updated)
    }
  }, [items])

  // Apply path on mount: /khaitri/{slug}
  useEffect(() => {
    if (hashApplied.current || items.length === 0) return
    const path = window.location.pathname
    if (path.startsWith('/khaitri/')) {
      const slug = path.slice(9)
      const found = items.find(it => khaitriSlug(it) === slug || String(it.order) === slug || it.id === slug)
      if (found) setSelected(found)
    }
    hashApplied.current = true
  }, [items])

  // Update document title when viewing a detail
  useEffect(() => {
    if (selected) {
      const d = selected[lang === 'vi' ? 'vi' : 'en'] || {}
      const title = d.question
      if (title) document.title = `${title} | ${t.siteName}`
    } else {
      document.title = `${lang === 'vi' ? 'Khai Trí' : 'Khai Trí'} | ${t.siteName}`
    }
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

  return <KhaiTriList items={items} lang={lang} onSelect={selectItem} />
}
