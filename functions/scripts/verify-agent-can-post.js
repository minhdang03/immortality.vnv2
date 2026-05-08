#!/usr/bin/env node
// Verify agent credentials can: signIn → POST /api/articles (then cleanup).
// Run: IMMORTALITY_AGENT_PASSWORD=<pass> node functions/scripts/verify-agent-can-post.js

const API_KEY = 'AIzaSyAqORIPOvrGoBjFTelJcZQZtJutCS2p0rc'
const EMAIL = 'agent@battudao.com'
const BASE = 'https://battudao.com'
const PASS = process.env.IMMORTALITY_AGENT_PASSWORD || process.argv[2]

if (!PASS) { console.error('Pass agent password as env var IMMORTALITY_AGENT_PASSWORD or as $1 arg'); process.exit(2) }

async function main() {
  console.log(`▶ signIn ${EMAIL}...`)
  const sigRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS, returnSecureToken: true }),
  })
  const sigBody = await sigRes.json()
  if (!sigRes.ok) { console.error('✗ signIn failed:', sigBody); process.exit(1) }
  console.log(`✓ signIn ok. uid=${sigBody.localId}, expiresIn=${sigBody.expiresIn}s`)
  const token = sigBody.idToken

  console.log(`\n▶ GET /api/agent-spec (no auth)...`)
  const specRes = await fetch(`${BASE}/api/agent-spec`)
  const spec = await specRes.json()
  console.log(`✓ spec.collections: ${Object.keys(spec.collections || {}).join(', ')}`)
  console.log(`✓ spec.classification present: ${!!spec.classification}`)

  const sourceRef = `verify-${Date.now()}`
  const draft = {
    sourceRef, topic: 'tam-linh', date: '2026-05-06',
    tag: { vi: 'Tâm Linh', en: 'Spiritual' },
    vi: { title: 'Verify post test', summary: 'Test', body: 'Test paragraph 1.\n\nTest paragraph 2.' },
    en: { title: 'Verify post test', summary: 'Test', body: 'Test paragraph 1.\n\nTest paragraph 2.' },
    status: 'draft',
  }

  console.log(`\n▶ POST /api/articles (sourceRef=${sourceRef})...`)
  const createRes = await fetch(`${BASE}/api/articles`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
  const createBody = await createRes.json()
  if (!createRes.ok) { console.error(`✗ create failed status=${createRes.status}:`, createBody); process.exit(1) }
  const id = createBody.id
  console.log(`✓ created id=${id}`)

  console.log(`\n▶ DELETE /api/articles/${id} (cleanup)...`)
  const delRes = await fetch(`${BASE}/api/articles/${id}`, {
    method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
  })
  const delBody = await delRes.json()
  console.log(`✓ delete status=${delRes.status}:`, delBody)

  console.log(`\n✅ ALL OK — credentials work, API works, agent can post.`)
}

main().catch(e => { console.error('✗ fatal:', e.message); process.exit(1) })
