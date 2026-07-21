import { normalizeLiveLocation } from '../apps/web/src/lib/live-visitors.js'

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  return res.status(200).json(normalizeLiveLocation({
    country: req.headers['x-vercel-ip-country'],
    latitude: req.headers['x-vercel-ip-latitude'],
    longitude: req.headers['x-vercel-ip-longitude'],
  }))
}
