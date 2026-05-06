// /api/articles/:id — GET / PUT / PATCH / DELETE
// Auth: Bearer Firebase ID token (allowlist).

import { validateArticle } from '../../schemas/articles.js'
import { requireAgent, jsonError } from '../_lib/auth.js'
import { db, FieldValue } from '../_lib/db.js'
import { articleSlugFields } from '../_lib/slug.js'

export default async function handler(req, res) {
  const auth = await requireAgent(req)
  if (!auth.ok) return jsonError(res, auth.status, auth.error, auth.detail)

  const id = req.query.id
  if (!id || typeof id !== 'string') return jsonError(res, 400, 'missing_id')

  const ref = db().collection('articles').doc(id)

  if (req.method === 'GET') {
    const doc = await ref.get()
    if (!doc.exists) return jsonError(res, 404, 'not_found')
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).send(JSON.stringify({ ok: true, id, doc: doc.data() }))
  }

  if (req.method === 'DELETE') {
    const doc = await ref.get()
    if (!doc.exists) return jsonError(res, 404, 'not_found')
    await ref.delete()
    return res.status(200).json({ ok: true, deleted: id })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { return jsonError(res, 400, 'invalid_json') } }
    const data = body || {}
    const isPartial = req.method === 'PATCH'

    const existing = await ref.get()
    if (!existing.exists) return jsonError(res, 404, 'not_found')

    const merged = isPartial
      ? { ...existing.data(), ...data,
          vi: { ...existing.data().vi, ...(data.vi || {}) },
          en: { ...existing.data().en, ...(data.en || {}) },
          tag: { ...existing.data().tag, ...(data.tag || {}) } }
      : data

    const v = validateArticle(merged, { allowMissingEn: isPartial })
    if (!v.ok) {
      return res.status(422).json({ ok: false, error: 'validation_failed', errors: v.errors })
    }

    const update = isPartial ? flatten(data) : flatten(v.normalized)
    // Re-stamp slug fields if title changed (or always for full replace)
    const titleChanged = data.vi?.title !== undefined || data.en?.title !== undefined || !isPartial
    if (titleChanged) {
      const slugSrc = isPartial
        ? { vi: { title: merged.vi?.title }, en: { title: merged.en?.title } }
        : v.normalized
      const slugs = articleSlugFields(slugSrc)
      update.viSlug = slugs.viSlug
      update.enSlug = slugs.enSlug
    }
    update.updatedAt = FieldValue.serverTimestamp()
    update.updatedBy = auth.email
    await ref.update(update)
    const after = await ref.get()
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).send(JSON.stringify({ ok: true, id, doc: { id, ...after.data() } }))
  }

  return jsonError(res, 405, 'method_not_allowed', 'Allow: GET, PUT, PATCH, DELETE')
}

// Flatten nested object → dot-notation keys (preserves unrelated admin edits on partial update).
function flatten(obj, prefix = '') {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'createdAt' || k === 'createdBy') continue
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v.constructor && v.constructor.name === 'FieldValue')) {
      Object.assign(out, flatten(v, key))
    } else {
      out[key] = v
    }
  }
  return out
}
