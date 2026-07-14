# Cloudflare Workers Agent-Facing CMS Stack Report

**Date:** 2026-06-10  
**Context:** Building agent-facing content API on Cloudflare Workers for battudao.com (Vietnamese/English multilingual content, ~2-5k word articles, RAG-enabled via Vectorize + embeddings).

---

## 1. MCP Server on Cloudflare Workers

### Recommendation
**Use `createMcpHandler()` from Cloudflare Agents SDK as default.** Stateless, ~50-100 LOC, zero Durable Objects overhead. Upgrade to `McpAgent` + Durable Objects only if per-session state required (unlikely for read-only content API).

### Transport & Auth
- **Transport:** Streamable HTTP (official MCP spec standard as of 2026, replaces stdio)
- **Auth:** Bearer token (API key) OR OAuth 2.0 via `workers-oauth-provider` (Cloudflare library)
- **Pattern:** Single Hono Worker can serve BOTH REST `/api/*` routes + MCP endpoint (`/mcp`) on same port

### Code Gist
```typescript
import { createMcpHandler } from '@cloudflare/agents';
import { Hono } from 'hono';

const app = new Hono();

// REST routes
app.get('/api/articles/:id', (c) => { /* ... */ });

// MCP endpoint
app.post('/mcp', createMcpHandler({
  name: 'battudao-cms',
  tools: [
    {
      name: 'search_articles',
      description: 'Semantic search articles',
      inputSchema: { /* zod */ }
    }
  ]
}));

export default app;
```

### Gotchas
- **OAuth setup required for production:** bearer tokens are fine for dev/testing; use `workers-oauth-provider` for multi-user agents
- **No session state by default:** if agent needs multi-turn memory, migrate to McpAgent + Durable Objects (costs ~$0.15/million invocations)
- **HTTP-only:** stdio transport no longer recommended; ensure client can do HTTP polling or streaming

---

## 2. Vectorize + Workers AI Embeddings (Multilingual)

### Recommendation
**Use `@cf/baai/bge-m3` — confirmed multilingual (Vietnamese + English) as of 2026. Dimensions: 1024 (dense) + sparse vectors. Free tier: 10k neurons/day.**

### Setup Pattern
```
Article → chunk (512-token recursive, 10-20% overlap) → embed via @cf/baai/bge-m3 → upsert to Vectorize index
```

### Vectorize Index Config
```typescript
// Wrangler config
[[vectorize]]
binding = "VECTORIZE"
index_name = "battudao-articles"
dims = 1024  // bge-m3 output
metric = "cosine"

// Upsert from Worker
const embeddings = await env.AI.run('@cf/baai/bge-m3', {
  text: chunkText
});
await env.VECTORIZE.upsert([{
  id: `${articleId}-${chunkNum}`,
  values: embeddings,
  metadata: { articleId, lang: 'vi', chunkNum }
}]);
```

### Chunking Strategy
- **Recursive split:** 512 tokens (default), 10-20% overlap → best balance for 2-5k articles
- **Metadata enrichment:** embed title + first sentence with each chunk → 70%+ retrieval accuracy vs 50% without

### Free Tier Limits
- 10,000 neurons/day (encompasses both embedding + vector ops)
- Reset daily 00:00 UTC
- Rough math: ~1 neuron per 1000 tokens embedded; 10k neurons ≈ 100 articles (5k tokens each) or ~500 queries/day

---

## 3. D1 FTS5 (Vietnamese Tokenization)

### Recommendation
**YES, D1 supports FTS5 (verified 2026).** BUT: unicode61 tokenizer silently drops Vietnamese diacritics. **Workaround: use D1 for metadata + exact search; offload semantic ranking to Vectorize.**

### Issue Detail
- FTS5 default tokenizer (unicode61) treats Vietnamese "à", "á", "ả" as separate tokens; queries for one diacritic variant miss others
- No built-in Vietnamese tokenizer in SQLite FTS5 (unlike some databases with full-text + stemming)
- Pattern: contentless FTS5 index (store rowid+search col only) + external metadata in main table

### Pattern (Hybrid)
```sql
-- Metadata table (queryable via Firestore REST API)
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT,
  excerpt TEXT,
  published_at TIMESTAMP
);

-- Optional: FTS5 for exact phrase + prefix matching (not semantic)
CREATE VIRTUAL TABLE articles_fts USING fts5(title, excerpt, content='articles', content_rowid='rowid');

-- Insert trigger to keep FTS5 in sync
CREATE TRIGGER articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, excerpt) VALUES (new.rowid, new.title, new.excerpt);
END;
```

### Gotchas
- **Diacritic bug unfixable in D1:** custom tokenizers not supported
- **Verdict:** use D1 FTS5 for "did user search for _exact phrase_?" (e.g., "Bất Tử Đạo"), not semantic ranking
- **Cost:** free tier includes D1 (100k reads, 1k writes/day), no overage charges in Cloudflare free plan

