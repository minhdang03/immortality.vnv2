#!/usr/bin/env node
/**
 * migrate-firestore-to-supabase.mjs — one-shot data migration (cutover 21/07/2026).
 *
 * Chuyển: comments (subcollection articles/{id}/comments), donations + donation_contacts,
 * contacts, newsletter_signups. Settings/translations KHÔNG ghi — chỉ in diff (Supabase
 * đang là bản site hiển thị 11 ngày qua; Firestore có thể chứa sửa đổi admin lạc trôi
 * sau cutover — người quyết, script không tự đè). Admins: chỉ in danh sách để đối chiếu,
 * KHÔNG tự phong role bên Supabase.
 *
 * Idempotent: mọi insert upsert theo id (giữ nguyên Firestore doc id) hoặc unique email.
 * Chạy lại thoải mái.
 *
 * Env (đọc từ .env ở repo root): VITE_SUPABASE_URL, SUPABASE_SECRET_KEY (service role),
 * VITE_FIREBASE_PROJECT_ID. Tuỳ chọn FIREBASE_SA_KEY_PATH → đọc được collections
 * admin-only (contacts, donation_contacts, newsletter, donations pending, admins);
 * không có thì chỉ migrate phần public-read và báo phần bị skip.
 *
 * Zero dependency: fetch + node:crypto (ký RS256 cho SA token).
 */
import { readFileSync, existsSync } from 'node:fs'
import { createSign, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ── env ───────────────────────────────────────────────────────────────────────
const env = {}
for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const SB_URL = env.VITE_SUPABASE_URL
const SB_KEY = env.SUPABASE_SECRET_KEY
const FB_PROJECT = env.VITE_FIREBASE_PROJECT_ID || 'immortalityvn'
if (!SB_URL || !SB_KEY) { console.error('Thiếu VITE_SUPABASE_URL / SUPABASE_SECRET_KEY trong .env'); process.exit(1) }

// ── Firebase auth (tuỳ chọn, cần cho collections admin-only) ─────────────────
let fbToken = null
const saPath = env.FIREBASE_SA_KEY_PATH || process.env.FIREBASE_SA_KEY_PATH
if (saPath && existsSync(saPath)) {
  const sa = JSON.parse(readFileSync(saPath, 'utf8'))
  const now = Math.floor(Date.now() / 1000)
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore',
    aud: sa.token_uri, iat: now, exp: now + 3600,
  })}`
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url')
  const r = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${unsigned}.${sig}`,
  })
  if (!r.ok) { console.error('Lấy SA token thất bại:', r.status, await r.text()); process.exit(1) }
  fbToken = (await r.json()).access_token
  console.log('✔ Có SA token — đọc được collections admin-only')
} else {
  console.log('⚠ Không có FIREBASE_SA_KEY_PATH — chỉ migrate phần public-read; contacts/donation_contacts/newsletter/donations-pending/admins sẽ SKIP')
}

// ── Firestore REST helpers ────────────────────────────────────────────────────
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`

function decodeVal(v) {
  if (v == null) return null
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('timestampValue' in v) return v.timestampValue
  if ('nullValue' in v) return null
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decodeVal(x)]))
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeVal)
  return null
}
function decodeDoc(d) {
  const id = d.name.split('/').pop()
  return { id, ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, decodeVal(v)])) }
}

/** Liệt kê hết docs 1 collection (path tương đối, vd 'donations' hay 'articles/x/comments'). */
async function fsList(path) {
  const docs = []
  let pageToken = ''
  for (;;) {
    const url = `${FS_BASE}/${path}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`
    const r = await fetch(url, fbToken ? { headers: { authorization: `Bearer ${fbToken}` } } : undefined)
    if (r.status === 403) return { docs, denied: true }
    if (!r.ok) throw new Error(`Firestore ${path}: ${r.status} ${await r.text()}`)
    const j = await r.json()
    for (const d of j.documents || []) docs.push(decodeDoc(d))
    if (!j.nextPageToken) return { docs, denied: false }
    pageToken = j.nextPageToken
  }
}

// ── Supabase REST helpers (service role — qua RLS + flood guard) ─────────────
async function sbUpsert(table, rows, onConflict) {
  if (!rows.length) return 0
  let n = 0
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200)
    const r = await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`,
        'content-type': 'application/json',
        prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(chunk),
    })
    if (!r.ok) throw new Error(`Supabase ${table}: ${r.status} ${await r.text()}`)
    n += chunk.length
  }
  return n
}
async function sbSelect(table, qs) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${qs}`, {
    headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}` },
  })
  if (!r.ok) throw new Error(`Supabase select ${table}: ${r.status}`)
  return r.json()
}

const summary = []
const skip = (what, why) => { summary.push(`SKIP ${what} — ${why}`); console.log(`⏭ SKIP ${what}: ${why}`) }

