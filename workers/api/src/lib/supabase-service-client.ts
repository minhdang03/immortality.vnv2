/**
 * Supabase service_role REST client for Cloudflare Workers.
 *
 * Uses the PostgREST endpoint with the service_role JWT — bypasses RLS by design.
 * service_role MUST come from `wrangler secret put SUPABASE_SERVICE_ROLE`.
 * NEVER put service_role in wrangler.toml [vars], client code, or goclaw config.
 *
 * Provisioning steps (run once per environment):
 *   wrangler secret put SUPABASE_SERVICE_ROLE   # paste the service_role JWT
 *   # SUPABASE_URL is a [vars] entry in wrangler.toml (not a secret — it's public)
 */

export type SupabaseEnv = {
  SUPABASE_URL: string;          // e.g. https://dzctvmrlsxwkcuidsqzk.supabase.co
  SUPABASE_SERVICE_ROLE: string; // service_role JWT — Workers secret only
};

export class SupabaseError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: string
  ) {
    super(message);
    this.name = "SupabaseError";
  }
}

/** Build common request headers for service_role PostgREST calls. */
function serviceHeaders(env: SupabaseEnv): HeadersInit {
  return {
    "apikey": env.SUPABASE_SERVICE_ROLE,
    "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Prefer": "return=representation",
  };
}

/** Raw PostgREST request — returns parsed JSON or throws SupabaseError. */
async function pgRequest<T = unknown>(
  env: SupabaseEnv,
  method: string,
  table: string,
  params?: URLSearchParams,
  body?: unknown,
  extraHeaders?: HeadersInit
): Promise<T> {
  const qs = params?.toString() ? `?${params.toString()}` : "";
  const url = `${env.SUPABASE_URL}/rest/v1/${table}${qs}`;

  const res = await fetch(url, {
    method,
    headers: { ...serviceHeaders(env), ...extraHeaders },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    let msg = `Supabase ${method} ${table} → ${res.status}`;
    let detail: string | undefined;
    try {
      const parsed = JSON.parse(text) as { message?: string; details?: string };
      if (parsed.message) msg = parsed.message;
      if (parsed.details) detail = parsed.details;
    } catch {
      detail = text.slice(0, 300);
    }
    throw new SupabaseError(res.status, msg, detail);
  }

  if (!text || res.status === 204) return [] as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SupabaseError(500, "Invalid JSON from Supabase", text.slice(0, 300));
  }
}

/**
 * Upsert rows into a table.
 * onConflict: column name(s) to use for conflict resolution (e.g. "source_ref" or "id").
 * Returns the upserted rows.
 */
export async function upsertRows<T = Record<string, unknown>>(
  env: SupabaseEnv,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
): Promise<T[]> {
  const params = new URLSearchParams();
  const headers: HeadersInit = {
    "Prefer": `resolution=merge-duplicates,return=representation`,
    "on-conflict": onConflict,
  };
  return pgRequest<T[]>(env, "POST", table, params, rows, headers);
}

/**
 * SELECT rows from a table with optional PostgREST filter params.
 * Example: selectRows(env, "api_keys", new URLSearchParams({ key_hash: `eq.${hash}` }))
 */
export async function selectRows<T = Record<string, unknown>>(
  env: SupabaseEnv,
  table: string,
  params: URLSearchParams
): Promise<T[]> {
  return pgRequest<T[]>(env, "GET", table, params);
}

/**
 * UPDATE rows matching the filter params.
 * Returns updated rows.
 */
export async function updateRows<T = Record<string, unknown>>(
  env: SupabaseEnv,
  table: string,
  params: URLSearchParams,
  patch: Record<string, unknown>
): Promise<T[]> {
  return pgRequest<T[]>(env, "PATCH", table, params, patch);
}

/**
 * INSERT a single row (no conflict handling — use upsertRows for idempotent writes).
 * Returns the inserted row.
 */
export async function insertRow<T = Record<string, unknown>>(
  env: SupabaseEnv,
  table: string,
  row: Record<string, unknown>
): Promise<T> {
  const rows = await pgRequest<T[]>(env, "POST", table, undefined, [row]);
  return rows[0];
}
