// GET /api/agent-spec — single source of truth for agents.
// Agents fetch this BEFORE every task to discover schemas + endpoints.
// When schemas/*.js change, this auto-reflects → no manual doc updates needed.

import * as KhaiTri from '../schemas/khaitri.js'
import * as Articles from '../schemas/articles.js'

const EXAMPLES = {
  khaitri_create: {
    method: 'POST', path: '/api/khaitri',
    body: {
      sourceRef: 'khaitri-2026-05-03-example-slug',
      order: 6,
      date: '2026-05-03',
      tag: { vi: 'Khai Trí', en: 'Enlightenment' },
      vi: {
        title: 'Tiêu đề ngắn', question: 'Câu hỏi của người hỏi',
        summary: 'Tóm tắt 1-2 câu',
        body: 'Hỏi:\nThưa Thầy, ...\n\nĐáp:\nKhi con ...'
      },
      en: {
        title: 'Short title', question: 'The question asked',
        summary: '1-2 sentence summary',
        body: 'Question:\nMaster, ...\n\nAnswer:\nWhen you ...'
      },
      status: 'draft',
    },
  },

  article_create: {
    method: 'POST', path: '/api/articles',
    body: {
      sourceRef: 'phi-thuyen-mat-ngu-2026-05-06',
      topic: 'tam-linh',
      date: '2026-05-06',
      image: 'https://pub-xxx.r2.dev/immortality-vn/articles/foo-1730000000000.jpg',
      tag: { vi: 'Mất Ngủ', en: 'Insomnia' },
      vi: {
        title: 'Phương pháp Phi Thuyền chữa mất ngủ',
        summary: 'Tóm tắt ngắn',
        body: 'Đoạn 1...\n\nĐoạn 2...',
      },
      en: {
        title: 'Phi Thuyen method for insomnia',
        summary: 'Short summary',
        body: 'Paragraph 1...\n\nParagraph 2...',
      },
      status: 'draft',
    },
  },

  upload_image: {
    method: 'POST', path: '/api/upload-from-url',
    body: { url: 'https://api.telegram.org/file/bot.../photos/x.jpg', intent: 'article', slug: 'phi-thuyen-mat-ngu' },
    response_example: {
      ok: true,
      url: 'https://pub-xxx.r2.dev/immortality-vn/articles/phi-thuyen-mat-ngu-1730000000000.jpg',
      key: 'immortality-vn/articles/phi-thuyen-mat-ngu-1730000000000.jpg',
      bytes: 234567, contentType: 'image/jpeg',
    },
  },
}

