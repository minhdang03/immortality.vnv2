import { useState, useEffect } from 'react'

const supportsScrollTimeline = CSS.supports?.('animation-timeline', 'scroll()')

export function ReadingProgress() {
  // Native CSS scroll-driven animation — zero JS, GPU-accelerated
  if (supportsScrollTimeline) return <div className="reading-progress-css" />

  // JS fallback for Firefox/Safari
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

// Q/A marker on its own line (or with inline content): "Hỏi:", "Đáp: ...", "Question:", etc.
// Card stays open until next marker — blank lines inside become paragraph breaks, NOT card boundaries.
const QA_MARKER_RE = /^\s*(Hỏi|Đáp|Trả lời|Question|Answer|Q|A)\s*[:：]\s*(.*)$/i
const Q_TYPES_RE = /^(Hỏi|Question|Q)$/i

function parseBlocks(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let current = null

  const flush = () => {
    if (current && current.content.trim()) {
      blocks.push({ type: current.type, content: current.content.trim() })
    }
    current = null
  }

  for (const line of lines) {
    const m = line.match(QA_MARKER_RE)
    if (m) {
      flush()
      current = { type: Q_TYPES_RE.test(m[1]) ? 'q' : 'a', content: m[2] || '' }
    } else if (current) {
      current.content += '\n' + line
    } else {
      current = { type: 'p', content: line }
    }
  }
  flush()
  return blocks
}

function renderInline(line, key) {
  return <span key={key}>{line}</span>
}

function renderParagraphs(content) {
  return content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map((p, i) => (
    <p key={i}>
      {p.split('\n').map((line, j, arr) =>
        j < arr.length - 1 ? <span key={j}>{line}<br /></span> : renderInline(line, j)
      )}
    </p>
  ))
}

export function renderText(text) {
  if (!text) return null
  const blocks = parseBlocks(text)
  return blocks.map((b, i) => {
    if (b.type === 'q') {
      return (
        <div key={i} className="qa-question">
          <span className="qa-label qa-label-q">Hỏi</span>
          {renderParagraphs(b.content)}
        </div>
      )
    }
    if (b.type === 'a') {
      return (
        <div key={i} className="qa-answer">
          <span className="qa-label qa-label-a">Đáp</span>
          {renderParagraphs(b.content)}
        </div>
      )
    }
    // Plain text block (text outside any Q/A card) — render its paragraphs directly
    return <div key={i} data-para={i}>{renderParagraphs(b.content)}</div>
  })
}
