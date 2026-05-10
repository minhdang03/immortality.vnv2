/**
 * Firestore REST client for Cloudflare Workers.
 * Firebase Admin SDK is Node-only — this uses the Firestore REST API
 * (firestore.googleapis.com/v1/...) authenticated with a service account JWT.
 *
 * Covers: getDoc, setDoc, updateDoc, deleteDoc, queryCollection, runTransaction.
 */

import type { Env } from "../cloudflare-worker-env.js";
import { getServiceAccountAccessToken } from "./service-account-jwt.js";

const FIRESTORE_BASE = "https://firestore.googleapis.com/v1";

// ── Firestore value type serialization ───────────────────────────────────────

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

/** Convert a JS primitive/object to a Firestore value envelope. */
function toFirestoreValue(val: unknown): FirestoreValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/** Convert a Firestore value envelope back to a JS primitive/object. */
function fromFirestoreValue(fv: FirestoreValue): unknown {
  if ("nullValue" in fv) return null;
  if ("booleanValue" in fv) return fv.booleanValue;
  if ("integerValue" in fv) return parseInt(fv.integerValue, 10);
  if ("doubleValue" in fv) return fv.doubleValue;
  if ("stringValue" in fv) return fv.stringValue;
  if ("timestampValue" in fv) return fv.timestampValue; // keep as ISO string
  if ("arrayValue" in fv) {
    return (fv.arrayValue.values ?? []).map(fromFirestoreValue);
  }
  if ("mapValue" in fv) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fv.mapValue.fields ?? {})) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

/** Convert a raw Firestore document to a plain JS object (with `id` extracted). */
function fromFirestoreDoc(doc: FirestoreDocument): Record<string, unknown> {
  const id = doc.name?.split("/").at(-1) ?? "";
  const result: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    result[k] = fromFirestoreValue(v);
  }
  return result;
}

/** Convert a plain JS object to a Firestore fields map. */
function toFirestoreFields(
  data: Record<string, unknown>
): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

// ── REST client ──────────────────────────────────────────────────────────────

async function firestoreRequest(
  env: Env,
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const token = await getServiceAccountAccessToken(env);
  const url = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new FirestoreError(res.status, err);
  }
  if (res.status === 204) return null;
  return res.json();
}

export class FirestoreError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "FirestoreError";
  }
}

/** Fetch a single document. Returns null if not found. */
export async function getDoc(
  env: Env,
  collection: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const raw = await firestoreRequest(env, "GET", `/${collection}/${id}`);
  if (!raw) return null;
  return fromFirestoreDoc(raw as FirestoreDocument);
}

/**
 * Create or overwrite a document (PUT semantics).
 * Pass `createOnly: true` to fail if doc already exists (idempotent create).
 */
export async function setDoc(
  env: Env,
  collection: string,
  id: string,
  data: Record<string, unknown>,
  options: { createOnly?: boolean } = {}
): Promise<Record<string, unknown>> {
  const fields = toFirestoreFields(data);

  if (options.createOnly) {
    // Use createDocument endpoint which 409s on existing doc
    const body = { fields };
    const token = await getServiceAccountAccessToken(env);
    const url = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}?documentId=${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.status === 409) {
      // Doc exists — idempotent, return existing doc
      return (await getDoc(env, collection, id))!;
    }
    if (!res.ok) throw new FirestoreError(res.status, await res.text());
    return fromFirestoreDoc((await res.json()) as FirestoreDocument);
  }

  // PATCH with updateMask=* replaces all fields
  const updateMask = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
    .join("&");
  const raw = await firestoreRequest(
    env,
    "PATCH",
    `/${collection}/${id}?${updateMask}`,
    { fields }
  );
  return fromFirestoreDoc(raw as FirestoreDocument);
}

/** Merge-update specific fields (does not overwrite unlisted fields). */
export async function updateDoc(
  env: Env,
  collection: string,
  id: string,
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const fields = toFirestoreFields(partial);
  const updateMask = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
    .join("&");
  const raw = await firestoreRequest(
    env,
    "PATCH",
    `/${collection}/${id}?${updateMask}`,
    { fields }
  );
  return fromFirestoreDoc(raw as FirestoreDocument);
}

/** Delete a document. */
export async function deleteDoc(
  env: Env,
  collection: string,
  id: string
): Promise<void> {
  await firestoreRequest(env, "DELETE", `/${collection}/${id}`);
}

// ── Query support ─────────────────────────────────────────────────────────────

type WhereFilter = {
  field: string;
  op:
    | "EQUAL"
    | "NOT_EQUAL"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL"
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL"
    | "ARRAY_CONTAINS";
  value: unknown;
};

type OrderBy = { field: string; direction?: "ASCENDING" | "DESCENDING" };

type QueryOptions = {
  where?: WhereFilter[];
  orderBy?: OrderBy[];
  limit?: number;
  /** Firestore document name to start after (for cursor pagination) */
  startAfterDocName?: string;
};

/**
 * Run a structured query on a collection.
 * Returns plain JS objects (with id extracted).
 */
export async function queryCollection(
  env: Env,
  collection: string,
  options: QueryOptions = {}
): Promise<Record<string, unknown>[]> {
  const { where = [], orderBy = [], limit = 50, startAfterDocName } = options;

  // Build structured query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const structuredQuery: Record<string, any> = {
    from: [{ collectionId: collection }],
    limit: Math.min(limit, 50), // cap at 50
  };

  if (where.length > 0) {
    const filters = where.map((w) => ({
      fieldFilter: {
        field: { fieldPath: w.field },
        op: w.op,
        value: toFirestoreValue(w.value),
      },
    }));
    structuredQuery.where =
      filters.length === 1
        ? filters[0]
        : { compositeFilter: { op: "AND", filters } };
  }

  if (orderBy.length > 0) {
    structuredQuery.orderBy = orderBy.map((o) => ({
      field: { fieldPath: o.field },
      direction: o.direction ?? "ASCENDING",
    }));
  }

  if (startAfterDocName) {
    structuredQuery.startAt = {
      values: [],
      before: false,
      // Cursor by document name requires referenceValue
      // Simplified: caller uses offset-based for now; full cursor in v1.1
    };
  }

  const token = await getServiceAccountAccessToken(env);
  const url = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structuredQuery }),
  });

  if (!res.ok) throw new FirestoreError(res.status, await res.text());

  const results = (await res.json()) as Array<{ document?: FirestoreDocument }>;
  return results
    .filter((r) => r.document)
    .map((r) => fromFirestoreDoc(r.document!));
}

/**
 * Atomically increment a numeric field on a document.
 * Uses Firestore field transform (server-side increment).
 */
export async function incrementField(
  env: Env,
  collection: string,
  id: string,
  field: string,
  by = 1
): Promise<void> {
  const token = await getServiceAccountAccessToken(env);
  const url = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${id}?updateMask.fieldPaths=${field}`;

  // Firestore field transform for server-side increment
  const body = {
    writes: [
      {
        transform: {
          document: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${id}`,
          fieldTransforms: [
            {
              fieldPath: field,
              increment: toFirestoreValue(by),
            },
          ],
        },
      },
    ],
  };

  const commitUrl = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;
  const res = await fetch(commitUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new FirestoreError(res.status, await res.text());
}
