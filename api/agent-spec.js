// GET /api/agent-spec — single source of truth for agents.
// Agents fetch this BEFORE every CRUD task to know current schema + rules.
// When schemas/khaitri.js changes, this endpoint auto-reflects → no manual SKILL.md/AGENT_GUIDE updates.

import { KHAITRI_SCHEMA, RULES, TAG_MAP_VI_TO_EN, SCHEMA_VERSION } from '../schemas/khaitri.js'

const EXAMPLES = {
  khaitri_create: {
    sourceRef: 'khaitri-2026-05-03-example-slug',
    order: 6,
    date: '2026-05-03',
    tag: { vi: 'Khai Trí', en: 'Enlightenment' },
    vi: {
      title: 'Tiêu đề ngắn',
      question: 'Câu hỏi của người hỏi',
      summary: 'Tóm tắt 1-2 câu',
      body: 'Hỏi:\nThưa Thầy, ...\n\nĐáp:\nKhi con ...'
    },
    en: {
      title: 'Short title',
      question: 'The question asked',
      summary: '1-2 sentence summary',
      body: 'Question:\nMaster, ...\n\nAnswer:\nWhen you ...'
    },
    status: 'draft',
  },
}

const ENDPOINTS = [
  { method: 'GET', path: '/api/agent-spec', auth: 'none', purpose: 'Fetch this spec. No auth.' },
  { method: 'POST', path: '/api/khaitri/validate', auth: 'bearer', purpose: 'Dry-run validation. Returns errors[] without writing.' },
  { method: 'GET', path: '/api/khaitri', auth: 'bearer', purpose: 'List all docs (returns id, order, sourceRef, status, hasVi, hasEn).' },
  { method: 'POST', path: '/api/khaitri', auth: 'bearer', purpose: 'Create doc. sourceRef must NOT exist. Returns 409 if duplicate.' },
  { method: 'PUT', path: '/api/khaitri/:id', auth: 'bearer', purpose: 'Full update by docId. Body = same shape as POST.' },
  { method: 'PATCH', path: '/api/khaitri/:id', auth: 'bearer', purpose: 'Partial update. Only fields present are written (dot-notation merge).' },
]

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed', allow: ['GET'] })
  }
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.status(200).send(JSON.stringify({
    ok: true,
    schema_version: SCHEMA_VERSION,
    domain: 'immortality.vn / battudao.com',
    collection: 'khaitri',
    schema: KHAITRI_SCHEMA,
    rules: RULES,
    tag_map_vi_en: TAG_MAP_VI_TO_EN,
    endpoints: ENDPOINTS,
    examples: EXAMPLES,
    auth: {
      type: 'firebase-id-token',
      header: 'Authorization: Bearer <ID_TOKEN>',
      how_to_get_token: 'signInWithEmailAndPassword via firebase/auth client SDK; then user.getIdToken().',
      allowlist: 'Token email must be in AGENT_ALLOWLIST_EMAILS env var (default: agent@battudao.com).',
    },
  }, null, 2))
}
