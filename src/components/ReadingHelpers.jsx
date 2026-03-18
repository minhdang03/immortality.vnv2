import { useState, useEffect } from 'react'

export function ReadingProgress() {
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

export function ReadingTime({ text, lang }) {
  if (!text) return null
  const words = text.split(/\s+/).length
  const min = Math.max(1, Math.round(words / 200))
  return (
    <span className="reading-time">
      {lang === 'vi' ? `${min} phút đọc` : `${min} min read`}
    </span>
  )
}

export function FontSizeControls({ fontSize, onIncrease, onDecrease, onReset }) {
  return (
    <div className="font-size-controls">
      <button className="font-size-btn" onClick={onDecrease} title="Nhỏ hơn">A-</button>
      <button className="font-size-btn font-size-reset" onClick={onReset} title="Mặc định">{fontSize}%</button>
      <button className="font-size-btn" onClick={onIncrease} title="Lớn hơn">A+</button>
    </div>
  )
}

export function renderText(text) {
  if (!text) return null
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim()

    // Detect Q&A patterns
    const isQuestion = /^(Hỏi|Question|Q)\s*[:：]/i.test(trimmed)
    const isAnswer = /^(Đáp|Trả lời|Answer|A)\s*[:：]/i.test(trimmed)

    if (isQuestion) {
      const content = trimmed.replace(/^(Hỏi|Question|Q)\s*[:：]\s*/i, '')
      return (
        <div key={i} data-para={i} className="qa-question">
          <span className="qa-label qa-label-q">Hỏi</span>
          <p>{content.split('\n').map((line, j, arr) => (
            j < arr.length - 1 ? <span key={j}>{line}<br /></span> : line
          ))}</p>
        </div>
      )
    }

    if (isAnswer) {
      const content = trimmed.replace(/^(Đáp|Trả lời|Answer|A)\s*[:：]\s*/i, '')
      return (
        <div key={i} data-para={i} className="qa-answer">
          <span className="qa-label qa-label-a">Đáp</span>
          <p>{content.split('\n').map((line, j, arr) => (
            j < arr.length - 1 ? <span key={j}>{line}<br /></span> : line
          ))}</p>
        </div>
      )
    }

    return (
      <p key={i} data-para={i}>{block.split('\n').map((line, j, arr) => (
        j < arr.length - 1 ? <span key={j}>{line}<br /></span> : line
      ))}</p>
    )
  })
}
