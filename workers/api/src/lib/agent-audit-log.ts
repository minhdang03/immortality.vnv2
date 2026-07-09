/**
 * Agent audit log writer.
 *
 * Inserts into public.agent_audit_log via service_role (bypasses RLS).
 * Always called via ctx.waitUntil() so it never blocks the response.
 *
 * Schema (from 0005_agent.sql):
 *   id, key_id, agent_name, action, content_id, ts, status_code, detail
 */

import { insertRow, type SupabaseEnv } from "./supabase-service-client.js";

export type AuditAction =
  | "content.create"
  | "content.update"
  | "media.upload"
  | "key.create"
  | "key.revoke";

export type AuditEntry = {
  key_id: string | null;
  agent_name: string | null;
  action: AuditAction;
  content_id?: string | null;
  status_code: number;
  detail?: string | null;
};

/**
 * Insert an audit row. Fire-and-forget — errors are logged but never thrown.
 * Usage: ctx.waitUntil(insertAuditRow(env, entry))
 */
export async function insertAuditRow(
  env: SupabaseEnv,
  entry: AuditEntry
): Promise<void> {
  try {
    await insertRow(env, "agent_audit_log", {
      key_id: entry.key_id ?? null,
      agent_name: entry.agent_name ?? null,
      action: entry.action,
      content_id: entry.content_id ?? null,
      status_code: entry.status_code,
      detail: entry.detail ?? null,
      // ts defaults to now() in Postgres
    });
  } catch (err) {
    // Audit failure must never surface to the caller
    console.error("[BTD audit-log] insert failed:", err instanceof Error ? err.message : err);
  }
}
