// Service Worker v3 — PWA upgrade with precache, runtime cache, offline fallback, push, background sync
const CACHE_NAME = 'btd-shell-v3-pwa-2026-05-11'
const RUNTIME_CACHE = 'btd-runtime-v3'
const IMAGE_CACHE = 'btd-images-v3'

// App shell files — precached on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
]

// Background sync queue name
const SYNC_QUEUE = 'btd-mutations'

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll fails entirely if any URL fails — use individual puts for resilience
      Promise.allSettled(
        APP_SHELL.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => { if (res.ok) cache.put(url, res) })
            .catch(() => {})
        )
      )
    )
  )
  self.skipWaiting()
})

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  const allowedCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE]
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !allowedCaches.includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Only handle GET — non-GET mutations go through background sync
  if (request.method !== 'GET') return

  // Skip: Firebase SDKs, Firestore API, third-party, analytics
  const isFirestore = url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('googleapis.com')
  const isCrossOrigin = url.origin !== self.location.origin
  const isGoogleFonts = url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  const isWsrv = url.hostname.includes('wsrv.nl')

  // Cross-origin image CDN (wsrv.nl) — cache-first, long TTL
  if (isWsrv) {
    e.respondWith(cacheFirstImages(request))
    return
  }

  // Skip other cross-origin except fonts
  if (isCrossOrigin && !isGoogleFonts && !isFirestore) return

  // Firebase Firestore — skip (let Firestore SDK handle caching via IndexedDB)
  if (isFirestore) return

  // Google Fonts — stale-while-revalidate
  if (isGoogleFonts) {
    e.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE, 60 * 60 * 24 * 30))
    return
  }

  // Navigation requests — serve cached index.html for SPA routing, offline.html on failure
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((res) => {
          // Cache success — update shell cache
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put('/', clone))
          }
          return res
        })
        .catch(async () => {
          // Offline — serve cached shell
          const cached = await caches.match('/') || await caches.match('/index.html')
          if (cached) return cached
          // Last resort: offline page
          return caches.match('/offline.html')
        })
    )
    return
  }

  // Hashed JS/CSS assets (Vite bundles with content hash) — cache-first, immutable
  if (url.pathname.match(/\/assets\/.*\.(js|css)(\?.*)?$/) ||
      url.pathname.match(/\.(woff2?)(\?.*)?$/)) {
    e.respondWith(cacheFirstImmutable(request))
    return
  }

  // Images in /public
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico)(\?.*)?$/)) {
    e.respondWith(cacheFirstImages(request))
    return
  }

  // manifest.json, robots.txt, sitemap, offline.html — cache-first with revalidate
  if (url.pathname.match(/\.(json|txt|xml|html)(\?.*)?$/) && url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(request, CACHE_NAME, 60 * 5))
    return
  }

  // /api routes — network-only (never cache)
  if (url.pathname.startsWith('/api')) return

  // Default: stale-while-revalidate for same-origin requests
  if (url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE, 60 * 5))
  }
})

// ── Cache helpers ─────────────────────────────────────────────────────────────

// Cache-first for immutable hashed assets (Vite content-hash bundles)
async function cacheFirstImmutable(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    return new Response('Asset offline', { status: 503 })
  }
}

// Cache-first for images (long TTL, no revalidate)
async function cacheFirstImages(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(IMAGE_CACHE)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    return new Response('Image offline', { status: 503 })
  }
}

// Stale-while-revalidate: return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchAndUpdate = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => cached || new Response('Offline', { status: 503 }))

  if (cached) {
    // Check if stale (use date header)
    const cachedDate = cached.headers.get('date')
    const ageMs = cachedDate ? Date.now() - new Date(cachedDate).getTime() : 0
    if (ageMs < maxAgeSeconds * 1000) {
      // Fresh enough — update in background, return cache
      fetchAndUpdate // fire-and-forget
      return cached
    }
  }

  // Stale or missing — await network, fall back to cache
  return fetchAndUpdate
}

// ── Background Sync ────────────────────────────────────────────────────────────
// Queue failed POST/PUT/PATCH mutations when offline, replay on reconnect
self.addEventListener('sync', (e) => {
  if (e.tag === SYNC_QUEUE) {
    e.waitUntil(replayMutations())
  }
})

async function replayMutations() {
  // Mutations stored in IndexedDB by pwa-install-prompt.js
  // Simple implementation: read queue from all clients via MessageChannel
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({ type: 'SW_SYNC_REPLAY' })
  })
}

// ── Push Notifications ─────────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  let data = { title: 'Bất Tử Đạo', body: 'Có nội dung mới', url: '/', icon: '/icons/icon-192.png' }

  try {
    if (e.data) {
      const parsed = e.data.json()
      data = { ...data, ...parsed }
    }
  } catch {
    if (e.data) data.body = e.data.text()
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'btd-notification',
    data: { url: data.url || '/' },
    requireInteraction: false,
    actions: data.actions || [],
  }

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// ── Notification Click ─────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close()

  const targetUrl = (e.notification.data && e.notification.data.url) || '/'

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        const clientUrl = new URL(client.url)
        if (clientUrl.origin === self.location.origin) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }
      // Open new window
      return self.clients.openWindow(targetUrl)
    })
  )
})

// ── Message handler ────────────────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
