/**
 * pwa-install-prompt-manager.js
 *
 * Captures the browser's `beforeinstallprompt` event and exposes a stable API
 * for the install banner component to trigger the native install dialog.
 *
 * Usage:
 *   import { onInstallReady, showInstallPrompt, onInstalled } from './pwa-install-prompt-manager'
 *   onInstallReady(() => setCanInstall(true))
 *   showInstallPrompt()  // call on user action only
 */

let _deferredPrompt = null
const _readyListeners = []
const _installedListeners = []

// Only meaningful in browser
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar on mobile Chrome from showing automatically
    e.preventDefault()
    _deferredPrompt = e
    _readyListeners.forEach((cb) => {
      try { cb() } catch {}
    })
  })

  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null
    _installedListeners.forEach((cb) => {
      try { cb() } catch {}
    })
    // Telemetry — dispatch custom event so analytics hook can pick it up
    try {
      window.dispatchEvent(new CustomEvent('btd:pwa_installed'))
    } catch {}
  })
}

/**
 * Register a callback to be called when the install prompt is available.
 * Returns a cleanup function to deregister.
 * @param {() => void} cb
 * @returns {() => void}
 */
export function onInstallReady(cb) {
  _readyListeners.push(cb)
  // If prompt already captured (e.g. component mounts after event fired), call immediately
  if (_deferredPrompt) {
    try { cb() } catch {}
  }
  return () => {
    const idx = _readyListeners.indexOf(cb)
    if (idx !== -1) _readyListeners.splice(idx, 1)
  }
}

/**
 * Register a callback for after successful install.
 * @param {() => void} cb
 * @returns {() => void}
 */
export function onInstalled(cb) {
  _installedListeners.push(cb)
  return () => {
    const idx = _installedListeners.indexOf(cb)
    if (idx !== -1) _installedListeners.splice(idx, 1)
  }
}

/**
 * Whether the install prompt is currently available.
 * @returns {boolean}
 */
export function canInstall() {
  return _deferredPrompt !== null
}

/**
 * Show the native install prompt. Must be called from a user gesture.
 * @returns {Promise<'accepted'|'dismissed'|'unavailable'>}
 */
export async function showInstallPrompt() {
  if (!_deferredPrompt) return 'unavailable'

  try {
    _deferredPrompt.prompt()
    const { outcome } = await _deferredPrompt.userChoice
    _deferredPrompt = null
    return outcome // 'accepted' | 'dismissed'
  } catch (err) {
    console.warn('[BTD PWA] Install prompt failed:', err)
    _deferredPrompt = null
    return 'unavailable'
  }
}

/**
 * Returns true if the app is already running in standalone (installed) mode.
 * @returns {boolean}
 */
export function isRunningStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari
  )
}
