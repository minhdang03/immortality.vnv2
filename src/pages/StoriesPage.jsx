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

  // Apply hash on mount: /story/01-thoat-chet-duoi...
  useEffect(() => {
    if (hashApplied.current || allStories.length === 0) return
    const hash = window.location.hash.slice(1)
    if (hash.startsWith('/story/')) {
      const slug = hash.slice(7)
      const found = allStories.find(s => storySlug(s) === slug || String(s.order) === slug)
      if (found) setSelected(found)
    }
    hashApplied.current = true
  }, [allStories])

  const selectStory = (story) => {
    setSelected(story)
    window.location.hash = `/story/${storySlug(story)}`
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setSelected(null)
    window.location.hash = '/stories'
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