// ── 1. comments (subcollection articles/{id}/comments) ───────────────────────
{
  const contentIds = new Set((await sbSelect('content', 'select=id&limit=10000')).map((c) => c.id))
  const { docs: articles, denied } = await fsList('articles')
  if (denied) skip('comments', 'articles bị chặn đọc (cần SA key)')
  else {
    const rows = []
    let orphan = 0
    for (const a of articles) {
      const sub = await fsList(`articles/${a.id}/comments`)
      if (sub.denied) continue
      for (const c of sub.docs) {
        const contentId = contentIds.has(a.id) ? a.id : null
        if (!contentId) orphan++
        rows.push({
          id: c.id, content_id: contentId,
          author_name: c.name ?? null, body: c.text ?? '',
          status: ['visible', 'hidden', 'pending'].includes(c.status) ? c.status : 'pending',
          created_at: c.createdAt || new Date().toISOString(),
        })
      }
    }
    const n = await sbUpsert('comments', rows.filter((r) => r.body), 'id')
    summary.push(`comments: ${n} dòng (orphan content_id→null: ${orphan})`)
  }
}

// ── 2. donations + donation_contacts ─────────────────────────────────────────
{
  const { docs, denied } = await fsList('donations')
  if (denied) skip('donations', 'bị chặn đọc')
  else {
    const rows = docs.map((d) => ({
      id: d.id,
      amount: Number.isFinite(d.amount) ? d.amount : null,
      channel: d.channel ?? null,
      donor_name: d.isAnonymous ? null : (d.displayName || null),
      message: d.message ?? null,
      status: ['pending', 'approved', 'rejected'].includes(d.status) ? d.status : 'pending',
      created_at: d.createdAt || new Date().toISOString(),
    }))
    summary.push(`donations: ${await sbUpsert('donations', rows, 'id')} dòng${fbToken ? '' : ' (chỉ approved — anon không đọc được pending)'}`)
  }
  const pii = await fsList('donation_contacts')
  if (pii.denied) skip('donation_contacts (PII)', 'cần SA key')
  else {
    const rows = pii.docs.map((d) => ({
      id: d.id, donation_id: d.id, // Firestore dùng chung id với donation
      real_name: d.realName ?? null, email: d.email ?? null, phone: d.phone ?? null,
      created_at: d.createdAt || new Date().toISOString(),
    }))
    summary.push(`donation_contacts: ${await sbUpsert('donation_contacts', rows, 'id')} dòng (adminNote bị bỏ — schema không có cột)`)
  }
}

// ── 3. contacts ──────────────────────────────────────────────────────────────
{
  const { docs, denied } = await fsList('contacts')
  if (denied) skip('contacts', 'cần SA key')
  else {
    const rows = docs.map((d) => ({
      id: d.id, name: d.name ?? null, email: d.email ?? null,
      phone: d.phone ?? null, message: d.message ?? null,
      created_at: d.createdAt || d.timestamp || new Date().toISOString(),
    }))
    summary.push(`contacts: ${await sbUpsert('contacts', rows, 'id')} dòng`)
  }
}

// ── 4. newsletter_signups ────────────────────────────────────────────────────
{
  const { docs, denied } = await fsList('newsletter_signups')
  if (denied) skip('newsletter_signups', 'cần SA key')
  else {
    // Unique index là lower(email) (expression) — ON CONFLICT không match được,
    // nên dedupe bằng tay: lọc trùng in-memory + trừ email đã có trên Supabase.
    const existing = new Set((await sbSelect('newsletter_signups', 'select=email&limit=10000')).map((r) => r.email.toLowerCase()))
    const seen = new Set()
    const rows = []
    for (const d of docs) {
      if (!d.email) continue
      const email = String(d.email).toLowerCase()
      if (existing.has(email) || seen.has(email)) continue
      seen.add(email)
      rows.push({ id: randomUUID(), email, lang: d.lang ?? null, source: d.source ?? null, created_at: d.timestamp || new Date().toISOString() })
    }
    summary.push(`newsletter_signups: ${await sbUpsert('newsletter_signups', rows, 'id')} dòng mới (đã có sẵn: ${existing.size})`)
  }
}

// ── 5. settings + translations: CHỈ DIFF, không ghi ──────────────────────────
for (const col of ['settings', 'translations']) {
  const { docs, denied } = await fsList(col)
  if (denied) { skip(`${col} diff`, 'bị chặn đọc'); continue }
  const sb = await sbSelect(col, 'select=*&limit=1000')
  console.log(`\n── DIFF ${col}: Firestore ${docs.length} docs vs Supabase ${sb.length} rows ──`)
  const sbKeys = new Set(sb.map((r) => r.id ?? r.key ?? r.lang))
  for (const d of docs) if (!sbKeys.has(d.id)) console.log(`  chỉ có ở Firestore: ${col}/${d.id}`)
  summary.push(`${col}: diff-only (xem log), KHÔNG tự ghi`)
}

// ── 6. admins: chỉ liệt kê để đối chiếu ──────────────────────────────────────
{
  const { docs, denied } = await fsList('admins')
  if (denied) skip('admins (đối chiếu)', 'cần SA key')
  else {
    console.log('\n── Firestore admins (KHÔNG tự phong bên Supabase — dùng set_user_role) ──')
    for (const d of docs) console.log(`  uid=${d.id} role=${d.role ?? '?'} ${d.email ?? ''}`)
    summary.push(`admins: ${docs.length} uid — liệt kê only`)
  }
}

console.log('\n══ TỔNG KẾT ══')
for (const s of summary) console.log('· ' + s)
