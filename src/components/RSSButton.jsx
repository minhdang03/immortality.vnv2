export default function RSSButton({ articles, lang }) {
  const generateRSS = () => {
    const siteUrl = window.location.origin
    const siteName = lang === 'vi' ? 'Bất Tử Đạo' : 'Immortality'
    const siteDesc = lang === 'vi' ? 'Trí Tuệ Người Việt Nam' : 'Vietnamese Wisdom'

    const items = articles.map(a => {
      const d = a[lang]
      if (!d) return ''
      return `
    <item>
      <title>${escapeXml(d.title)}</title>
      <description>${escapeXml(d.summary)}</description>
      <link>${siteUrl}/#article-${a.id}</link>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <guid>${siteUrl}/#article-${a.id}</guid>
    </item>`
    }).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDesc}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`

    const blob = new Blob([rss], { type: 'application/rss+xml' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  return (
    <button className="rss-btn" onClick={generateRSS} title="RSS Feed">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <circle cx="6.18" cy="17.82" r="2.18"/>
        <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
      </svg>
      RSS
    </button>
  )
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
