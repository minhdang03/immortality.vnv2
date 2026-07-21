#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildQaItems } from './qa-pairing.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'data')

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return fallback }
}

function loadMessages() {
  const path = join(DATA, 'messages.jsonl')
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).flatMap((line) => {
    try { return [JSON.parse(line)] } catch { return [] }
  })
}

function main() {
  const config = readJson(join(DATA, 'config.json'), {})
  const existing = readJson(join(DATA, 'qa.json'), { items: [] })
  const decisions = readJson(join(DATA, 'qa-decisions.json'), { version: 1, pairs: {}, questions: {} })
  const messages = loadMessages()
  const items = buildQaItems(messages, config, decisions, existing.items)
  const count = (status) => items.filter((item) => item.status === status).length
  const meta = {
    group_id: config.group_id,
    group_name: config.group_name,
    built_at: new Date().toISOString(),
    message_count: messages.length,
    qa_count: items.length,
    candidate: count('candidate'),
    verified: count('verified'),
    rejected: count('rejected'),
    unanswered: count('unanswered'),
  }
  writeFileSync(join(DATA, 'qa.json'), `${JSON.stringify({ meta, items }, null, 2)}\n`)
  writeFileSync(join(DATA, 'messages.json'), `${JSON.stringify({ meta, messages }, null, 2)}\n`)
  console.log(JSON.stringify({ ok: true, ...meta }, null, 2))
}

main()
