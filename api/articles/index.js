// /api/articles — list (GET) + create (POST)
// Auth: Bearer Firebase ID token (allowlist).

import { validateArticle } from '../../schemas/articles.js'
import { requireAgent, jsonError, applyCors } from '../_lib/auth.js'
import { db, FieldValue } from '../_lib/db.js'
import { articleSlugFields } from '../_lib/slug.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  const auth = await requireAgent(req)
  if (!auth.ok) return jsonError(res, auth.status, auth.error, auth.detail)

  if (req.method === 'GET') return list(req, res)
  if (req.method === 'POST') return create(req, res, auth)
  return jsonError(res, 405, 'method_not_allowed', 'Allow: GET, POST')
}

async function list(req, res) {
  const snap = await db().collection('articles').orderBy('date', 'desc').get()
  const items = snap.docs.map(d => {
    const x = d.data()
    return {
      id: d.id,
      sourceRef: x.sourceRef,
      topic: x.topic,
      date: x.date,
      status: x.status,
      image: x.image || '',
      tag: { vi: x.tag?.vi, en: x.tag?.en },
      vi: { title: x.vi?.title, hasBody: !!x.vi?.body },
      en: { title: x.en?.title, hasBody: !!x.en?.body },
    }
  })
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify({ ok: true, count: items.length, items }))
}

async function create(req, res, auth) {
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return jsonError(res, 400, 'invalid_json') }
  }
  const data = body || {}

  // Idempotency check
  if (data.sourceRef) {
    const dup = await db().collection('articles').where('sourceRef', '==', data.sourceRef).limit(1).get()
    if (!dup.empty) {
      return jsonError(res, 409, 'sourceRef_exists', `doc with sourceRef "${data.sourceRef}" already exists at id=${dup.docs[0].id} — use PUT/PATCH to update`)
    }
  }

  const v = validateArticle(data, { allowMissingEn: false })
  if (!v.ok) {
    return res.status(422).json({ ok: false, error: 'validation_failed', errors: v.errors })
  }

  const slugFields = articleSlugFields(v.normalized)
  const ref = await db().collection('articles').add({
    ...v.normalized,
    ...slugFields,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: auth.email,
  })
  const created = await ref.get()
  // Convenience: tell the agent the canonical public URL so it stops guessing
  const publicUrl = slugFields.viSlug
    ? `https://battudao.com/article/${slugFields.viSlug}`
    : `https://battudao.com/article/${ref.id}`
  res.setHeader('Content-Type', 'application/json')
  res.status(201).send(JSON.stringify({ ok: true, id: ref.id, publicUrl, doc: { id: ref.id, ...created.data() } }))
}
