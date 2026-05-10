/**
 * Notion → Firestore one-way sync logic.
 * Called by the scheduled cron handler every 5 minutes.
 *
 * Algorithm:
 *   1. Fetch all pages from Notion DB (paginated, rate-limited)
 *   2. For each page: compare last_edited_time vs Firestore lastSyncedAt → skip unchanged
 *   3. Upsert changed pages to btd_knowledge/{notionPageId}
 *   4. Soft-delete pages present in Firestore but absent from Notion (archivedAt = now)
 *   5. Log sync metrics to _sync_logs collection
 *
 * Collection: btd_knowledge
 * Fields: notionPageId, title, slug, tags, bodyMarkdown, lastEditedTime,
 *         published, source, lastSyncedAt, archivedAt (nullable)
 */

import type { Env } from "./cloudflare-worker-env.js";
import { fetchAllKnowledgePages } from "./notion-knowledge-base-client.js";
import {
  getDoc,
  setDoc,
  queryCollection,
  addDoc,
} from "./firestore-rest-client.js";

const KNOWLEDGE_COLLECTION = "btd_knowledge";
const SYNC_LOGS_COLLECTION = "_sync_logs";

export interface SyncMetrics {
  databaseId: string;
  pagesTotal: number;
  pagesUpserted: number;
  pagesSkipped: number;
  pagesSoftDeleted: number;
  durationMs: number;
  errors: string[];
}

/**
 * Sync a single Notion database to Firestore.
 * Returns metrics for logging.
 */
async function syncDatabase(env: Env, databaseId: string): Promise<SyncMetrics> {
  const startMs = Date.now();
  const metrics: SyncMetrics = {
    databaseId,
    pagesTotal: 0,
    pagesUpserted: 0,
    pagesSkipped: 0,
    pagesSoftDeleted: 0,
    durationMs: 0,
    errors: [],
  };

  // 1. Fetch all pages from Notion
  let notionPages;
  try {
    notionPages = await fetchAllKnowledgePages(env.NOTION_TOKEN, databaseId);
  } catch (err) {
    metrics.errors.push(`Notion fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    metrics.durationMs = Date.now() - startMs;
    return metrics;
  }

  metrics.pagesTotal = notionPages.length;
  const notionPageIds = new Set(notionPages.map((p) => p.notionPageId));

  // 2. Upsert changed pages
  for (const page of notionPages) {
    try {
      const existing = await getDoc(env, KNOWLEDGE_COLLECTION, page.notionPageId);

      // Skip if unchanged (compare Notion last_edited_time vs our lastSyncedAt checkpoint)
      if (
        existing &&
        typeof existing.lastEditedTime === "string" &&
        existing.lastEditedTime === page.lastEditedTime &&
        !existing.archivedAt // re-sync if previously archived
      ) {
        metrics.pagesSkipped++;
        continue;
      }

      await setDoc(env, KNOWLEDGE_COLLECTION, page.notionPageId, {
        notionPageId: page.notionPageId,
        title: page.title,
        slug: page.slug,
        tags: page.tags,
        bodyMarkdown: page.bodyMarkdown,
        lastEditedTime: page.lastEditedTime,
        published: page.published,
        source: "notion",
        lastSyncedAt: new Date().toISOString(),
        archivedAt: null, // clear archive flag if page reappears
      });

      metrics.pagesUpserted++;
    } catch (err) {
      const msg = `Upsert failed for ${page.notionPageId}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[notion-sync] ${msg}`);
      metrics.errors.push(msg);
    }
  }

  // 3. Soft-delete pages removed from Notion
  // Query all non-archived docs in our collection, find ones not in Notion anymore
  try {
    const existingDocs = await queryCollection(env, KNOWLEDGE_COLLECTION, {
      where: [{ field: "source", op: "EQUAL", value: "notion" }],
      limit: 500,
    });

    for (const doc of existingDocs) {
      const docId = doc.id as string;
      if (!notionPageIds.has(docId) && !doc.archivedAt) {
        try {
          await setDoc(env, KNOWLEDGE_COLLECTION, docId, {
            ...(doc as Record<string, unknown>),
            archivedAt: new Date().toISOString(),
          });
          metrics.pagesSoftDeleted++;
        } catch (err) {
          const msg = `Soft-delete failed for ${docId}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(`[notion-sync] ${msg}`);
          metrics.errors.push(msg);
        }
      }
    }
  } catch (err) {
    // Non-fatal: deletion detection failure doesn't block upserts
    metrics.errors.push(
      `Soft-delete query failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  metrics.durationMs = Date.now() - startMs;
  return metrics;
}

/**
 * Main sync entry point — called by the cron scheduled handler.
 * Syncs primary DB; optionally syncs archive DB if env var is set.
 */
export async function runNotionSync(env: Env): Promise<void> {
  const allMetrics: SyncMetrics[] = [];

  // Primary knowledge DB
  if (env.NOTION_DB_KNOWLEDGE) {
    const metrics = await syncDatabase(env, env.NOTION_DB_KNOWLEDGE);
    allMetrics.push(metrics);
    console.log(
      `[notion-sync] Primary DB done: ${metrics.pagesUpserted} upserted, ` +
        `${metrics.pagesSkipped} skipped, ${metrics.pagesSoftDeleted} archived, ` +
        `${metrics.errors.length} errors, ${metrics.durationMs}ms`
    );
  } else {
    console.warn("[notion-sync] NOTION_DB_KNOWLEDGE not set — skipping primary DB sync");
  }

  // Optional archive DB
  if (env.NOTION_DB_KHAITRI_ARCHIVE) {
    const metrics = await syncDatabase(env, env.NOTION_DB_KHAITRI_ARCHIVE);
    allMetrics.push(metrics);
    console.log(
      `[notion-sync] Archive DB done: ${metrics.pagesUpserted} upserted, ` +
        `${metrics.pagesSkipped} skipped, ${metrics.durationMs}ms`
    );
  }

  // Log to Firestore _sync_logs (best-effort)
  try {
    await addDoc(env, SYNC_LOGS_COLLECTION, {
      type: "notion_sync",
      databases: allMetrics.map((m) => m.databaseId),
      totalUpserted: allMetrics.reduce((s, m) => s + m.pagesUpserted, 0),
      totalSkipped: allMetrics.reduce((s, m) => s + m.pagesSkipped, 0),
      totalArchived: allMetrics.reduce((s, m) => s + m.pagesSoftDeleted, 0),
      totalErrors: allMetrics.reduce((s, m) => s + m.errors.length, 0),
      errorDetails: allMetrics.flatMap((m) => m.errors).slice(0, 20), // cap log size
      durationMs: allMetrics.reduce((s, m) => s + m.durationMs, 0),
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal: sync succeeded even if log write fails
    console.error(`[notion-sync] Failed to write sync log: ${err}`);
  }
}
