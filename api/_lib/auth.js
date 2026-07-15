// api/_lib/auth.js — Agent auth via btd_ API key (Bearer), validated against
// Supabase public.api_keys. Firebase ID-token flow is retired (2026-07-15):
// agents hold btd_ keys only — same auth plane as the Worker /v1/content API.
//
// Env vars required on Vercel:
//   SUPABASE_URL           — e.g. https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE  — sb_secret_... key (service role; bypasses RLS)

import { createHash } from 'node:crypto'

const KEY_SHAPE = /^btd_[0-9a-f]{32}$/

// VITE_SUPABASE_URL fallback: same public project URL, already set on Vercel.
function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Validate Authorization: Bearer btd_<32hex> against public.api_keys.
 * requiredScope: e.g. "media:write" — must be present in the key's scopes CSV.
 * Returns { ok, agent, keyId } or { ok: false, status, error, detail }.
 */
export async function requireAgent(req, requiredScope = 'media:write') {
  if (!supabaseUrl() || !process.env.SUPABASE_SERVICE_ROLE) {
    return { ok: false, status: 500, error: 'auth_not_configured', detail: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE missing' }
  }
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return { ok: false, status: 401, error: 'missing_bearer_token' }
  const raw = m[1].trim()
  if (!KEY_SHAPE.test(raw)) return { ok: false, status: 401, error: 'invalid_key_format' }

  const hash = createHash('sha256').update(raw).digest('hex')
  const params = new URLSearchParams({
    key_hash: `eq.${hash}`,
    revoked_at: 'is.null',
    select: 'id,agent_name,scopes',
  })
  let rows
  try {
    const r = await fetch(`${supabaseUrl()}/rest/v1/api_keys?${params}`, { headers: supabaseHeaders() })
    if (!r.ok) return { ok: false, status: 500, error: 'key_lookup_failed', detail: `supabase ${r.status}` }
    rows = await r.json()
  } catch (e) {
    return { ok: false, status: 500, error: 'key_lookup_failed', detail: e.message }
  }
  if (!rows.length) return { ok: false, status: 401, error: 'key_not_found_or_revoked' }

  const key = rows[0]
  const scopes = String(key.scopes || '').split(',').map(s => s.trim())
  if (!scopes.includes(requiredScope)) {
    return { ok: false, status: 403, error: 'scope_not_granted', detail: requiredScope }
  }
  return { ok: true, agent: key.agent_name, keyId: key.id }
}

/**
 * Fire-and-forget audit row into public.agent_audit_log (same table the
 * Worker writes). Never throws — audit failure must not fail the upload.
 */
export async function logAgentAction({ keyId, agent, action, contentId = null, statusCode, detail }) {
  try {
    await fetch(`${supabaseUrl()}/rest/v1/agent_audit_log`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        key_id: keyId ?? null,
        agent_name: agent ?? null,
        action,
        content_id: contentId,
        status_code: statusCode,
        detail: detail ? String(detail).slice(0, 500) : null,
      }),
    })
  } catch (e) {
    console.warn('agent_audit_log write failed', e.message)
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
