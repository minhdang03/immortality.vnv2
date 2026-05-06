// /api/upload-from-url — Agent posts a source URL (Telegram, picsum, etc.),
// the function fetches bytes and uploads them to Firebase Storage at the
// requested path, then returns the permanent public URL.
//
// Why route through this API instead of letting agent upload directly to
// Firebase Storage:
//   - Centralized validation (size cap, content-type allowlist, path policy)
//   - Audit log entry per upload (in /agent_log)
//   - Decouples agent from storage backend (Firebase today, R2 tomorrow)
//   - Same auth surface as the rest of the CMS API (Bearer ID token)

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { requireAgent, jsonError } from './_lib/auth.js'
import { db, FieldValue } from './_lib/db.js'

const MAX_BYTES = 8 * 1024 * 1024  // 8 MB per upload
const ALLOWED_CT = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ALLOWED_PREFIXES = ['articles/', 'khaitri/']
const DEFAULT_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'immortalityvn.firebasestorage.app'

let initialized = false
function ensureAdminApp() {
  if (initialized) return
  if (getApps().length) { initialized = true; return }
  const saB64 = process.env.FIREBASE_ADMIN_SA_B64
  if (saB64) {
    const sa = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'))
    initializeApp({ credential: cert(sa), storageBucket: DEFAULT_BUCKET })
  } else {
    initializeApp({ storageBucket: DEFAULT_BUCKET })
  }
  initialized = true
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
  if (!intent || !['article', 'khaitri'].includes(intent)) {
    return jsonError(res, 400, 'invalid_intent', 'intent must be "article" or "khaitri"')
  }

  // Download source
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

  // Resolve destination path
  const ext = extFromContentType(contentType)
  const folder = intent === 'article' ? 'articles' : 'khaitri'
  const filename = safeFilename(slug, ext)
  const path = `${folder}/${filename}`
  if (!ALLOWED_PREFIXES.some(p => path.startsWith(p))) {
    return jsonError(res, 400, 'path_not_allowed', path)
  }

  // Upload via admin SDK (bypasses storage rules — auth already verified)
  ensureAdminApp()
  const downloadToken = crypto.randomUUID()
  try {
    const bucket = getStorage().bucket(DEFAULT_BUCKET)
    const file = bucket.file(path)
    await file.save(bytes, {
      contentType,
      resumable: false,
      metadata: {
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    })
  } catch (e) {
    return jsonError(res, 500, 'upload_failed', e.message)
  }

  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${DEFAULT_BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`

  // Audit
  try {
    await db().collection('agent_log').add({
      action: 'upload.image',
      params: { intent, path, contentType, size: bytes.length, sourceUrl: url.slice(0, 200) },
      status: 'success',
      actor: auth.email,
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch (e) {
    // Non-fatal — upload already succeeded
    console.warn('agent_log write failed', e.message)
  }

  res.setHeader('Content-Type', 'application/json')
  return res.status(200).send(JSON.stringify({
    ok: true,
    url: downloadUrl,
    path,
    bytes: bytes.length,
    contentType,
  }))
}
