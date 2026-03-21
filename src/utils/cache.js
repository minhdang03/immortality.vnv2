const TTL_MS = {
  content: 30 * 60 * 1000,  // 30 min — articles, stories, topics, settings, etc.
  rate: 60 * 60 * 1000,     // 1 hour — rate limiting
}

export function cacheGet(key, type = 'content') {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    const ttl = TTL_MS[type]
    if (ttl && Date.now() - ts > ttl) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function cacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function cacheRemove(key) {
  localStorage.removeItem(key)
}
