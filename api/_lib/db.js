// api/_lib/db.js — Firestore admin client (bypasses security rules; only used in API endpoints
// gated by requireAgent()).

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

let initialized = false
function ensureAdmin() {
  if (initialized) return
  if (getApps().length) { initialized = true; return }
  const saB64 = process.env.FIREBASE_ADMIN_SA_B64
  if (saB64) {
    const sa = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'))
    initializeApp({ credential: cert(sa) })
  } else {
    initializeApp()
  }
  initialized = true
}

export function db() {
  ensureAdmin()
  return getFirestore()
}

export { FieldValue }
