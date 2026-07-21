#!/usr/bin/env node
/**
 * Watch goclaw Zalo Personal (dangzalo). On sustained disconnect / gave-up:
 *  1) Telegram alert to Đăng
 *  2) Start zalo.personal.qr.start → send QR PNG to Telegram for re-scan
 *
 * Env:
 *   ALERT_AFTER_SEC   seconds offline before alert (default 180)
 *   QR_COOLDOWN_SEC   min seconds between QR blasts (default 600)
 *   TELEGRAM_CHAT_ID  default 448301215
 *   DANGZALO_INSTANCE_ID  default 019dfd0f-e5b4-7efa-8209-28b8d9d48cd2
 *   ONCE=1            process recent logs once (no follow)
 */
import { createDecipheriv } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync, appendFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import WebSocket from 'ws'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA = join(__dir, '..', 'data')
const LOG = join(DATA, 'zalo-watch.log')

const ALERT_AFTER_SEC = Number(process.env.ALERT_AFTER_SEC || 180)
const QR_COOLDOWN_SEC = Number(process.env.QR_COOLDOWN_SEC || 600)
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '448301215'
const INSTANCE_ID = process.env.DANGZALO_INSTANCE_ID || '019dfd0f-e5b4-7efa-8209-28b8d9d48cd2'
const STATE_PATH = join(DATA, 'zalo-watch-state.json')

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  try {
    mkdirSync(DATA, { recursive: true })
    appendFileSync(LOG, line + '\n')
  } catch { /* */ }
}

function loadState() {
  const def = {
    lastAlertAt: 0,
    lastConnectedAt: Date.now(),
    lastReconnectNotifyAt: 0,
    offlineSince: null,
    wasOffline: false,
    alertedWhileOffline: false,
  }
  if (!existsSync(STATE_PATH)) return { ...def }
  try { return { ...def, ...JSON.parse(readFileSync(STATE_PATH, 'utf8')) } } catch { return { ...def } }
}

function saveState(s) {
  mkdirSync(DATA, { recursive: true })
  writeFileSync(STATE_PATH, JSON.stringify(s, null, 2))
}

function deriveKey(input) {
  if (input.length === 64 && /^[0-9a-fA-F]+$/.test(input)) return Buffer.from(input, 'hex')
  if (input.length === 32) return Buffer.from(input, 'utf8')
  throw new Error('bad encryption key length ' + input.length)
}

function decryptAesGcm(ciphertext, keyStr) {
  if (!ciphertext.startsWith('aes-gcm:')) return ciphertext
  const key = deriveKey(keyStr)
  const data = Buffer.from(ciphertext.slice('aes-gcm:'.length), 'base64')
  const nonce = data.subarray(0, 12)
  const enc = data.subarray(12)
  const tag = enc.subarray(enc.length - 16)
  const body = enc.subarray(0, enc.length - 16)
  const d = createDecipheriv('aes-256-gcm', key, nonce)
  d.setAuthTag(tag)
  return Buffer.concat([d.update(body), d.final()]).toString('utf8')
}

function docker(args, opts = {}) {
  const r = spawnSync('docker', args, { encoding: 'utf8', ...opts })
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || 'docker failed').slice(0, 300))
  return (r.stdout || '').trim()
}

function getEncryptionKey() {
  return docker(['exec', 'goclaw-goclaw-1', 'printenv', 'GOCLAW_ENCRYPTION_KEY'])
}

function getGatewayToken() {
  return docker(['exec', 'goclaw-goclaw-1', 'printenv', 'GOCLAW_GATEWAY_TOKEN'])
}

function getTelegramBotToken() {
  const cipher = docker([
    'exec', 'goclaw-postgres-1', 'psql', '-U', 'goclaw', '-d', 'goclaw', '-t', '-A', '-c',
    "SELECT convert_from(credentials, 'UTF8') FROM channel_instances WHERE name='giahan1-bot'",
  ])
  const plain = decryptAesGcm(cipher, getEncryptionKey())
  const j = JSON.parse(plain)
  if (!j.token) throw new Error('no telegram token in giahan1-bot credentials')
  return j.token
}

async function tgSendMessage(token, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })
  const j = await res.json()
  if (!j.ok) throw new Error('tg sendMessage: ' + JSON.stringify(j))
  return j
}

async function tgSendPhoto(token, pngBuf, caption) {
  const form = new FormData()
  form.append('chat_id', TELEGRAM_CHAT_ID)
  form.append('caption', caption)
  form.append('photo', new Blob([pngBuf], { type: 'image/png' }), 'zalo-qr.png')
  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form,
  })
  const j = await res.json()
  if (!j.ok) throw new Error('tg sendPhoto: ' + JSON.stringify(j))
  return j
}

