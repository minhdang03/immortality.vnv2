#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readCanonicalFile } from './goclaw-workspace.mjs'
import { initialDigestState, reconcileDigest } from './digest-state.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'data')
const E2E = process.argv.includes('--e2e')
const checks = []

function check(name, condition, detail) {
  checks.push({ name, ok: Boolean(condition), detail })
}

function readJson(name, fallback = null) {
  const path = join(DATA, name)
  if (!existsSync(path)) return fallback
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return fallback }
}

function sqlJson(sql) {
  const out = execFileSync('docker', [
    'exec', 'goclaw-postgres-1', 'psql', '-U', 'goclaw', '-d', 'goclaw',
    '-t', '-A', '-c', sql.replace(/\s+/g, ' ').trim(),
  ], { encoding: 'utf8', timeout: 30_000 }).trim()
  return out ? JSON.parse(out) : null
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function main() {
  const containers = execFileSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8', timeout: 30_000 })
  check('goclaw container', containers.includes('goclaw-goclaw-1'), 'gateway running')
  check('postgres container', containers.includes('goclaw-postgres-1'), 'database running')

  const config = readJson('config.json', {})
  if (!/^\d+$/.test(String(config.group_id || ''))) throw new Error('config.group_id must contain digits only')
  const sync = readJson('sync-state.json', {})
  const qa = readJson('qa.json', { meta: {}, items: [] })
  const state = readJson('digest-state.json', {})
  const batch = readJson('pending-digest.json', {})
  const messages = existsSync(join(DATA, 'messages.jsonl'))
    ? readFileSync(join(DATA, 'messages.jsonl'), 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
    : []

  const db = sqlJson(`SELECT json_build_object(
    'pending_count', (SELECT count(*) FROM channel_pending_messages WHERE history_key = '${config.group_id}' OR history_key LIKE '%${config.group_id}%'),
    'cron', (SELECT row_to_json(t) FROM (SELECT id, enabled, cron_expression, timezone, deliver, deliver_channel, deliver_to, last_status, last_run_at FROM cron_jobs WHERE name='kim-cuong-group-digest') t),
    'latest_run', (SELECT row_to_json(r) FROM (SELECT status, summary, ran_at FROM cron_run_logs WHERE job_id=(SELECT id FROM cron_jobs WHERE name='kim-cuong-group-digest') ORDER BY ran_at DESC LIMIT 1) r)
  )`)
  check('capture populated', Number(db?.pending_count) > 0, `${db?.pending_count || 0} pending rows`)
  check('canonical sync', sync.total_unique === messages.length, `${messages.length} local messages`)
  check('Q&A built from capture', qa.meta?.message_count === messages.length, `${qa.items.length} Q&A items`)
  check('digest cron enabled', db?.cron?.enabled, db?.cron?.cron_expression)
  check('digest timezone', db?.cron?.timezone === 'Asia/Ho_Chi_Minh', db?.cron?.timezone)
  check('manual delivery contract', db?.cron?.deliver === false, `deliver=${db?.cron?.deliver}`)
  check('digest state valid', state.version === 1, `version=${state.version}`)
  check(
    'pending state matches batch',
    (!state.pending && !batch.batch_id) || state.pending?.batch_id === batch.batch_id,
    batch.batch_id || 'empty',
  )

  const candidateAnswers = qa.items
    .filter((item) => ['candidate', 'verified'].includes(item.status) && item.answer?.msg_id)
    .map((item) => item.answer.msg_id)
  check('active answers unique', candidateAnswers.length === new Set(candidateAnswers).size, `${candidateAnswers.length} active answers`)
  check('no automatic paired status', qa.items.every((item) => item.status !== 'paired'), 'legacy status absent')

  const productionHash = digest({ state, batch })
  const isolated = reconcileDigest({
    messages,
    state: initialDigestState(),
    existingBatch: null,
    ack: { version: 1, batch_id: 'wrong', status: 'delivered', delivery_ref: 'invalid', delivered_at: new Date().toISOString() },
    now: new Date().toISOString(),
  })
  check('isolated failure keeps cursor', isolated.state.committed_cursor === null, isolated.ackResult)
  check('health does not mutate cursor', productionHash === digest({ state: readJson('digest-state.json', {}), batch: readJson('pending-digest.json', {}) }), 'unchanged')

  const mirrored = readCanonicalFile('pending-digest.json')
  let mirrorBatch = null
  try { mirrorBatch = JSON.parse(mirrored) } catch { /* reported below */ }
  check('workspace mirror', mirrorBatch?.batch_id === (batch.batch_id || null), mirrorBatch?.batch_id || 'empty')

  if (E2E) {
    const deliveredAt = Date.parse(state.last_delivery?.delivered_at || '')
    const runAt = Date.parse(db?.latest_run?.ran_at || '')
    check(
      'real digest receipt',
      /^[a-f0-9]{16}$/.test(state.last_delivery?.batch_id || '') &&
        Boolean(state.last_delivery?.delivery_ref) && Number.isFinite(deliveredAt),
      state.last_delivery?.batch_id || 'missing',
    )
    check(
      'receipt correlated to cron run',
      db?.latest_run?.summary?.includes(state.last_delivery?.batch_id) && runAt >= deliveredAt,
      db?.latest_run?.summary || 'missing',
    )
    check('cron last run ok', db?.cron?.last_status === 'ok', db?.cron?.last_status || 'missing')
  }

  for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name} — ${item.detail}`)
  const failed = checks.filter((item) => !item.ok)
  console.log(JSON.stringify({ ok: failed.length === 0, checks: checks.length, failed: failed.length }, null, 2))
  if (failed.length) process.exitCode = 1
}

try {
  main()
} catch (error) {
  console.error(`FAIL health check — ${error.message}`)
  process.exitCode = 1
}
