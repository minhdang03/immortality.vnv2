/**
 * localStorage SWR cache — versioned keys, TTL awareness, size cap.
 * Shared by useSupabaseSWR + useTranslations. Cache keys unchanged from the
 * pre-cutover era (`cached_*::v3`) so existing clients keep their warm cache.
 */
const TTL = 5 * 60 * 1000 // 5 minutes

// Bump CACHE_VERSION whenever the cached data shape changes incompatibly.
// Older-version entries are silently ignored, forcing a fresh network read.
const CACHE_VERSION = 'v3' // v3: cutover Supabase 2026-07-10 — wipe cache shape cũ
const versioned = (key) => `${key}::${CACHE_VERSION}`

// One-shot purge: drop any leftover keys from the unversioned era.
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
export function readCache(key) {
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
export function writeCache(key, data) {
  try {
    const vKey = versioned(key)
    const json = JSON.stringify(data)
    if (json.length > MAX_CACHE_BYTES) return
    localStorage.setItem(vKey, json)
    localStorage.setItem(`${vKey}_ts`, String(Date.now()))
  } catch {}
}

// Clear ALL versioned `cached_*` entries — call from auth signOut so a non-admin
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
