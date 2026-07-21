// Chatbot disabled 21/07/2026 — pending auth + rate-limit design.
// GoClaw proxy code removed to close the unauthenticated quota-burn hole (git history keeps it).
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

  return res.status(503).json({ error: 'chat_disabled', message: 'Chatbot tạm tắt' })
}
