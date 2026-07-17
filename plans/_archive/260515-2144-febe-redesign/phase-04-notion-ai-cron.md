# Phase 04 — Notion Sync + Claude AI Cron

## Context Links

- Plan overview: [plan.md](plan.md)
- Workers scaffold: `workers/notion/`
- Commit reference: `1f95413 feat(workers/notion): Notion sync cron + Claude AI hỏi ngược bridge`
- Firestore collections affected: `btd_knowledge`, `_sync_logs`, `btd_ai_flags`, `btd_ai_usage`
- AI skill reference: `btd-comment-facebook v0.2` (mentioned in CLAUDE.md)

## Overview

- **Priority:** P2 (not launch-blocker)
- **Status:** pending
- **Duration:** Tuần 4-5 (5-7 ngày)
- **Owner:** Đăng

**Mục tiêu:** Deploy `workers/notion` — daily cron sync Notion database → Firestore `btd_knowledge`, + Claude AI "hỏi ngược" bridge cho comment moderation. Replace ad-hoc manual sync hiện tại (nếu có) bằng scheduled, observable, reproducible job.

## Key Insights

- `workers/notion/` đã scaffold (commit 1f95413) — chưa deploy production.
- Notion API rate limit 3 req/sec — daily cron OK nhưng full re-sync 100+ pages cần batch.
- Claude AI hỏi ngược feature — sentiment + reframe comment. Paid feature 99K/tháng (commit 21b1bdc).
- `_sync_logs` collection growing unbounded — Phase 5 sẽ add TTL cleanup.
- Notion credentials hiện chưa rõ store ở đâu — em đoán trong CF env hoặc .env local. Confirm với anh.

## Requirements

### Functional

- Daily cron `0 3 * * *` UTC (10:00 VN) sync Notion → Firestore `btd_knowledge`
- Incremental sync: only pages changed since last run (Notion `last_edited_time` filter)
- Full sync trigger via `POST /sync/full` admin endpoint (auth-gated)
- AI Hỏi Ngược endpoint: `POST /ai/reframe-comment` — input comment, output suggested reframe via Claude
- Write to `_sync_logs/{date}-{runId}` with: pages synced, errors, duration
- Update `btd_knowledge/{notionPageId}` document with: title, body, lastEditedTime, tags, slug

### Non-functional

- Sync duration < 5 min for incremental, < 30 min for full
- Idempotent: re-run same period = same result
- Observable: tail logs CF Dashboard
- Error rate < 1% per sync run
- Claude API cost cap: $5/day hard limit

## Architecture

```
SCHEDULED:
  0 3 * * * UTC
    │
    ▼
  workers/notion (Cron trigger)
    │
    ├── Fetch Notion DB pages (filter last_edited > last_run_at)
    │     └── Notion API
    ├── Parse blocks → Markdown
    ├── Generate slug + tags
    ├── Write Firestore btd_knowledge/{pageId}
    └── Write Firestore _sync_logs/{date}-{runId}

ON-DEMAND (admin):
  POST api.battudao.com/v1/admin/notion-sync  (workers/api proxies to workers/notion)
    │
    └── Trigger full re-sync

AI REFRAME:
  Comment created → trigger Worker (queue or direct call)
    │
    ▼
  workers/notion /ai/reframe-comment
    │
    ├── Check btd_ai_flags (paid?)
    ├── Call Claude API (skill: btd-comment-facebook v0.2)
    ├── Increment btd_ai_usage
    └── Write suggestion → comments/{id}.ai_reframe field
```

## Related Code Files

### Modify
- `workers/notion/wrangler.toml` — add cron trigger, secrets list, KV bindings if needed

### Create
- `workers/notion/src/index.ts` — entry point with cron + fetch handler
- `workers/notion/src/notion-client.ts` — Notion API wrapper
- `workers/notion/src/parser.ts` — Notion blocks → Markdown
- `workers/notion/src/slug.ts` — generate slug từ title (VN diacritics handling)
- `workers/notion/src/sync.ts` — orchestrate sync run
- `workers/notion/src/ai-reframe.ts` — Claude API wrapper với prompt template
- `workers/notion/src/__tests__/parser.test.ts`
- `workers/notion/src/__tests__/sync.test.ts`

## Implementation Steps

