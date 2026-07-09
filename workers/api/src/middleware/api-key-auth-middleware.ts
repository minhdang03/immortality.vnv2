/**
 * Hono middleware: validate a btd_ API key from Authorization: Bearer header.
 *
 * Flow:
 *   1. Extract Bearer token; shape-check with looksLikeApiKey.
 *   2. SHA-256 hash the raw token.
 *   3. SELECT api_keys WHERE key_hash=? AND revoked_at IS NULL (Supabase service_role).
 *   4. Scope check — caller passes required scope (e.g. "content:write").
 *   5. Fire-and-forget UPDATE last_used_at.
 *   6. Attach key row to context as `c.set("apiKey", ...)` for downstream handlers.
 *
 * Returns:
 *   401 — missing/malformed token, key not found, key revoked
 *   403 — key found but scope insufficient
 */

import { createMiddleware } from "hono/factory";
import { hashApiKey, looksLikeApiKey, type ApiKeyScope } from "../lib/api-key.js";
import { selectRows, updateRows, type SupabaseEnv } from "../lib/supabase-service-client.js";
import type { Env } from "../cloudflare-worker-env.js";

export type ApiKeyRow = {
  id: string;
  key_hash: string;
  agent_name: string;
  scopes: string;        // comma-separated, e.g. "content:read,content:write"
  revoked_at: string | null;
  last_used_at: string | null;
};

type Variables = {
  apiKey: ApiKeyRow;
};

/**
 * Factory: returns middleware that requires the given scope.
 *
 * Usage:
 *   app.use("/v1/content/*", requireApiKeyScope("content:write"))
 */
export function requireApiKeyScope(requiredScope: ApiKeyScope) {
  return createMiddleware<{ Bindings: Env & SupabaseEnv; Variables: Variables }>(
    async (c, next) => {
      // 1. Extract token
      const authHeader = c.req.header("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return c.json(
          { error: { code: "UNAUTHENTICATED", message: "Authorization: Bearer <btd_key> required" } },
          401
        );
      }
      const raw = authHeader.slice(7).trim();

      // 2. Shape check — cheap, no DB hit
      if (!looksLikeApiKey(raw)) {
        return c.json(
          { error: { code: "UNAUTHENTICATED", message: "Invalid API key format" } },
          401
        );
      }

      // 3. Hash and look up in Postgres
      const hash = await hashApiKey(raw);
      const params = new URLSearchParams({
        key_hash: `eq.${hash}`,
        revoked_at: "is.null",
        select: "id,key_hash,agent_name,scopes,revoked_at,last_used_at",
      });

      let rows: ApiKeyRow[];
      try {
        rows = await selectRows<ApiKeyRow>(c.env, "api_keys", params);
      } catch {
        return c.json(
          { error: { code: "INTERNAL_ERROR", message: "Key lookup failed" } },
          500
        );
      }

      if (rows.length === 0) {
        return c.json(
          { error: { code: "UNAUTHENTICATED", message: "API key not found or revoked" } },
          401
        );
      }

      const keyRow = rows[0];

      // 4. Scope check
      const grantedScopes = keyRow.scopes.split(",").map((s) => s.trim());
      if (!grantedScopes.includes(requiredScope)) {
        return c.json(
          { error: { code: "FORBIDDEN", message: `Scope '${requiredScope}' not granted` } },
          403
        );
      }

      // 5. Update last_used_at (fire-and-forget — don't await, don't block response)
      c.executionCtx.waitUntil(
        updateRows(
          c.env,
          "api_keys",
          new URLSearchParams({ id: `eq.${keyRow.id}` }),
          { last_used_at: new Date().toISOString() }
        ).catch((err) =>
          console.error("[BTD api-key] last_used_at update failed:", err instanceof Error ? err.message : err)
        )
      );

      // 6. Attach to context
      c.set("apiKey", keyRow);
      await next();
    }
  );
}
