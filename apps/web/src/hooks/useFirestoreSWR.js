import { useState, useEffect } from 'react'

const TTL = 5 * 60 * 1000 // 5 minutes

// Bump CACHE_VERSION whenever the data shape on Firestore changes incompatibly
// (e.g. new required field, schema migration). All cached data with older
// versions is silently ignored, forcing a fresh Firestore read.
const CACHE_VERSION = 'v2'
const versioned = (key) => `${key}::${CACHE_VERSION}`

// One-shot purge: drop any leftover keys from the unversioned era so they
// don't accumulate forever in users' localStorage.
let purgedLegacy = false
function purgeLegacyOnce() {
  if (purgedLegacy) return
  purgedLegacy = true
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('cached_') && !k.includes('::')) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
}

// Read from versioned localStorage with TTL awareness
function readCache(key) {
  try {
    purgeLegacyOnce()
    const vKey = versioned(key)
    const raw = localStorage.getItem(vKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Old format: { data: [...], ts: 123 }
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'ts' in parsed) {
      return { data: parsed.data, fresh: Date.now() - parsed.ts < TTL }
    }
    // New format: raw data + separate timestamp key
    const ts = parseInt(localStorage.getItem(`${vKey}_ts`)) || 0
    return { data: parsed, fresh: Date.now() - ts < TTL }
  } catch { return null }
}

// 2 MB cap per cache entry — bigger than this gets dropped to keep localStorage healthy
const MAX_CACHE_BYTES = 2 * 1024 * 1024

// Write to versioned localStorage with timestamp + size cap
function writeCache(key, data) {
  try {
    const vKey = versioned(key)
    const json = JSON.stringify(data)
    if (json.length > MAX_CACHE_BYTES) {
      // Skip cache rather than evict random items / trip QuotaExceeded silently
      return
    }
    localStorage.setItem(vKey, json)
    localStorage.setItem(`${vKey}_ts`, String(Date.now()))
  } catch {}
}

// Clear ALL versioned `cached_*` entries — call from auth signOut handler so a non-admin
// user on a shared device cannot read previously-cached admin-visible data.
export function clearAllCaches() {
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('cached_')) keysToRemove.push(k)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  } catch {}
}

/**
 * SWR hook for Firestore: show cached data instantly, revalidate via onSnapshot.
 *
 * @param {string} cacheKey - localStorage key (e.g. 'cached_articles')
 * @param {function} subscribe - (onData, onError) => unsubscribe
 * @param {*} fallback - default value when no cache exists
 * @returns {{ data, loading }}
 */
export function useFirestoreSWR(cacheKey, subscribe, fallback) {
  const [cached] = useState(() => readCache(cacheKey))
  const [data, setData] = useState(cached?.data ?? fallback)
  const [loading, setLoading] = useState(!cached)
  // `fresh` = true after the first live Firestore snapshot arrives.
  // Distinguishes "we have cached data but haven't revalidated yet" from
  // "we have the current truth". Deep-link skeletons rely on this to avoid
  // rendering a stale list when the requested detail isn't in cache yet.
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    try {
      const unsub = subscribe(
        (newData) => {
          setData(newData)
          setLoading(false)
          setFresh(true)
          writeCache(cacheKey, newData)
        },
        () => { setLoading(false); setFresh(true) }
      )
      return unsub
    } catch { setLoading(false); setFresh(true) }
  }, [cacheKey])

  return { data, loading, fresh }
}

/**
 * SWR + CRUD: same as useFirestoreSWR but adds add/update/remove operations.
 */
export { readCache, writeCache }