/** Start QR login via goclaw gateway WS; resolve with PNG Buffer */
function fetchZaloQRPng(gatewayToken, instanceId, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:18790/ws')
    const timer = setTimeout(() => {
      try { ws.close() } catch { /* */ }
      reject(new Error('QR timeout'))
    }, timeoutMs)

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'req', id: '1', method: 'connect',
        params: { token: gatewayToken, protocolVersion: 3, locale: 'vi' },
      }))
    })

    ws.on('message', (raw) => {
      let msg
      try { msg = JSON.parse(raw.toString()) } catch { return }

      if (msg.type === 'res' && msg.id === '1') {
        if (msg.error) {
          clearTimeout(timer)
          ws.close()
          reject(new Error('connect: ' + JSON.stringify(msg.error)))
          return
        }
        ws.send(JSON.stringify({
          type: 'req', id: '2', method: 'zalo.personal.qr.start',
          params: { instance_id: instanceId },
        }))
      }

      if (msg.type === 'res' && msg.id === '2') {
        if (msg.error) {
          clearTimeout(timer)
          ws.close()
          reject(new Error('qr.start: ' + JSON.stringify(msg.error)))
        }
        // wait for event
      }

      if (msg.type === 'event' && msg.event === 'zalo.personal.qr.code') {
        const b64 = msg.payload?.png_b64
        if (!b64) return
        clearTimeout(timer)
        try { ws.close() } catch { /* */ }
        resolve(Buffer.from(b64, 'base64'))
      }

      if (msg.type === 'event' && msg.event === 'zalo.personal.qr.done') {
        if (msg.payload?.success === false) {
          clearTimeout(timer)
          try { ws.close() } catch { /* */ }
          reject(new Error('qr.done fail: ' + (msg.payload?.error || 'unknown')))
        }
      }
    })

    ws.on('error', (e) => {
      clearTimeout(timer)
      reject(e)
    })
  })
}

async function alertAndQR(reason) {
  const state = loadState()
  const now = Date.now()
  if (now - (state.lastAlertAt || 0) < QR_COOLDOWN_SEC * 1000) {
    log(`skip alert (cooldown) reason=${reason}`)
    return
  }

  log(`ALERT reason=${reason}`)
  const token = getTelegramBotToken()

  await tgSendMessage(
    token,
    `⚠️ <b>Zalo dangzalo DISCONNECTED</b>\n\n` +
    `Lý do: <code>${reason}</code>\n` +
    `Tin group trong lúc dis sẽ <b>miss</b> (không backfill).\n\n` +
    `Đang tạo QR — quét ngay bằng Zalo (Đăng nhập thiết bị khác / quét QR).`,
  )

  try {
    const gw = getGatewayToken()
    const png = await fetchZaloQRPng(gw, INSTANCE_ID)
    const path = join(tmpdir(), `zalo-qr-${Date.now()}.png`)
    writeFileSync(path, png)
    await tgSendPhoto(
      token,
      png,
      '📲 Quét QR này bằng app Zalo để reconnect dangzalo (hết hạn ~2 phút). Sau khi quét, chờ "connected".',
    )
    log(`QR sent bytes=${png.length}`)
  } catch (e) {
    log(`QR failed: ${e.message}`)
    await tgSendMessage(
      token,
      `❌ Không tạo được QR tự động: <code>${e.message}</code>\n` +
      `Vào goclaw UI → Channels → dangzalo → QR login thủ công.`,
    )
  }

  state.lastAlertAt = now
  state.alertedWhileOffline = true
  state.wasOffline = true
  if (!state.offlineSince) state.offlineSince = now
  saveState(state)
}

