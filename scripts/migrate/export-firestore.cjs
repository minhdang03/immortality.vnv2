/**
 * Phase-02 export: dump public Firestore collections → scripts/migrate/.dump/<col>.json
 * Uses Firebase CLIENT SDK with NO auth (content collections are public-read per
 * firestore.rules). PII collections (donation_contacts, contacts, pending donations)
 * need admin SDK — handled separately, not here. Read-only; never writes Firestore.
 *
 * Run: node scripts/migrate/export-firestore.cjs [collection]
 * Env: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID (from .env)
 */
const fs = require('fs')
const path = require('path')
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs } = require('firebase/firestore')

// Minimal .env loader (avoid dotenv dep in pnpm workspace root).
;(function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
})()

// Public content + config collections (no auth needed).
const PUBLIC_COLLECTIONS = [
  'articles', 'stories', 'khaitri', 'teachings', 'practices',
  'topics', 'translations', 'settings', 'comments',
]

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})
const db = getFirestore(app)

const DUMP_DIR = path.join(__dirname, '.dump')

async function dumpCollection(name) {
  const snap = await getDocs(collection(db, name))
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  fs.writeFileSync(path.join(DUMP_DIR, `${name}.json`), JSON.stringify(docs, null, 2))
  return docs.length
}

async function main() {
  if (!process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_PROJECT_ID) {
    console.error('Missing VITE_FIREBASE_API_KEY / VITE_FIREBASE_PROJECT_ID in .env')
    process.exit(1)
  }
  fs.mkdirSync(DUMP_DIR, { recursive: true })
  const only = process.argv[2]
  const cols = only ? [only] : PUBLIC_COLLECTIONS
  console.log('Exporting Firestore (client SDK, public read):')
  let total = 0
  for (const name of cols) {
    try {
      const n = await dumpCollection(name)
      total += n
      console.log(`  ${name.padEnd(14)} ${n} docs`)
    } catch (e) {
      console.log(`  ${name.padEnd(14)} ERROR ${String(e.message || e).slice(0, 80)}`)
    }
  }
  console.log(`Total: ${total} docs → ${DUMP_DIR}`)
  process.exit(0)
}

main()
