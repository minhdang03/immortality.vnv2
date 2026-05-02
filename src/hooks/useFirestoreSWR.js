import { useState, useEffect } from 'react'

const TTL = 5 * 60 * 1000 // 5 minutes

// Read from localStorage with TTL awareness
// Handles both old format { data, ts } (from cacheSet) and new format (raw data + separate _ts key)
function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Old format: { data: [...], ts: 123 }
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'ts' in parsed) {
      return { data: parsed.data, fresh: Date.now() - parsed.ts < TTL }
    }
    // New format: raw data + separate timestamp key
    const ts = parseInt(localStorage.getItem(`${key}_ts`)) || 0
    return { data: parsed, fresh: Date.now() - ts < TTL }
  } catch { return null }
}

// Write to localStorage with timestamp
function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(`${key}_ts`, String(Date.now()))
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

  useEffect(() => {
    try {
      const unsub = subscribe(
        (newData) => {
          setData(newData)
          setLoading(false)
          writeCache(cacheKey, newData)
        },
        () => setLoading(false)
      )
      return unsub
    } catch { setLoading(false) }
  }, [cacheKey])

  return { data, loading }
}

/**
 * SWR + CRUD: same as useFirestoreSWR but adds add/update/remove operations.
 */
export { readCache, writeCache }
