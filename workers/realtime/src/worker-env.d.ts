/**
 * Cloudflare Workers environment bindings for btd-realtime worker.
 * Keep in sync with workers/wrangler.toml [realtime] section.
 */

import type { ChannelDurableObject } from "./channel-durable-object.ts";

export interface Env {
  // Durable Object binding — one instance per channelId
  CHANNEL: DurableObjectNamespace<ChannelDurableObject>;

  // KV — caches Google JWKS keys (TTL ~1h from Cache-Control header)
  KV_JWKS: KVNamespace;

  // KV — hot-read cache: channel configs (5min TTL)
  KV_CACHE: KVNamespace;

  // Secrets (set via `wrangler secret put`)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string; // Full service account JSON as string

  // Static vars from wrangler.toml [vars]
  ENV: "development" | "staging" | "production";
  CORS_ORIGINS: string; // Comma-separated allowed origins
}
