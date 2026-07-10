/**
 * Phase-02 transform: .dump/*.json → .dump/import.sql (upserts into public.content).
 * Preserves Firestore doc id (content.id) + slugs. Idempotent: ON CONFLICT (id) DO UPDATE.
 * Dollar-quoting ($mig$) avoids escaping bodies with quotes/newlines.
 *
 * Handles 3 content shapes:
 *   articles/khaitri/teachings/practices : nested { vi:{title,summary,body,question}, en:{...} }, viSlug/enSlug
 *   stories                              : flat titleVi/contentVi/lessonVi/... + titleEn/...
 * Config (settings/translations) seeded in phase-01; not re-imported here.
 *
 * Run: node scripts/migrate/transform-to-sql.cjs   → writes .dump/import.sql
 */
const fs = require('fs')
const path = require('path')
const DUMP = path.join(__dirname, '.dump')

const TAG = 'mig'
function q(v) {
  if (v === undefined || v === null || v === '') return 'null'
  const s = String(v)
  if (s.includes(`$${TAG}$`)) throw new Error('dollar-tag collision in body')
  return `$${TAG}$${s}$${TAG}$`
}
function slugify(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}
const read = (name) => {
  const p = path.join(DUMP, `${name}.json`)
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []
}

const COLS = ['id','type','status','vi_title','en_title','vi_summary','en_summary',
  'vi_body','en_body','vi_question','en_question','vi_slug','en_slug','order_index',
  'content_date','source_ref','created_by','thumbnail_url','extra']

// extra jsonb (NOT NULL default '{}'): field per-type ngoài schema phẳng (0013).
// Bỏ key null/undefined; luôn trả JSON hợp lệ (không trả null — cột NOT NULL).
function extraJson(obj) {
  const clean = Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''))
  return JSON.stringify(clean)
}

function row(o) {
  return '(' + COLS.map((c) => (c === 'order_index' && o[c] != null ? o[c] : q(o[c]))).join(', ') + ')'
}

function fromNested(d, type) {
  const vi = d.vi || {}, en = d.en || {}
  const viSlug = d.viSlug || (type === 'khaitri' && d.order != null ? `${d.order}-${slugify(vi.title)}` : null)
  return {
    id: d.id, type, status: d.status || 'published',
    vi_title: vi.title, en_title: en.title, vi_summary: vi.summary, en_summary: en.summary,
    vi_body: vi.body, en_body: en.body, vi_question: vi.question, en_question: en.question,
    vi_slug: viSlug, en_slug: d.enSlug || null,
    order_index: type === 'khaitri' ? (d.order ?? null) : null,
    content_date: d.date || null, source_ref: d.sourceRef || null,
    created_by: d.createdBy || null, thumbnail_url: d.image || null,
    // tag/topic/source: card chips + filter trên web dùng trực tiếp (mất trong bản import đầu)
    extra: extraJson({ tag: d.tag, topic: d.topic, source: d.source }),
  }
}
function fromStory(d) {
  return {
    id: d.id, type: 'story', status: d.status || 'published',
    vi_title: d.titleVi, en_title: d.titleEn, vi_summary: d.lessonVi, en_summary: d.lessonEn,
    vi_body: d.contentVi, en_body: d.contentEn, vi_question: null, en_question: null,
    vi_slug: d.order != null ? `${d.order}-${slugify(d.titleVi)}` : slugify(d.titleVi), en_slug: null,
    // order: StoriesPage sort + storySlug đều cần (bản đầu để null → trang 37 chuyện vỡ)
    order_index: d.order ?? null, content_date: null, source_ref: null,
    created_by: null, thumbnail_url: d.image || null,
    extra: extraJson({
      tag: d.tag,
      threadVi: d.threadVi, threadEn: d.threadEn,
      highlightsVi: d.highlightsVi, highlightsEn: d.highlightsEn,
    }),
  }
}

const rows = []
for (const t of ['articles', 'khaitri', 'teachings', 'practices']) {
  for (const d of read(t)) rows.push(fromNested(d, t.replace(/s$/, '') === 'article' ? 'article' : t === 'khaitri' ? 'khaitri' : t === 'teachings' ? 'teaching' : 'practice'))
}
for (const d of read('stories')) rows.push(fromStory(d))

const sql = `-- Auto-generated phase-02 content import (${rows.length} rows). Idempotent upsert.
insert into public.content (${COLS.join(', ')}) values
${rows.map(row).join(',\n')}
on conflict (id) do update set
  type=excluded.type, status=excluded.status,
  vi_title=excluded.vi_title, en_title=excluded.en_title,
  vi_summary=excluded.vi_summary, en_summary=excluded.en_summary,
  vi_body=excluded.vi_body, en_body=excluded.en_body,
  vi_question=excluded.vi_question, en_question=excluded.en_question,
  vi_slug=excluded.vi_slug, en_slug=excluded.en_slug,
  order_index=excluded.order_index, content_date=excluded.content_date,
  source_ref=excluded.source_ref, created_by=excluded.created_by,
  thumbnail_url=excluded.thumbnail_url, extra=excluded.extra, updated_at=now();
`
fs.writeFileSync(path.join(DUMP, 'import.sql'), sql)
const byType = rows.reduce((m, r) => ((m[r.type] = (m[r.type] || 0) + 1), m), {})
console.log('rows:', rows.length, byType)
console.log('→', path.join(DUMP, 'import.sql'))
