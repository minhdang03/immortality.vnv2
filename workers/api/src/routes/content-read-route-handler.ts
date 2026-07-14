/**
 * Agent read endpoint: GET /v1/content
 *
 * Lets agents resolve content rows by human-known handles (title text, slug,
 * source_ref) instead of needing a DB id up front — the id comes back in the
 * response and feeds PATCH /v1/content/:id.
 *
 * Query params (PostgREST-style filters, matching what the goclaw scripts
 * already send — e.g. ?type=eq.article&id=eq.<uuid>):
 *   id, source_ref, type, status, vi_slug, en_slug — forwarded verbatim
 *   q       — free-text title search (ilike on vi_title OR en_title)
 *   limit   — default 50, max 200
 *   order   — default created_at.desc
 *
 * Auth: content:read scope (mounted method-aware in index.ts).
 */

import { Hono } from "hono";
import { selectRows, type SupabaseEnv } from "../lib/supabase-service-client.js";
import type { ApiKeyRow } from "../middleware/api-key-auth-middleware.js";
import type { Env } from "../cloudflare-worker-env.js";

type AppEnv = { Bindings: Env & SupabaseEnv; Variables: { apiKey: ApiKeyRow } };

// Only these filters reach PostgREST — everything else is dropped.
const FILTER_PARAMS = ["id", "source_ref", "type", "status", "vi_slug", "en_slug"] as const;

const SELECT_COLUMNS = [
  "id", "type", "status", "source_ref",
  "vi_title", "en_title", "vi_slug", "en_slug",
  "vi_summary", "en_summary",
  "order_index", "content_date", "thumbnail_url", "tags",
  "created_by", "created_at", "updated_at",
].join(",");

const router = new Hono<AppEnv>();

router.get("/", async (c) => {
  const params = new URLSearchParams({ select: SELECT_COLUMNS });

  for (const key of FILTER_PARAMS) {
    const value = c.req.query(key);
    if (value) params.set(key, value);
  }

  // Title search: ?q=cứu giúp bản thân → ilike both title columns.
  const q = c.req.query("q");
  if (q) {
    const escaped = q.replace(/[%_,()]/g, " ").trim();
    if (escaped) params.set("or", `(vi_title.ilike.*${escaped}*,en_title.ilike.*${escaped}*)`);
  }

  const rawLimit = Number(c.req.query("limit") ?? 50);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, rawLimit), 200) : 50;
  params.set("limit", String(limit));
  params.set("order", c.req.query("order") ?? "created_at.desc");

  try {
    const rows = await selectRows<Record<string, unknown>>(c.env, "content", params);
    return c.json({ ok: true, count: rows.length, rows }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Read failed";
    return c.json({ error: { code: "DB_ERROR", message } }, 500);
  }
});

export { router as contentReadRouter };
