/**
 * One-shot backfill: stamp viSlug + enSlug on all articles docs.
 * Run BEFORE deploying the new where() query in functions/index.js.
 *
 * Usage:
 *   cd functions
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/backfill-article-slugs.js
 *
 * Safe to re-run (idempotent — skips docs whose slugs already match).
 */

const admin = require('firebase-admin')

admin.initializeApp({ credential: admin.credential.applicationDefault() })
const db = admin.firestore()

// Keep in sync with functions/index.js toSlug and src/utils/slug.js toSlug
const VI_MAP = 'àáạảãâầấậẩẫăằắặẳẵ→a,èéẹẻẽêềếệểễ→e,ìíịỉĩ→i,òóọỏõôồốộổỗơờớợởỡ→o,ùúụủũưừứựửữ→u,ỳýỵỷỹ→y,đ→d'
const SLUG_MAP = {}
VI_MAP.split(',').forEach(group => {
  const [chars, to] = group.split('→')
  for (const c of chars) SLUG_MAP[c] = to
})

function toSlug(str) {
  if (!str) return ''
  return str.toLowerCase().split('').map(c => SLUG_MAP[c] || c).join('')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

async function main() {
  const snap = await db.collection('articles').get()
  console.log(`Found ${snap.size} articles`)

  let updated = 0
  let skipped = 0

  // Firestore batch max 500 ops; use chunks of 400 to be safe
  const BATCH_SIZE = 400
  const docs = snap.docs
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    let batchCount = 0
    for (const docSnap of docs.slice(i, i + BATCH_SIZE)) {
      const d = docSnap.data()
      const viSlug = toSlug(d.vi?.title)
      const enSlug = toSlug(d.en?.title)
      if (d.viSlug === viSlug && d.enSlug === enSlug) {
        skipped++
        continue
      }
      batch.update(docSnap.ref, { viSlug, enSlug })
      batchCount++
      updated++
    }
    if (batchCount > 0) {
      await batch.commit()
      console.log(`  committed batch of ${batchCount}`)
    }
  }

  console.log(`Done — updated=${updated} skipped=${skipped}`)
  console.log('\nNext step: verify in Firebase Console then deploy functions.')
}

main().catch(e => { console.error(e); process.exit(1) })
