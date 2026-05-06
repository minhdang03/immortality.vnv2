/**
 * End-to-end test of agent image upload flow.
 *
 * Mimics what goclaw will do:
 *   1. Sign in as agent@battudao.com → Firebase ID token
 *   2. Download an image (here: any URL passed in, or a default sample)
 *   3. Upload to Firebase Storage at articles/<filename>.<ext> using the ID token
 *   4. Verify the returned public URL is reachable + correct content-type
 *
 * Usage:
 *   FIREBASE_API_KEY=<web-api-key> AGENT_EMAIL=agent@battudao.com AGENT_PASSWORD=<pass> \
 *     node functions/scripts/test-upload-image.js [<source-image-url>]
 *
 * Web API key is at Firebase Console → Project Settings → General → Web API Key.
 * (DIFFERENT from service account; this is the public client key, safe to use here.)
 */

const SAMPLE_URL = 'https://picsum.photos/800/450'

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

async function downloadImage(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`download failed ${r.status}`)
  const ct = r.headers.get('content-type') || 'image/png'
  const buf = Buffer.from(await r.arrayBuffer())
  return { bytes: buf, contentType: ct }
}

async function uploadToFirebaseStorage({ bucket, path, bytes, contentType, idToken }) {
  // Firebase Storage REST upload — multipart/related not required, simple POST works.
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(path)}`
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': contentType,
    },
    body: bytes,
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`upload failed: ${JSON.stringify(j)}`)
  // Public download URL (works because we have a downloadTokens entry per upload)
  const token = j.downloadTokens
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
  return { downloadUrl, metadata: j }
}

async function main() {
  const apiKey = process.env.FIREBASE_API_KEY
  const email = process.env.AGENT_EMAIL || 'agent@battudao.com'
  const password = process.env.AGENT_PASSWORD
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || 'immortalityvn.firebasestorage.app'
  const sourceUrl = process.argv[2] || SAMPLE_URL

  if (!apiKey) throw new Error('FIREBASE_API_KEY env required')
  if (!password) throw new Error('AGENT_PASSWORD env required')

  console.log('[1/4] Signing in as', email)
  const auth = await signIn(email, password, apiKey)
  console.log('  uid:', auth.uid)

  console.log('[2/4] Downloading source image:', sourceUrl)
  const img = await downloadImage(sourceUrl)
  console.log('  bytes:', img.bytes.length, '| content-type:', img.contentType)

  const ext = img.contentType.includes('jpeg') ? 'jpg' :
              img.contentType.includes('webp') ? 'webp' : 'png'
  const filename = `test-${Date.now()}.${ext}`
  const path = `articles/${filename}`

  console.log('[3/4] Uploading to', `${bucket}/${path}`)
  const up = await uploadToFirebaseStorage({ bucket, path, bytes: img.bytes, contentType: img.contentType, idToken: auth.idToken })
  console.log('  → URL:', up.downloadUrl)

  console.log('[4/4] Verifying URL is publicly reachable...')
  const verify = await fetch(up.downloadUrl)
  console.log('  status:', verify.status, '| content-type:', verify.headers.get('content-type'), '| content-length:', verify.headers.get('content-length'))

  console.log('\n=== SUCCESS ===')
  console.log('Public URL:', up.downloadUrl)
  console.log('\nGoclaw stamps this URL into article doc { image: "<url>" }.')
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1) })
