export const LIVE_VISITORS_CHANNEL = 'site-live-visitors:v1'

const MAX_PATH_LENGTH = 160
const MAX_PRESENCES = 500

export function normalizeLivePath(value) {
  if (typeof value !== 'string' || value.length > MAX_PATH_LENGTH) return null
  const path = value.split(/[?#]/, 1)[0]
  if (!path.startsWith('/')) return null
  return path.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

export function isTrackableLivePath(path) {
  const normalized = normalizeLivePath(path)
  return Boolean(normalized && !/^\/(admin|live)(\/|$)/.test(normalized))
}

export function normalizeCountry(value) {
  return typeof value === 'string' && /^[a-z]{2}$/i.test(value)
    ? value.toUpperCase()
    : 'unknown'
}

export function quantizeCoordinate(value, type) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const number = Number(value)
  const limit = type === 'latitude' ? 90 : 180
  if (!Number.isFinite(number) || Math.abs(number) > limit) return null
  return Math.round(number / 10) * 10
}

export function normalizeLiveLocation(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const country = normalizeCountry(source.country)
  return {
    country,
    latitude: country === 'unknown' ? null : quantizeCoordinate(source.latitude, 'latitude'),
    longitude: country === 'unknown' ? null : quantizeCoordinate(source.longitude, 'longitude'),
  }
}

function normalizeTimestamp(value) {
  if (typeof value !== 'string' || value.length > 64) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

export function normalizePresenceState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return []
  const visitors = []
  let inspected = 0

  for (const key in state) {
    if (!Object.prototype.hasOwnProperty.call(state, key)) continue
    if (inspected >= MAX_PRESENCES) break
    const presences = state[key]
    if (!Array.isArray(presences)) { inspected += 1; continue }
    for (let index = 0; index < presences.length && inspected < MAX_PRESENCES; index += 1) {
      inspected += 1
      const presence = presences[index]
      if (!presence || typeof presence !== 'object' || Array.isArray(presence)) continue
      const path = normalizeLivePath(presence?.path)
      if (!isTrackableLivePath(path)) continue
      visitors.push({
        key: `${key}:${index}`,
        path,
        lang: presence.lang === 'en' ? 'en' : 'vi',
        country: normalizeCountry(presence.country),
        latitude: quantizeCoordinate(presence.latitude, 'latitude'),
        longitude: quantizeCoordinate(presence.longitude, 'longitude'),
        joinedAt: normalizeTimestamp(presence.joined_at),
        updatedAt: normalizeTimestamp(presence.updated_at),
      })
    }
  }

  return visitors
}

export function aggregateVisitors(visitors, selector) {
  const counts = new Map()
  visitors.forEach(visitor => {
    const value = selector(visitor)
    if (!value) return
    counts.set(value, (counts.get(value) || 0) + 1)
  })
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
}

export function routeIdFromPath(path) {
  const normalized = normalizeLivePath(path) || '/'
  if (normalized === '/') return 'home'
  if (/^\/articles?\//.test(normalized)) return 'articles'
  if (/^\/story\//.test(normalized)) return 'stories'
  if (/^\/khaitri\//.test(normalized)) return 'khaitri'
  if (/^\/topic\//.test(normalized)) return 'articles'
  if (/^\/category\//.test(normalized)) return 'articles'
  return normalized.split('/')[1] || 'home'
}

export function projectGlobePoint(latitude, longitude) {
  const lat = quantizeCoordinate(latitude, 'latitude')
  const lon = quantizeCoordinate(longitude, 'longitude')
  if (lat === null || lon === null) return null
  return { x: ((lon + 180) / 360) * 720, y: ((90 - lat) / 180) * 360 }
}
