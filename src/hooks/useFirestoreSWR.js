import { useState, useEffect } from 'react'

const TTL = 5 * 60 * 1000 // 5 minutes

// Read from localStorage with TTL awareness
function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    const ts = parseInt(localStorage.getItem(`${key}_ts`)) || 0
    return { data, fresh: Date.now() - ts < TTL }
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
  }, [])

  return { data, loading }
}

/**
 * SWR + CRUD: same as useFirestoreSWR but adds add/update/remove operations.
 */
export { readCache, writeCache }