async function notifyReconnected(detail) {
  const s = loadState()
  const now = Date.now()
  // Only notify if we actually went offline (or sent a dis/QR alert)
  if (!s.wasOffline && !s.alertedWhileOffline && !s.offlineSince) {
    log('connected (no prior offline) — skip reconnect notify')
    return
  }
  // Debounce reconnect spam (e.g. double log lines)
  if (now - (s.lastReconnectNotifyAt || 0) < 60_000) {
    log('skip reconnect notify (60s debounce)')
    return
  }

  const offlineMs = s.offlineSince ? now - s.offlineSince : 0
  const offlineMin = Math.max(0, Math.round(offlineMs / 60000))
  try {
    const token = getTelegramBotToken()
    await tgSendMessage(
      token,
      `✅ <b>Zalo dangzalo RECONNECTED</b>\n\n` +
      `Channel đã online lại.\n` +
      (offlineMin > 0 ? `Offline khoảng: <b>~${offlineMin} phút</b>\n` : '') +
      `Tin trong lúc dis: <b>đã miss</b> (không backfill).\n` +
      `Capture group Kim Cương chạy lại từ thời điểm này.\n\n` +
      `<code>${String(detail || '').slice(0, 120)}</code>`,
    )
    s.lastReconnectNotifyAt = now
    log('reconnect notify sent')
  } catch (e) {
    log('reconnect notify failed: ' + e.message)
  }
  s.wasOffline = false
  s.alertedWhileOffline = false
  s.offlineSince = null
  s.lastConnectedAt = now
  saveState(s)
}

function markConnected(detail) {
  const s = loadState()
  const hadOffline = !!(s.offlineSince || s.wasOffline || s.alertedWhileOffline)
  s.lastConnectedAt = Date.now()
  saveState(s)
  log('state: connected')
  if (hadOffline) {
    notifyReconnected(detail).catch((e) => log(e.message))
  } else {
    s.offlineSince = null
    s.wasOffline = false
    saveState(s)
  }
}

function markDisconnected(detail) {
  const s = loadState()
  if (!s.offlineSince) s.offlineSince = Date.now()
  s.wasOffline = true
  saveState(s)
  log(`state: offline since ${new Date(s.offlineSince).toISOString()} (${detail})`)
}

function checkOfflineDuration() {
  const s = loadState()
  if (!s.offlineSince) return
  const sec = (Date.now() - s.offlineSince) / 1000
  if (sec >= ALERT_AFTER_SEC) {
    alertAndQR(`offline ≥ ${Math.round(sec)}s (since ${new Date(s.offlineSince).toISOString()})`).catch((e) => log(e.message))
  }
}

function onLogLine(line) {
  if (!/zalo_personal|dangzalo/.test(line)) return

  if (/zalo_personal connected/.test(line)) {
    markConnected(line.slice(0, 160))
    return
  }
  // "listener loop started" alone is noisy after every restart attempt — only treat as
  // soft online if we were offline and don't get "connected" (connected is preferred).
  if (/listener loop started/.test(line)) {
    const s = loadState()
    if (s.offlineSince || s.wasOffline) markConnected(line.slice(0, 160))
    return
  }

  if (/gave up after max restart|credentials failed|re-auth:|QR login failed/.test(line)) {
    markDisconnected(line.slice(0, 120))
    alertAndQR(line.slice(0, 200)).catch((e) => log(e.message))
    return
  }

  if (/zalo_personal disconnected|connection closed|restarting channel|restart failed/.test(line)) {
    markDisconnected(line.slice(0, 120))
  }
}

function followLogs() {
  log(`watching goclaw logs ALERT_AFTER_SEC=${ALERT_AFTER_SEC} QR_COOLDOWN=${QR_COOLDOWN_SEC}`)
  const child = spawn('docker', ['logs', 'goclaw-goclaw-1', '-f', '--since', '2m'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let buf = ''
  const onData = (chunk) => {
    buf += chunk.toString()
    const parts = buf.split('\n')
    buf = parts.pop() || ''
    for (const line of parts) onLogLine(line)
  }
  child.stdout.on('data', onData)
  child.stderr.on('data', onData)
  child.on('exit', (code) => {
    log(`docker logs exited code=${code}, restart in 5s`)
    setTimeout(followLogs, 5000)
  })

  // periodic offline check (in case disconnect without further logs)
  setInterval(checkOfflineDuration, 30_000)
}

async function main() {
  mkdirSync(DATA, { recursive: true })
  // ensure ws package
  try {
    await import('ws')
  } catch {
    log('installing ws…')
    spawnSync('npm', ['install', 'ws', '--no-save'], { cwd: join(__dir, '..'), stdio: 'inherit' })
  }

  if (process.env.ONCE === '1') {
    log('ONCE mode')
    if (process.env.FORCE_ALERT === '1') {
      await alertAndQR('manual FORCE_ALERT test')
    }
    if (process.env.FORCE_RECONNECTED === '1') {
      const s = loadState()
      s.wasOffline = true
      s.offlineSince = Date.now() - 5 * 60_000
      s.alertedWhileOffline = true
      saveState(s)
      await notifyReconnected('manual FORCE_RECONNECTED test')
    }
    return
  }

  followLogs()
}

main().catch((e) => {
  log('FATAL ' + e.message)
  process.exit(1)
})
