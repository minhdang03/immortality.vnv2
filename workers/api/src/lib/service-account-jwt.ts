/**
 * Google Service Account JWT signing for Cloudflare Workers.
 *
 * Firebase Admin SDK uses Node crypto — incompatible with Workers.
 * This uses Web Crypto API (available in Workers) to sign RS256 JWTs,
 * then exchanges them for OAuth2 access tokens for Firestore REST API calls.
 *
 * Access tokens are cached in Workers KV (KV_JWKS) for 50 minutes
 * (Google tokens expire at 60min; 10min buffer for clock skew).
 */

import type { Env } from "../cloudflare-worker-env.js";

const TOKEN_CACHE_KEY = "sa:access_token";
const TOKEN_TTL_SECONDS = 50 * 60; // 50 minutes

type ServiceAccountJson = {
  client_email: string;
  private_key: string;
  project_id: string;
};

type CachedToken = {
  access_token: string;
  expires_at: number; // unix ms
};

/** Parse and cache the service account JSON from env secret. */
function parseServiceAccount(env: Env): ServiceAccountJson {
  try {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccountJson;
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. Set via: wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON"
    );
  }
}

/**
 * Import RSA private key (PEM) into Web Crypto API for RS256 signing.
 * Workers support SubtleCrypto.importKey with PKCS#8 format.
 */
async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  // Strip PEM headers/footers and decode base64
  const pemContents = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "")
    .trim();

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/** Base64url encode a Uint8Array (no padding). */
function base64url(data: ArrayBuffer | Uint8Array): string {
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Create a signed RS256 JWT asserting service account identity. */
async function createServiceAccountJwt(
  sa: ServiceAccountJson,
  scope: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope,
    iat: now,
    exp: now + 3600, // 1 hour max
  };

  const encode = (obj: unknown) =>
    base64url(new TextEncoder().encode(JSON.stringify(obj)));

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64url(signature)}`;
}

/**
 * Exchange a service account JWT for a Google OAuth2 access token.
 * Scope: Firestore read/write.
 */
async function fetchAccessToken(sa: ServiceAccountJson): Promise<string> {
  const jwt = await createServiceAccountJwt(
    sa,
    "https://www.googleapis.com/auth/datastore"
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch service account access token: ${body}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Get a valid Firestore access token, using KV cache to avoid re-signing
 * on every request. Cache TTL = 50min (Google token expires at 60min).
 */
export async function getServiceAccountAccessToken(env: Env): Promise<string> {
  // Check KV cache first
  const cached = await env.KV_JWKS.get<CachedToken>(TOKEN_CACHE_KEY, "json");
  if (cached && cached.expires_at > Date.now() + 60_000) {
    // Valid with 1min buffer
    return cached.access_token;
  }

  const sa = parseServiceAccount(env);
  const token = await fetchAccessToken(sa);

  // Cache in KV
  const payload: CachedToken = {
    access_token: token,
    expires_at: Date.now() + TOKEN_TTL_SECONDS * 1000,
  };
  await env.KV_JWKS.put(TOKEN_CACHE_KEY, JSON.stringify(payload), {
    expirationTtl: TOKEN_TTL_SECONDS,
  });

  return token;
}
