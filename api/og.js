import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

const SITE_NAME = 'Bất Tử Đạo - Immortality'
const SITE_URL = 'https://immortality.vn'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`
const DEFAULT_DESC = 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.'

function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderOgPage({ title, description, image, url }) {
  const t = escapeHtml(title || SITE_NAME)
  const d = escapeHtml(description || DEFAULT_DESC)
  const img = escapeHtml(image || DEFAULT_IMAGE)
  const u = escapeHtml(url || SITE_URL)
  // hashUrl for client redirect
  const hashPath = url ? url.replace(SITE_URL, '') : '/'
  const redirectUrl = `${SITE_URL}/#${hashPath}`

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:type" content="article">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${img}">
<meta property="og:url" content="${u}">
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
<meta property="og:locale" content="vi_VN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}">
</head>
<body>
<p>Redirecting to <a href="${escapeHtml(redirectUrl)}">${t}</a>...</p>
</body>
</html>`
}

// Vietnamese slug helper (matches client-side toSlug)
const VIET_MAP = 'àáạảãâầấậẩẫăằắặẳẵ:a,èéẹẻẽêềếệểễ:e,ìíịỉĩ:i,òóọỏõôồốộổỗơờớợởỡ:o,ùúụủũưừứựửữ:u,ỳýỵỷỹ:y,đ:d'
const charMap = {}
VIET_MAP.split(',').forEach(g => {
  const [chars, rep] = g.split(':')
  chars.split('').forEach(c => { charMap[c] = rep })
})
function toSlug(str) {
  if (!str) return ''
  return str.toLowerCase().split('').map(c => charMap[c] || c).join('')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

async function findStory(slug) {
  const q = query(collection(db, 'stories'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    const data = d.data()
    const num = String(data.order || 1).padStart(2, '0')
    const title = data.titleVi || data.titleEn || ''
    const s = toSlug(title)
    const storySlug = s ? `${num}-${s}` : num
    if (storySlug === slug || String(data.order) === slug) {
      return { id: d.id, ...data }
    }
  }
  return null
}

async function findArticle(slug) {
  const snap = await getDocs(collection(db, 'articles'))
  for (const d of snap.docs) {
    const data = d.data()
    const title = data.vi?.title || data.en?.title || ''
    const s = toSlug(title) || d.id
    if (s === slug || d.id === slug) {
      return { id: d.id, ...data }
    }
  }
  return null
}

async function findKhaiTri(slug) {
  const q = query(collection(db, 'khaitri'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    const data = d.data()
    const num = String(data.order || 1).padStart(2, '0')
    const title = data.vi?.title || data.en?.title || ''
    const s = toSlug(title)
    const itemSlug = s ? `${num}-${s}` : num
    if (itemSlug === slug || String(data.order) === slug || d.id === slug) {
      return { id: d.id, ...data }
    }
  }
  return null
}

export default async function handler(req, res) {
  const p = req.query.p || '/'

  try {
    // /story/{slug}
    const storyMatch = p.match(/^\/story\/(.+)$/)
    if (storyMatch) {
      const story = await findStory(storyMatch[1])
      if (story) {
        const title = story.titleVi || story.titleEn || ''
        const content = story.contentVi || story.contentEn || ''
        const desc = content.slice(0, 160).replace(/\n/g, ' ') + (content.length > 160 ? '...' : '')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(renderOgPage({
          title: `${title} | ${SITE_NAME}`,
          description: desc,
          url: `${SITE_URL}/story/${storyMatch[1]}`,
        }))
      }
    }

    // /article/{slug}
    const articleMatch = p.match(/^\/article\/(.+)$/)
    if (articleMatch) {
      const article = await findArticle(articleMatch[1])
      if (article) {
        const title = article.vi?.title || article.en?.title || ''
        const summary = article.vi?.summary || article.en?.summary || ''
        const desc = summary || (article.vi?.body || '').slice(0, 160).replace(/\n/g, ' ')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(renderOgPage({
          title: `${title} | ${SITE_NAME}`,
          description: desc,
          url: `${SITE_URL}/article/${articleMatch[1]}`,
        }))
      }
    }

    // /khaitri/{slug}
    const khaitriMatch = p.match(/^\/khaitri\/(.+)$/)
    if (khaitriMatch) {
      const item = await findKhaiTri(khaitriMatch[1])
      if (item) {
        const title = item.vi?.title || item.en?.title || ''
        const summary = item.vi?.summary || item.en?.summary || ''
        const desc = summary || (item.vi?.body || '').slice(0, 160).replace(/\n/g, ' ')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(renderOgPage({
          title: `${title} | Khai Trí`,
          description: desc,
          url: `${SITE_URL}/khaitri/${khaitriMatch[1]}`,
        }))
      }
    }
  } catch (e) {
    console.error('OG handler error:', e)
  }

  // Default fallback
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(renderOgPage({ url: SITE_URL }))
}