---

## 4. Firestore from Cloudflare Workers

### Recommendation
**Use REST API + WebCrypto JWT (via `@sagi.io/workers-jwt` library).** No SDK. Total setup: ~80 LOC. Auth cost: negligible (JWT sign is local).

### JWT Pattern
```typescript
import { sign } from '@sagi.io/workers-jwt';

const serviceAccountJson = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

const token = await sign({
  iss: serviceAccountJson.client_email,
  aud: 'https://firestore.googleapis.com/google.firestore.v1.Firestore',
  sub: serviceAccountJson.client_email,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
}, serviceAccountJson.private_key);

// Fetch Firestore REST API
const res = await fetch(
  `https://firestore.googleapis.com/v1/projects/${serviceAccountJson.project_id}/databases/(default)/documents/articles/${id}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Gotchas
- **private_key in env:** store via `wrangler secret put` (never commit)
- **JWT valid 1hr:** acceptable for long-lived batch jobs; re-sign per batch or cache + refresh before expiry
- **REST API slower than SDK:** ~50-100ms per request vs 10-20ms (SDK was Node-only, now Workers-compatible via SDK port, but REST is simpler)

### Alternative (lighter)
If you move all articles → D1 + Vectorize, drop Firestore REST entirely. Simpler, faster, free tier is generous.

---

## 5. Workers Cron + Queues (Fan-Out)

### Recommendation
**Use cron trigger for nightly reconcile (D1 + Vectorize + cache purge).** Use Queues ONLY if article publish needs to fan-out to 5+ subscribers (webhooks, webhooks, social posts, etc.).

### Pattern: Cron Nightly Sync
```typescript
// wrangler.toml
[triggers]
crons = ["0 2 * * *"]  # 2am UTC daily

// src/index.ts
export default {
  async scheduled(event, env) {
    // Sync Firestore → D1 + re-embed + purge cache
    const articles = await fetchFirestorePublished();
    for (const article of articles) {
      await env.D1.prepare('INSERT OR REPLACE INTO articles (...)').bind(...).run();
      const emb = await env.AI.run('@cf/baai/bge-m3', { text: article.fullText });
      await env.VECTORIZE.upsert([...]);
    }
    // Purge CF cache for article pages
    await env.CACHE.delete(`/article/*`);
  }
}
```

### Pattern: Queues (if needed)
Use only if you have async fan-out (e.g., publish article → email subscribers + post to social + log event):
```typescript
// In REST endpoint
await env.ARTICLE_QUEUE.send({ articleId, action: 'publish' });

// Separate queue consumer
export default {
  async queue(batch, env) {
    for (const msg of batch.messages) {
      const { articleId } = msg.body;
      await notifySubscribers(articleId);
      await postToSocial(articleId);
      msg.ack();
    }
  }
}
```

### Gotchas
- **Cron wall-time limit:** ~5 min max execution (vs 30sec HTTP timeout); enough for 50-100 articles
- **Queue storage cost:** free tier = 1M operations/month (includes retries); $0.40/million after
- **Hybrid recommendation:** cron handles publish→storage; if you need webhooks to external services (Slack, Discord, etc.), THEN use Queues for reliable retry

---

## 6. Hono Framework on Workers

### Recommendation
**Hono v4.x (major version stable in 2026).** Use `@hono/zod-openapi` for typed validation + auto-generated OpenAPI docs.

### Setup
```typescript
import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

// Zod schema with OpenAPI metadata
const ArticleSchema = z.object({
  id: z.string().openapi({ example: 'article-123' }),
  title: z.string(),
  lang: z.enum(['vi', 'en'])
}).openapi('Article');

// Typed route
app.openapi(
  createRoute({
    method: 'get',
    path: '/api/articles/{id}',
    parameters: [{ name: 'id', in: 'path', schema: z.string() }],
    responses: {
      200: { content: { 'application/json': { schema: ArticleSchema } } },
      404: { description: 'Not found' }
    }
  }),
  async (c) => {
    const { id } = c.req.param();
    // ...
    return c.json({ /* ... */ });
  }
);

// Auto-generated OpenAPI at /doc
app.doc('/doc', { title: 'Battudao CMS API', version: '1.0.0' });

