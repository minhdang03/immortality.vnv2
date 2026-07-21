#!/usr/bin/env node
/**
 * Forever loop: sync channel_pending_messages → agent inbox + local data.
 * Fixes "DB has messages but inbox stale" without manual npm run.
 *
 * Env:
 *   SYNC_INTERVAL_SEC  default 300 (5 min)
 *   ONCE=1             run one cycle and exit
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendFileSync, mkdirSync } from 'node:fs'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')
const INTERVAL = Math.max(60, Number(process.env.SYNC_INTERVAL_SEC || 300))
const ONCE = process.env.ONCE === '1'
const LOG = join(ROOT, 'data', 'auto-sync.log')

function log(line) {
  const row = `[${new Date().toISOString()}] ${line}`
  console.log(row)
  try {
    mkdirSync(join(ROOT, 'data'), { recursive: true })
    appendFileSync(LOG, row + '\n')
  } catch { /* ignore */ }
}

function run(name, args) {
  const r = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
    timeout: 90_000,
  })
  if (r.stdout?.trim()) log(`${name} stdout: ${r.stdout.trim().slice(0, 500)}`)
  if (r.stderr?.trim()) log(`${name} stderr: ${r.stderr.trim().slice(0, 300)}`)
  if (r.status !== 0) {
    log(`${name} FAILED status=${r.status}`)
    return false
  }
  return true
}

function cycle() {
  log('--- sync cycle start ---')
  const ok1 = run('sync-inbox', [join(__dir, 'sync-to-agent-inbox.mjs')])
  const ok2 = run('build-qa', [join(__dir, 'build-qa.mjs')])
  log(`--- cycle done inbox=${ok1} qa=${ok2} ---`)
  return ok1 && ok2
}

async function main() {
  log(`auto-sync-loop started interval=${INTERVAL}s once=${ONCE}`)
  for (;;) {
    try {
      cycle()
    } catch (e) {
      log(`cycle error: ${e?.message || e}`)
    }
    if (ONCE) break
    await new Promise((r) => setTimeout(r, INTERVAL * 1000))
  }
}

main()
