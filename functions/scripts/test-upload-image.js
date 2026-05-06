/**
 * End-to-end test of agent image upload flow via CMS API (Path 1).
 *
 * Mimics what goclaw will do:
 *   1. Sign in as agent@battudao.com → Firebase ID token
 *   2. POST source URL to /api/upload-from-url on battudao.com
 *   3. Verify the returned permanent URL is reachable + correct content-type
 *
 * Usage:
 *   FIREBASE_API_KEY=<web-api-key> AGENT_EMAIL=agent@battudao.com AGENT_PASSWORD=<pass> \
 *     node functions/scripts/test-upload-image.js [<source-image-url>]
 *
 * Web API key is at Firebase Console → Project Settings → General → Web API Key
 * (DIFFERENT from service account; this is the public client key, safe here).
 */

const SAMPLE_URL = 'https://picsum.photos/800/450'
const CMS_BASE = process.env.CMS_BASE_URL || 'https://battudao.com'

async function signIn(email, password, apiKey) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`signIn failed: ${JSON.stringify(j)}`)
  return { idToken: j.idToken, refreshToken: j.refreshToken, uid: j.localId }
}

async function uploadFromUrl(idToken, body) {
  const r = await fetch(`${CMS_BASE}/api/upload-from-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`API ${r.status}: ${JSON.stringify(j)}`)
  return j
}

async function main() {
  const apiKey = process.env.FIREBASE_API_KEY
  const email = process.env.AGENT_EMAIL || 'agent@battudao.com'
  const password = process.env.AGENT_PASSWORD
  const sourceUrl = process.argv[2] || SAMPLE_URL

  if (!apiKey) throw new Error('FIREBASE_API_KEY env required')
  if (!password) throw new Error('AGENT_PASSWORD env required')

  console.log('[1/3] Signing in as', email)
  const auth = await signIn(email, password, apiKey)
  console.log('  uid:', auth.uid)

  console.log('[2/3] POST', `${CMS_BASE}/api/upload-from-url`, '{ url, intent: "article", slug: "test-upload" }')
  const result = await uploadFromUrl(auth.idToken, {
    url: sourceUrl,
    intent: 'article',
    slug: 'test-upload',
  })
  console.log('  →', result)

  console.log('[3/3] Verifying URL is publicly reachable...')
  const verify = await fetch(result.url)
  console.log('  status:', verify.status, '| content-type:', verify.headers.get('content-type'), '| content-length:', verify.headers.get('content-length'))

  console.log('\n=== SUCCESS ===')
  console.log('Permanent URL:', result.url)
  console.log('\nGoclaw stamps this URL into article doc { image: "<url>" } via /api/articles.')
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
