// /api/upload-from-url — Agent posts a source URL (Telegram, picsum, etc.),
// the function fetches bytes and uploads them to Cloudflare R2 (S3-compatible),
// then returns the permanent public URL.
//
// Why R2 (not Firebase Storage):
//   - 10 GB free storage (vs Firebase 5 GB)
//   - Unlimited egress (Firebase: 1 GB/day cap on free)
//   - No credit card required to enable (Firebase Storage now requires Blaze)
//
// Env vars required on Vercel:
//   R2_ACCOUNT_ID            — Cloudflare account id (from R2 dashboard)
//   R2_ACCESS_KEY_ID         — R2 API token access key
//   R2_SECRET_ACCESS_KEY     — R2 API token secret
//   R2_BUCKET_NAME           — bucket name (shared across projects, e.g. "phithuyen-audio")
//   R2_PUBLIC_URL            — public URL prefix (e.g. "https://pub-xxx.r2.dev")
//
// Object keys are prefixed with "immortality-vn/<intent>/<file>" so this app's
// content stays separated from other projects sharing the same bucket.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { requireAgent, jsonError } from './_lib/auth.js'
import { db, FieldValue } from './_lib/db.js'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_CT = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ALLOWED_INTENTS = new Set(['article', 'khaitri'])

let s3 = null
function getS3() {
  if (s3) return s3
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 env vars not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)')
  }
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return s3
}

function safeFilename(slug, ext) {
  const clean = (slug || 'untitled').toString().toLowerCase()
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 80)
  return `${clean}-${Date.now()}.${ext}`
}

function extFromContentType(ct) {
  if (ct.includes('jpeg')) return 'jpg'
  if (ct.includes('webp')) return 'webp'
  if (ct.includes('gif')) return 'gif'
  return 'png'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'method_not_allowed', 'POST only')

  const auth = await requireAgent(req)
  if (!auth.ok) return jsonError(res, auth.status, auth.error, auth.detail)

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return jsonError(res, 400, 'invalid_json') }
  }
  const { url, intent, slug } = body || {}

  if (!url) return jsonError(res, 400, 'missing_url')
  if (!ALLOWED_INTENTS.has(intent)) {
    return jsonError(res, 400, 'invalid_intent', 'intent must be "article" or "khaitri"')
  }

  // Download source bytes
  let bytes, contentType
  try {
    const r = await fetch(url, { redirect: 'follow' })
    if (!r.ok) return jsonError(res, 422, 'source_fetch_failed', `${r.status} ${r.statusText}`)
    contentType = (r.headers.get('content-type') || 'image/png').toLowerCase().split(';')[0].trim()
    if (!ALLOWED_CT.has(contentType)) {
      return jsonError(res, 415, 'unsupported_content_type', contentType)
    }
    const ab = await r.arrayBuffer()
    if (ab.byteLength > MAX_BYTES) {
      return jsonError(res, 413, 'payload_too_large', `max ${MAX_BYTES} bytes`)
    }
    bytes = Buffer.from(ab)
  } catch (e) {
    return jsonError(res, 502, 'source_fetch_error', e.message)
  }

  // Upload to R2 — prefix keys with project name (bucket is shared across projects)
  const ext = extFromContentType(contentType)
  const folder = intent === 'article' ? 'articles' : 'khaitri'
  const filename = safeFilename(slug, ext)
  const prefix = process.env.R2_KEY_PREFIX || 'immortality-vn'
  const key = `${prefix}/${folder}/${filename}`

  const bucket = process.env.R2_BUCKET_NAME
  const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '')
  if (!bucket || !publicBase) {
    return jsonError(res, 500, 'r2_not_configured', 'R2_BUCKET_NAME / R2_PUBLIC_URL missing')
  }

  try {
    await getS3().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }))
  } catch (e) {
    return jsonError(res, 500, 'upload_failed', e.message)
  }

  const downloadUrl = `${publicBase}/${key}`

  // Audit
  try {
    await db().collection('agent_log').add({
      action: 'upload.image',
      params: { intent, key, contentType, size: bytes.length, sourceUrl: url.slice(0, 200), backend: 'r2' },
      status: 'success',
      actor: auth.email,
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch (e) {
    console.warn('agent_log write failed', e.message)
  }

  res.setHeader('Content-Type', 'application/json')
  return res.status(200).send(JSON.stringify({
    ok: true,
    url: downloadUrl,
    key,
    bytes: bytes.length,
    contentType,
  }))
}
