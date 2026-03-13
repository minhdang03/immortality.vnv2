import { useState, useEffect, useMemo, useRef } from 'react'
import { STORIES, STORY_TAGS, STORY_CONTENT, STORY_LESSONS, STORY_HIGHLIGHTS } from '../data/stories'
import { storySlug } from '../utils/slug'
import SunIcon from '../components/SunIcon'
import ShareButtons from '../components/ShareButtons'

function renderText(text) {
  return text.split('\n\n').map((block, i) => (
    <p key={i} data-para={i}>{block.split('\n').map((line, j, arr) => (
      j < arr.length - 1 ? <span key={j}>{line}<br/></span> : line
    ))}</p>
  ))
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="reading-progress" style={{ width: `${progress}%` }} />
}

function ReadingTime({ text, lang }) {
  if (!text) return null
  const words = text.split(/\s+/).length
  const min = Math.max(1, Math.round(words / 200))
  return (
    <span className="reading-time">
      {lang === 'vi' ? `${min} phút đọc` : `${min} min read`}
    </span>
  )
}

function FontSizeControls({ fontSize, onIncrease, onDecrease, onReset }) {
  return (
    <div className="font-size-controls">
      <button className="font-size-btn" onClick={onDecrease} title="A-">A-</button>
      <button className="font-size-btn font-size-reset" onClick={onReset} title="Reset">{fontSize}%</button>
      <button className="font-size-btn" onClick={onIncrease} title="A+">A+</button>
    </div>
  )
}

