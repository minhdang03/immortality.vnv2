# Phase 03 — Enrich pipeline + Vectorize + hybrid search

## Context Links
- Brainstorm §4 (auto-enrich: slug, dedup, taxonomy, SEO meta, embeddings → Vectorize)
- Research §2 (bge-m3 1024-dim, 10k neurons/day, chunk 512-token), §3 (FTS5 keyword), §5 (cron backfill)
- Depends on phase-02 `ingest-content-service.ts` (enrich hooks into write path)

## Overview
- **Priority:** P1
- **Status:** pending
- Real enrich pipeline on ingest: taxonomy suggest + SEO meta (Claude API), embeddings (Workers AI `@cf/baai/bge-m3`) → Vectorize upsert. Graceful degradation when 10k-neuron/day quota hit (skip embed, mark `embedded=0`, cron backfills). Hybrid `/v1/search`: D1 FTS5 keyword + Vectorize semantic.
- **Depends on:** phase-02 (ingest service), phase-01 (Vectorize + AI bindings).

## Key Insights
- **Neuron budget is the hard constraint.** Embedding a 5k-token article ≈ ~5 neurons; 10k/day ≈ ~100 articles/day or ~500 queries. Enrich MUST check a daily-neuron counter (KV) and **degrade, not fail**: if budget low, skip embed + set `embedded=0`; nightly cron (P05) processes the `idx_content_embedded` backlog when budget resets 00:00 UTC.
- **Claude enrich is best-effort too.** Taxonomy/SEO via Claude API (key in CF secret). On error/timeout → fall back to deterministic: taxonomy from existing `taxonomy` table fuzzy-match, SEO from `vi.summary`. Never block publish on Claude.
- **Chunking:** 512-token recursive, 10-20% overlap, prepend title+first-sentence to each chunk (research: 70% vs 50% retrieval). Vectorize id = `${contentId}-${chunkNum}`, metadata `{ contentId, type, lang, chunkNum }`.
- **Hybrid search merge:** FTS5 gives accent-insensitive keyword hits (BM25 rank); Vectorize gives semantic (cosine). Merge by normalized-score blend (e.g. 0.5/0.5), dedup by contentId, return top-N. Keyword-only fallback if Vectorize query budget exhausted.

## Requirements
**Functional**
- Enrich runs inside `ingest-content-service` after Firestore write, in `waitUntil` (non-blocking): taxonomy, SEO meta, embed+upsert.
- Neuron guard: KV daily counter `neurons:{YYYY-MM-DD}` incremented per AI call; threshold (e.g. 8000) → skip embed.
- `GET /v1/search?q=&type=&lang=&mode=hybrid|keyword|semantic` (scope `content:read`): returns ranked `{ id, type, title, summary, slug, score }`.
- `GET /v1/taxonomy` (scope `content:read`): topics+tags from `taxonomy` table (feeds MCP `get_taxonomy`).

**Non-functional**
- Search p95 < 200ms at 10k docs (D1 FTS5 indexed; Vectorize top-k=10).
- Enrich failures logged to `agent_audit_log` with `neurons_used`; never surface as ingest error.

## Architecture
**Enrich pipeline (`enrich/` modules, each <150 lines):**
```
enrich-orchestrator(env, content, ctx)
  ├─ taxonomy-suggester  → Claude OR taxonomy-table fuzzy → topic + tags
  ├─ seo-meta-generator  → Claude OR summary-derived → {title, description, ogTitle}
  └─ embedding-indexer   → neuron-guard → chunk → AI.run(bge-m3) → VECTORIZE.upsert → set embedded=1
```
Each sub-step independent + try/catch isolated; partial success allowed (taxonomy ok, embed skipped).

**Search (`services/search-service.ts`):**
```
hybrid: parallel [ ftsKeyword(d1, q), semantic(vectorize, embed(q)) ]
  → normalize scores → merge by contentId → hydrate from D1 → top-N
keyword-only fallback when embed budget exhausted (semantic skipped)
```

