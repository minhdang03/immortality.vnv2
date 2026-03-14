import { useState, useEffect, useMemo, useRef } from 'react'
import { storySlug } from '../utils/slug'
import StoryDetail from '../components/stories/StoryDetail'
import StoryList from '../components/stories/StoryList'

export default function StoriesPage({ t, lang, firestoreStories, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, user, onUpdateStory }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const hashApplied = useRef(false)

  const allStories = useMemo(() =>
    (firestoreStories || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [firestoreStories]
  )

  // Sync selected with latest Firestore data
  useEffect(() => {
    if (selected && allStories.length > 0) {
      const updated = allStories.find(s => s.id === selected.id)
      if (updated && updated !== selected) setSelected(updated)
    }
  }, [allStories])

  // Apply path on mount: /story/01-thoat-chet-duoi...
  useEffect(() => {
    if (hashApplied.current || allStories.length === 0) return
    const path = window.location.pathname
    if (path.startsWith('/story/')) {
      const slug = path.slice(7)
      const found = allStories.find(s => storySlug(s) === slug || String(s.order) === slug)
      if (found) setSelected(found)
    }
    hashApplied.current = true
  }, [allStories])

  // Update document title when viewing a story
  useEffect(() => {
    if (selected) {
      const title = lang === 'vi' ? selected.titleVi : selected.titleEn
      if (title) document.title = `${title} | ${t.siteName}`
    } else {
      document.title = `${lang === 'vi' ? '37 Câu Chuyện' : '37 Stories'} | ${t.siteName}`
    }
  }, [selected, lang])

  const selectStory = (story) => {
    setSelected(story)
    history.pushState({}, '', `/story/${storySlug(story)}`)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setSelected(null)
    history.pushState({}, '', '/stories')
  }

  if (selected) {
    return (
      <StoryDetail
        story={selected} lang={lang} t={t} navigate={navigate}
        fontSize={fontSize} onFontIncrease={onFontIncrease} onFontDecrease={onFontDecrease} onFontReset={onFontReset}
        user={user} onUpdateStory={onUpdateStory}
        onBack={(nextStory) => {
          if (nextStory && nextStory.id) {
            selectStory(nextStory)
          } else {
            goBack()
          }
        }}
        allStories={allStories}
      />
    )
  }

  const filtered = filter === 'all' ? allStories : allStories.filter(s => s.tag === filter)

  return (
    <StoryList
      allStories={allStories}
      filtered={filtered}
      filter={filter}
      setFilter={setFilter}
      lang={lang}
      onSelect={selectStory}
    />
  )
}
