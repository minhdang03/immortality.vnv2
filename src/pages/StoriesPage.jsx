import { useState, useEffect, useMemo, useRef } from 'react'
import { STORIES, STORY_CONTENT, STORY_LESSONS } from '../data/stories'
import { storySlug } from '../utils/slug'
import StoryDetail from '../components/stories/StoryDetail'
import StoryList from '../components/stories/StoryList'

// Merge Firestore stories with hardcoded fallback
function mergeStories(firestoreStories) {
  if (firestoreStories && firestoreStories.length > 0) return firestoreStories

  return STORIES.map(s => ({
    id: s.id,
    order: s.id,
    tag: s.tag,
    titleVi: s.vi,
    titleEn: s.en,
    contentVi: STORY_CONTENT[s.id]?.vi || '',
    contentEn: STORY_CONTENT[s.id]?.en || '',
    lessonVi: STORY_LESSONS[s.id]?.vi || '',
    lessonEn: STORY_LESSONS[s.id]?.en || '',
  }))
}

export default function StoriesPage({ t, lang, firestoreStories, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const hashApplied = useRef(false)

  const allStories = useMemo(() => mergeStories(firestoreStories), [firestoreStories])

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