const ENDPOINTS = [
  { method: 'GET', path: '/api/agent-spec', auth: 'none', purpose: 'Fetch this spec.' },

  // Khai Trí
  { method: 'GET', path: '/api/khaitri', auth: 'bearer', purpose: 'List all khaitri docs.' },
  { method: 'POST', path: '/api/khaitri', auth: 'bearer', purpose: 'Create khaitri (sourceRef must not exist; 409 if dup).' },
  { method: 'GET', path: '/api/khaitri/:id', auth: 'bearer', purpose: 'Fetch single khaitri.' },
  { method: 'PUT', path: '/api/khaitri/:id', auth: 'bearer', purpose: 'Full update by id.' },
  { method: 'PATCH', path: '/api/khaitri/:id', auth: 'bearer', purpose: 'Partial update by id.' },
  { method: 'DELETE', path: '/api/khaitri/:id', auth: 'bearer', purpose: 'Delete by id.' },
  { method: 'POST', path: '/api/khaitri/validate', auth: 'bearer', purpose: 'Dry-run validation.' },

  // Articles
  { method: 'GET', path: '/api/articles', auth: 'bearer', purpose: 'List all articles (date desc).' },
  { method: 'POST', path: '/api/articles', auth: 'bearer', purpose: 'Create article (sourceRef must not exist; 409 if dup).' },
  { method: 'GET', path: '/api/articles/:id', auth: 'bearer', purpose: 'Fetch single article.' },
  { method: 'PUT', path: '/api/articles/:id', auth: 'bearer', purpose: 'Full update by id.' },
  { method: 'PATCH', path: '/api/articles/:id', auth: 'bearer', purpose: 'Partial update by id.' },
  { method: 'DELETE', path: '/api/articles/:id', auth: 'bearer', purpose: 'Delete by id.' },

  // Upload
  { method: 'POST', path: '/api/upload-from-url', auth: 'bearer', purpose: 'Fetch source URL → upload to R2 → return permanent URL.' },
]

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed', allow: ['GET'] })
  }
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.status(200).send(JSON.stringify({
    ok: true,
    domain: 'immortality.vn / battudao.com',

    collections: {
      khaitri: {
        schema_version: KhaiTri.SCHEMA_VERSION,
        schema: KhaiTri.KHAITRI_SCHEMA,
        rules: KhaiTri.RULES,
        tag_map_vi_en: KhaiTri.TAG_MAP_VI_TO_EN,
      },
      articles: {
        schema_version: Articles.SCHEMA_VERSION,
        schema: Articles.ARTICLE_SCHEMA,
        rules: Articles.RULES,
        tag_map_vi_en: Articles.TAG_MAP_VI_TO_EN,
      },
    },

    endpoints: ENDPOINTS,
    examples: EXAMPLES,

    classification: {
      purpose: 'Decide collection (articles vs khaitri) WITHOUT asking the user. Pick automatically from content shape.',
      decide_article_when: [
        'Long-form essay / explanatory writing (multiple paragraphs of prose).',
        'Content title is a noun phrase / topic ("Linh thai — vệ tinh tâm linh", "Phương pháp chữa mất ngủ").',
        'No explicit Hỏi/Đáp (or Question/Answer) markers in the body.',
        'Body discusses a method, concept, or teaching in narrative form.',
        'Default fallback when uncertain.',
      ],
      decide_khaitri_when: [
        'Body contains explicit "Hỏi:" / "Đáp:" markers (or English "Question:" / "Answer:").',
        'Title is phrased as a question ("Vì sao ngồi thiền...?", "Cốt sống thư lỏng là gì?").',
        'Single Q paired with one or more A paragraphs (transcript-style).',
      ],
      tie_breaker: 'If both signals present: count Q/A markers. Two or more pairs ⇒ khaitri. Otherwise ⇒ article.',
      do_not_ask_user: 'Auto-classify and proceed. Only confirm with user if classification confidence is genuinely <70%.',
    },

    storage: {
      backend: 'cloudflare-r2',
      bucket: 'shared (project-prefixed)',
      key_prefix: 'immortality-vn/',
      upload_endpoint: '/api/upload-from-url',
      intents: ['article', 'khaitri'],
    },

    auth: {
      type: 'firebase-id-token',
      header: 'Authorization: Bearer <ID_TOKEN>',
      how_to_get_token: 'POST identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<API_KEY> with { email, password, returnSecureToken: true }',
      token_ttl_seconds: 3600,
      refresh: 'POST securetoken.googleapis.com/v1/token?key=<API_KEY> body grant_type=refresh_token&refresh_token=<rt>',
      allowlist: 'Token email must be in AGENT_ALLOWLIST_EMAILS env var (default: agent@battudao.com).',
    },

    suggested_pipeline: [
      '1. signInWithPassword → idToken (cache 55 min)',
      '2. GET /api/agent-spec → discover schemas, examples, validation rules, CLASSIFICATION rules',
      '3. Receive content from user → CLASSIFY (article vs khaitri) using classification rules — DO NOT ASK USER',
      '4. Generate / translate content as needed (Vi+En both required)',
      '5. (Optional) Generate image → temporary URL',
      '6. POST /api/upload-from-url { url, intent, slug } → permanent R2 URL',
      '7. POST /api/articles OR /api/khaitri (per classification) { ..., image, sourceRef }',
      '8. Reply to user with: classification chosen, sourceRef, doc id, public URL',
    ],
  }, null, 2))
}
