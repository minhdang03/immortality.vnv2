import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQaItems, pairKey } from '../scripts/qa-pairing.mjs'

const config = {
  teacher_uids: ['teacher'], teacher_name_hints: [],
  reply_window_msgs: 40, reply_window_ms: 172800000,
}
const msg = (id, role, minute) => ({
  msg_id: id,
  uid_from: role === 'teacher' ? 'teacher' : id,
  display_name: role,
  role,
  ts_iso: `2026-07-20T02:${String(minute).padStart(2, '0')}:00.000Z`,
  text: id,
})

test('automatic chronology produces a candidate and never reuses one teacher answer', () => {
  const items = buildQaItems([
    msg('q1', 'student', 0), msg('q2', 'student', 1), msg('a1', 'teacher', 2),
  ], config)
  assert.equal(items.find((item) => item.question.msg_id === 'q1').status, 'unanswered')
  const candidate = items.find((item) => item.question.msg_id === 'q2')
  assert.equal(candidate.status, 'candidate')
  assert.equal(candidate.answer.msg_id, 'a1')
  assert.equal(candidate.pairing_evidence.authoritative, false)
})

test('pair-specific human verification survives a different inferred candidate', () => {
  const messages = [
    msg('q1', 'student', 0), msg('a1', 'teacher', 1),
    msg('q2', 'student', 2), msg('a2', 'teacher', 3),
  ]
  const decisions = {
    pairs: {
      [pairKey('q1', 'a1')]: {
        question_msg_id: 'q1', answer_msg_id: 'a1', status: 'verified',
      },
    },
    questions: {},
  }
  const item = buildQaItems(messages, config, decisions).find((entry) => entry.question.msg_id === 'q1')
  assert.equal(item.status, 'verified')
  assert.equal(item.answer.msg_id, 'a1')
  assert.equal(item.pairing_evidence.authoritative, true)
})

test('rejection applies only to the exact question-answer pair', () => {
  const decisions = {
    pairs: {
      [pairKey('q1', 'a1')]: {
        question_msg_id: 'q1', answer_msg_id: 'a1', status: 'rejected',
      },
    },
    questions: {},
  }
  const rejected = buildQaItems([
    msg('q1', 'student', 0), msg('a1', 'teacher', 1),
  ], config, decisions)[0]
  assert.equal(rejected.status, 'rejected')

  const changed = buildQaItems([
    msg('q1', 'student', 0), msg('a2', 'teacher', 1),
  ], config, decisions)[0]
  assert.equal(changed.status, 'candidate')
})

test('a human-verified teacher answer is not reused by an automatic candidate', () => {
  const messages = [msg('q1', 'student', 0), msg('q2', 'student', 1), msg('a1', 'teacher', 2)]
  const decisions = {
    pairs: {
      [pairKey('q1', 'a1')]: {
        question_msg_id: 'q1', answer_msg_id: 'a1', status: 'verified',
      },
    },
    questions: {},
  }
  const items = buildQaItems(messages, config, decisions)
  assert.equal(items.find((item) => item.question.msg_id === 'q1').status, 'verified')
  assert.equal(items.find((item) => item.question.msg_id === 'q2').status, 'unanswered')
})

test('conflicting manual decisions cannot verify one teacher answer twice', () => {
  const messages = [msg('q1', 'student', 0), msg('q2', 'student', 1), msg('a1', 'teacher', 2)]
  const decisions = {
    pairs: {
      [pairKey('q1', 'a1')]: {
        question_msg_id: 'q1', answer_msg_id: 'a1', status: 'verified', updated_at: '2026-07-20T02:00:00Z',
      },
      [pairKey('q2', 'a1')]: {
        question_msg_id: 'q2', answer_msg_id: 'a1', status: 'verified', updated_at: '2026-07-20T03:00:00Z',
      },
    },
    questions: {},
  }
  const items = buildQaItems(messages, config, decisions)
  assert.equal(items.filter((item) => item.status === 'verified').length, 1)
  assert.equal(items.find((item) => item.question.msg_id === 'q2').status, 'verified')
})
