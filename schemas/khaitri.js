// schemas/khaitri.js — Single source of truth for Khai Trí data shape + validation rules.
// Used by /api/khaitri/* endpoints AND by the goclaw immortality-publisher skill.
// When this file changes, both human (admin form) and AI agent paths get the new rules.

export const SCHEMA_VERSION = '2026-05-03'

// Vi → En tag mapping. Used by validate to suggest defaults when tagEn missing.
export const TAG_MAP_VI_TO_EN = {
  'Khai Trí': 'Enlightenment',
  'Tâm Linh': 'Spiritual',
  'Mất Ngủ': 'Insomnia',
  'Năng Lượng': 'Energy',
  'Sức Khỏe': 'Health',
}

// Field schema in declarative form — easy to introspect via /api/agent-spec.
export const KHAITRI_SCHEMA = {
  fields: {
    sourceRef: { type: 'string', required: true, description: 'Idempotency key. Stable per logical entry.' },
    order: { type: 'integer', required: true, min: 1, max: 9999, description: 'Display order. MUST be max(existing)+1, NOT timestamp.' },
    date: { type: 'string', required: true, format: 'YYYY-MM-DD', description: 'Quote in YAML to keep as string, not Date object.' },
    status: { type: 'enum', values: ['draft', 'published'], default: 'draft', description: 'Always start as draft for human review.' },
    source: { type: 'string', default: 'goclaw-publisher-v1' },
    tag: { type: 'object', required: true, fields: {
      vi: { type: 'string', required: true },
      en: { type: 'string', required: true, hint: 'Use TAG_MAP_VI_TO_EN[tag.vi] if missing' },
    }},
    vi: { type: 'object', required: true, fields: {
      title: { type: 'string', required: true, maxLen: 200 },
      question: { type: 'string', required: true, maxLen: 500 },
      summary: { type: 'string', maxLen: 500 },
      body: { type: 'string', required: true, format: 'qa-blocks' },
    }},
    en: { type: 'object', required: true, fields: {
      title: { type: 'string', required: true, maxLen: 200, note: 'BILINGUAL REQUIRED' },
      question: { type: 'string', required: true, maxLen: 500 },
      summary: { type: 'string', maxLen: 500 },
      body: { type: 'string', required: true, format: 'qa-blocks-en' },
    }},
  },
}

// Authoritative rule list — agent reads these via /api/agent-spec
export const RULES = [
  'order MUST be max(existing orders) + 1. NEVER use timestamp like 20260503001.',
  'Site is bilingual Vi+En. Both vi.* AND en.* fields required. Translate Vi→En faithfully if source only has Vi.',
  'body MUST contain only Hỏi:/Đáp: blocks (Vi) or Question:/Answer: blocks (En) separated by blank lines.',
  'NO markdown headings (# / ## / ###) in body — renderText() in apps/immortality-vn/src/components/shared/ReadingHelpers.jsx does not parse markdown, the # chars render literally.',
  'NO bullet lists or markdown formatting in body. If source has framing/key-points sections, fold insights INTO the Đáp: answer.',
  'date MUST be a string YYYY-MM-DD. In YAML frontmatter, quote it: \'2026-05-03\' — unquoted becomes a Date object and breaks regex validation.',
  'sourceRef is the idempotency key. Same sourceRef = update existing doc, NOT a new doc.',
  'status always starts as "draft". Admin manually promotes to "published" via UI.',
  'tag.vi must match one of the curated tags: Khai Trí, Tâm Linh, Mất Ngủ, Năng Lượng, Sức Khỏe. tag.en uses the TAG_MAP_VI_TO_EN mapping.',
]

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const HEADING_RE = /^#+\s/m

