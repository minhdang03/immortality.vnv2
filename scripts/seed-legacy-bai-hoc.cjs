/**
 * Seed 2 legacy "Bài học Reset bộ não" articles into Firestore using their
 * deterministic IDs from src/data/articles.js (DEFAULT_ARTICLES).
 *
 * Why: those 2 articles are baked into the JS bundle via DEFAULT_ARTICLES and
 * fall through the merge filter in src/hooks/useArticles.js — so they render
 * on the list page without an `image` field. Once the doc exists in Firestore
 * with the same ID, the merge filter excludes the static seed and admin/Mod
 * can manage them via the normal CMS workflow (including image-patch).
 *
 * Run: node scripts/seed-legacy-bai-hoc.cjs
 */
const admin = require('firebase-admin')
const serviceAccount = require('../secrets/firebase-admin-sa.json')

const TARGET_IDS = [
  'bai-hoc-reset-bo-nao-ve-khong-dao',
  'bai-hoc-thu-nhat-reset-bo-nao',
]

const VIETNAMESE_MAP = {
  'à':'a','á':'a','ạ':'a','ả':'a','ã':'a','â':'a','ầ':'a','ấ':'a','ậ':'a','ẩ':'a','ẫ':'a','ă':'a','ằ':'a','ắ':'a','ặ':'a','ẳ':'a','ẵ':'a',
  'è':'e','é':'e','ẹ':'e','ẻ':'e','ẽ':'e','ê':'e','ề':'e','ế':'e','ệ':'e','ể':'e','ễ':'e',
  'ì':'i','í':'i','ị':'i','ỉ':'i','ĩ':'i',
  'ò':'o','ó':'o','ọ':'o','ỏ':'o','õ':'o','ô':'o','ồ':'o','ố':'o','ộ':'o','ổ':'o','ỗ':'o','ơ':'o','ờ':'o','ớ':'o','ợ':'o','ở':'o','ỡ':'o',
  'ù':'u','ú':'u','ụ':'u','ủ':'u','ũ':'u','ư':'u','ừ':'u','ứ':'u','ự':'u','ử':'u','ữ':'u',
  'ỳ':'y','ý':'y','ỵ':'y','ỷ':'y','ỹ':'y',
  'đ':'d',
}

function toSlug(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .split('')
    .map(c => VIETNAMESE_MAP[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

async function getMaxOrder() {
  const snap = await db.collection('articles').orderBy('order', 'desc').limit(1).get()
  return snap.empty ? 0 : (snap.docs[0].data().order || 0)
}

async function main() {
  // DEFAULT_ARTICLES is ESM — load via dynamic import
  const { DEFAULT_ARTICLES } = await import('../src/data/articles.js')
  const seeds = DEFAULT_ARTICLES.filter(a => TARGET_IDS.includes(a.id))
  if (seeds.length !== TARGET_IDS.length) {
    const missing = TARGET_IDS.filter(id => !seeds.find(s => s.id === id))
    throw new Error(`Missing seed entries in DEFAULT_ARTICLES: ${missing.join(', ')}`)
  }

  let baseOrder = await getMaxOrder()
  console.log(`📦 Seeding ${seeds.length} legacy articles (current max order: ${baseOrder})`)

  for (const seed of seeds) {
    const ref = db.collection('articles').doc(seed.id)
    const existing = await ref.get()
    if (existing.exists) {
      console.log(`  ⏭  ${seed.id} already exists — skip`)
      continue
    }
    baseOrder += 1
    await ref.set({
      topic: seed.topic || '',
      date: seed.date,
      image: '',
      tag: seed.tag,
      vi: seed.vi,
      en: seed.en,
      viSlug: toSlug(seed.vi?.title),
      enSlug: toSlug(seed.en?.title),
      order: baseOrder,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`  ✅ ${seed.id} ("${seed.vi?.title || seed.en?.title}") → order ${baseOrder}`)
  }

  console.log('\n✅ Done. Bot Mod can now patch `image` field via /api/articles.')
  process.exit(0)
}

main().catch(err => { console.error('❌', err); process.exit(1) })
