import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

// Firestore with IndexedDB persistence — F5 serves cached data instantly
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
})

export const auth = getAuth(app)

// Analytics is lazy-loaded — saves ~60KB on initial bundle.
// First logEvent() call triggers dynamic import; events before SDK loads are
// queued and flushed once ready.
let analyticsPromise = null
const eventQueue = []

function loadAnalytics() {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) return null
  if (!analyticsPromise) {
    analyticsPromise = import('firebase/analytics')
      .then(({ getAnalytics, logEvent }) => {
        const a = getAnalytics(app)
        // Flush any queued events
        for (const [name, params] of eventQueue) {
          try { logEvent(a, name, params) } catch {}
        }
        eventQueue.length = 0
        return { a, logEvent }
      })
      .catch(() => null)
  }
  return analyticsPromise
}

// Preload analytics during browser idle time so first user event is fast.
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000))
  schedule(() => loadAnalytics())
}

export function logEvent(eventName, params) {
  const p = loadAnalytics()
  if (!p) return
  // If SDK not loaded yet, queue the event
  if (!p.then) return
  p.then(mod => {
    if (mod) {
      try { mod.logEvent(mod.a, eventName, params) } catch {}
    } else {
      eventQueue.push([eventName, params])
    }
  })
}
