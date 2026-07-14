/**
 * Agent write endpoint: POST /v1/content
 *
 * Accepts bilingual content payloads from goclaw agents authenticated
 * with a btd_ API key. Upserts into public.content via service_role
 * (RLS bypassed by design). Idempotent via source_ref.
 *
 * Contract:
 *   POST /v1/content    — create or upsert by source_ref
 *   PATCH /v1/content/:id — partial update by id
 *
 * Auth: requireApiKeyScope("content:write") applied at route mount.
 * Audit: every write fires an agent_audit_log row via ctx.waitUntil.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { upsertRows, updateRows, selectRows, type SupabaseEnv } from "../lib/supabase-service-client.js";
import { insertAuditRow } from "../lib/agent-audit-log.js";
import { computeContentHash } from "../lib/content-hash.js";
import type { ApiKeyRow } from "../middleware/api-key-auth-middleware.js";
import type { Env } from "../cloudflare-worker-env.js";

type AppEnv = { Bindings: Env & SupabaseEnv; Variables: { apiKey: ApiKeyRow } };

// ── Zod schemas ───────────────────────────────────────────────────────────────

const CONTENT_TYPES = ["article", "story", "khaitri", "teaching", "practice"] as const;
const CONTENT_STATUSES = ["draft", "published", "archived"] as const;

const ContentUpsertSchema = z.object({
  // Identity — at least one of id or source_ref required for idempotency
  id: z.string().optional(),
  source_ref: z.string().min(1).optional(),

  // Classification
  type: z.enum(CONTENT_TYPES),
  status: z.enum(CONTENT_STATUSES).default("draft"),

  // Bilingual text
  vi_title: z.string().optional(),
  en_title: z.string().optional(),
  vi_summary: z.string().optional(),
  en_summary: z.string().optional(),
  vi_body: z.string().optional(),
  en_body: z.string().optional(),
  vi_slug: z.string().optional(),
  en_slug: z.string().optional(),

  // Khaitri Q&A
  vi_question: z.string().optional(),
  en_question: z.string().optional(),
  order_index: z.number().int().positive().optional(),

  // Feed / ordering
  content_date: z.string().datetime().optional(),

  // Taxonomy
  category_id: z.string().optional(),

  // Media
  thumbnail_url: z.string().url().optional(),

  // Agent metadata
  tags: z.array(z.string()).default([]),
  seo_meta: z.record(z.unknown()).optional(),
  created_by: z.string().optional(),

  // Set true to bypass the content-hash duplicate check for a deliberate repost.
  allow_duplicate: z.boolean().optional(),
}).refine(
  (d) => d.id !== undefined || d.source_ref !== undefined,
  { message: "At least one of 'id' or 'source_ref' is required" }
);

const ContentPatchSchema = z.object({
  status: z.enum(CONTENT_STATUSES).optional(),
  vi_title: z.string().optional(),
  en_title: z.string().optional(),
  vi_summary: z.string().optional(),
  en_summary: z.string().optional(),
  vi_body: z.string().optional(),
  en_body: z.string().optional(),
  vi_slug: z.string().optional(),
  en_slug: z.string().optional(),
  vi_question: z.string().optional(),
  en_question: z.string().optional(),
  order_index: z.number().int().positive().optional(),
  content_date: z.string().datetime().optional(),
  category_id: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  seo_meta: z.record(z.unknown()).optional(),
}).strict();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map validated payload to public.content flat columns. */
function toContentRow(data: z.infer<typeof ContentUpsertSchema>): Record<string, unknown> {
  const row: Record<string, unknown> = {
    type: data.type,
    status: data.status,
    tags: JSON.stringify(data.tags),
    updated_at: new Date().toISOString(),
  };

  // Optional text fields — only include when provided
  const optionalFields = [
    "id", "source_ref",
    "vi_title", "en_title",
    "vi_summary", "en_summary",
    "vi_body", "en_body",
    "vi_slug", "en_slug",
    "vi_question", "en_question",
    "order_index", "content_date",
    "category_id", "thumbnail_url",
    "created_by",
  ] as const;

  for (const field of optionalFields) {
    if (data[field] !== undefined) row[field] = data[field];
  }

  if (data.seo_meta !== undefined) row.seo_meta = JSON.stringify(data.seo_meta);

  return row;
}

// ── Router ────────────────────────────────────────────────────────────────────

const router = new Hono<AppEnv>();

/**
 * POST /v1/content — upsert content (idempotent via source_ref or id).
 * Conflict resolution: if source_ref exists → update; else insert with provided/generated id.
 */
