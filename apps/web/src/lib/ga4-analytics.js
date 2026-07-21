/**
 * GA4 analytics — lazy gtag.js injection with a queue.
 * Drop-in replacement for the previous logEvent(name, params) signature.
 *
 * Measurement ID: VITE_GA_MEASUREMENT_ID (preferred) or the legacy measurement env.
 * No-ops on SSR or when no measurement ID is configured.
 */
const MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID

let injected = false

function ensureGtag() {
  if (typeof window === 'undefined' || !MEASUREMENT_ID) return null
  if (!injected) {
    injected = true
    window.dataLayer = window.dataLayer || []
    // Standard GA4 bootstrap — dataLayer queues calls until the script loads.
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false })

    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    document.head.appendChild(s)
  }
  return window.gtag
}

// Preload during idle time so the first user event is fast.
if (typeof window !== 'undefined' && MEASUREMENT_ID) {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000))
  schedule(() => ensureGtag())
}

/**
 * Log a GA4 event. Safe no-op when analytics is unavailable.
 * @param {string} eventName
 * @param {object} [params]
 */
export function logEvent(eventName, params) {
  const gtag = ensureGtag()
  if (!gtag) return
  try { gtag('event', eventName, params || {}) } catch {}
}
