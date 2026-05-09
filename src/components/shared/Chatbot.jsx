import { useState, useRef, useEffect } from 'react'

const GREETING = {
  vi: 'Xin chào, tôi là trợ lý Bất Tử Đạo. Bạn muốn hỏi gì?',
  en: "Hello, I'm the Bất Tử Đạo assistant. Ask me anything.",
}
const PLACEHOLDER = { vi: 'Nhập câu hỏi…', en: 'Type your question…' }
const TITLE = { vi: 'Trợ lý Bất Tử', en: 'Immortality Assistant' }

export default function Chatbot({ lang = 'vi', userId }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING[lang] || GREETING.vi }])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return
    const next = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }]
    setMessages(next)
    setInput('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          userId,
        }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        const errMsg = lang === 'vi' ? 'Xin lỗi, có lỗi xảy ra. Thử lại sau nhé.' : 'Sorry, something went wrong.'
        setMessages(m => updateLast(m, errMsg))
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') return
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content || ''
            if (delta) setMessages(m => appendLast(m, delta))
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errMsg = lang === 'vi' ? 'Mất kết nối. Thử lại nhé.' : 'Connection lost. Try again.'
        setMessages(m => updateLast(m, errMsg))
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <button
        className={`chatbot-fab${open ? ' chatbot-fab-active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={TITLE[lang]}
      >
        {open ? '✕' : '✦'}
      </button>
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label={TITLE[lang]}>
          <div className="chatbot-header">
            <span className="chatbot-title">{TITLE[lang]}</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
                {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={PLACEHOLDER[lang]}
              rows={1}
              disabled={streaming}
            />
            <button onClick={send} disabled={!input.trim() || streaming} aria-label="Send">→</button>
          </div>
        </div>
      )}
    </>
  )
}

function appendLast(msgs, delta) {
  const copy = msgs.slice()
  copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + delta }
  return copy
}
function updateLast(msgs, content) {
  const copy = msgs.slice()
  copy[copy.length - 1] = { ...copy[copy.length - 1], content }
  return copy
}
