import { readFileSync } from 'fs'
import { join } from 'path'

// OG meta renderer for crawlers. Data source: Supabase `public.content` (single
// indexed query on slug/id, status=published). Firebase/Firestore removed 21/07/2026.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const SITE_NAME = 'Bất Tử Đạo - Immortality'
const CANONICAL_URL = 'https://battudao.com'
const DEFAULT_IMAGE = `${CANONICAL_URL}/og-image.png`
const DEFAULT_DESC = 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.'
const LIVE_DESC = 'Xem hoạt động ẩn danh đang diễn ra trên Bất Tử Đạo theo thời gian thực.'

function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function isCrawler(req) {
  const ua = req.headers['user-agent'] || ''
  return /bot|crawler|spider|facebook|twitter|linkedin|whatsapp|slack|telegram|discord|google|bing|yahoo|baidu|applebot|sogou|exabot|ia_archiver/i.test(ua)
}

async function serveApp(res) {
  // Try monorepo path first (apps/web/dist), fall back to legacy single-app path.
  const candidates = [
    join(process.cwd(), 'apps/web/dist/index.html'),
    join(process.cwd(), 'dist/index.html'),
  ]
  for (const p of candidates) {
    try {
      const html = readFileSync(p, 'utf8')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(html)
    } catch { /* try next */ }
  }
  // Last-ditch network fetch — hits the static catch-all rewrite, NOT this function.
  try {
    const html = await fetch(`${CANONICAL_URL}/index.html`).then(r => r.text())
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(html)
  } catch (e) {
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send('<!doctype html><meta charset=utf-8><title>SPA shell unavailable</title><p>App shell could not be served. Try refreshing.</p>')
  }
}

function renderOgPage({ title, description, image, url, siteUrl }) {
  const t = escapeHtml(title || SITE_NAME)
  const d = escapeHtml(description || DEFAULT_DESC)
  const img = escapeHtml(image || (siteUrl ? `${siteUrl}/og-image.png` : DEFAULT_IMAGE))
  const u = escapeHtml(url || siteUrl || CANONICAL_URL)

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
</head>
<body><p><a href="${u}">${t}</a></p></body>
</html>`
}

const CONTENT_SELECT = 'id,type,vi_title,en_title,vi_summary,en_summary,vi_body,en_body,thumbnail_url'

async function sbGet(path) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase env missing')
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json()
}

// Look up one published content row by slug or Firestore id (with numeric
// order_index fallback for legacy numbered routes), scoped to a content type.
// slug_redirects covers old shared links whose slug changed.
async function findContent(slug, type) {
  const s = encodeURIComponent(slug)
  const numeric = /^\d+$/.test(slug)
  const or = [
    `vi_slug.eq.${s}`,
    `en_slug.eq.${s}`,
    `id.eq.${s}`,
    ...(numeric ? [`order_index.eq.${slug}`] : []),
  ].join(',')

  const rows = await sbGet(
    `content?type=eq.${type}&status=eq.published&or=(${or})&select=${CONTENT_SELECT}&limit=1`
  )
  if (rows && rows.length) return rows[0]

  // Fallback: legacy slug redirect → content id
  const redir = await sbGet(`slug_redirects?old_slug=eq.${s}&select=content_id&limit=1`)
  if (redir && redir.length) {
    const byId = await sbGet(
      `content?id=eq.${encodeURIComponent(redir[0].content_id)}&type=eq.${type}&status=eq.published&select=${CONTENT_SELECT}&limit=1`
    )
    if (byId && byId.length) return byId[0]
  }
  return null
}

function summarize(row) {
  const summary = row.vi_summary || row.en_summary || ''
  if (summary) return summary
  const body = row.vi_body || row.en_body || ''
  return body.slice(0, 160).replace(/\n/g, ' ') + (body.length > 160 ? '...' : '')
}

export default async function handler(req, res) {
  const p = req.query.p || '/'
  const host = req.headers.host || 'battudao.com'
  const SITE_URL = `https://${host}`

  // Non-crawlers: serve the SPA directly so URL stays clean
  if (!isCrawler(req)) return serveApp(res)

  if (p === '/live') {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(renderOgPage({
      title: `Khách Đang Xem | ${SITE_NAME}`,
      description: LIVE_DESC,
      url: `${SITE_URL}/live`,
      siteUrl: SITE_URL,
    }))
  }

  try {
    // /story/{slug}
    const storyMatch = p.match(/^\/story\/(.+)$/)
    if (storyMatch) {
      const row = await findContent(storyMatch[1], 'story')
      if (row) {
        const title = row.vi_title || row.en_title || ''
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(renderOgPage({
          title: `${title} | ${SITE_NAME}`,
          description: summarize(row),
          image: row.thumbnail_url || undefined,
          url: `${SITE_URL}/story/${storyMatch[1]}`,
          siteUrl: SITE_URL,
        }))
      }
    }

    // /article/{slug} or /articles/{slug} (plural alias)
    const articleMatch = p.match(/^\/articles?\/(.+)$/)
    if (articleMatch) {
      const row = await findContent(articleMatch[1], 'article')
      if (row) {
        const title = row.vi_title || row.en_title || ''
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(renderOgPage({
          title: `${title} | ${SITE_NAME}`,
          description: summarize(row),
          image: row.thumbnail_url || undefined,
          url: `${SITE_URL}/article/${articleMatch[1]}`,
          siteUrl: SITE_URL,
        }))
      }
    }

    // /khaitri/{slug}
    const khaitriMatch = p.match(/^\/khaitri\/(.+)$/)
    if (khaitriMatch) {
      const row = await findContent(khaitriMatch[1], 'khaitri')
      if (row) {
        const title = row.vi_title || row.en_title || ''
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.send(renderOgPage({
          title: `${title} | Khai Trí`,
          description: summarize(row),
          image: row.thumbnail_url || undefined,
          url: `${SITE_URL}/khaitri/${khaitriMatch[1]}`,
          siteUrl: SITE_URL,
        }))
      }
    }
  } catch (e) {
    console.error('OG handler error:', e)
  }

  // Fallback — cache ngắn thôi: có thể là lỗi Supabase thoáng qua, đừng đóng đinh card mặc định 1h
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(renderOgPage({ url: SITE_URL, siteUrl: SITE_URL }))
}
