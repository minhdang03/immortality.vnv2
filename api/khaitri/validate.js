// POST /api/khaitri/validate — dry-run validation. No write, no auth needed (idempotent read of rules).
// Body: { data: <khaitri object>, mode: 'create' | 'update' }
// Returns: { ok, errors[], normalized? }

import { validateKhaiTri } from '../../schemas/khaitri.js'
import { db } from '../_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed', allow: ['POST'] })
  }
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return res.status(400).json({ ok: false, error: 'invalid_json' }) }
  }
  body = body || {}
  const data = body.data || {}
  const mode = body.mode === 'update' ? 'update' : 'create'

  // Fetch existing orders for collision check (only for 'create' or order changes)
  let existingOrders = []
  try {
    const snap = await db().collection('khaitri').get()
    existingOrders = snap.docs
      .filter(d => d.data().sourceRef !== data.sourceRef) // exclude self
      .map(d => Number(d.data().order))
      .filter(n => Number.isInteger(n))
  } catch (e) {
    // Non-fatal: validate without collision check
  }

  const result = validateKhaiTri(data, {
    existingOrders,
    allowMissingEn: mode === 'update', // partial updates can omit En
  })

  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify({
    ...result,
    mode,
    suggested_next_order: existingOrders.length ? Math.max(0, ...existingOrders) + 1 : 1,
  }))
}
