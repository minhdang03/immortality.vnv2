/**
 * Bất Tử Đạo — Cloudflare Workers API entry point.
 *
 * Stack: Hono + Supabase (agent write plane). Firebase Auth + Firestore plane
 * removed 21/07/2026 — community reads/writes moved to the Supabase-backed apps.
 * Deployed to: api.battudao.com
 *
 * Route map:
 *   GET   /api/health
 *
 *   -- Agent write plane (btd_ key auth, service_role → Supabase) --
 *   GET   /v1/content          list/search (filters: id, source_ref, type, slug, q=title)
 *   POST  /v1/content          upsert content (idempotent via source_ref)
 *   PATCH /v1/content/:id      partial update by id
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./cloudflare-worker-env.js";
import { globalErrorHandler } from "./middleware/error-handler-middleware.js";
import { requireApiKeyScope } from "./middleware/api-key-auth-middleware.js";
import { contentWriteRouter } from "./routes/content-write-route-handler.js";
import { contentReadRouter } from "./routes/content-read-route-handler.js";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ─────────────────────────────────────────────────────────

app.use("*", logger());
app.use("*", secureHeaders());

// CORS: explicit origin allowlist from wrangler.toml [vars]
app.use("*", async (c, next) => {
  const allowedOrigins = c.env.CORS_ORIGINS.split(",").map((o) => o.trim());
  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type", "X-Request-ID"],
    exposeHeaders: ["X-Request-ID"],
    maxAge: 86400, // 24h preflight cache
    credentials: true,
  })(c, next);
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    env: c.env.ENV,
    ts: new Date().toISOString(),
  });
});

// ── Agent plane (/v1 — btd_ key auth, Supabase service_role) ──────────────────
//
// Scope is method-aware: GET needs content:read, everything else content:write.
// Mount BEFORE notFound handler.

const contentScopeGuard = (c: Parameters<ReturnType<typeof requireApiKeyScope>>[0], next: () => Promise<void>) =>
  requireApiKeyScope(c.req.method === "GET" ? "content:read" : "content:write")(c, next);

app.use("/v1/content/*", contentScopeGuard);
app.use("/v1/content", contentScopeGuard);
app.route("/v1/content", contentReadRouter);
app.route("/v1/content", contentWriteRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    { error: { code: "NOT_FOUND", message: `Route not found: ${c.req.method} ${c.req.path}` } },
    404
  );
});

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.onError((err, c) => globalErrorHandler(err, c as any));

export default app;
