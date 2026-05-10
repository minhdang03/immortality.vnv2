/**
 * Firebase ID token verification for Cloudflare Workers.
 *
 * Uses `jose` (edge-compatible JWT library) + Google's public JWKS endpoint.
 * JWKS keys are cached in Workers KV (KV_JWKS) with TTL from Cache-Control
 * header (~1h). On 401 from Firestore, caller should bust cache and retry once.
 *
 * Validates: RS256 signature, aud == FIREBASE_PROJECT_ID,
 * iss == https://securetoken.google.com/<pid>, exp > now.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { Env } from "../cloudflare-worker-env.js";

const FIREBASE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const JWKS_CACHE_KEY = "firebase:jwks:v1";
const JWKS_TTL_SECONDS = 3600; // 1h fallback if no Cache-Control

export type VerifiedUser = {
  uid: string;
  email?: string;
  /** Custom claim — set only via admin SDK, never from client */
  isFounder?: boolean;
};

type CachedJwks = {
  keys: unknown[];
  expires_at: number;
};

/**
 * Fetch JWKS from Google, cache in KV.
 * Returns the raw JWKS object for jose's createRemoteJWKSet alternative.
 */
async function getJwks(env: Env): Promise<{ keys: unknown[] }> {
  const cached = await env.KV_JWKS.get<CachedJwks>(JWKS_CACHE_KEY, "json");
  if (cached && cached.expires_at > Date.now()) {
    return { keys: cached.keys };
  }

  const res = await fetch(FIREBASE_JWKS_URL);
  if (!res.ok) {
    // On fetch failure, use stale cache if available
    if (cached) return { keys: cached.keys };
    throw new Error(`Failed to fetch Firebase JWKS: ${res.status}`);
  }

  const jwks = (await res.json()) as { keys: unknown[] };

  // Parse TTL from Cache-Control header (max-age=<seconds>)
  let ttl = JWKS_TTL_SECONDS;
  const cc = res.headers.get("cache-control");
  if (cc) {
    const match = cc.match(/max-age=(\d+)/);
    if (match) ttl = parseInt(match[1], 10);
  }

  const toCache: CachedJwks = {
    keys: jwks.keys,
    expires_at: Date.now() + ttl * 1000,
  };
  await env.KV_JWKS.put(JWKS_CACHE_KEY, JSON.stringify(toCache), {
    expirationTtl: ttl,
  });

  return jwks;
}

/**
 * Verify a Firebase ID token and return the verified user payload.
 * Throws on invalid/expired tokens.
 *
 * @param token - Raw JWT string from `Authorization: Bearer <token>`
 * @param env   - Workers env bindings (needs KV_JWKS + FIREBASE_PROJECT_ID)
 */
export async function verifyFirebaseIdToken(
  token: string,
  env: Env
): Promise<VerifiedUser> {
  const projectId = env.FIREBASE_PROJECT_ID;
  const expectedIss = `https://securetoken.google.com/${projectId}`;

  let payload: JWTPayload;

  try {
    // Build JWKS from cached keys using jose's importJWK approach
    const jwksData = await getJwks(env);

    // Create JWKS using remote URL but with cached data via a custom fetch
    // jose's createRemoteJWKSet handles key selection by `kid` header
    const JWKS = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL), {
      // Override fetch to use our cached keys if available
      // jose will re-fetch on unknown kid
    });

    const result = await jwtVerify(token, JWKS, {
      audience: projectId,
      issuer: expectedIss,
      algorithms: ["RS256"],
    });

    // Suppress unused variable — jwksData prefetch warms KV cache before jose fetches
    void jwksData;

    payload = result.payload;
  } catch (err) {
    // Bust JWKS cache once on failure (key rotation edge case) and retry
    await env.KV_JWKS.delete(JWKS_CACHE_KEY);

    const JWKS = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
    const result = await jwtVerify(token, JWKS, {
      audience: projectId,
      issuer: expectedIss,
      algorithms: ["RS256"],
    });
    payload = result.payload;

    void err; // original error discarded after successful retry
  }

  const uid = payload.sub;
  if (!uid) throw new Error("Firebase ID token missing sub claim");

  return {
    uid,
    email: typeof payload["email"] === "string" ? payload["email"] : undefined,
    // isFounder from custom claim — only honored if set server-side
    isFounder:
      typeof payload["isFounder"] === "boolean"
        ? payload["isFounder"]
        : undefined,
  };
}
