import { useState, useEffect } from 'react'
import { STORY_TAGS } from '../../data/stories'
import SunIcon from '../SunIcon'
import ShareButtons from '../ShareButtons'
import InlineEdit from '../InlineEdit'
import StoryLessons from './StoryLessons'
import StoryThread from './StoryThread'

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

export default function StoryDetail({ story, lang, t, navigate, fontSize, onFontIncrease, onFontDecrease, onFontReset, onBack, allStories, user, onUpdateStory }) {
  const tag = STORY_TAGS[story.tag]
  const content = lang === 'vi' ? story.contentVi : story.contentEn
  const lesson = lang === 'vi' ? story.lessonVi : story.lessonEn
  const title = lang === 'vi' ? story.titleVi : story.titleEn
  const hlRaw = lang === 'vi' ? story.highlightsVi : story.highlightsEn
  const highlightList = hlRaw ? hlRaw.split('\n').filter(l => l.trim()) : null
  const thread = lang === 'vi' ? story.threadVi : story.threadEn

  const isAdmin = !!user
  const saveField = (field) => async (value) => {
    if (onUpdateStory && story.id) {
      await onUpdateStory(story.id, { [field]: value })
    }
  }

  const contentField = lang === 'vi' ? 'contentVi' : 'contentEn'
  const highlightsField = lang === 'vi' ? 'highlightsVi' : 'highlightsEn'
  const lessonField = lang === 'vi' ? 'lessonVi' : 'lessonEn'
  const threadField = lang === 'vi' ? 'threadVi' : 'threadEn'

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
        <div className="section-editable">
          <h3 style={{ margin: 0, flex: 1 }} />
          {isAdmin && <InlineEdit value={content} onSave={saveField(contentField)} lang={lang} label={lang === 'vi' ? 'Nội dung' : 'Content'} />}
        </div>
        <div className="story-detail-body detail-body">
          {content
            ? renderText(content)
            : <p className="story-placeholder">{lang === 'vi' ? 'Nội dung đang cập nhật...' : 'Content being updated...'}</p>
          }
        </div>

        {/* Part 1: Key Highlights */}
        {(highlightList?.length > 0 || isAdmin) && (
          <div className="story-highlights-v2">
            <div className="section-editable">
              <h3 className="highlights-v2-header" style={{ margin: 0 }}>
                <SunIcon size={16} />
                {lang === 'vi' ? 'Điểm Nhấn' : 'Key Highlights'}
              </h3>
              {isAdmin && <InlineEdit value={hlRaw} onSave={saveField(highlightsField)} lang={lang} label={lang === 'vi' ? 'Điểm Nhấn' : 'Highlights'} />}
            </div>
            {highlightList && highlightList.length > 0 && (
              <div className="highlights-v2-list">
                {highlightList.map((h, i) => (
                  <div key={i} className="highlight-v2-item">
                    <span className="highlight-v2-bullet">&#9672;</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Part 2: Deep Wisdom / Lessons */}
        <div className="section-editable">
          <span style={{ flex: 1 }} />
          {isAdmin && <InlineEdit value={lesson} onSave={saveField(lessonField)} lang={lang} label={lang === 'vi' ? 'Bài Học' : 'Lessons'} />}
        </div>
        <StoryLessons lesson={lesson} lang={lang} />

        {/* Part 3: The Thread */}
        <div className="section-editable">
          <span style={{ flex: 1 }} />
          {isAdmin && <InlineEdit value={thread} onSave={saveField(threadField)} lang={lang} label={lang === 'vi' ? 'Xuyên Suốt' : 'Thread'} />}
        </div>
        <StoryThread thread={thread} lang={lang} />

        {/* Share bottom */}
        <div className="detail-share">
          <ShareButtons title={title || ''} articleId={`story-${story.order}`} t={t} />
        </div>

        {/* Prev/Next navigation */}
        <div className="story-nav">
          {prevStory ? (
            <button className="story-nav-btn story-nav-prev" onClick={() => onBack(prevStory)}>
              <span className="story-nav-label">&larr; {lang === 'vi' ? 'Trước' : 'Previous'}</span>
              <span className="story-nav-title">{String(prevStory.order).padStart(2, '0')}. {lang === 'vi' ? prevStory.titleVi : prevStory.titleEn}</span>
            </button>
          ) : <div />}
          {nextStory ? (
            <button className="story-nav-btn story-nav-next" onClick={() => onBack(nextStory)}>
              <span className="story-nav-label">{lang === 'vi' ? 'Tiếp' : 'Next'} &rarr;</span>
              <span className="story-nav-title">{String(nextStory.order).padStart(2, '0')}. {lang === 'vi' ? nextStory.titleVi : nextStory.titleEn}</span>
            </button>
          ) : <div />}
        </div>
      </div>
    </>
  )
}
