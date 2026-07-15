// GET /api/agent-spec — single source of truth for agents.
// Agents fetch this BEFORE every task to discover schemas + endpoints.
//
// 2026-07-15: Firestore CRUD endpoints retired. Content writes go to the
// Cloudflare Worker (/v1/content, flat bilingual columns, btd_ key auth).
// Only media upload stays on Vercel (R2 credentials live here).

const WORKER_BASE = 'https://btd-api.mr-dang1305.workers.dev/v1'

const CONTENT_SCHEMA = {
  description: 'Flat bilingual row in Supabase public.content. At least one of id/source_ref required. source_ref is the idempotency key: re-POST with same source_ref updates instead of duplicating.',
  fields: {
    type: "required — 'article' | 'story' | 'khaitri' | 'teaching' | 'practice'",
    status: "'draft' | 'published' | 'archived' (default 'draft'; policy 2026-07-13: agent posts go straight to 'published')",
    source_ref: 'idempotency key, e.g. article-2026-07-15-slug or khaitri-2026-07-15-slug',
    vi_title: 'string', en_title: 'string',
    vi_summary: 'string', en_summary: 'string',
    vi_body: 'string — plain paragraphs; khaitri uses Hỏi:/Đáp: blocks',
    en_body: 'string — plain paragraphs; khaitri uses Question:/Answer: blocks',
    vi_slug: 'kebab-case, no diacritics', en_slug: 'kebab-case',
    vi_question: 'khaitri only', en_question: 'khaitri only',
    order_index: 'khaitri only — integer, max(existing)+1, NEVER timestamps',
    content_date: 'ISO 8601 datetime — articles sort by this desc',
    thumbnail_url: 'public R2 URL from upload endpoints below',
    tags: "string array, e.g. ['Tâm Linh', 'Spiritual']",
    created_by: 'agent name for provenance',
    allow_duplicate: 'boolean — set true ONLY for a deliberate repost; otherwise identical title+body under a new source_ref is rejected 409 DUPLICATE_CONTENT',
  },
}

const EXAMPLES = {
  content_create: {
    method: 'POST', path: `${WORKER_BASE}/content`,
    body: {
      type: 'article',
      status: 'published',
      source_ref: 'article-2026-07-15-example-slug',
      content_date: '2026-07-15T00:00:00Z',
      vi_title: 'Tiêu đề', en_title: 'Title',
      vi_summary: 'Tóm tắt 1-2 câu', en_summary: 'Short summary',
      vi_body: 'Đoạn 1...\n\nĐoạn 2...', en_body: 'Paragraph 1...\n\nParagraph 2...',
      vi_slug: 'tieu-de', en_slug: 'title',
      tags: ['Tâm Linh', 'Spiritual'],
      created_by: 'goclaw-publisher-v1',
    },
    response_example: { ok: true, id: '<uuid>', type: 'article', status: 'published' },
  },

  content_search_by_title: {
    method: 'GET', path: `${WORKER_BASE}/content?q=cứu giúp bản thân&type=eq.article&limit=5`,
    purpose: 'Resolve a row id from a human-known title — no id needed up front.',
    response_example: { ok: true, count: 1, rows: [{ id: '<uuid>', source_ref: '...', vi_title: '...', thumbnail_url: null }] },
  },

  attach_hero: {
    method: 'PATCH', path: `${WORKER_BASE}/content/<id>`,
    body: { thumbnail_url: 'https://pub-xxx.r2.dev/immortality-vn/articles/slug-1730000000000.png' },
  },

  upload_image_from_url: {
    method: 'POST', path: '/api/upload-from-url',
    body: { url: 'https://api.telegram.org/file/bot.../photos/x.jpg', intent: 'article', slug: 'phi-thuyen-mat-ngu' },
    response_example: {
      ok: true,
      url: 'https://pub-xxx.r2.dev/immortality-vn/articles/phi-thuyen-mat-ngu-1730000000000.jpg',
      key: 'immortality-vn/articles/phi-thuyen-mat-ngu-1730000000000.jpg',
      bytes: 234567, contentType: 'image/jpeg',
    },
  },

  upload_image_local_bytes: {
    method: 'POST', path: '/api/upload-file',
    headers: { 'Content-Type': 'image/png', 'X-Intent': 'article', 'X-Slug': 'phi-thuyen-mat-ngu' },
    body: '<raw image bytes>',
    purpose: 'For locally generated images (create_image output) — no public URL needed.',
  },
}

const ENDPOINTS = [
  { method: 'GET', path: '/api/agent-spec', auth: 'none', purpose: 'Fetch this spec.' },

  // Content — Cloudflare Worker, Supabase-backed. Same btd_ Bearer key.
  { method: 'GET', path: `${WORKER_BASE}/content`, auth: 'bearer btd_ (content:read)', purpose: 'List/search. Filters: id, source_ref, type, status, vi_slug, en_slug (PostgREST eq. style), q=<title text>, limit, order.' },
  { method: 'POST', path: `${WORKER_BASE}/content`, auth: 'bearer btd_ (content:write)', purpose: 'Create/upsert by source_ref. 409 DUPLICATE_CONTENT if same title+body exists under another source_ref.' },
  { method: 'PATCH', path: `${WORKER_BASE}/content/:id`, auth: 'bearer btd_ (content:write)', purpose: 'Partial update by id (status, thumbnail_url, slugs, bodies…).' },

  // Media — Vercel (R2 credentials live here)
  { method: 'POST', path: '/api/upload-from-url', auth: 'bearer btd_ (media:write)', purpose: 'Fetch a public http(s) URL and store in R2. Returns permanent public URL.' },
  { method: 'POST', path: '/api/upload-file', auth: 'bearer btd_ (media:write)', purpose: 'Upload raw image bytes (Content-Type + X-Intent + X-Slug headers).' },
]

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=300')
  return res.status(200).send(JSON.stringify({
    version: '2026-07-15',
    auth: 'All write endpoints: Authorization: Bearer btd_<32hex>. Keys are per-agent, scoped (content:read, content:write, media:write). Firebase auth is RETIRED.',
    content_schema: CONTENT_SCHEMA,
    endpoints: ENDPOINTS,
    examples: EXAMPLES,
  }, null, 2))
}
