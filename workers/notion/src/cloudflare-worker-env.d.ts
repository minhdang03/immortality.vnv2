/**
 * Cloudflare Workers environment bindings for btd-notion-sync Worker.
 * Matches wrangler.toml bindings exactly — keep in sync.
 */
export interface Env {
  // KV Namespaces
  KV_QUOTA: KVNamespace; // Daily AI quota counter: key=quota:{uid}:{date}, value=count

  // Secrets (set via `wrangler secret put`)
  ANTHROPIC_API_KEY: string;
  NOTION_TOKEN: string; // Notion integration token (read-only scope)
  NOTION_DB_KNOWLEDGE: string; // Notion knowledge base DB ID
  NOTION_DB_KHAITRI_ARCHIVE: string; // Optional second Notion DB ID (may be empty)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string; // Full service account JSON as string

  // Static vars from wrangler.toml [vars]
  ENV: "development" | "staging" | "production";
  CORS_ORIGINS: string; // Comma-separated allowed origins
  AI_DAILY_QUOTA: string; // Default: "100" requests/day per Pro user
  AI_MAX_OUTPUT_TOKENS: string; // Default: "800" — cost guardrail
  AI_MAX_HISTORY_TURNS: string; // Default: "5" conversation turns kept
}
