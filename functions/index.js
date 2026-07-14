const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

admin.initializeApp()
const db = admin.firestore()

const { LOCALES, PAGE_OG } = require('./og-locales')

// Domain decides OG language: immortality.vn → en, battudao.com (default) → vi.
// Behind Firebase Hosting the original domain arrives via x-forwarded-host.
function localeForRequest(req) {
  const host = req.headers['x-forwarded-host'] || req.hostname || ''
  return host.includes('immortality.vn') ? LOCALES.en : LOCALES.vi
}

// Vietnamese diacritic → ASCII for slug matching
const VI_MAP = 'àáạảãâầấậẩẫăằắặẳẵ→a,èéẹẻẽêềếệểễ→e,ìíịỉĩ→i,òóọỏõôồốộổỗơờớợởỡ→o,ùúụủũưừứựửữ→u,ỳýỵỷỹ→y,đ→d'
const SLUG_MAP = {}
VI_MAP.split(',').forEach(group => {
  const [chars, to] = group.split('→')
  for (const c of chars) SLUG_MAP[c] = to
})

// Keep in sync with src/utils/slug.js
function toSlug(str) {
  if (!str) return ''
  return str.toLowerCase().split('').map(c => SLUG_MAP[c] || c).join('')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// Crawler detection
const CRAWLERS = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Googlebot|bingbot|Zalobot|kakaotalk|viber|LINE|Pinterest|Embedly|Iframely/i

function escHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderOgHtml({ title, description, url, image, type = 'website', loc = LOCALES.vi }) {
  const t = escHtml(title)
  const d = escHtml(description)
  const u = escHtml(url)
  const img = escHtml(image || `${loc.site}/og-image.png`)
  return `<!DOCTYPE html>
<html lang="${loc.lang}">
<head>
<meta charset="UTF-8" />
<title>${t}</title>
<meta name="description" content="${d}" />
<meta property="og:type" content="${type}" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:url" content="${u}" />
<meta property="og:image" content="${img}" />
<meta property="og:site_name" content="${escHtml(loc.siteName)}" />
<meta property="og:locale" content="${loc.ogLocale}" />
<meta property="og:locale:alternate" content="${loc.ogLocaleAlt}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
<meta name="twitter:image" content="${img}" />
<link rel="canonical" href="${u}" />
</head>
<body>
<h1>${t}</h1>
<p>${d}</p>
<a href="${u}">${loc.readMore} ${escHtml(loc.siteName)}</a>
</body>
</html>`
}

// Read SPA index.html (copied during build) for non-crawler requests
let spaHtml = null
function getSpaHtml() {
  if (spaHtml) return spaHtml
  try {
    spaHtml = fs.readFileSync(path.join(__dirname, 'spa.html'), 'utf-8')
  } catch {
    // Fallback: redirect to root with hash (won't trigger rewrite loop)
    spaHtml = null
  }
  return spaHtml
}

exports.ogRenderer = onRequest({ region: 'asia-southeast1' }, async (req, res) => {
  const ua = req.headers['user-agent'] || ''
  const reqPath = req.path || '/'
  const loc = localeForRequest(req)

  // Not a crawler → serve the SPA HTML so the React app handles routing
  if (!CRAWLERS.test(ua)) {
    const spa = getSpaHtml()
    if (spa) {
      res.status(200).set('Content-Type', 'text/html').send(spa)
    } else {
      // Fallback: redirect to root SPA when spa.html unavailable
      res.redirect(302, loc.site)
    }
    return
  }

  try {
    // Article detail: /article/:slug (canonical) or /articles/:slug (alias)
    // Uses pre-stamped viSlug/enSlug fields for O(1) lookup (run backfill-article-slugs.js first)
    const articleMatch = reqPath.match(/^\/articles?\/(.+?)\/?$/)
    if (articleMatch) {
      const slug = articleMatch[1]
      let article = null

      // Try viSlug → enSlug → sourceRef → doc-id fallback (covers legacy + agent-posted docs)
      let snap = await db.collection('articles').where('viSlug', '==', slug).limit(1).get()
      if (snap.empty) snap = await db.collection('articles').where('enSlug', '==', slug).limit(1).get()
      if (snap.empty) snap = await db.collection('articles').where('sourceRef', '==', slug).limit(1).get()
      if (!snap.empty) {
        const d = snap.docs[0]
        article = { id: d.id, ...d.data() }
      } else {
        const byId = await db.collection('articles').doc(slug).get()
        if (byId.exists) article = { id: byId.id, ...byId.data() }
      }

      if (article) {
        const d = (loc.lang === 'en' ? article.en || article.vi : article.vi || article.en) || {}
        res.status(200).send(renderOgHtml({
          title: `${d.title} | ${loc.siteName}`,
          description: d.summary || d.question || loc.desc,
          url: `${loc.site}/article/${slug}`,
          image: article.image || undefined,
          type: 'article',
          loc,
        }))
        return
      }
    }

    // Khai Trí detail: /khaitri/:slug — slug = "<order2digit>-<vi-title-slug>" or "<order>" or doc-id
    if (reqPath.startsWith('/khaitri/')) {
      const slug = reqPath.slice(9).replace(/\/$/, '')
      let item = null

      // Parse leading order from slug ("06-vi-sao-..." → 6)
      const orderMatch = slug.match(/^(\d+)/)
      if (orderMatch) {
        const order = parseInt(orderMatch[1], 10)
        const snap = await db.collection('khaitri').where('order', '==', order).limit(5).get()
        if (!snap.empty) {
          // If multiple, prefer the one whose computed slug matches
          for (const d of snap.docs) {
            const data = d.data()
            const num = String(data.order || 1).padStart(2, '0')
            const title = data.vi?.title || data.en?.title || ''
            const titleSlug = toSlug(title)
            const computed = titleSlug ? `${num}-${titleSlug}` : num
            if (computed === slug) { item = { id: d.id, ...data }; break }
          }
          if (!item) item = { id: snap.docs[0].id, ...snap.docs[0].data() }
        }
      }
      // Fallback: doc-id lookup
      if (!item) {
        const byId = await db.collection('khaitri').doc(slug).get()
        if (byId.exists) item = { id: byId.id, ...byId.data() }
      }

      if (item) {
        const d = (loc.lang === 'en' ? item.en || item.vi : item.vi || item.en) || {}
        res.status(200).send(renderOgHtml({
          title: `${d.title} | ${loc.siteName}`,
          description: d.summary || d.question || loc.desc,
          url: `${loc.site}/khaitri/${slug}`,
          image: item.image || undefined,
          type: 'article',
          loc,
        }))
        return
      }
    }

    // Topic: /topic/:id
    if (reqPath.startsWith('/topic/')) {
      const topicId = reqPath.slice(7).replace(/\/$/, '')
      const topicDoc = await db.collection('topics').doc(topicId).get()
      if (topicDoc.exists) {
        const data = topicDoc.data()
        const name = (loc.lang === 'en' ? data.en || data.vi : data.vi || data.en) || topicId
        const desc = loc.lang === 'en' ? data.descEn || data.descVi : data.descVi || data.descEn
        res.status(200).send(renderOgHtml({
          title: `${name} | ${loc.siteName}`,
          description: desc || loc.desc,
          url: `${loc.site}/topic/${topicId}`,
          loc,
        }))
        return
      }
    }

    // Static pages
    const pageId = reqPath.replace(/^\//, '').replace(/\/$/, '') || 'home'
    const pageOg = PAGE_OG[pageId]?.[loc.lang]
    if (pageOg) {
      res.status(200).send(renderOgHtml({
        title: `${pageOg.title} | ${loc.siteName}`,
        description: pageOg.desc,
        url: `${loc.site}/${pageId}`,
        loc,
      }))
      return
    }

    // Homepage or fallback
    res.status(200).send(renderOgHtml({
      title: loc.fullTitle,
      description: loc.desc,
      url: loc.site,
      loc,
    }))
  } catch (err) {
    console.error('OG render error:', err)
    res.status(200).send(renderOgHtml({
      title: loc.fullTitle,
      description: loc.desc,
      url: loc.site,
      loc,
    }))
  }
})
