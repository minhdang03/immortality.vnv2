#!/usr/bin/env node
/** Build the canonical group inbox and one stable, delivery-acknowledged digest batch. */
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
  chmodSync, closeSync, existsSync, mkdirSync, openSync, readFileSync,
  unlinkSync, writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  atomicWriteJson, initialDigestState, readJson, reconcileDigest,
} from './digest-state.mjs'
import { mirrorFiles, readCanonicalFile, removeCanonicalFile } from './goclaw-workspace.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'data')
const CONFIG = readJson(join(DATA, 'config.json'), {})
const STATE_PATH = join(DATA, 'digest-state.json')
const BATCH_PATH = join(DATA, 'pending-digest.json')
const DIGEST_MD_PATH = join(DATA, 'digest-inbox.md')
const LOCK_PATH = join(DATA, '.sync.lock')

function acquireLock() {
  mkdirSync(DATA, { recursive: true })
  chmodSync(DATA, 0o700)
  if (existsSync(LOCK_PATH)) {
    const owner = readJson(LOCK_PATH, {})
    let alive = false
    if (Number.isInteger(owner.pid)) {
      try { process.kill(owner.pid, 0); alive = true } catch { /* stale owner */ }
    }
    if (alive) throw new Error(`sync already running with pid ${owner.pid}`)
    unlinkSync(LOCK_PATH)
  }
  const owner = { pid: process.pid, token: randomUUID(), created_at: new Date().toISOString() }
  const fd = openSync(LOCK_PATH, 'wx')
  writeFileSync(fd, `${JSON.stringify(owner)}\n`)
  closeSync(fd)
  return owner
}

function releaseLock(owner) {
  const current = readJson(LOCK_PATH, {})
  if (current.token === owner.token && existsSync(LOCK_PATH)) unlinkSync(LOCK_PATH)
}

function loadMessages() {
  const path = join(DATA, 'messages.jsonl')
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).flatMap((line) => {
    try { return [JSON.parse(line)] } catch { return [] }
  })
}

function parseWorkspaceAck() {
  const raw = readCanonicalFile('digest-ack.json')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return { invalid: true } }
}

function renderInbox(messages, syncedAt) {
  const lines = [
    '# Kim Cương Bất Tử — inbox capture', '',
    `- group_id: \`${CONFIG.group_id}\``,
    `- group_name: ${CONFIG.group_name}`,
    `- synced_at: ${syncedAt}`,
    `- message_count: ${messages.length}`,
    '', '## Messages (canonical merged stream, chronological)', '',
  ]
  for (const message of messages) {
    const role = message.role === 'teacher' ? 'TEACHER' : 'STUDENT'
    lines.push(
      `### [${role}] ${message.display_name || '?'} · \`${message.uid_from || ''}\` · ${message.ts_iso || message.ts || ''}`,
      '', message.text || '', '', `<!-- msg_id=${message.msg_id} source=${message.source} -->`, '',
    )
  }
  if (!messages.length) lines.push('_(Chưa có tin capture mới.)_', '')
  return lines.join('\n')
}

function renderDigest(batch) {
  if (!batch) return '# Kim Cương — digest window\n\n- message_count: 0\n\n_(Không có tin mới.)_\n'
  const lines = [
    '# Kim Cương — digest window', '',
    `- batch_id: \`${batch.batch_id}\``,
    `- prepared_at: ${batch.prepared_at}`,
    `- message_count: ${batch.message_count}`,
    '- delivery: at-least-once; batch ID identifies a replay', '',
  ]
  for (const message of batch.messages) {
    lines.push(
      `## [${message.role === 'teacher' ? 'TEACHER' : 'STUDENT'}] ${message.display_name || '?'}`,
      '', message.text || '', '', `<!-- msg_id=${message.msg_id} source=${message.source} -->`, '',
    )
  }
  return lines.join('\n')
}

function protocol() {
  return `# Kim Cương — digest protocol

- Canonical input: \`group-kim-cuong/pending-digest.json\`.
- If \`message_count=0\`: do not send.
- Automatic matches are candidates, never authoritative quotes.
- Send Telegram digest with visible \`batch_id\` using the message tool.
- Only after the tool returns success, write \`group-kim-cuong/digest-ack.json\`:
  \`{"version":1,"batch_id":"...","cursor":<copy batch.cursor>,"status":"delivered","delivery_ref":"<tool result>","delivered_at":"ISO"}\`
- On tool error: do not write ACK. A crash may replay the same batch ID (at-least-once).
`
}

function main() {
  const lock = acquireLock()
  try {
    execFileSync(process.execPath, [join(ROOT, 'scripts', 'sync-from-goclaw.mjs')], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60_000,
    })
    const now = new Date().toISOString()
    const messages = loadMessages()
    const ack = parseWorkspaceAck()
    const result = reconcileDigest({
      messages,
      state: readJson(STATE_PATH, initialDigestState()),
      existingBatch: readJson(BATCH_PATH, null)?.batch_id ? readJson(BATCH_PATH) : null,
      ack,
      now,
    })
    atomicWriteJson(STATE_PATH, result.state)
    atomicWriteJson(BATCH_PATH, result.batch || { version: 1, batch_id: null, message_count: 0, messages: [] })
    if (
      result.ackResult === 'committed' ||
      (ack?.batch_id && ack.batch_id === result.state.last_delivery?.batch_id)
    ) removeCanonicalFile('digest-ack.json')
    writeFileSync(join(DATA, 'inbox.md'), renderInbox(messages, now))
    writeFileSync(DIGEST_MD_PATH, renderDigest(result.batch))
    writeFileSync(join(DATA, 'README.runtime.md'), protocol())
    mirrorFiles({
      'inbox.md': join(DATA, 'inbox.md'),
      'digest-inbox.md': DIGEST_MD_PATH,
      'pending-digest.json': BATCH_PATH,
      'README.md': join(DATA, 'README.runtime.md'),
      'config.json': join(DATA, 'config.json'),
    })
    console.log(JSON.stringify({
      ok: true,
      messages: messages.length,
      batch_id: result.batch?.batch_id || null,
      batch_messages: result.batch?.message_count || 0,
      ack: result.ackResult,
    }, null, 2))
  } finally {
    releaseLock(lock)
  }
}

main()
