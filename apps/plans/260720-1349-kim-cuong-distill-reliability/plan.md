---
title: "Kim Cuong Distill Reliability"
description: "Make group digests incremental/idempotent, mark inferred Q&A as candidates, and add real local/E2E health gates."
status: pending
priority: P1
effort: 1-2d
branch: main
tags: [bugfix, reliability, automation]
blockedBy: []
blocks: []
created: 2026-07-20
---

# Kim Cương Distill Reliability

## Scope and decisions

- Keep `tools/kim-cuong-distill/` at repo root: domain adapter + source of truth. Mirror runtime inputs/receipts to GoClaw workspace.
- GoClaw stays generic capture/cron/delivery infra. No reconnect work; user confirms it works. No tool move into GoClaw.
- No new direct-Postgres boundary for digest state. Existing capture queries remain; API abstraction is future work.
- Current cron `kim-cuong-group-digest` is stateful, `deliver=true`, Telegram `giahan1-bot → 448301215`. Agent file writes happen before automatic delivery, so they cannot safely commit a cursor.

## Workstreams

### 1. Durable, delivery-safe digest

1. Add `scripts/digest-state.mjs`: atomically manage ignored `data/digest-state.json`, `pending-digest.json`, and `digest-ack.json`. Cursor = stable `(created_at, source, message_id)` high-watermark; batch ID = hash of ordered message IDs.
2. Update `scripts/auto-sync-loop.mjs` and `scripts/sync-to-agent-inbox.mjs`: import a valid runtime ACK first, commit only its matching pending batch, then prepare/mirror exactly one pending batch. A rerun before ACK reuses identical content/ID; failed or missing ACK never advances cursor.
3. Change the GoClaw cron row (config, not domain source): `deliver=false`; payload reads the canonical merged pending batch, sends through GoClaw's Telegram delivery tool, and writes `digest-ack.json` only after the tool returns success. Empty batch sends nothing. This is explicitly **at-least-once**: a crash after send but before ACK can replay the same visible batch ID; never advance on an error.
4. Include batch ID in digest/ACK and reject stale, malformed, mismatched, or lower-watermark ACKs. Serialize sync cycles with an atomic lock; crash-safe temp-file + rename writes.

### 2. Candidate vs verified Q&A

1. Update `scripts/build-qa.mjs`: replace “first later teacher message = paired” with `unanswered | candidate | verified | rejected` plus `pairing_evidence` and message IDs.
2. Current capture has no reply/reference metadata, so automatic matches are always `candidate`; only a human action may produce `verified`. Use one teacher message at most once and keep ambiguous text unverified.
3. Preserve manual decisions in ignored `data/qa-decisions.json`, keyed by `(question_msg_id, answer_msg_id)` so verification cannot transfer to a changed candidate and rejection only suppresses that exact pair. Update `scripts/serve-ui.mjs` and `ui/index.html` for approve/reject actions and labels. Export authoritative Q&A only when `verified`.

### 3. Real health gates

1. Add Node built-in tests under `test/digest-state.test.mjs` and `test/build-qa.test.mjs`; add `test`, `health:local`, `health:e2e` scripts to `package.json`.
2. Add `scripts/health-check.mjs`: local gate checks config/files, running GoClaw/Postgres containers, real group capture query, sync → batch → Q&A pipeline in an isolated temp data directory, JSON/schema invariants, and no production cursor mutation.
3. E2E gate sends one tagged health probe through the same GoClaw Telegram path, requires a real success receipt, writes an isolated ACK, and proves commit-on-success. Also exercise a real rejected destination and prove cursor non-advance. Never invoke reconnect/QR tests.
4. Update `README.md`, `GROUP_DIGEST_BEST_PRACTICE.md`, and `MOT_NGAY.md` with state lifecycle, candidate/verified meaning, health commands, operator recovery, and cron contract.

## Exact files

- Modify: `tools/kim-cuong-distill/scripts/{auto-sync-loop,sync-to-agent-inbox,build-qa,serve-ui}.mjs`, `ui/index.html`, `data/config.json`, `package.json`, and the three Markdown docs above.
- Create: `scripts/digest-state.mjs`, `scripts/health-check.mjs`, `test/digest-state.test.mjs`, `test/build-qa.test.mjs`.
- Runtime ignored: `data/digest-state.json`, `data/pending-digest.json`, `data/digest-ack.json`, `data/qa-decisions.json`, lock/temp files. Delete: none.

## Acceptance criteria

- First run emits only messages after committed cursor; rerun before ACK emits byte-equivalent batch; failed delivery preserves cursor; successful matching ACK advances once; late/duplicate ACK is harmless. Duplicate Telegram delivery after a send-before-ACK crash is acceptable and identifiable by batch ID.
- Same-timestamp messages are neither skipped nor duplicated; full-snapshot inbox rewrites do not resend committed messages.
- Unrelated later teacher text never becomes authoritative. Only explicit evidence or human approval yields `verified`; exports exclude unverified candidates.
- `npm test`, `npm run health:local`, and opt-in `npm run health:e2e` pass against real local GoClaw; E2E records success + failure cursor assertions; reconnect untouched.

## Risks and rollback

- Delivery-tool semantics may differ by channel: gate cron change on tagged probe receipt; keep job disabled during migration. Avoid sensitive text in logs/state and validate all mirrored JSON.
- Rollback: disable job, restore saved cron payload + `deliver=true`, restore scripts/docs, retain state files for diagnosis, then re-enable. Never move cursor forward manually; replay pending batch after recovery.

## Unresolved questions

- None. Implementation must stop at the delivery-semantics gate if GoClaw cannot return a real Telegram send receipt; do not substitute agent-turn `status=ok`.
