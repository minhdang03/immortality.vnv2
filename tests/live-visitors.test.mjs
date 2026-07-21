import test from 'node:test'
import assert from 'node:assert/strict'
import {
  aggregateVisitors,
  isTrackableLivePath,
  normalizeCountry,
  normalizeLiveLocation,
  normalizeLivePath,
  normalizePresenceState,
  projectGlobePoint,
  quantizeCoordinate,
  routeIdFromPath,
} from '../apps/web/src/lib/live-visitors.js'
import liveLocationHandler from '../api/live-location.js'

function mockResponse() {
  return {
    statusCode: 200, headers: {}, body: null,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

test('coarse geography accepts only valid country and coordinates', () => {
  assert.equal(normalizeCountry('vn'), 'VN')
  assert.equal(normalizeCountry('Vietnam'), 'unknown')
  assert.equal(quantizeCoordinate('10.8', 'latitude'), 10)
  assert.equal(quantizeCoordinate('106.7', 'longitude'), 110)
  assert.equal(quantizeCoordinate(null, 'latitude'), null)
  assert.equal(quantizeCoordinate(181, 'longitude'), null)
  assert.deepEqual(normalizeLiveLocation({ country: 'vn', latitude: 10, longitude: 107, path: '/admin', ip: 'secret' }), {
    country: 'VN', latitude: 10, longitude: 110,
  })
})

test('paths are normalized and private dashboards never track', () => {
  assert.equal(normalizeLivePath('/articles/test?secret=1'), '/articles/test')
  assert.equal(normalizeLivePath(`/${'x'.repeat(200)}?ignored=1`), null)
  assert.equal(isTrackableLivePath('/articles/test'), true)
  assert.equal(isTrackableLivePath('/live'), false)
  assert.equal(isTrackableLivePath('/admin/users'), false)
  assert.equal(routeIdFromPath('/article/a-slug'), 'articles')
  assert.equal(routeIdFromPath('/story/a-story'), 'stories')
})

test('presence normalization drops malformed and excluded payloads', () => {
  const visitors = normalizePresenceState({
    one: [{ path: '/articles', country: 'au', latitude: -33.8, longitude: 151.2, joined_at: '2026-07-21T00:00:00Z' }],
    two: [{ path: '/live', country: 'VN' }, null, { path: 'not-a-path' }],
    broken: 'not-an-array',
  })
  assert.equal(visitors.length, 1)
  assert.deepEqual(
    { path: visitors[0].path, country: visitors[0].country, latitude: visitors[0].latitude, longitude: visitors[0].longitude },
    { path: '/articles', country: 'AU', latitude: -30, longitude: 150 }
  )
})

test('presence normalization stops at the public-channel safety cap', () => {
  const oversized = Array.from({ length: 700 }, (_, index) => ({ path: `/articles/${index}` }))
  assert.equal(normalizePresenceState({ hostile: oversized }).length, 500)
  const invalidFirst = Array.from({ length: 500 }, () => null)
  assert.equal(normalizePresenceState({ hostile: invalidFirst, later: [{ path: '/articles' }] }).length, 0)
})

test('aggregation sorts counts and globe projection stays bounded', () => {
  const rows = aggregateVisitors(
    [{ country: 'VN' }, { country: 'AU' }, { country: 'VN' }],
    visitor => visitor.country
  )
  assert.deepEqual(rows, [{ key: 'VN', count: 2 }, { key: 'AU', count: 1 }])
  assert.deepEqual(projectGlobePoint(0, 0), { x: 360, y: 180 })
  assert.equal(projectGlobePoint(91, 0), null)
})

test('live location endpoint returns only coarse allowlisted geography', () => {
  const response = mockResponse()
  liveLocationHandler({ method: 'GET', headers: {
    'x-vercel-ip-country': 'vn',
    'x-vercel-ip-latitude': '10.8231',
    'x-vercel-ip-longitude': '106.6297',
    'x-forwarded-for': '203.0.113.1',
    'x-vercel-ip-city': 'Ho%20Chi%20Minh',
  } }, response)
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body, { country: 'VN', latitude: 10, longitude: 110 })
  assert.equal(response.headers['Cache-Control'], 'private, no-store, max-age=0')
})

test('live location endpoint rejects non-GET methods', () => {
  const response = mockResponse()
  liveLocationHandler({ method: 'POST', headers: {} }, response)
  assert.equal(response.statusCode, 405)
  assert.deepEqual(response.body, { error: 'method_not_allowed' })
  assert.equal(response.headers.Allow, 'GET')
})
