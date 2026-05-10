/**
 * Firestore REST API client for Cloudflare Workers edge runtime.
 *
 * Firebase Admin SDK cannot run on Workers (Node-only deps: fs, gRPC).
 * This module uses the Firestore REST API directly, authenticated via
 * a service account JWT signed with Web Crypto API (RS256).
 *
 * Functions used by ChannelDurableObject:
 *   - createMessage()      — persist new chat message with expiresAt
 *   - deleteMessage()      — remove expired message (called from DO alarm)
 *   - getChannelConfig()   — fetch slowModeSeconds + ephemeralTtlHours
 *   - updateMessagePromoted() — set promotedToQuestionId on message doc
 */

const FIRESTORE_BASE = "https://firestore.googleapis.com/v1";
const TOKEN_EXPIRY_SECONDS = 3600;

// ── Service account JWT ───────────────────────────────────────────────────────

interface ServiceAccount {
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a short-lived OAuth2 access token for the Firestore REST API.
 * Token is cached in module memory for ~55 minutes per isolate lifetime.
 */
async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const sa = JSON.parse(serviceAccountJson) as ServiceAccount;

  // Build JWT header + payload
  const iat = Math.floor(now / 1000);
  const exp = iat + TOKEN_EXPIRY_SECONDS;
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT", kid: sa.private_key_id }));
  const payload = btoa(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp,
      scope: "https://www.googleapis.com/auth/datastore",
    })
  );

  const signingInput = `${toBase64Url(header)}.${toBase64Url(payload)}`;

  // Import private key (PEM → CryptoKey)
  const privateKey = await importPrivateKey(sa.private_key);
  const signatureBytes = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );
  const signature = toBase64Url(btoa(String.fromCharCode(...new Uint8Array(signatureBytes))));

  const jwt = `${signingInput}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    throw new Error(`Failed to get Firestore access token: ${tokenResponse.status} ${body}`);
  }

  const { access_token } = (await tokenResponse.json()) as { access_token: string };

  cachedToken = { token: access_token, expiresAt: exp * 1000 };
  return access_token;
}

/** Import PEM private key as CryptoKey for RS256 signing. */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ── Firestore REST helpers ────────────────────────────────────────────────────

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  timestampValue?: string;
  booleanValue?: boolean;
  nullValue?: null;
}

interface FirestoreDocument {
  name?: string;
  fields: Record<string, FirestoreValue>;
}

/** Convert a plain object to Firestore REST field map. */
function toFirestoreFields(obj: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      // Use timestampValue for epoch-ms timestamp fields ending in 'At'
      if (key.endsWith("At") || key.endsWith("Expires")) {
        fields[key] = { timestampValue: new Date(value).toISOString() };
      } else {
        fields[key] = { integerValue: String(value) };
      }
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    }
  }
  return fields;
}

/** Read a string field from a Firestore document. */
function readString(doc: FirestoreDocument, field: string): string | undefined {
  return doc.fields[field]?.stringValue;
}

/** Read an integer field from a Firestore document. */
function readInt(doc: FirestoreDocument, field: string): number | undefined {
  const v = doc.fields[field]?.integerValue;
  return v !== undefined ? parseInt(v, 10) : undefined;
}

/** Read a timestamp field (ISO string → epoch ms). */
function readTimestamp(doc: FirestoreDocument, field: string): number | undefined {
  const v = doc.fields[field]?.timestampValue;
  return v !== undefined ? new Date(v).getTime() : undefined;
}

async function firestoreRequest(
  method: string,
  path: string,
  body: unknown | undefined,
  serviceAccountJson: string
): Promise<Response> {
  const token = await getAccessToken(serviceAccountJson);
  return fetch(`${FIRESTORE_BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface MessageData {
  id: string;
  channelId: string;
  authorUid: string;
  authorNickname: string;
  body: string;
  createdAt: number; // epoch ms
  expiresAt: number; // epoch ms
}

export interface ChannelConfig {
  slowModeSeconds: number;
  ephemeralTtlHours: number;
}

/**
 * Persist a new chat message to Firestore `btd_messages` collection.
 * Uses document ID from MessageData.id (caller supplies UUID).
 */
export async function createMessage(
  data: MessageData,
  projectId: string,
  serviceAccountJson: string
): Promise<void> {
  const path = `projects/${projectId}/databases/(default)/documents/btd_messages/${data.id}`;
  const body: FirestoreDocument = {
    fields: toFirestoreFields({
      id: data.id,
      channelId: data.channelId,
      authorUid: data.authorUid,
      authorNickname: data.authorNickname,
      body: data.body,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    }),
  };

  const response = await firestoreRequest("PATCH", path, body, serviceAccountJson);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`createMessage failed: ${response.status} ${text}`);
  }
}

/**
 * Delete an expired message from Firestore `btd_messages`.
 * Called from DO alarm handler after TTL elapses.
 */
export async function deleteMessage(
  messageId: string,
  projectId: string,
  serviceAccountJson: string
): Promise<void> {
  const path = `projects/${projectId}/databases/(default)/documents/btd_messages/${messageId}`;
  const response = await firestoreRequest("DELETE", path, undefined, serviceAccountJson);
  // 404 is acceptable — message already deleted or never existed
  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`deleteMessage failed: ${response.status} ${text}`);
  }
}

/**
 * Fetch channel config (slowModeSeconds, ephemeralTtlHours) from Firestore.
 * Returns defaults if channel doc is missing or fields absent.
 */
export async function getChannelConfig(
  channelId: string,
  projectId: string,
  serviceAccountJson: string
): Promise<ChannelConfig> {
  const path = `projects/${projectId}/databases/(default)/documents/btd_channels/${channelId}`;
  const response = await firestoreRequest("GET", path, undefined, serviceAccountJson);

  if (response.status === 404) {
    return { slowModeSeconds: 60, ephemeralTtlHours: 24 };
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`getChannelConfig failed: ${response.status} ${text}`);
  }

  const doc = (await response.json()) as FirestoreDocument;
  return {
    slowModeSeconds: readInt(doc, "slowModeSeconds") ?? 60,
    ephemeralTtlHours: readInt(doc, "ephemeralTtlHours") ?? 24,
  };
}

/**
 * Set `promotedToQuestionId` on a btd_messages doc (partial update via fieldMask).
 */
export async function updateMessagePromoted(
  messageId: string,
  questionId: string,
  projectId: string,
  serviceAccountJson: string
): Promise<void> {
  const path =
    `projects/${projectId}/databases/(default)/documents/btd_messages/${messageId}` +
    `?updateMask.fieldPaths=promotedToQuestionId`;
  const body: FirestoreDocument = {
    fields: { promotedToQuestionId: { stringValue: questionId } },
  };
  const response = await firestoreRequest("PATCH", path, body, serviceAccountJson);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`updateMessagePromoted failed: ${response.status} ${text}`);
  }
}

// Re-export for test access
export { readString, readInt, readTimestamp };
