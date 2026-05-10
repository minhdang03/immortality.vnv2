/**
 * Cloudflare Worker entry point for btd-notion-sync.
 *
 * Handles two execution contexts:
 *   - Scheduled (cron every-5min): runs Notion → Firestore sync
 *   - HTTP fetch: routes POST /api/ai/ask to SSE streaming AI hỏi ngược handler
 *
 * All other routes return 404. CORS restricted to CORS_ORIGINS env var.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./cloudflare-worker-env.js";
import { handleAiAsk } from "./ai-ask-sse-handler.js";
import { runNotionSync } from "./notion-to-firestore-sync.js";

const app = new Hono<{ Bindings: Env }>();

// ── CORS ──────────────────────────────────────────────────────────────────────

app.use("*", async (c, next) => {
  const origins = (c.env.CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean);
  return cors({
    origin: origins.length > 0 ? origins : "*",
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })(c, next);
});

// ── Routes ────────────────────────────────────────────────────────────────────

/** Health check — confirms Worker is deployed and reachable. */
app.get("/health", (c) =>
  c.json({ status: "ok", worker: "btd-notion-sync", env: c.env.ENV })
);

/** AI hỏi ngược SSE endpoint — Pro users only, auth required. */
app.post("/api/ai/ask", handleAiAsk);

/** Catch-all 404 */
app.all("*", (c) => c.json({ error: "Not found" }, 404));

// ── Worker export ─────────────────────────────────────────────────────────────

export default {
  /** HTTP requests */
  fetch: app.fetch,

  /** Cron trigger: Notion → Firestore sync every 5 minutes */
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(
      runNotionSync(env).catch((err) => {
        console.error("[worker] Scheduled sync failed:", err);
      })
    );
  },
} satisfies ExportedHandler<Env>;
