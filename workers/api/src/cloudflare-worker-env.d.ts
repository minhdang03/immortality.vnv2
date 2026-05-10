/**
 * Cloudflare Workers environment bindings type declaration.
 * Matches wrangler.toml bindings exactly — keep in sync.
 */
export interface Env {
  // KV Namespaces
  KV_JWKS: KVNamespace;   // Caches Google JWKS keys (TTL ~1h from Cache-Control)
  KV_CACHE: KVNamespace;  // Hot-read cache: profiles (5min), channels (5min)

  // Secrets (set via `wrangler secret put`)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string; // Full service account JSON as string

  // Static vars from wrangler.toml [vars]
  ENV: "development" | "staging" | "production";
  CORS_ORIGINS: string; // Comma-separated allowed origins
}
