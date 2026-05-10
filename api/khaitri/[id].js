// /api/khaitri/:id — GET / PUT / PATCH / DELETE
// Auth: Bearer Firebase ID token (allowlist).

import { validateKhaiTri } from '../../schemas/khaitri.js'
import { requireAgent, jsonError, applyCors } from '../_lib/auth.js'
import { db, FieldValue } from '../_lib/db.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  const auth = await requireAgent(req)
  if (!auth.ok) return jsonError(res, auth.status, auth.error, auth.detail)

  const id = req.query.id
  if (!id || typeof id !== 'string') return jsonError(res, 400, 'missing_id')

  const ref = db().collection('khaitri').doc(id)

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

    // For PUT (full update): merge data on top of existing for validation purposes.
    // For PATCH: only validate provided fields against allowMissingEn=true.
    const merged = isPartial ? { ...existing.data(), ...data, vi: { ...existing.data().vi, ...(data.vi || {}) }, en: { ...existing.data().en, ...(data.en || {}) }, tag: { ...existing.data().tag, ...(data.tag || {}) } } : data

    // Existing orders excluding self
    const allSnap = await db().collection('khaitri').get()
    const existingOrders = allSnap.docs.filter(d => d.id !== id).map(d => Number(d.data().order)).filter(Number.isInteger)

    const v = validateKhaiTri(merged, { existingOrders, allowMissingEn: isPartial })
    if (!v.ok) {
      return res.status(422).json({
        ok: false,
        error: 'validation_failed',
        errors: v.errors,
        suggested_next_order: existingOrders.length ? Math.max(0, ...existingOrders) + 1 : 1,
      })
    }

    // Build dot-notation update payload to preserve unrelated admin edits.
    const update = isPartial ? flatten(data) : flatten(v.normalized)
    update.updatedAt = FieldValue.serverTimestamp()
    update.updatedBy = auth.email
    await ref.update(update)
    const after = await ref.get()
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).send(JSON.stringify({ ok: true, id, doc: { id, ...after.data() } }))
  }

  return jsonError(res, 405, 'method_not_allowed', 'Allow: GET, PUT, PATCH, DELETE')
}

// Flatten { vi: { title, body }, tag: { vi } } → { 'vi.title', 'vi.body', 'tag.vi' }
// Avoids whole-subdoc clobber on partial updates.
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
