import { useState } from 'react'

export default function ShareButtons({ title, articleId, shareUrl, t }) {
  const [copied, setCopied] = useState(false)
  const url = shareUrl || `${window.location.origin}/#article-${articleId}`

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400')
  }

  const shareZalo = () => {
    window.open(`https://zalo.me/share/social/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share-buttons">
      <span className="share-label">{t.share}:</span>
      <button className="share-btn share-fb" onClick={shareFacebook} title="Facebook">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </button>
      <button className="share-btn share-zalo" onClick={shareZalo} title="Zalo">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.346c-.195.39-.587.654-1.072.654H7.178c-.485 0-.877-.264-1.072-.654-.195-.39-.127-.848.176-1.176l5.076-6.426H7.854c-.485 0-.878-.393-.878-.878s.393-.878.878-.878h8.292c.485 0 .877.264 1.072.654.195.39.127.848-.176 1.176l-5.076 6.426h3.928c.485 0 .878.393.878.878s-.098.834-.978 1.224z"/></svg>
      </button>
      <button className="share-btn share-copy" onClick={copyLink} title={t.copyLink}>
        {copied ? (
          <span className="copied-text">{t.copied}</span>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        )}
      </button>
    </div>
  )
}
