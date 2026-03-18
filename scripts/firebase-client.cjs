/**
 * Firebase Client SDK helper for seed scripts
 * Uses email/password auth instead of Admin SDK (no service account needed)
 *
 * Requires .env with:
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID,
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
require('dotenv/config')

const { initializeApp } = require('firebase/app')
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } = require('firebase/firestore')

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})

const auth = getAuth(app)
const db = getFirestore(app)

async function login() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) throw new Error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  console.log(`✅ Logged in as ${cred.user.email}`)
  return cred.user
}

async function getMaxOrder(collectionName) {
  const q = query(collection(db, collectionName), orderBy('order', 'desc'), limit(1))
  const snap = await getDocs(q)
  return snap.empty ? 0 : (snap.docs[0].data().order || 0)
}

async function seedCollection(collectionName, items) {
  await login()
  const maxOrder = await getMaxOrder(collectionName)
  console.log(`📦 Seeding ${items.length} items into "${collectionName}" (current max order: ${maxOrder})`)

  for (let i = 0; i < items.length; i++) {
    const item = { ...items[i], order: items[i].order || maxOrder + i + 1, createdAt: serverTimestamp() }
    const docRef = await addDoc(collection(db, collectionName), item)
    const title = item.vi?.title || item.en?.title || `Item ${i + 1}`
    console.log(`  ${i + 1}. "${title}" → ${docRef.id}`)
  }

  console.log(`\n✅ Done! ${items.length} items seeded into "${collectionName}".`)
  process.exit(0)
}

module.exports = { db, auth, login, getMaxOrder, seedCollection }
