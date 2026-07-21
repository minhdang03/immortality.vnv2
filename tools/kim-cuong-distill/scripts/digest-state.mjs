import { createHash } from 'node:crypto'
import { chmodSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'

export function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

export function atomicWriteJson(path, value) {
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`)
  renameSync(tmp, path)
  chmodSync(path, 0o600)
}

function timestampOf(message) {
  const iso = Date.parse(message.ts_iso || '')
  if (Number.isFinite(iso)) return iso
  const raw = Number(message.ts || 0)
  return Number.isFinite(raw) ? raw : 0
}

export function cursorOf(message) {
  return {
    timestamp_ms: timestampOf(message),
    message_id: String(message.msg_id || message.dedupe_key || ''),
  }
}

export function compareCursors(left, right) {
  if (left.timestamp_ms !== right.timestamp_ms) return left.timestamp_ms - right.timestamp_ms
  return left.message_id.localeCompare(right.message_id)
}

export function sortMessages(messages) {
  return [...messages].sort((a, b) => compareCursors(cursorOf(a), cursorOf(b)))
}

function batchId(messages) {
  const ids = messages.map((message) => cursorOf(message).message_id)
  return createHash('sha256').update(JSON.stringify(ids)).digest('hex').slice(0, 16)
}

export function initialDigestState() {
  return {
    version: 1,
    committed_cursor: null,
    committed_message_ids: [],
    pending: null,
    last_delivery: null,
  }
}

function validAck(ack, pending) {
  return Boolean(
    ack?.version === 1 && pending && ack.status === 'delivered' &&
    ack.batch_id === pending.batch_id && JSON.stringify(ack.cursor) === JSON.stringify(pending.cursor) &&
    typeof ack.delivery_ref === 'string' && ack.delivery_ref.trim() &&
    Number.isFinite(Date.parse(ack.delivered_at || '')),
  )
}

export function reconcileDigest({ messages, state, existingBatch, ack, now }) {
  const nextState = state?.version === 1 ? structuredClone(state) : initialDigestState()
  let batch = existingBatch
  let ackResult = 'none'

  // One-time migration from the original cursor-only state.
  if (!Array.isArray(nextState.committed_message_ids)) {
    nextState.committed_message_ids = nextState.committed_cursor
      ? sortMessages(messages)
        .filter((message) => compareCursors(cursorOf(message), nextState.committed_cursor) <= 0)
        .map((message) => cursorOf(message).message_id)
      : []
    const migratedIds = new Set(nextState.committed_message_ids)
    if (
      nextState.pending?.messages?.length &&
      nextState.pending.messages.every((message) => migratedIds.has(cursorOf(message).message_id))
    ) {
      nextState.pending = null
      batch = null
      ackResult = 'migration-cleared'
    }
  }
  const committedAtStart = new Set(nextState.committed_message_ids)
  if (
    nextState.pending?.messages?.length &&
    nextState.pending.messages.every((message) => committedAtStart.has(cursorOf(message).message_id))
  ) {
    nextState.pending = null
    batch = null
    ackResult = 'already-committed-cleared'
  }

  if (validAck(ack, nextState.pending)) {
    nextState.committed_cursor = nextState.pending.cursor
    nextState.committed_message_ids = [...new Set([
      ...(nextState.committed_message_ids || []),
      ...nextState.pending.messages.map((message) => cursorOf(message).message_id),
    ])]
    nextState.last_delivery = {
      batch_id: ack.batch_id,
      delivery_ref: ack.delivery_ref.trim(),
      delivered_at: ack.delivered_at || now,
    }
    nextState.pending = null
    batch = null
    ackResult = 'committed'
  } else if (ack) {
    ackResult = 'ignored'
  }

  if (nextState.pending && batch?.batch_id === nextState.pending.batch_id) {
    return { state: nextState, batch, ackResult }
  }
  if (nextState.pending) {
    // State is authoritative; recover the derived mirror file after a crash.
    return { state: nextState, batch: structuredClone(nextState.pending), ackResult: 'recovered' }
  }

  const committed = new Set(nextState.committed_message_ids || [])
  const fresh = sortMessages(messages).filter((message) => !committed.has(cursorOf(message).message_id))
  if (!fresh.length) return { state: nextState, batch: null, ackResult }

  const id = batchId(fresh)
  const cursor = cursorOf(fresh.at(-1))
  batch = {
    version: 1,
    batch_id: id,
    prepared_at: now,
    message_count: fresh.length,
    cursor,
    messages: fresh,
  }
  nextState.pending = structuredClone(batch)
  return { state: nextState, batch, ackResult }
}
