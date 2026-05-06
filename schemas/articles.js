// schemas/articles.js — Article shape + validation rules.
// Used by /api/articles/* and goclaw publisher skills.

export const SCHEMA_VERSION = '2026-05-06'

export const TAG_MAP_VI_TO_EN = {
  'Khai Trí': 'Enlightenment',
  'Tâm Linh': 'Spiritual',
  'Mất Ngủ': 'Insomnia',
  'Năng Lượng': 'Energy',
  'Sức Khỏe': 'Health',
  'Bài Học': 'Lesson',
  'Phương Pháp': 'Method',
}

export const ARTICLE_SCHEMA = {
  fields: {
    sourceRef: { type: 'string', required: true, description: 'Idempotency key. Stable per logical entry; same sourceRef = update existing.' },
    topic: { type: 'string', required: true, description: 'Topic id (must exist in /topics collection).' },
    date: { type: 'string', required: true, format: 'YYYY-MM-DD' },
    image: { type: 'string', required: false, description: 'Hero image URL (typically R2 public URL from /api/upload-from-url).' },
    status: { type: 'enum', values: ['draft', 'published'], default: 'draft' },
    source: { type: 'string', default: 'goclaw-publisher-v1' },
    tag: { type: 'object', required: true, fields: {
      vi: { type: 'string', required: true },
      en: { type: 'string', required: true, hint: 'Use TAG_MAP_VI_TO_EN[tag.vi] if missing' },
    }},
    vi: { type: 'object', required: true, fields: {
      title: { type: 'string', required: true, maxLen: 200 },
      question: { type: 'string', maxLen: 500 },
      summary: { type: 'string', maxLen: 500 },
      body: { type: 'string', required: true, maxLen: 50000 },
    }},
    en: { type: 'object', required: true, fields: {
      title: { type: 'string', required: true, maxLen: 200 },
      question: { type: 'string', maxLen: 500 },
      summary: { type: 'string', maxLen: 500 },
      body: { type: 'string', required: true, maxLen: 50000 },
    }},
  },
}

export const RULES = [
  'Site is bilingual Vi+En. Both vi.* AND en.* required. Translate Vi→En faithfully if source only has Vi.',
  'date MUST be a string YYYY-MM-DD. Quote in YAML to keep as string.',
  'sourceRef is the idempotency key. Same sourceRef = update existing doc, NOT a new doc.',
  'status starts as "draft". Admin promotes to "published" via UI.',
  'tag.vi from curated list: Khai Trí, Tâm Linh, Mất Ngủ, Năng Lượng, Sức Khỏe, Bài Học, Phương Pháp. tag.en uses TAG_MAP_VI_TO_EN.',
  'image is optional. To add a hero image, first POST /api/upload-from-url with intent="article" → use returned URL.',
  'topic must reference an existing /topics doc id.',
  'body can have plain paragraphs (separated by blank lines) and Q/A blocks. renderText() handles both.',
]

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isStr(v, max) { return typeof v === 'string' && v.length > 0 && (!max || v.length <= max) }

export function validateArticle(data, { allowMissingEn = false } = {}) {
  const errors = []
  const d = data || {}

  if (!isStr(d.sourceRef, 200)) errors.push('sourceRef: required string')
  if (!isStr(d.topic, 100)) errors.push('topic: required string (topic id)')
  if (!isStr(d.date) || !DATE_RE.test(d.date)) errors.push('date: required YYYY-MM-DD string')

  // Optional image — if present, must be a URL string
  if (d.image != null && d.image !== '') {
    if (typeof d.image !== 'string' || d.image.length > 1000) errors.push('image: must be a URL string ≤1000 chars')
    else if (!/^https?:\/\//i.test(d.image)) errors.push('image: must start with http:// or https://')
  }

  d.tag = d.tag || {}
  if (!isStr(d.tag.vi)) errors.push('tag.vi: required')
  if (!isStr(d.tag.en)) {
    if (d.tag.vi && TAG_MAP_VI_TO_EN[d.tag.vi]) d.tag.en = TAG_MAP_VI_TO_EN[d.tag.vi]
    else errors.push(`tag.en: required (suggestion: TAG_MAP_VI_TO_EN[${JSON.stringify(d.tag.vi)}])`)
  }

  d.vi = d.vi || {}
  if (!isStr(d.vi.title, 200)) errors.push('vi.title: required string ≤200')
  if (!isStr(d.vi.body, 50000)) errors.push('vi.body: required')

  d.en = d.en || {}
  if (!allowMissingEn) {
    if (!isStr(d.en.title, 200)) errors.push('en.title: required (translate from vi.title)')
    if (!isStr(d.en.body, 50000)) errors.push('en.body: required (translate Vi → En)')
  }

  if (d.status && !['draft', 'published'].includes(d.status)) {
    errors.push('status: must be "draft" or "published"')
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? {
      sourceRef: d.sourceRef,
      topic: d.topic,
      date: d.date,
      image: d.image || '',
      tag: { vi: d.tag.vi, en: d.tag.en },
      vi: { title: d.vi.title, question: d.vi.question || '', summary: d.vi.summary || '', body: d.vi.body },
      en: { title: d.en.title || '', question: d.en.question || '', summary: d.en.summary || '', body: d.en.body || '' },
      status: d.status || 'draft',
      source: d.source || 'goclaw-publisher-v1',
    } : null,
  }
}
