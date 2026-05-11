/**
 * pwa-fcm-web-push-subscription.js
 *
 * Firebase Cloud Messaging Web Push integration.
 *
 * Design principles (anti-FOMO):
 *   - NEVER request notification permission on page load.
 *   - Only subscribe when the user explicitly taps "Bật thông báo".
 *   - Push topics are deliberately limited:
 *       1. Thầy answered your Khai Trí question
 *       2. New article published by Đăng
 *   - Token saved to Firestore btd_profiles/{uid}.fcmToken for server-side targeting.
 *
 * FCM VAPID key: set VITE_FIREBASE_VAPID_KEY in .env
 * Firebase project: immortalityvn (shared with web app)
 */

import { getToken, isSupported, onMessage } from 'firebase/messaging'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

// Lazy-load Firebase Messaging — it adds ~40KB; only needed when user subscribes
let _messagingInstance = null
let _messagingApp = null

async function getMessaging() {
  if (_messagingInstance) return _messagingInstance

  const supported = await isSupported().catch(() => false)
  if (!supported) {
    throw new Error('Firebase Messaging not supported in this browser')
  }

  // Import lazily to avoid adding FCM to initial bundle
  const { getMessaging: _getMessaging } = await import('firebase/messaging')
  // Re-use the already-initialized Firebase app via the shared db instance's app
  const { db: _db } = await import('../firebase.js')
  const firebaseApp = _db.app

  _messagingApp = firebaseApp
  _messagingInstance = _getMessaging(firebaseApp)
  return _messagingInstance
}

/**
 * Request notification permission and subscribe to FCM push.
 * MUST be called from a user gesture (button click).
 *
 * @param {import('firebase/auth').User|null} user  Authenticated Firebase user (nullable — saves token anon)
 * @returns {Promise<{ token: string|null, status: 'granted'|'denied'|'unsupported'|'error' }>}
 */
export async function subscribeToPush(user) {
  // 1. Check browser support
  const supported = await isSupported().catch(() => false)
  if (!supported) return { token: null, status: 'unsupported' }

  // 2. Request permission (must be triggered by user gesture)
  let permission = Notification.permission
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission()
    } catch {
      return { token: null, status: 'denied' }
    }
  }
  if (permission !== 'granted') return { token: null, status: 'denied' }

  try {
    const messaging = await getMessaging()
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

    if (!vapidKey) {
      console.warn('[BTD Push] VITE_FIREBASE_VAPID_KEY not set — token cannot be generated')
      return { token: null, status: 'error' }
    }

    // 3. Get registration (SW must already be registered)
    const swReg = await navigator.serviceWorker.ready

    // 4. Get FCM token
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg })

    if (!token) return { token: null, status: 'error' }

    // 5. Persist token to Firestore
    await saveTokenToFirestore(token, user)

    return { token, status: 'granted' }
  } catch (err) {
    console.error('[BTD Push] Subscribe failed:', err)
    return { token: null, status: 'error' }
  }
}

/**
 * Save FCM token to Firestore so server can send targeted pushes.
 * Collection: btd_profiles/{uid} for authenticated users,
 *             btd_push_tokens/{token} for anonymous.
 */
async function saveTokenToFirestore(token, user) {
  try {
    if (user?.uid) {
      await setDoc(
        doc(db, 'btd_profiles', user.uid),
        {
          fcmToken: token,
          fcmUpdatedAt: serverTimestamp(),
          pushTopics: ['khaitri_answer', 'new_article_from_dang'],
        },
        { merge: true }
      )
    } else {
      // Anonymous — store by token hash for deduplication
      await setDoc(
        doc(db, 'btd_push_tokens', token.slice(0, 40)),
        {
          token,
          updatedAt: serverTimestamp(),
          topics: ['new_article_from_dang'],
        },
        { merge: true }
      )
    }
  } catch (err) {
    // Non-fatal — token still usable; Firestore write failed silently
    console.warn('[BTD Push] Token save to Firestore failed:', err)
  }
}

/**
 * Delete FCM token and remove from Firestore (unsubscribe).
 * @param {import('firebase/auth').User|null} user
 * @returns {Promise<void>}
 */
export async function unsubscribeFromPush(user) {
  try {
    const messaging = await getMessaging()
    const { deleteToken } = await import('firebase/messaging')
    await deleteToken(messaging)

    if (user?.uid) {
      await setDoc(
        doc(db, 'btd_profiles', user.uid),
        { fcmToken: null, fcmUpdatedAt: serverTimestamp() },
        { merge: true }
      )
    }
  } catch (err) {
    console.warn('[BTD Push] Unsubscribe failed:', err)
  }
}

/**
 * Returns current notification permission state.
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function getPermissionStatus() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

/**
 * Listen for foreground push messages (app is open).
 * Background messages are handled by sw.js push event.
 *
 * @param {(payload: object) => void} handler
 * @returns {Promise<() => void>} unsubscribe function
 */
export async function onForegroundMessage(handler) {
  try {
    const messaging = await getMessaging()
    return onMessage(messaging, handler)
  } catch {
    return () => {}
  }
}
