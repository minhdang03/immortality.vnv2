// Service Worker — precache app shell for instant repeat loads
const CACHE_NAME = 'app-shell-v2'

// App shell: index + key assets cached on install
const APP_SHELL = [
  '/',
  '/index.html',
]

// Install: precache app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: stale-while-revalidate for navigation & assets
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Skip non-GET, cross-origin, and Firebase/API requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return

  // Navigation requests (HTML) → serve cached index.html for SPA routing
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', clone))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // JS/CSS assets → stale-while-revalidate
  if (url.pathname.match(/\.(js|css|woff2?)$/)) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return res
        }).catch(() => cached)

        return cached || fetchPromise
      })
    )
    return
  }
})
