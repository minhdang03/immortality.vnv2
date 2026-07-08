import { useState, useEffect, useMemo } from 'react'
import { storySlug } from '../../utils/slug'
import { updateCanonical } from '../../hooks/useSEO'
import StoryDetail from '../../components/stories/StoryDetail'
import StoryList from '../../components/stories/StoryList'
import { DetailSkeleton } from '../../components/shared/Skeleton'

export default function StoriesPage({ t, lang, firestoreStories, fresh, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, user, onUpdateStory }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const allStories = useMemo(() =>
    (firestoreStories || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [firestoreStories]
  )

  // Sync selected from URL pathname — re-runs when stories grow + on browser back/forward.
  // Replaces hashApplied 1-shot ref which got stuck when stale cache had no matching story.
  useEffect(() => {
    const sync = () => {
      const path = window.location.pathname
      if (path.startsWith('/story/')) {
        const slug = path.slice(7)
        const found = allStories.find(s => storySlug(s) === slug || String(s.order) === slug)
        if (found) setSelected(found)
      } else {
        setSelected(null)
      }
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [allStories])

  // Update document title and og:url when viewing a story
  useEffect(() => {
    if (selected) {
      const title = lang === 'vi' ? selected.titleVi : selected.titleEn
      if (title) document.title = `${title} | ${t.siteName}`
    } else {
      document.title = `${lang === 'vi' ? '37 Câu Chuyện' : '37 Stories'} | ${t.siteName}`
    }
    updateCanonical()
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

  // Deep-link refresh: hold skeleton until Firestore confirms a fresh snapshot,
  // otherwise a stale SWR cache (length > 0, missing the new slug) flashes the list.
  const isDeepLink = typeof window !== 'undefined' && window.location.pathname.startsWith('/story/')
  if (isDeepLink && !fresh) return <DetailSkeleton />


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
