import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

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
