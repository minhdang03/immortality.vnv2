/**
 * Bất Tử Đạo — Cloudflare Workers API entry point.
 *
 * Stack: Hono + Firebase Auth (jose JWKS) + Firestore REST
 * Deployed to: api.battudao.com (Workers subdomain until custom domain DNS)
 *
 * Route map:
 *   GET  /api/health
 *   GET  /api/profiles/:uid
 *   POST /api/profiles
 *   PATCH /api/profiles/me
 *   GET  /api/questions
 *   POST /api/questions
 *   GET  /api/questions/:id
 *   POST /api/questions/:id/answers
 *   PATCH /api/questions/:id/chosen-answer
 *   POST /api/votes
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./cloudflare-worker-env.js";
import { globalErrorHandler } from "./middleware/error-handler-middleware.js";
import { profilesRouter } from "./routes/profiles-route-handler.js";
import { questionsRouter } from "./routes/questions-route-handler.js";
import { votesRouter } from "./routes/votes-route-handler.js";

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

// ── API routes ────────────────────────────────────────────────────────────────

app.route("/api/profiles", profilesRouter);
app.route("/api/questions", questionsRouter);
app.route("/api/votes", votesRouter);

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
