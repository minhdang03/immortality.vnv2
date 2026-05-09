// Proxy SSE chat to GoClaw /v1/chat/completions.
// Client never sees GoClaw URL or API key.
const ALLOWED_ORIGINS = [
  'https://battudao.com',
  'https://www.battudao.com',
  'https://immortality.vn',
  'https://www.immortality.vn',
  'http://localhost:5173',
]

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { GOCLAW_URL, GOCLAW_API_KEY, GOCLAW_AGENT_ID } = process.env
  if (!GOCLAW_URL || !GOCLAW_API_KEY || !GOCLAW_AGENT_ID) {
    return res.status(500).json({ error: 'Chatbot not configured' })
  }

  const { messages, userId } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' })
  }

  const upstreamRes = await fetch(`${GOCLAW_URL.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GOCLAW_API_KEY}`,
      ...(userId ? { 'X-GoClaw-User-Id': String(userId) } : {}),
    },
    body: JSON.stringify({
      model: `goclaw:${GOCLAW_AGENT_ID}`,
      messages,
      stream: true,
      user: userId,
    }),
  })

  if (!upstreamRes.ok) {
    const txt = await upstreamRes.text().catch(() => '')
    return res.status(upstreamRes.status).json({ error: 'Upstream error', detail: txt.slice(0, 500) })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const reader = upstreamRes.body.getReader()
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'stream_error', message: String(err) })}\n\n`)
  } finally {
    res.end()
  }
}
