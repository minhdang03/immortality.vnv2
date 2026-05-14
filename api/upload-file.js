// /api/upload-file — Direct binary upload for agent workflows.
// Accepts raw image bytes in request body and pipes them to Cloudflare R2.
//
// Why this exists (vs /api/upload-from-url):
//   /api/upload-from-url only accepts public http(s) URLs (SSRF-hardened — denies
//   data:, file:, and private IPs). Agents that generate images locally (in a
//   workspace) have no public URL to point at, and sending the image as a base64
//   data: URL inflates payload by ~33% so even modest images hit Vercel's
//   request body limit. This endpoint takes bytes directly — no URL, no base64.
//
// Request:
//   POST /api/upload-file
//   Authorization: Bearer <firebase id token>
//   Content-Type:  image/png | image/jpeg | image/webp | image/gif
//   X-Intent:      article | khaitri
//   X-Slug:        optional kebab-case slug for the filename (e.g. "bai-hoc-reset")
//   <body>:        raw image bytes (≤ 8 MB; Vercel platform may cap lower)
//
// Response 200:
//   { ok: true, url, key, bytes, contentType }
//
// Vercel note: bodyParser is disabled here so binary body arrives intact.
// The platform still enforces its own request size limit (4.5 MB Hobby,
// configurable on Pro). If your image exceeds that, downscale before posting.

import { requireAgent, jsonError, applyCors } from './_lib/auth.js'
import { db, FieldValue } from './_lib/db.js'
import {
  MAX_BYTES, ALLOWED_CT, ALLOWED_INTENTS, uploadToR2,
} from './_lib/r2.js'

export const config = { api: { bodyParser: false } }

async function readRawBody(req, maxBytes) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > maxBytes) {
      const err = new Error('payload_too_large')
      err.code = 'payload_too_large'
      throw err
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') return jsonError(res, 405, 'method_not_allowed', 'POST only')

  const auth = await requireAgent(req)
  if (!auth.ok) return jsonError(res, auth.status, auth.error, auth.detail)

  // Validate headers before reading body — fail fast on bad requests.
  const intent = (req.headers['x-intent'] || '').toString().trim()
  const slug = (req.headers['x-slug'] || '').toString().trim()
  const contentType = (req.headers['content-type'] || '').toString().split(';')[0].trim().toLowerCase()

  if (!ALLOWED_INTENTS.has(intent)) {
    return jsonError(res, 400, 'invalid_intent', 'X-Intent header must be "article" or "khaitri"')
  }
  if (!ALLOWED_CT.has(contentType)) {
    return jsonError(res, 415, 'unsupported_content_type', `Content-Type must be one of: ${[...ALLOWED_CT].join(', ')}; got "${contentType}"`)
  }

  let bytes
  try {
    bytes = await readRawBody(req, MAX_BYTES)
  } catch (e) {
    if (e.code === 'payload_too_large') {
      return jsonError(res, 413, 'payload_too_large', `body exceeds ${MAX_BYTES} bytes; downscale and retry`)
    }
    return jsonError(res, 400, 'body_read_failed', e.message)
  }
  if (bytes.length === 0) return jsonError(res, 400, 'empty_body', 'request body is empty')

  let uploaded
  try {
    uploaded = await uploadToR2({ bytes, contentType, intent, slug })
  } catch (e) {
    if (e.code === 'r2_not_configured') return jsonError(res, 500, 'r2_not_configured', e.message)
    return jsonError(res, 500, 'upload_failed', e.message)
  }

  try {
    await db().collection('agent_log').add({
      action: 'upload.image',
      params: {
        source: 'upload-file',
        intent,
        key: uploaded.key,
        contentType: uploaded.contentType,
        size: uploaded.bytes,
        backend: 'r2',
      },
      status: 'success',
      actor: auth.email,
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch (e) {
    console.warn('agent_log write failed', e.message)
  }

  res.setHeader('Content-Type', 'application/json')
  return res.status(200).send(JSON.stringify({ ok: true, ...uploaded }))
}