### Day 1: Setup secrets + bindings
1. `cd workers/notion`
2. `wrangler secret put NOTION_API_KEY`
3. `wrangler secret put NOTION_DATABASE_ID`
4. `wrangler secret put CLAUDE_API_KEY`
5. `wrangler secret put FIREBASE_PROJECT_ID`
6. `wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON`
7. Config `wrangler.toml`:
   ```toml
   [triggers]
   crons = ["0 3 * * *"]
   ```

### Day 2-3: Notion sync logic
1. Implement Notion client — paginate `database.query` with filter
2. Parse Notion blocks → Markdown (use `@notionhq/client` or REST)
3. Slug generator with VN diacritics removal
4. Write Firestore — use REST client từ Phase 1
5. Log to `_sync_logs/{YYYY-MM-DD}-{runId}`
6. Unit tests for parser edge cases

### Day 4: AI reframe
1. Port prompt từ `btd-comment-facebook` skill v0.2
2. Implement `/ai/reframe-comment` endpoint
3. Check `btd_ai_flags/{uid}` for paid status
4. Atomic increment `btd_ai_usage/{uid}` (same pattern as Phase 2 chat)
5. Cap daily cost: if `btd_ai_usage` aggregate > $5 → 429

### Day 5-6: Deploy + observe
1. Deploy staging, manually trigger cron via Dashboard
2. Verify sync writes correct data to `btd_knowledge`
3. Deploy production
4. Wait for first cron run at 0 3 UTC
5. Monitor `_sync_logs` for 3 daily runs

### Day 7: AI reframe wiring
1. Frontend hook: comments page calls `/ai/reframe-comment` for moderation
2. Verify billing increments correctly
3. Test daily cap trigger

## Todo List

- [ ] Notion API key + DB ID secrets set
- [ ] Claude API key secret set
- [ ] Firebase service account secret set
- [ ] Cron trigger configured `0 3 * * *`
- [ ] Notion client implemented
- [ ] Parser blocks → Markdown
- [ ] Slug generator handles VN diacritics
- [ ] Sync writes Firestore `btd_knowledge`
- [ ] `_sync_logs` writes correct record
- [ ] AI reframe endpoint implemented
- [ ] Billing gate (paid check) works
- [ ] Daily cost cap enforced
- [ ] Staging cron run verified
- [ ] Production cron run verified (3 days)
- [ ] Comment moderation UI calls reframe endpoint

## Success Criteria

- [ ] Daily cron success rate ≥ 99% (allow 1 fail/month for transient Notion API issue)
- [ ] Incremental sync < 5 min, full sync < 30 min
- [ ] AI reframe latency < 5s
- [ ] AI cost stays under $5/day cap
- [ ] `_sync_logs` queryable via Firestore Console — visible audit trail

## Risk Assessment

| # | Risk | Mitigation |
|---|---|---|
| P4-R1 | Notion API rate limit hit (3 req/sec) | Batch with delay 350ms between requests, exponential backoff |
| P4-R2 | Notion schema changes break parser | Schema validation + alert; graceful skip page with error log |
| P4-R3 | Claude API cost runaway | Hard cap $5/day, per-user rate limit, idempotency keys |
| P4-R4 | `_sync_logs` collection grows unbounded | Phase 5 adds TTL cleanup (30 days retention) |
| P4-R5 | Cron skipped (CF infra issue) | Monitor `_sync_logs` presence daily; alert if missing 2 runs |
| P4-R6 | Notion credentials leaked | Rotate quarterly, audit access logs |

## Security Considerations

- All secrets in wrangler secret store (not in code, not in .toml)
- AI reframe endpoint requires auth + paid flag
- Notion API key scoped read-only to specific database (not workspace-wide)
- Claude API key separate from other apps' keys for audit
- Daily cost cap protects against malicious AI usage

## Next Steps

- **Blocks:** Nothing critical (cron is independent)
- **Unblocks:** Phase 5 TTL cleanup can target `_sync_logs`
- **Parallel:** Can run any time after Phase 1 (depends on Firestore REST client)

## Open Questions

1. Notion database ID? Notion API key currently stored where?
2. Có nhiều Notion DB không (vd: 1 cho articles, 1 cho khaitri)? Hay 1 DB?
3. AI reframe trigger — auto on every comment hay manual moderation button?
4. AI Hỏi Ngược billing — paid subscription đang chạy đâu? SePay webhooks gắn `btd_ai_flags` update từ provider nào?
5. Daily cost cap $5 OK? Hay anh muốn khác?
