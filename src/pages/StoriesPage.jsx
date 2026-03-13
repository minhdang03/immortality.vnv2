import { useState, useEffect, useMemo, useRef } from 'react'
import { STORIES, STORY_TAGS, STORY_CONTENT, STORY_LESSONS, STORY_HIGHLIGHTS, STORY_THREADS } from '../data/stories'
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

function renderLessonContent(text) {
  // Split text and render with quote detection
  // Quotes: text between \u201C...\u201D or "..."
  const quoteRegex = /[\u201C"]([^"\u201D]+)[\u201D"]/g
  const parts = []
  let lastIndex = 0
  let match
  while ((match = quoteRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'quote', value: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return parts.map((p, i) =>
    p.type === 'quote'
      ? <span key={i} className="lesson-quote">&ldquo;{p.value}&rdquo;</span>
      : <span key={i}>{p.value}</span>
  )
}

function LessonCard({ title, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`lesson-card ${open ? 'lesson-card-open' : ''}`}>
      <button className="lesson-card-header" onClick={() => setOpen(!open)}>
        <span className="lesson-card-title">{title}</span>
        <span className={`lesson-card-arrow ${open ? 'open' : ''}`}>&#9662;</span>
      </button>
      {open && content && (
        <div className="lesson-card-body">
          {content.split('\n').map((line, i) => (
            <p key={i}>{renderLessonContent(line)}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function parseLessonCards(lessonText) {
  if (!lessonText) return []
  const paragraphs = lessonText.split('\n\n').filter(p => p.trim())
  return paragraphs.map(p => {
    // First sentence = title, rest = content
    const dotMatch = p.match(/^(.+?[.!?])\s+(.+)$/s)
    if (dotMatch) {
      return { title: dotMatch[1], content: dotMatch[2] }
    }
    return { title: p, content: '' }
  })
}

function StoryDetail({ story, lang, t, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, onBack, allStories }) {
  const tag = STORY_TAGS[story.tag]
  const content = lang === 'vi' ? story.contentVi : story.contentEn
  const lesson = lang === 'vi' ? story.lessonVi : story.lessonEn
  const title = lang === 'vi' ? story.titleVi : story.titleEn
  // Highlights: from Firestore (newline-separated string) or fallback to hardcoded
  const firestoreHL = lang === 'vi' ? story.highlightsVi : story.highlightsEn
  const highlightList = firestoreHL
    ? firestoreHL.split('\n').filter(l => l.trim())
    : (STORY_HIGHLIGHTS[story.order] ? (lang === 'vi' ? STORY_HIGHLIGHTS[story.order].vi : STORY_HIGHLIGHTS[story.order].en) : null)

  // Thread: from Firestore or fallback to hardcoded
  const firestoreThread = lang === 'vi' ? story.threadVi : story.threadEn
  const thread = firestoreThread
    || (STORY_THREADS[story.order] ? (lang === 'vi' ? STORY_THREADS[story.order].vi : STORY_THREADS[story.order].en) : null)

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

        {/* Part 1: Điểm Nhấn / Key Highlights */}
        {highlightList && highlightList.length > 0 && (
          <div className="story-highlights-v2">
            <h3 className="highlights-v2-header">
              <SunIcon size={16} />
              {lang === 'vi' ? 'Điểm Nhấn' : 'Key Highlights'}
            </h3>
            <div className="highlights-v2-list">
              {highlightList.map((h, i) => (
                <div key={i} className="highlight-v2-item">
                  <span className="highlight-v2-bullet">◈</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part 2: Bài Học Siêu Trí Tuệ / Deep Wisdom */}
        {lesson && (() => {
          const cards = parseLessonCards(lesson)
          return cards.length > 0 && (
            <div className="story-lesson-v2">
              <h3 className="lesson-v2-header">
                <SunIcon size={20} />
                {lang === 'vi' ? 'Bài Học Siêu Trí Tuệ' : 'Deep Wisdom'}
              </h3>
              <div className="lesson-cards">
                {cards.map((card, i) => (
                  <LessonCard key={i} title={card.title} content={card.content} />
                ))}
              </div>
            </div>
          )
        })()}

        {/* Part 3: Xuyên Suốt / The Thread */}
        {thread && (
          <div className="story-thread-v2">
            <div className="thread-v2-icon">
              <svg viewBox="0 0 48 10" fill="none">
                <circle className="thread-dot" cx="4" cy="5" r="3" />
                <line className="thread-line" x1="7" y1="5" x2="41" y2="5" />
                <circle className="thread-dot" cx="44" cy="5" r="3" />
              </svg>
            </div>
            <h3 className="thread-v2-header">
              {lang === 'vi' ? 'Xuyên Suốt' : 'The Thread'}
            </h3>
            <p className="thread-v2-body">{thread}</p>
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
