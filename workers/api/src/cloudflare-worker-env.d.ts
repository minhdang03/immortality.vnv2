/**
 * Cloudflare Workers environment bindings type declaration.
 * Matches wrangler.toml bindings exactly — keep in sync.
 */
export interface Env {
  // Supabase — agent write plane (phase-05)
  // SUPABASE_URL is a [vars] entry (public URL, not sensitive)
  // SUPABASE_SERVICE_ROLE is a wrangler secret — NEVER in toml/repo/goclaw
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE: string;

  // Static vars from wrangler.toml [vars]
  ENV: "development" | "staging" | "production";
  CORS_ORIGINS: string; // Comma-separated allowed origins
}