function validateBody(s, lang) {
  const errors = []
  if (HEADING_RE.test(s)) errors.push(`${lang}.body: contains markdown heading (# or ##) — not supported by renderText, will display raw`)
  if (lang === 'vi') {
    if (!/(^|\n)\s*Hỏi\s*[:：]/i.test(s)) errors.push('vi.body: missing "Hỏi:" Q&A block')
    if (!/(^|\n)\s*Đáp\s*[:：]/i.test(s)) errors.push('vi.body: missing "Đáp:" answer block')
  } else if (lang === 'en') {
    if (!/(^|\n)\s*Question\s*[:：]/i.test(s)) errors.push('en.body: missing "Question:" Q&A block')
    if (!/(^|\n)\s*Answer\s*[:：]/i.test(s)) errors.push('en.body: missing "Answer:" answer block')
  }
  return errors
}

function isStr(v, max) { return typeof v === 'string' && v.length > 0 && (!max || v.length <= max) }

// validateKhaiTri(data) → { ok, errors[], normalized }
// Used by api/khaitri/validate AND api/khaitri (write paths). publish.mjs can import too.
export function validateKhaiTri(data, { existingOrders = [], allowMissingEn = false } = {}) {
  const errors = []
  const d = data || {}

  if (!isStr(d.sourceRef, 200)) errors.push('sourceRef: required string')
  if (!Number.isInteger(d.order) || d.order < 1 || d.order > 9999) {
    errors.push(`order: required integer 1..9999 (got ${JSON.stringify(d.order)}). Use max(existing)+1, not a timestamp.`)
  } else if (existingOrders.length && existingOrders.includes(d.order) && !d.sourceRef /* updating same doc OK */) {
    errors.push(`order ${d.order} already used by another doc — pick max(existing)+1 = ${Math.max(0, ...existingOrders) + 1}`)
  }
  if (!isStr(d.date) || !DATE_RE.test(d.date)) errors.push('date: required YYYY-MM-DD string (quote in YAML to avoid Date object)')

  // Tag
  d.tag = d.tag || {}
  if (!isStr(d.tag.vi)) errors.push('tag.vi: required')
  if (!isStr(d.tag.en)) {
    if (d.tag.vi && TAG_MAP_VI_TO_EN[d.tag.vi]) {
      d.tag.en = TAG_MAP_VI_TO_EN[d.tag.vi] // auto-fill
    } else {
      errors.push(`tag.en: required (suggestion: TAG_MAP_VI_TO_EN[${JSON.stringify(d.tag.vi)}])`)
    }
  }

  // Vi block
  d.vi = d.vi || {}
  if (!isStr(d.vi.title, 200)) errors.push('vi.title: required string ≤200')
  if (!isStr(d.vi.question, 500)) errors.push('vi.question: required string ≤500')
  if (!isStr(d.vi.body)) errors.push('vi.body: required')
  else errors.push(...validateBody(d.vi.body, 'vi'))

  // En block — REQUIRED unless allowMissingEn (used internally for partial updates)
  d.en = d.en || {}
  if (!allowMissingEn) {
    if (!isStr(d.en.title, 200)) errors.push('en.title: required (site is bilingual — translate from vi.title)')
    if (!isStr(d.en.question, 500)) errors.push('en.question: required (translate from vi.question)')
    if (!isStr(d.en.body)) errors.push('en.body: required (translate Vi Q&A → En)')
    else errors.push(...validateBody(d.en.body, 'en'))
  } else if (d.en.body) {
    errors.push(...validateBody(d.en.body, 'en'))
  }

  // Status defaults
  if (d.status && !['draft', 'published'].includes(d.status)) {
    errors.push('status: must be "draft" or "published"')
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? {
      sourceRef: d.sourceRef,
      order: d.order,
      date: d.date,
      tag: { vi: d.tag.vi, en: d.tag.en },
      vi: { title: d.vi.title, question: d.vi.question, summary: d.vi.summary || '', body: d.vi.body },
      en: { title: d.en.title || '', question: d.en.question || '', summary: d.en.summary || '', body: d.en.body || '' },
      status: d.status || 'draft',
      source: d.source || 'goclaw-publisher-v1',
    } : null,
  }
}