function StoryDetail({ story, lang, t, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, onBack, allStories }) {
  const tag = STORY_TAGS[story.tag]
  const content = lang === 'vi' ? story.contentVi : story.contentEn
  const lesson = lang === 'vi' ? story.lessonVi : story.lessonEn
  const title = lang === 'vi' ? story.titleVi : story.titleEn
  const highlights = STORY_HIGHLIGHTS[story.order]
  const highlightList = highlights ? (lang === 'vi' ? highlights.vi : highlights.en) : null

  // Next/prev stories
  const currentIndex = allStories.findIndex(s => s.id === story.id)
  const prevStory = currentIndex > 0 ? allStories[currentIndex - 1] : null
  const nextStory = currentIndex < allStories.length - 1 ? allStories[currentIndex + 1] : null

  return (
    <>
      <ReadingProgress />
      <div className="story-detail fade-up">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button onClick={() => navigate('home')}>{t.navHome}</button>
          <span className="breadcrumb-sep">/</span>
          <button onClick={onBack}>{lang === 'vi' ? 'Câu Chuyện' : 'Stories'}</button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{title?.slice(0, 30)}{title?.length > 30 ? '...' : ''}</span>
        </div>

        <div className="story-detail-header">
          <span className="story-num-lg">{String(story.order).padStart(2, '0')}</span>
          {tag && <span className={`story-tag tag-${story.tag}`}>{lang === 'vi' ? tag.vi : tag.en}</span>}
        </div>

        <h1 className="story-detail-title">{title}</h1>

        {/* Meta: tag + reading time */}
        <div className="detail-meta">
          {tag && <span className="article-tag">{lang === 'vi' ? tag.vi : tag.en}</span>}
          <ReadingTime text={content} lang={lang} />
        </div>

        {/* Toolbar: Font size + Share */}
        <div className="detail-toolbar">
          <FontSizeControls
            fontSize={fontSize}
            onIncrease={onFontIncrease}
            onDecrease={onFontDecrease}
            onReset={onFontReset}
          />
          <ShareButtons title={title || ''} articleId={`story-${story.order}`} t={t} />
        </div>

        {/* Body */}
        <div className="story-detail-body detail-body">
          {content
            ? renderText(content)
            : <p className="story-placeholder">{lang === 'vi' ? 'Nội dung đang cập nhật...' : 'Content being updated...'}</p>
          }
        </div>

        {/* Lesson */}
        {lesson && (
          <div className="story-lesson">
            <h3 className="story-lesson-title">
              <SunIcon size={18} />
              {lang === 'vi' ? 'Bài Học Từ Câu Chuyện' : 'Lesson From The Story'}
            </h3>
            <div className="story-lesson-body">
              {renderText(lesson)}
            </div>
          </div>
        )}

        {/* Highlights */}
        {highlightList && highlightList.length > 0 && (
          <div className="story-highlights">
            <h4 className="story-highlights-title">
              <SunIcon size={16} />
              {lang === 'vi' ? 'Điểm Nhấn' : 'Key Highlights'}
            </h4>
            <ul className="story-highlights-list">
              {highlightList.map((h, i) => (
                <li key={i} className="story-highlight-item">{h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Share bottom */}
        <div className="detail-share">
          <ShareButtons title={title || ''} articleId={`story-${story.order}`} t={t} />
        </div>

        {/* Prev/Next navigation */}
        <div className="story-nav">
          {prevStory ? (
            <button className="story-nav-btn story-nav-prev" onClick={() => onBack(prevStory)}>
              <span className="story-nav-label">← {lang === 'vi' ? 'Trước' : 'Previous'}</span>
              <span className="story-nav-title">{String(prevStory.order).padStart(2, '0')}. {lang === 'vi' ? prevStory.titleVi : prevStory.titleEn}</span>
            </button>
          ) : <div />}
          {nextStory ? (
            <button className="story-nav-btn story-nav-next" onClick={() => onBack(nextStory)}>
              <span className="story-nav-label">{lang === 'vi' ? 'Tiếp' : 'Next'} →</span>
              <span className="story-nav-title">{String(nextStory.order).padStart(2, '0')}. {lang === 'vi' ? nextStory.titleVi : nextStory.titleEn}</span>
            </button>
          ) : <div />}
        </div>
      </div>
    </>
  )
}

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

  const tags = ['all', ...Object.keys(STORY_TAGS)]
  const filtered = filter === 'all' ? allStories : allStories.filter(s => s.tag === filter)

  return (
    <section className="stories-page fade-up">
      <h1 className="stories-title">
        {lang === 'vi' ? `${allStories.length} Câu Chuyện Người Bất Tử` : `${allStories.length} Stories of The Immortal`}
      </h1>
      <p className="stories-subtitle">
        {lang === 'vi'
          ? 'Hành trình hơn 40 năm khám phá, chiến đấu và chữa lành'
          : 'A journey of over 40 years of discovery, battle and healing'}
      </p>

      <div className="stories-filters">
        {tags.map(tag => (
          <button
            key={tag}
            className={`story-filter ${filter === tag ? 'active' : ''} ${tag !== 'all' ? `tag-${tag}` : ''}`}
            onClick={() => setFilter(tag)}
          >
            {tag === 'all'
              ? (lang === 'vi' ? 'Tất cả' : 'All')
              : (lang === 'vi' ? STORY_TAGS[tag].vi : STORY_TAGS[tag].en)
            }
            {tag === 'all'
              ? ` (${allStories.length})`
              : ` (${allStories.filter(s => s.tag === tag).length})`
            }
          </button>
        ))}
      </div>

      <div className="stories-list">
        {filtered.map((story, i) => {
          const tag = STORY_TAGS[story.tag]
          const hasContent = !!(story.contentVi || story.contentEn)
          return (
            <div
              key={story.id}
              className={`story-item fade-up fade-up-d${(i % 4) + 1} ${hasContent ? 'has-content' : ''}`}
              onClick={() => selectStory(story)}
            >
              <span className="story-num">{String(story.order).padStart(2, '0')}</span>
              <div className="story-info">
                <div className="story-item-title">{lang === 'vi' ? story.titleVi : story.titleEn}</div>
                {tag && <span className={`story-tag tag-${story.tag}`}>{lang === 'vi' ? tag.vi : tag.en}</span>}
              </div>
              <span className="story-arrow">›</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
