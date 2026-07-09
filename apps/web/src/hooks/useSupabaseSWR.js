/**
 * SWR hook for Supabase: show cached data instantly, revalidate via one-shot select().
 * Mirrors the useFirestoreSWR(cacheKey, subscribe, fallback) contract so hooks can
 * swap implementations behind the VITE_DATA_BACKEND flag without touching callers.
 *
 * Difference: `fetcher` is an async () => data[] instead of (onData, onError) => unsub.
 */
import { useState, useEffect } from 'react'
import { readCache, writeCache } from './useFirestoreSWR'

/**
 * @param {string} cacheKey - localStorage key (e.g. 'cached_articles')
 * @param {() => Promise<any>} fetcher - async fn that returns the data
 * @param {*} fallback - default value when no cache exists
 * @returns {{ data, loading, fresh }}
 */
export function useSupabaseSWR(cacheKey, fetcher, fallback) {
  const [cached] = useState(() => readCache(cacheKey))
  const [data, setData] = useState(cached?.data ?? fallback)
  const [loading, setLoading] = useState(!cached)
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetcher()
        if (!cancelled) {
          setData(result)
          writeCache(cacheKey, result)
        }
      } catch (err) {
        console.error('[useSupabaseSWR]', cacheKey, err)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setFresh(true)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [cacheKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, fresh }
}
