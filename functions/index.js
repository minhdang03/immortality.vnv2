const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

admin.initializeApp()
const db = admin.firestore()

const SITE = 'https://battudao.com'
const SITE_NAME = 'Bất Tử Đạo - Immortality'
const DEFAULT_IMAGE = `${SITE}/og-image.png`
const DEFAULT_DESC = 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.'

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

function renderOgHtml({ title, description, url, image, type = 'website' }) {
  const t = escHtml(title)
  const d = escHtml(description)
  const u = escHtml(url)
  const img = escHtml(image || DEFAULT_IMAGE)
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>${t}</title>
<meta name="description" content="${d}" />
<meta property="og:type" content="${type}" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:url" content="${u}" />
<meta property="og:image" content="${img}" />
<meta property="og:site_name" content="${escHtml(SITE_NAME)}" />
<meta property="og:locale" content="vi_VN" />
<meta property="og:locale:alternate" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
<meta name="twitter:image" content="${img}" />
<link rel="canonical" href="${u}" />
</head>
<body>
<h1>${t}</h1>
<p>${d}</p>
<a href="${u}">Đọc tiếp tại ${escHtml(SITE_NAME)}</a>
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

// Page config for static pages OG
const PAGE_OG = {
  stories: { title: '37 Câu Chuyện | ' + SITE_NAME, desc: 'Những câu chuyện thật về hành trình chữa lành và giác ngộ tâm linh.' },
  khaitri: { title: 'Khai Trí | ' + SITE_NAME, desc: 'Hỏi đáp trí tuệ — giải đáp những câu hỏi về tâm linh, sức khỏe và bất tử.' },
  about: { title: 'Giới Thiệu | ' + SITE_NAME, desc: 'Tìm hiểu về Bất Tử Đạo và phương pháp năng lượng Mặt Trời.' },
  practice: { title: 'Thái Dương Quyền | ' + SITE_NAME, desc: 'Học Thái Dương Quyền — bài tập năng lượng mặt trời cho sức khỏe và trí tuệ.' },
  articles: { title: 'Bài Viết | ' + SITE_NAME, desc: 'Tất cả bài viết về tâm linh, sức khỏe và bất tử.' },
  contact: { title: 'Liên Hệ | ' + SITE_NAME, desc: 'Liên hệ với chúng tôi để được hỗ trợ và tư vấn.' },
  search: { title: 'Tìm Kiếm | ' + SITE_NAME, desc: 'Tìm kiếm bài viết, câu chuyện và nội dung trên Bất Tử Đạo.' },
}

exports.ogRenderer = onRequest({ region: 'asia-southeast1' }, async (req, res) => {
  const ua = req.headers['user-agent'] || ''
  const reqPath = req.path || '/'

  // Not a crawler → serve the SPA HTML so the React app handles routing
  if (!CRAWLERS.test(ua)) {
    const spa = getSpaHtml()
    if (spa) {
      res.status(200).set('Content-Type', 'text/html').send(spa)
    } else {
      // Fallback: redirect to root SPA when spa.html unavailable
      res.redirect(302, SITE)
    }
    return
  }

  try {
    // Article detail: /article/:slug
    // Uses pre-stamped viSlug/enSlug fields for O(1) lookup (run backfill-article-slugs.js first)
    if (reqPath.startsWith('/article/')) {
      const slug = reqPath.slice(9).replace(/\/$/, '')
      let article = null

      // Try viSlug index → enSlug index → doc-id fallback (covers legacy / unmigrated docs)
      let snap = await db.collection('articles').where('viSlug', '==', slug).limit(1).get()
      if (snap.empty) snap = await db.collection('articles').where('enSlug', '==', slug).limit(1).get()
      if (!snap.empty) {
        const d = snap.docs[0]
        article = { id: d.id, ...d.data() }
      } else {
        const byId = await db.collection('articles').doc(slug).get()
        if (byId.exists) article = { id: byId.id, ...byId.data() }
      }

      if (article) {
        const d = article.vi || article.en || {}
        res.status(200).send(renderOgHtml({
          title: `${d.title} | ${SITE_NAME}`,
          description: d.summary || d.question || DEFAULT_DESC,
          url: `${SITE}/article/${slug}`,
          type: 'article',
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
        const name = data.vi || data.en || topicId
        res.status(200).send(renderOgHtml({
          title: `${name} | ${SITE_NAME}`,
          description: data.descVi || data.descEn || DEFAULT_DESC,
          url: `${SITE}/topic/${topicId}`,
        }))
        return
      }
    }

    // Static pages
    const pageId = reqPath.replace(/^\//, '').replace(/\/$/, '') || 'home'
    const pageOg = PAGE_OG[pageId]
    if (pageOg) {
      res.status(200).send(renderOgHtml({
        title: pageOg.title,
        description: pageOg.desc,
        url: `${SITE}/${pageId}`,
      }))
      return
    }

    // Homepage or fallback
    res.status(200).send(renderOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESC,
      url: SITE,
    }))
  } catch (err) {
    console.error('OG render error:', err)
    res.status(200).send(renderOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESC,
      url: SITE,
    }))
  }
})
