import { useState } from 'react'
import SunIcon from '../SunIcon'

function renderLessonContent(text) {
  // Split text and render with quote detection
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

export function parseLessonCards(lessonText) {
  if (!lessonText) return []
  const paragraphs = lessonText.split('\n\n').filter(p => p.trim())
  return paragraphs.map(p => {
    const dotMatch = p.match(/^(.+?[.!?])\s+(.+)$/s)
    if (dotMatch) {
      return { title: dotMatch[1], content: dotMatch[2] }
    }
    return { title: p, content: '' }
  })
}

export default function StoryLessons({ lesson, lang }) {
  if (!lesson) return null
  const cards = parseLessonCards(lesson)
  if (cards.length === 0) return null

  return (
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
}
