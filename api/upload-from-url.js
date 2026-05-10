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
import { promises as dns } from 'node:dns'
import { requireAgent, jsonError, applyCors } from './_lib/auth.js'
import { db, FieldValue } from './_lib/db.js'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_CT = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ALLOWED_INTENTS = new Set(['article', 'khaitri'])
const MAX_REDIRECTS = 3

// SSRF defense — reject private/loopback/cloud-metadata IPs.
// Resolves DNS at every redirect hop to defeat DNS-rebinding.
function isPrivateIp(ip) {
  if (!ip) return true
  // IPv4
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (m) {
    const [a, b] = m.slice(1).map(Number)
    if (a === 10) return true                      // 10.0.0.0/8
    if (a === 127) return true                     // 127.0.0.0/8 loopback
    if (a === 0) return true                       // 0.0.0.0/8
    if (a === 169 && b === 254) return true        // 169.254.0.0/16 link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
    if (a === 192 && b === 168) return true        // 192.168.0.0/16
    if (a >= 224) return true                      // multicast / reserved
    return false
  }
  // IPv6 — block loopback, link-local, ULA, mapped
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return true
  if (lower.startsWith('::ffff:')) {
    return isPrivateIp(lower.slice(7)) // IPv4-mapped — recurse on v4 part
  }
  return true // unknown format → deny
}

async function safeFetch(rawUrl) {
  let url = rawUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let parsed
    try { parsed = new URL(url) } catch { throw new Error('invalid_url') }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('protocol_not_allowed')
    }
    // Resolve host → all IPs, deny if any are private (defense against DNS rebinding)
    const hostname = parsed.hostname
    let addrs
    try { addrs = await dns.lookup(hostname, { all: true, verbatim: true }) }
    catch { throw new Error('dns_lookup_failed') }
    if (!addrs.length) throw new Error('dns_no_addrs')
    if (addrs.some(a => isPrivateIp(a.address))) throw new Error('private_ip_blocked')

    const r = await fetch(url, { redirect: 'manual' })
    if (r.status >= 300 && r.status < 400) {
      const next = r.headers.get('location')
      if (!next) throw new Error('redirect_no_location')
      url = new URL(next, url).toString()
      continue
    }
    return r
  }
  throw new Error('too_many_redirects')
}

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
  if (applyCors(req, res)) return
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

  // Download source bytes — SSRF-hardened (deny private IPs at every redirect hop)
  let bytes, contentType
  try {
    const r = await safeFetch(url)
    if (!r.ok) return jsonError(res, 422, 'source_fetch_failed', `${r.status}`)
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
    // Generic message to caller — don't leak which validation tripped (info disclosure)
    return jsonError(res, 422, 'source_fetch_blocked')
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
