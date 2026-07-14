---
title: "SP1 — Agent Content Platform (Workers api.battudao.com)"
description: "Agent-native content API on Cloudflare Workers: ingest v2, per-agent API keys, R2 media, MCP server, auto-enrich (Vectorize embeddings), D1 replica + FTS5 search, nightly reconcile."
status: pending
priority: P1
effort: 22h
branch: claude/immortality-mobile-hybrid
tags: [cloudflare-workers, hono, mcp, vectorize, d1, agent-api, strangler]
created: 2026-06-10
---

# SP1 — Agent Content Platform

Extend existing `workers/api` (Hono v4 + Firestore REST scaffold) into the agent-native content platform per brainstorm §4,5,9,10. **Strangler pattern: additive only** — never touch Vercel `api/`, `functions/`, `apps/web`, `apps/mobile`. New paths under `/v1/...` mirror the old Vercel contract so agents migrate by changing base URL only.

## Architecture (write path — single road)
```
Agent ──REST /v1/content  OR  MCP tool──► Hono Worker (api.battudao.com)
   validate (zod) → enrich (slug, dedup, taxonomy+SEO via Claude, embeddings via Workers AI)
   → Firestore write (REST + WebCrypto JWT, canonical)
   → ctx.waitUntil: D1 upsert (content + FTS5) + Vectorize upsert + AgentLog
Nightly cron: Firestore ↔ D1/Vectorize reconcile
```

## Phases

| # | Phase | Status | Ships |
|---|-------|--------|-------|
| 01 | [Foundation: wrangler bindings + D1 migrations + API-key auth](phase-01-foundation-bindings-d1-apikeys.md) | pending | All bindings wired, D1 schema live, `btd_` key auth + admin key mgmt |
| 02 | [Content ingest v2 + Firestore write + R2 media](phase-02-content-ingest-firestore-r2.md) | pending | POST/PATCH `/v1/content`, idempotent dedup, R2 upload (bytes + from-URL) |
| 03 | [Enrich pipeline + Vectorize + hybrid search](phase-03-enrich-vectorize-search.md) | pending | Auto-slug/taxonomy/SEO (Claude), embeddings, graceful quota degrade, `/v1/search` |
| 04 | [MCP server + OpenAPI + agent-spec discovery](phase-04-mcp-openapi-agent-spec.md) | pending | `/mcp` Streamable HTTP, 5 tools sharing handler core, `/doc`, `/v1/agent-spec` |
| 05 | [Cron reconcile + observability (AgentLog)](phase-05-cron-reconcile-observability.md) | pending | Nightly Firestore↔D1/Vectorize sync, per-key audit log + token cost |
| 06 | [E2E validation + contract-parity sign-off](phase-06-e2e-validation-parity.md) | pending | Full agent loop verified, Vercel-contract mapping table validated |

## Contract mapping (old Vercel → new Workers)
Documented in phase-02. Agents change base URL `https://immortality.vn/api/*` → `https://api.battudao.com/v1/*`.

## Key dependencies
- 01 blocks all (bindings + auth + D1 are foundation).
- 02 blocks 03 (enrich runs inside ingest write path), 04 (MCP wraps ingest handler core), 05 (reconcile syncs ingested content).
- 03 blocks 04 (search_content + upload_media tools need enrich/search services).
- 05 blocks 06 (e2e validates reconcile too).

## Hard constraints
- pnpm only · files <200 lines · kebab-case · `$0/mo` free-tier target · Workers AI 10k neurons/day → enrich degrades gracefully (skip embed, queue for cron) on quota.
- Secrets via `wrangler secret put` only; document in `.dev.vars.example` (never commit values).
- Out of scope: Astro (SP2), retiring backends (SP3), admin UI / review queue / chatbot / Notion changes (SP4).