router.post(
  "/",
  zValidator("json", ContentUpsertSchema),
  async (c) => {
    const body = c.req.valid("json");
    const keyRow = c.get("apiKey");
    const row = toContentRow(body);

    // Determine conflict column: prefer source_ref for agent idempotency, fallback to id
    const onConflict = body.source_ref ? "source_ref" : "id";

    // Duplicate-content check: same title+body already published under a
    // DIFFERENT source_ref (re-runs of the same source_ref are legitimate
    // updates, not duplicates — source_ref upsert already handles those).
    const titleForHash = body.vi_title || body.en_title || "";
    const bodyForHash = body.vi_body || body.en_body || "";
    if (!body.allow_duplicate && (titleForHash || bodyForHash)) {
      const contentHash = await computeContentHash(titleForHash, bodyForHash);
      row.content_hash = contentHash;

      const dupes = await selectRows<{ id: string; source_ref: string | null; vi_title: string | null }>(
        c.env,
        "content",
        new URLSearchParams({
          content_hash: `eq.${contentHash}`,
          select: "id,source_ref,vi_title",
        })
      );
      const conflict = dupes.find((d) => d.source_ref !== body.source_ref);
      if (conflict) {
        c.executionCtx.waitUntil(
          insertAuditRow(c.env, {
            key_id: keyRow.id,
            agent_name: keyRow.agent_name,
            action: "content.duplicate_rejected",
            content_id: conflict.id,
            status_code: 409,
            detail: `duplicate of source_ref=${conflict.source_ref}`,
          })
        );
        return c.json(
          {
            error: {
              code: "DUPLICATE_CONTENT",
              message: "Content with this title+body already exists",
              existing: conflict,
            },
          },
          409
        );
      }
    }

    let upserted: Record<string, unknown>[];
    try {
      upserted = await upsertRows<Record<string, unknown>>(
        c.env,
        "content",
        [row],
        onConflict
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upsert failed";
      c.executionCtx.waitUntil(
        insertAuditRow(c.env, {
          key_id: keyRow.id,
          agent_name: keyRow.agent_name,
          action: "content.create",
          content_id: body.id ?? null,
          status_code: 500,
          detail: message,
        })
      );
      return c.json({ error: { code: "DB_ERROR", message } }, 500);
    }

    const result = upserted[0] ?? { id: body.id };
    const contentId = String(result.id ?? body.id ?? "");
    const isUpdate = Boolean(result.updated_at);

    c.executionCtx.waitUntil(
      insertAuditRow(c.env, {
        key_id: keyRow.id,
        agent_name: keyRow.agent_name,
        action: isUpdate ? "content.update" : "content.create",
        content_id: contentId,
        status_code: 200,
      })
    );

    return c.json({ ok: true, id: contentId, type: body.type, status: body.status }, 200);
  }
);

/**
 * PATCH /v1/content/:id — partial update by content id.
 */
router.patch(
  "/:id",
  zValidator("json", ContentPatchSchema),
  async (c) => {
    const { id } = c.req.param();
    const patch = c.req.valid("json");
    const keyRow = c.get("apiKey");

    const patchRow: Record<string, unknown> = {
      ...patch,
      updated_at: new Date().toISOString(),
    };
    if (patch.tags !== undefined) patchRow.tags = JSON.stringify(patch.tags);
    if (patch.seo_meta !== undefined) patchRow.seo_meta = JSON.stringify(patch.seo_meta);

    let updated: Record<string, unknown>[];
    try {
      updated = await updateRows<Record<string, unknown>>(
        c.env,
        "content",
        new URLSearchParams({ id: `eq.${id}` }),
        patchRow
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      c.executionCtx.waitUntil(
        insertAuditRow(c.env, {
          key_id: keyRow.id,
          agent_name: keyRow.agent_name,
          action: "content.update",
          content_id: id,
          status_code: 500,
          detail: message,
        })
      );
      return c.json({ error: { code: "DB_ERROR", message } }, 500);
    }

    if (updated.length === 0) {
      return c.json({ error: { code: "NOT_FOUND", message: `Content id '${id}' not found` } }, 404);
    }

    c.executionCtx.waitUntil(
      insertAuditRow(c.env, {
        key_id: keyRow.id,
        agent_name: keyRow.agent_name,
        action: "content.update",
        content_id: id,
        status_code: 200,
      })
    );

    return c.json({ ok: true, id, updated: updated.length }, 200);
  }
);

export { router as contentWriteRouter };
