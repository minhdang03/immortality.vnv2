// api/_lib/auth.js — Verify Firebase ID token from Authorization header.
// Agent obtains token by signing in with email/password (same flow as publisher skill).

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let initialized = false
function ensureAdmin() {
  if (initialized) return
  if (getApps().length) { initialized = true; return }
  // Vercel: service account JSON in env var (base64) OR file at ./src/*-firebase-adminsdk-*.json (local).
  const saB64 = process.env.FIREBASE_ADMIN_SA_B64
  if (saB64) {
    const sa = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'))
    initializeApp({ credential: cert(sa) })
  } else {
    // Fallback: application default credentials (Vercel + GCP)
    initializeApp()
  }
  initialized = true
}

// Allowlist of UIDs / emails permitted to write via API. Add more agent accounts as needed.
const AGENT_ALLOWLIST_EMAILS = (process.env.AGENT_ALLOWLIST_EMAILS || 'agent@battudao.com').split(',').map(s => s.trim()).filter(Boolean)

export async function requireAgent(req) {
  ensureAdmin()
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return { ok: false, status: 401, error: 'missing_bearer_token' }
  try {
    // checkRevoked=true → instant revoke via revokeRefreshTokens(uid).
    // Costs 1 extra RPC per request but enables key compromise containment.
    const decoded = await getAuth().verifyIdToken(m[1], true)
    if (!AGENT_ALLOWLIST_EMAILS.includes(decoded.email)) {
      return { ok: false, status: 403, error: 'forbidden', detail: `email ${decoded.email} not in agent allowlist` }
    }
    return { ok: true, uid: decoded.uid, email: decoded.email }
  } catch (e) {
    return { ok: false, status: 401, error: 'invalid_token', detail: e.message }
  }
}

// CORS allowlist for /api/* endpoints. Reject cross-origin tokens from anywhere else.
const CORS_ALLOWLIST = new Set([
  'https://battudao.com',
  'https://www.battudao.com',
  'https://immortality.vn',
  'https://www.immortality.vn',
  'http://localhost:5173',
  'http://localhost:4173',
  'capacitor://localhost', // Capacitor iOS WebView
  'ionic://localhost',     // Capacitor older
])
export function applyCors(req, res) {
  const origin = req.headers.origin
  if (origin && CORS_ALLOWLIST.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Max-Age', '600')
  }
  if (req.method === 'OPTIONS') {
    res.status(origin && CORS_ALLOWLIST.has(origin) ? 204 : 403).end()
    return true // request handled
  }
  return false
}

export function jsonError(res, status, error, detail) {
  res.status(status).setHeader('Content-Type', 'application/json')
  return res.send(JSON.stringify({ ok: false, error, detail }))
}
