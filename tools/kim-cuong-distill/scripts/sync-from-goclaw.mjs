#!/usr/bin/env node
/**
 * Pull Kim Cương Bất Tử messages from goclaw Postgres into data/messages.jsonl
 * Sources: channel_pending_messages + sessions (group key)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')
const DATA = join(ROOT, 'data')
const CONFIG = JSON.parse(readFileSync(join(DATA, 'config.json'), 'utf8'))
const GROUP_ID = CONFIG.group_id
if (!/^\d+$/.test(String(GROUP_ID))) throw new Error('config.group_id must contain digits only')
const MESSAGES_PATH = join(DATA, 'messages.jsonl')
const STATE_PATH = join(DATA, 'sync-state.json')

function classifyRole(uid, name, cfg) {
  const u = String(uid || '')
  if (cfg.teacher_uids?.includes(u)) return 'teacher'
  const n = (name || '').toLowerCase()
  for (const h of cfg.teacher_name_hints || []) {
    if (h && n.includes(h.trim().toLowerCase())) return 'teacher'
  }
  // rough: names containing "Hà" but not common false positives
  if (/\bhà\b|thầy/i.test(name || '') && !/hành|hoa|hạnh|hải|hằng/i.test(name || '')) return 'teacher'
  return 'student'
}

function normalizePendingRow(row, cfg) {
  const text = row.body || ''
  const msgId = row.platform_msg_id || `pending-${row.id}`
  return {
    msg_id: msgId,
    dedupe_key: `pending:${row.id}`,
    source: 'channel_pending_messages',
    group_id: GROUP_ID,
    group_name: cfg.group_name,
    uid_from: row.sender_id || '',
    display_name: row.sender || '',
    role: classifyRole(row.sender_id, row.sender, cfg),
    ts: row.created_at ? new Date(row.created_at).getTime().toString() : '',
    ts_iso: row.created_at ? new Date(row.created_at).toISOString() : null,
    text,
    content_raw: null,
  }
}

function extractFromSessionMessages(messages, cfg) {
  const out = []
  if (!Array.isArray(messages)) return out
  for (const m of messages) {
    // goclaw session message shapes vary
    const role = m.role || m.Role
    const content = m.content || m.Content || m.text || ''
    const text = typeof content === 'string' ? content : JSON.stringify(content)
    // agent turns are not group chat
    if (role === 'assistant' || role === 'system') continue
    // user content often prefixed [From: Name]
    let display_name = m.name || m.display_name || ''
    let body = text
    const fromMatch = text.match(/^\[From:\s*([^\]]+)\]\n?([\s\S]*)$/)
    if (fromMatch) {
      display_name = fromMatch[1].trim()
      body = fromMatch[2]
    }
    const msgId = m.id || m.message_id || m.msg_id || `sess-${m.timestamp || m.ts || Math.random()}`
    out.push({
      msg_id: String(msgId),
      dedupe_key: `session:${msgId}`,
      source: 'sessions',
      group_id: GROUP_ID,
      group_name: cfg.group_name,
      uid_from: m.user_id || m.uid || '',
      display_name,
      role: classifyRole(m.user_id || m.uid, display_name, cfg),
      ts: String(m.timestamp || m.ts || ''),
      ts_iso: m.timestamp ? new Date(Number(m.timestamp) || m.timestamp).toISOString() : null,
      text: body,
      content_raw: null,
    })
  }
  return out
}

function dockerSqlJson(sql) {
  // single-line SQL only
  const flat = sql.replace(/\s+/g, ' ').trim()
  const out = execFileSync(
    'docker',
    ['exec', 'goclaw-postgres-1', 'psql', '-U', 'goclaw', '-d', 'goclaw', '-t', '-A', '-c', flat],
    { encoding: 'utf8', timeout: 30_000 },
  )
  const t = out.trim()
  if (!t || t === '') return []
  return JSON.parse(t)
}

async function main() {
  mkdirSync(DATA, { recursive: true })

  // Host-mapped 5432 may not be goclaw's role; always use docker exec for reliability.
  let rowsPending = []
  let sessionRows = []
  try {
    rowsPending = dockerSqlJson(
      `SELECT COALESCE(json_agg(t),'[]'::json) FROM (SELECT id::text, channel_name, history_key, sender, sender_id, body, platform_msg_id, created_at FROM channel_pending_messages WHERE history_key = '${GROUP_ID}' OR history_key LIKE '%${GROUP_ID}%' ORDER BY created_at ASC) t`,
    )
    sessionRows = dockerSqlJson(
      `SELECT COALESCE(json_agg(t),'[]'::json) FROM (SELECT session_key, messages, updated_at FROM sessions WHERE session_key LIKE '%${GROUP_ID}%' ORDER BY updated_at DESC LIMIT 20) t`,
    )
  } catch (e) {
    console.error('docker sql failed', e.message)
    throw e
  }

  // Full rewrite each run so role/config fixes apply and inbox never stays stale.
  const byId = new Map()
  for (const row of rowsPending) {
    const m = normalizePendingRow(row, CONFIG)
    byId.set(m.msg_id || m.dedupe_key, m)
  }
  for (const srow of sessionRows) {
    let messages = srow.messages
    if (typeof messages === 'string') {
      try { messages = JSON.parse(messages) } catch { messages = [] }
    }
    for (const m of extractFromSessionMessages(messages, CONFIG)) {
      byId.set(m.msg_id || m.dedupe_key, m)
    }
  }

  const all = [...byId.values()].sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0))
  writeFileSync(
    MESSAGES_PATH,
    all.map((m) => JSON.stringify(m)).join('\n') + (all.length ? '\n' : ''),
  )

  writeFileSync(STATE_PATH, JSON.stringify({
    synced_at: new Date().toISOString(),
    pending_rows: rowsPending.length,
    session_rows: sessionRows.length,
    total_unique: all.length,
    mode: 'full_rewrite',
  }, null, 2))

  console.log(JSON.stringify({
    ok: true,
    pending_rows: rowsPending.length,
    session_rows: sessionRows.length,
    total_lines: all.length,
    note: all.length === 0
      ? 'Chưa có tin trong pending/sessions. Cần activity trong group sau khi bật pairing.'
      : undefined,
  }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