export default app;
```

### Middleware Stack
```typescript
app.use('*', logger());
app.use('*', cors({ origin: '*' }));
app.use('/api/*', apiKeyAuth(env.API_KEY));
app.use('/api/*', zValidator('json', ArticleSchema));
```

### Gotchas
- **Bundle size:** Hono <14kb; @hono/zod-openapi adds ~50kb (monitor if Workers script size limit is concern)
- **Version lag:** major breaking changes rare; v4.x stable through 2026
- **OpenAPI gen:** metadata required on all routes (good discipline, slight overhead)

---

## Free Tier Summary

| Service | Limit | Notes |
|---------|-------|-------|
| **Workers** | 100k requests/day | Enough for ~10-50 concurrent users |
| **Vectorize** | Included (see AI) | No separate billing |
| **Workers AI** | 10k neurons/day | ~100 articles 5k tokens or 500 queries/day |
| **D1** | 100k reads, 1k writes/day | Plenty for small site |
| **R2** | 10GB storage free | Media/backups |
| **Cron triggers** | Unlimited | Free |
| **Queues** | 1M ops/month free | Retries count toward limit |

**Realistic monthly cost (paid tier):** $10-15 (cron + minimal queues + overages). Scales smoothly to $50-100 under 1M req/month.

---

## Recommended Architecture (Minimal)

```
Agent query (via MCP endpoint)
  ↓
Hono Worker (/api + /mcp routes)
  ├─→ D1 (metadata search, last-modified checks)
  ├─→ Vectorize (semantic search for 3-5 closest articles)
  └─→ Firestore REST (read-only fetch full article for context)
  ↓
Response (article text + embeddings for agent context)

Nightly cron:
  Firestore → D1 + Vectorize (upsert)
  + cache purge
```

**Alternative (simpler):** drop Firestore entirely, move all content → D1. REST API becomes pure D1 reads + Vectorize queries.

---

## Unresolved Questions

1. **D1 → Vectorize sync frequency:** nightly sufficient? Or on-demand publish-time embed + upsert? (Answer depends on article CMS workflow; recommend publish-time for ~<1k articles, batch nightly for 1k+)

2. **Vietnamese tokenizer for FTS5:** is there a custom stopword list or stemmer you'd want to apply pre-index? (Current setup skips; semantic ranking via Vectorize offloads this problem)

3. **MCP tool set:** what specific tools should the agent expose? (search_articles, get_article_by_id, list_topics, embed_query_semantic, vote_on_comment — suggest collecting from product roadmap)

4. **Rate limits per agent:** should API key auth bind to agent identity + quota? Or open 10k req/day freely? (Recommend quotas: 100 req/min per agent for DDoS protection, escalate on demand)

5. **OAuth scope:** if using `workers-oauth-provider`, what scopes? (Suggest: `articles:read` for public content, `articles:moderate` for admin agents, `profiles:read` for user-facing agents)

6. **Cache strategy:** should `/article/:id` responses cache via CF Cache API? TTL? (Recommend 1hr cache, purge on publish + nightly reconcile)

---

## Status
**DONE** — Research complete. Recommendation: Hono + Streamable HTTP MCP + @cf/baai/bge-m3 Vectorize + D1 metadata + Firestore REST (optional, if migrating from Firebase). Cron for nightly sync, no Queues needed for read-only API.

---

## Sources

- [Build a Remote MCP server · Cloudflare Agents docs](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [Cloudflare's own MCP servers · Cloudflare Agents docs](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/)
- [Transport · Cloudflare Agents docs](https://developers.cloudflare.com/agents/model-context-protocol/transport/)
- [Transports - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Vectorize and Workers AI · Cloudflare Vectorize docs](https://developers.cloudflare.com/vectorize/get-started/embeddings/)
- [Workers AI Models · Cloudflare Workers AI docs](https://developers.cloudflare.com/workers-ai/models/)
- [bge-m3 (BAAI) · Cloudflare AI docs](https://developers.cloudflare.com/workers-ai/models/bge-m3/)
- [SQL statements · Cloudflare D1 docs](https://developers.cloudflare.com/d1/sql-api/sql-statements/)
- [Overview · Cloudflare D1 docs](https://developers.cloudflare.com/d1/)
- [Writing an API at the Edge with Workers and Cloud Firestore](https://blog.cloudflare.com/api-at-the-edge-workers-and-firestore/)
- [GitHub - sagi/workers-jwt: Generate JWTs on Cloudflare Workers](https://github.com/sagi/workers-jwt)
- [Cron Triggers · Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Scheduled Handler · Cloudflare Workers docs](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
- [Zod OpenAPI - Hono](https://hono.dev/examples/zod-openapi)
- [Hono · Cloudflare Workers docs](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/)
- [Cloudflare Workers + Hono + D1 + R2 Free Stack 2026](https://www.buildmvpfast.com/blog/cloudflare-workers-hono-d1-r2-free-fullstack-2026/)
- [Workers Best Practices · Cloudflare Workers docs](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Best Chunking Strategies for RAG (and LLMs) in 2026](https://www.firecrawl.dev/blog/best-chunking-strategies-rag)
- [Pricing · Cloudflare Workers AI docs](https://developers.cloudflare.com/workers-ai/platform/pricing/)
