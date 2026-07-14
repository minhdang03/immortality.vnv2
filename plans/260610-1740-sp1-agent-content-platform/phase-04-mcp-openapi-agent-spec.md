# Phase 04 — MCP server + OpenAPI + agent-spec discovery

## Context Links
- Brainstorm §10 (two surfaces one handler core; tools: publish_content, update_content, search_content, get_taxonomy, upload_media)
- Research §1 (`createMcpHandler` Streamable HTTP, single Hono Worker serves REST + `/mcp`), §6 (`@hono/zod-openapi` auto-doc)
- Mirror+extend existing `api/agent-spec.js`
- Depends on P02 (`ingest-content-service`), P03 (`search-service`, taxonomy)

## Overview
- **Priority:** P1
- **Status:** pending
- Expose the same handler cores as an MCP server (Streamable HTTP via Cloudflare Agents SDK `createMcpHandler`) + auto-generated OpenAPI at `/doc` + extended `/v1/agent-spec` self-onboarding discovery. **No new business logic** — MCP tools are thin wrappers over P02/P03 services.
- **Depends on:** P02, P03 (services exist + are Context-free).

## Key Insights
- **One handler core, two surfaces** (brainstorm §10): REST routes (P02/P03) and MCP tools both call the same `services/*` functions taking `(env, input, agentCtx)`. Zero duplication (DRY). If services were Context-coupled this would fail — P02 already extracted them clean.
- MCP auth = Bearer `btd_` key (same middleware as REST). Map key scopes to tool availability: no `content:write` → `publish_content`/`update_content` not callable (return problem-details).
- `createMcpHandler` stateless (research §1) — no Durable Objects, no per-session state (content API is request/response). Keeps $0 cost.
- `/v1/agent-spec` must mirror old `api/agent-spec.js` shape (collections, examples, classification rules, suggested_pipeline) **plus** new: MCP endpoint URL, OpenAPI `/doc` link, `llms.txt` pointer, auth = `btd_` keys (not Firebase). Old spec stays at Vercel untouched; new spec describes new contract.
- `@hono/zod-openapi`: to get auto `/doc`, content + search routes should register via `OpenAPIHono`/`createRoute`. Either migrate those routes (cleaner) or hand-write OpenAPI doc. **Decision:** wrap the zod schemas already defined in P02/P03 into `createRoute` definitions in a dedicated `openapi/` module so route handlers stay thin — avoid rewriting P02 handlers.

## Requirements
**Functional**
- `POST /mcp` Streamable HTTP MCP endpoint, name `battudao-cms`, 5 tools:
  - `publish_content` (scope content:write) → ingest-content-service
  - `update_content` (content:write) → ingest patch path
  - `search_content` (content:read) → search-service
  - `get_taxonomy` (content:read) → taxonomy
  - `upload_media` (media:write) → r2-media (accepts URL or base64; bytes path documented)
- `GET /doc` OpenAPI 3.1 JSON (auto from zod).
- `GET /v1/agent-spec` discovery JSON (mirror + extend old).
- `GET /llms.txt` static index pointing agents to agent-spec + doc (minimal; full SP2).

**Non-functional**
- MCP tool inputSchema = same zod as REST → single source of truth.
- Tool errors = problem-details mapped into MCP error result (machine-readable).

## Architecture
**Surface sharing:**
```
                 ┌── REST route handler (P02/P03) ──┐
services/*  ─────┤                                   ├──► same service fn
                 └── MCP tool wrapper (P04) ─────────┘
```
`mcp/tool-definitions.ts` declares 5 tools; each handler resolves agentCtx from Bearer key, scope-checks, calls service, maps result/error.

## Related Code Files
**Create**
- `workers/api/src/mcp/mcp-handler.ts` (`createMcpHandler` config, mounts at `/mcp`)
- `workers/api/src/mcp/tool-definitions.ts` (5 tools → service calls, scope guard)
- `workers/api/src/openapi/route-definitions.ts` (`createRoute` for content/search/media)
- `workers/api/src/openapi/openapi-doc.ts` (`app.doc('/doc', …)`)
- `workers/api/src/routes/agent-spec-route-handler.ts` (`/v1/agent-spec`, mirror+extend)
- `workers/api/public/llms.txt` (static, served via route)

**Modify**
- `workers/api/src/index.ts` (mount `/mcp`, `/doc`, `/v1/agent-spec`, `/llms.txt`)
- `workers/api/package.json` (`@cloudflare/agents` already added P01 — confirm)

## Implementation Steps
1. Confirm `@cloudflare/agents` + `@hono/zod-openapi` installed (P01). Pin versions.
2. `tool-definitions.ts`: define 5 tools with zod inputSchema (reuse P02/P03 schemas), each calls service fn, scope-guarded via key ctx, returns text/JSON result; errors → problem-details.
3. `mcp-handler.ts`: `createMcpHandler({ name, tools })`; wrap with API-key middleware; mount `app.all('/mcp', …)`.
4. `route-definitions.ts` + `openapi-doc.ts`: register createRoute defs referencing existing zod; expose `/doc`.
5. `agent-spec-route-handler.ts`: build discovery JSON — collections/types, examples, classification rules (copy from old spec), suggested_pipeline updated for `btd_` key auth + MCP, links to `/doc` + `/mcp` + `/llms.txt`.
6. `llms.txt`: minimal index (site, agent-spec URL, doc URL, content types).
7. Mount all in index.ts. typecheck. Test: MCP client lists 5 tools; call `search_content`; call `publish_content` with read-only key → scope error.

## Todo List
- [ ] confirm @cloudflare/agents + @hono/zod-openapi deps
- [ ] mcp/tool-definitions.ts (5 tools → services, scope guard)
- [ ] mcp/mcp-handler.ts (createMcpHandler + key auth, /mcp mount)
- [ ] openapi/route-definitions.ts + openapi-doc.ts (/doc)
- [ ] routes/agent-spec-route-handler.ts (/v1/agent-spec mirror+extend)
- [ ] public/llms.txt + serve route
- [ ] index.ts mounts; typecheck
- [ ] MCP client smoke (list tools, search, scope-denied publish)

## Success Criteria
- MCP client (Claude Code) connects to `/mcp`, lists 5 tools, `search_content` returns results, `publish_content` writes a doc visible via REST `GET /v1/content/:id`.
- Read-only key calling `publish_content` → machine-readable scope error.
- `GET /doc` valid OpenAPI 3.1; `GET /v1/agent-spec` includes types, examples, classification, MCP+doc links, `btd_` auth.
- A fresh agent can self-onboard from `/v1/agent-spec` alone (no human instruction) — manual walkthrough confirms.

## Risk Assessment
| Risk | L×I | Mitigation |
|------|-----|------------|
| `createMcpHandler` API shape differs from research gist | M×M | Pin SDK version; verify against installed types; adjust wrapper |
| MCP + REST double-maintenance of schemas | M×M | Single zod source reused both surfaces (enforced by P02 service extraction) |
| `@hono/zod-openapi` 50kb pushes Worker size limit | L×M | Monitor bundle; lazy/tree-shake; doc route optional if over limit |
| Stateless MCP can't do multi-turn agent memory | L×L | Out of scope (content API is req/resp); McpAgent+DO deferred |

## Security Considerations
- MCP endpoint requires `btd_` key; tool availability gated by scope (default-deny).
- agent-spec is public (no auth) but contains no secrets — only schema/endpoint discovery, matching old spec policy.
- Validate MCP tool inputs with same zod as REST (no bypass path).

## Next Steps
Unblocks nothing downstream-blocking; P05 (cron) independent. Both feed P06 e2e.