## Related Code Files
**Create**
- `workers/api/src/enrich/enrich-orchestrator.ts`
- `workers/api/src/enrich/taxonomy-suggester.ts` (Claude + fallback)
- `workers/api/src/enrich/seo-meta-generator.ts` (Claude + fallback)
- `workers/api/src/enrich/embedding-indexer.ts` (chunk + bge-m3 + Vectorize upsert)
- `workers/api/src/enrich/neuron-budget-guard.ts` (KV daily counter)
- `workers/api/src/enrich/text-chunker.ts` (512-token recursive + overlap)
- `workers/api/src/lib/claude-client.ts` (fetch Anthropic API, key from secret, timeout)
- `workers/api/src/services/search-service.ts` (hybrid merge)
- `workers/api/src/routes/search-route-handler.ts` (`/v1/search`, `/v1/taxonomy`)

**Modify**
- `workers/api/src/services/ingest-content-service.ts` (call enrich-orchestrator in waitUntil)
- `workers/api/src/db/content-repository.ts` (add `markEmbedded`, `listPendingEmbed` for P05)

## Implementation Steps
1. `neuron-budget-guard.ts`: KV get/incr `neurons:{date}`; `canEmbed(estCost)` returns bool; expose remaining.
2. `text-chunker.ts`: recursive split to ~512 tokens (approx by chars/4), 15% overlap, prepend title+lead.
3. `embedding-indexer.ts`: for each chunk guard→`AI.run('@cf/baai/bge-m3',{text})`→collect→`VECTORIZE.upsert`; on success `markEmbedded(id,1)`, increment neurons; on budget-skip leave `embedded=0`.
4. `claude-client.ts`: minimal fetch wrapper (model, max_tokens, 8s timeout, returns text or throws).
5. `taxonomy-suggester.ts` + `seo-meta-generator.ts`: Claude prompt → parse JSON; catch → deterministic fallback.
6. `enrich-orchestrator.ts`: run 3 steps with isolated try/catch; write results back via repository update; audit-log neurons_used.
7. `search-service.ts` + route: FTS5 `MATCH` query + Vectorize query, normalize+merge, hydrate.
8. Hook orchestrator into ingest `waitUntil`. typecheck + dev: publish→verify Vectorize upsert→search returns it.

## Todo List
- [ ] neuron-budget-guard.ts (KV daily counter + threshold)
- [ ] text-chunker.ts (512-token + overlap + title prepend)
- [ ] embedding-indexer.ts (bge-m3 → Vectorize, mark embedded)
- [ ] claude-client.ts (Anthropic fetch + timeout)
- [ ] taxonomy-suggester.ts + seo-meta-generator.ts (Claude + fallback)
- [ ] enrich-orchestrator.ts (isolated steps, audit neurons)
- [ ] search-service.ts + search-route-handler.ts (hybrid + /v1/taxonomy)
- [ ] wire into ingest waitUntil; repository markEmbedded/listPendingEmbed
- [ ] typecheck + dev e2e (publish → embed → search)

## Success Criteria
- Publish article → Vectorize has chunks, `content.embedded=1`; `/v1/search?q=...&mode=semantic` returns it.
- VI query "bat tu dao" (no diacritics) matches "Bất Tử Đạo" via FTS5.
- Simulate budget exhaustion (force counter past threshold) → publish still 201, `embedded=0`, no error; row appears in `listPendingEmbed`.
- Claude API down → publish still succeeds with fallback taxonomy/SEO.
- Hybrid search p95 < 200ms on seeded 1k docs.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| Neuron quota exhausted mid-day → embeds stop | H×M | Budget guard + `embedded=0` backlog + cron backfill (P05); degrade not fail |
| Claude latency/cost balloons enrich | M×M | 8s timeout, best-effort, deterministic fallback, not in request path (waitUntil) |
| FTS5 BM25 vs cosine score scales differ → bad merge | M×M | Normalize both to 0-1 before blend; tune weights; keyword-only fallback always valid |
| Vectorize free-tier dims queried cap | L×M | top-k=10, single index; monitor; sufficient per brainstorm §7 |
| Chunk explosion on 5k-word article → many neurons | M×M | Cap chunks/article; title-only embed fallback for over-cap docs |

## Security Considerations
- Anthropic key in CF secret only. Claude output treated as untrusted → validate/clamp taxonomy + SEO lengths before persist (no injection into HTML; SP2 renders).
- Search read-scope gated; no body leakage beyond summary in results.

## Next Steps
Unblocks P04 (search_content + get_taxonomy MCP tools call these services). Feeds P05 (cron drains embed backlog).
