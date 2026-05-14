import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Self-host fonts so Vietnamese diacritics render correctly even when
// fonts.googleapis.com is slow/blocked (common on some VN ISPs / Android).
// Each weight import bundles latin + latin-ext + vietnamese subsets.
import '@fontsource/be-vietnam-pro/300.css'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/cormorant-garamond/400-italic.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register Service Worker for app shell precaching — production hosts only.
// On localhost / 127.0.0.1, actively unregister + clear caches so a stale SW
// from a prior `pnpm preview` doesn't keep serving the site after the server stops.
if ('serviceWorker' in navigator) {
  const host = window.location.hostname
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')
  if (isLocal) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))
    if (window.caches?.keys) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}
