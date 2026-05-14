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

import { promises as dns } from 'node:dns'
import { requireAgent, jsonError, applyCors } from './_lib/auth.js'
import { db, FieldValue } from './_lib/db.js'
import {
  MAX_BYTES, ALLOWED_CT, ALLOWED_INTENTS, uploadToR2,
} from './_lib/r2.js'

const MAX_REDIRECTS = 3

// Detect scheme up front so we can return an actionable error
// (instead of the generic source_fetch_blocked) when an agent sends a
// data:/blob:/file: URL — the right answer is /api/upload-file.
function detectScheme(url) {
  if (typeof url !== 'string') return 'unknown'
  const head = url.slice(0, 16).toLowerCase()
  if (head.startsWith('data:')) return 'data'
  if (head.startsWith('blob:')) return 'blob'
  if (head.startsWith('file:')) return 'file'
  if (head.startsWith('http://') || head.startsWith('https://')) return 'http'
  return 'other'
}

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

  // Early reject non-http(s) schemes with an actionable pointer.
  const scheme = detectScheme(url)
  if (scheme !== 'http') {
    return jsonError(
      res, 400, 'public_url_required',
      `this endpoint accepts only http(s) URLs (got "${scheme}"); to upload local bytes use POST /api/upload-file with Content-Type: image/<type> and X-Intent header`,
    )
  }

  // Download source bytes — SSRF-hardened (deny private IPs at every redirect hop)
  let bytes, contentType, fetchReason = null
  try {
    const r = await safeFetch(url)
    if (!r.ok) {
      fetchReason = `http_${r.status}`
      return jsonError(res, 422, 'source_fetch_failed', `${r.status}`)
    }
    contentType = (r.headers.get('content-type') || 'image/png').toLowerCase().split(';')[0].trim()
    if (!ALLOWED_CT.has(contentType)) {
      fetchReason = 'unsupported_content_type'
      return jsonError(res, 415, 'unsupported_content_type', contentType)
    }
    const ab = await r.arrayBuffer()
    if (ab.byteLength > MAX_BYTES) {
      fetchReason = 'payload_too_large'
      return jsonError(res, 413, 'payload_too_large', `max ${MAX_BYTES} bytes`)
    }
    bytes = Buffer.from(ab)
  } catch (e) {
    // Generic outward message (don't leak which check tripped — info disclosure),
    // but log the precise reason for ops.
    fetchReason = e.message || 'unknown'
    console.warn('upload-from-url source fetch blocked', {
      reason: fetchReason,
      sourceHost: (() => { try { return new URL(url).hostname } catch { return null } })(),
    })
    return jsonError(res, 422, 'source_fetch_blocked')
  }

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
        source: 'upload-from-url',
        intent,
        key: uploaded.key,
        contentType: uploaded.contentType,
        size: uploaded.bytes,
        sourceUrl: url.slice(0, 200),
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
