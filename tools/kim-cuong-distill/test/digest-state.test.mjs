import test from 'node:test'
import assert from 'node:assert/strict'
import { initialDigestState, reconcileDigest } from '../scripts/digest-state.mjs'

const message = (id, time, source = 'channel_pending_messages') => ({
  msg_id: id, ts_iso: time, source, text: id,
})
const now = '2026-07-20T04:00:00.000Z'

test('creates one sorted stable batch until matching delivery ACK', () => {
  const messages = [
    message('b', '2026-07-20T03:00:00.000Z'),
    message('a', '2026-07-20T02:00:00.000Z'),
  ]
  const first = reconcileDigest({ messages, state: initialDigestState(), existingBatch: null, ack: null, now })
  assert.deepEqual(first.batch.messages.map((item) => item.msg_id), ['a', 'b'])

  const replay = reconcileDigest({
    messages: [...messages, message('c', '2026-07-20T03:30:00.000Z')],
    state: first.state,
    existingBatch: first.batch,
    ack: null,
    now: '2026-07-20T04:05:00.000Z',
  })
  assert.equal(replay.batch.batch_id, first.batch.batch_id)
  assert.equal(replay.batch.message_count, 2)
})

test('does not advance on a failed or mismatched ACK', () => {
  const first = reconcileDigest({
    messages: [message('a', '2026-07-20T02:00:00.000Z')],
    state: initialDigestState(), existingBatch: null, ack: null, now,
  })
  const failed = reconcileDigest({
    messages: first.batch.messages,
    state: first.state,
    existingBatch: first.batch,
    ack: { batch_id: first.batch.batch_id, status: 'failed', delivery_ref: 'error' },
    now,
  })
  assert.equal(failed.state.committed_cursor, null)
  assert.equal(failed.batch.batch_id, first.batch.batch_id)
  assert.equal(failed.ackResult, 'ignored')
})

test('matching ACK commits old batch and leaves later messages for next batch', () => {
  const a = message('a', '2026-07-20T02:00:00.000Z')
  const b = message('b', '2026-07-20T03:00:00.000Z')
  const first = reconcileDigest({
    messages: [a], state: initialDigestState(), existingBatch: null, ack: null, now,
  })
  const next = reconcileDigest({
    messages: [a, b], state: first.state, existingBatch: first.batch,
    ack: {
      version: 1,
      batch_id: first.batch.batch_id,
      status: 'delivered',
      delivery_ref: 'telegram-message-123',
      delivered_at: '2026-07-20T04:01:00.000Z',
      cursor: first.batch.cursor,
    },
    now: '2026-07-20T04:05:00.000Z',
  })
  assert.equal(next.ackResult, 'committed')
  assert.deepEqual(next.batch.messages.map((item) => item.msg_id), ['b'])
  assert.equal(next.state.last_delivery.batch_id, first.batch.batch_id)
})

test('same-timestamp messages use stable message IDs as tie breakers', () => {
  const time = '2026-07-20T02:00:00.000Z'
  const first = reconcileDigest({
    messages: [message('b', time), message('a', time)],
    state: initialDigestState(), existingBatch: null, ack: null, now,
  })
  assert.deepEqual(first.batch.messages.map((item) => item.msg_id), ['a', 'b'])
})

test('recovers a missing derived batch from authoritative state', () => {
  const first = reconcileDigest({
    messages: [message('a', '2026-07-20T02:00:00.000Z')],
    state: initialDigestState(), existingBatch: null, ack: null, now,
  })
  const recovered = reconcileDigest({
    messages: first.batch.messages, state: first.state, existingBatch: null, ack: null, now,
  })
  assert.equal(recovered.ackResult, 'recovered')
  assert.equal(recovered.batch.batch_id, first.batch.batch_id)
})

test('does not resend a committed message when its source changes', () => {
  const original = message('same-id', '2026-07-20T02:00:00.000Z', 'channel_pending_messages')
  const first = reconcileDigest({
    messages: [original], state: initialDigestState(), existingBatch: null, ack: null, now,
  })
  const committed = reconcileDigest({
    messages: [original], state: first.state, existingBatch: first.batch,
    ack: {
      version: 1, batch_id: first.batch.batch_id, status: 'delivered',
      delivery_ref: 'telegram-message-123', delivered_at: now, cursor: first.batch.cursor,
    },
    now,
  })
  const sourceChanged = { ...original, source: 'sessions', ts_iso: '2026-07-20T03:00:00.000Z' }
  const replay = reconcileDigest({
    messages: [sourceChanged], state: committed.state, existingBatch: null, ack: null, now,
  })
  assert.equal(replay.batch, null)
})

test('clears a stale pending batch when every message is already committed', () => {
  const staleBatch = {
    version: 1, batch_id: 'stale', prepared_at: now, message_count: 1,
    cursor: { timestamp_ms: Date.parse(now), message_id: 'a' },
    messages: [message('a', now)],
  }
  const state = {
    ...initialDigestState(),
    committed_message_ids: ['a'],
    pending: staleBatch,
  }
  const result = reconcileDigest({ messages: staleBatch.messages, state, existingBatch: staleBatch, ack: null, now })
  assert.equal(result.batch, null)
  assert.equal(result.state.pending, null)
  assert.equal(result.ackResult, 'already-committed-cleared')
})

test('retains committed identities beyond 5,000 full-snapshot messages', () => {
  const committedIds = Array.from({ length: 5001 }, (_, index) => `id-${index}`)
  const state = { ...initialDigestState(), committed_message_ids: committedIds }
  const replay = reconcileDigest({
    messages: committedIds.map((id, index) => message(id, new Date(index * 1000).toISOString())),
    state, existingBatch: null, ack: null, now,
  })
  assert.equal(replay.batch, null)
  assert.equal(replay.state.committed_message_ids.length, 5001)
})
