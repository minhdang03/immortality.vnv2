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
    const decoded = await getAuth().verifyIdToken(m[1])
    if (!AGENT_ALLOWLIST_EMAILS.includes(decoded.email)) {
      return { ok: false, status: 403, error: 'forbidden', detail: `email ${decoded.email} not in agent allowlist` }
    }
    return { ok: true, uid: decoded.uid, email: decoded.email }
  } catch (e) {
    return { ok: false, status: 401, error: 'invalid_token', detail: e.message }
  }
}

export function jsonError(res, status, error, detail) {
  res.status(status).setHeader('Content-Type', 'application/json')
  return res.send(JSON.stringify({ ok: false, error, detail }))
}
