/**
 * Per-agent API key generation & hashing.
 *
 * Format: btd_<32 hex chars> (128 bits entropy) — mirrors goclaw's key model.
 * Raw key is returned ONCE at creation; only the SHA-256 hash is persisted.
 */

const KEY_PREFIX = "btd_";
const RANDOM_BYTES = 16; // 16 bytes → 32 hex chars

export type GeneratedKey = {
  raw: string;       // btd_<hex32> — show once, never persist
  hash: string;      // sha256 hex of raw — stored in D1
  prefix: string;    // btd_ + first 8 hex — safe display identifier
};

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 hex digest of a raw key string (WebCrypto, Workers-compatible). */
export async function hashApiKey(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return bytesToHex(new Uint8Array(digest));
}

/** Generate a new agent API key. Raw value must be shown to the admin once and discarded. */
export async function generateApiKey(): Promise<GeneratedKey> {
  const random = crypto.getRandomValues(new Uint8Array(RANDOM_BYTES));
  const hex = bytesToHex(random);
  const raw = `${KEY_PREFIX}${hex}`;
  return {
    raw,
    hash: await hashApiKey(raw),
    prefix: `${KEY_PREFIX}${hex.slice(0, 8)}`,
  };
}

/** Cheap shape check before hashing — rejects obviously malformed tokens. */
export function looksLikeApiKey(token: string): boolean {
  return token.startsWith(KEY_PREFIX) && /^btd_[0-9a-f]{32}$/.test(token);
}

/** Valid RBAC scopes for agent keys. */
export const VALID_SCOPES = ["content:read", "content:write", "media:write"] as const;
export type ApiKeyScope = (typeof VALID_SCOPES)[number];

export function parseScopes(csv: string): ApiKeyScope[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ApiKeyScope => (VALID_SCOPES as readonly string[]).includes(s));
}
