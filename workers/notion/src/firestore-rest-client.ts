/**
 * Firestore REST client for Cloudflare Workers (notion Worker).
 * Mirrors api worker's client — no shared package to keep Workers independent.
 * Covers: getDoc, setDoc, updateDoc, queryCollection used by notion-sync and ai-ask.
 */

import type { Env } from "./cloudflare-worker-env.js";
import { getServiceAccountAccessToken } from "./service-account-jwt-signer.js";

const FIRESTORE_BASE = "https://firestore.googleapis.com/v1";

// ── Value type serialization ──────────────────────────────────────────────────

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

export class FirestoreError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "FirestoreError";
  }
}

function toValue(val: unknown): FirestoreValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val)
      ? { integerValue: String(val) }
      : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromValue(fv: FirestoreValue): unknown {
  if ("nullValue" in fv) return null;
  if ("booleanValue" in fv) return fv.booleanValue;
  if ("integerValue" in fv) return parseInt(fv.integerValue, 10);
  if ("doubleValue" in fv) return fv.doubleValue;
  if ("stringValue" in fv) return fv.stringValue;
  if ("timestampValue" in fv) return fv.timestampValue;
  if ("arrayValue" in fv) return (fv.arrayValue.values ?? []).map(fromValue);
  if ("mapValue" in fv) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fv.mapValue.fields ?? {})) {
      obj[k] = fromValue(v);
    }
    return obj;
  }
  return null;
}

function fromDoc(doc: FirestoreDocument): Record<string, unknown> {
  const id = doc.name?.split("/").at(-1) ?? "";
  const result: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    result[k] = fromValue(v);
  }
  return result;
}

function toFields(data: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toValue(v);
  }
  return fields;
}

async function request(
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
  if (!res.ok) throw new FirestoreError(res.status, await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export async function getDoc(
  env: Env,
  collection: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const raw = await request(env, "GET", `/${collection}/${id}`);
  if (!raw) return null;
  return fromDoc(raw as FirestoreDocument);
}

export async function setDoc(
  env: Env,
  collection: string,
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const fields = toFields(data);
  const mask = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
    .join("&");
  const raw = await request(env, "PATCH", `/${collection}/${id}?${mask}`, { fields });
  return fromDoc(raw as FirestoreDocument);
}

export async function addDoc(
  env: Env,
  collection: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const token = await getServiceAccountAccessToken(env);
  const url = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!res.ok) throw new FirestoreError(res.status, await res.text());
  return fromDoc((await res.json()) as FirestoreDocument);
}

type WhereFilter = {
  field: string;
  op: "EQUAL" | "NOT_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "ARRAY_CONTAINS" | "IS_NULL" | "IS_NOT_NULL";
  value: unknown;
};

export async function queryCollection(
  env: Env,
  collection: string,
  options: { where?: WhereFilter[]; limit?: number } = {}
): Promise<Record<string, unknown>[]> {
  const { where = [], limit = 50 } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const structuredQuery: Record<string, any> = {
    from: [{ collectionId: collection }],
    limit: Math.min(limit, 500),
  };

  if (where.length > 0) {
    const filters = where.map((w) => ({
      fieldFilter: {
        field: { fieldPath: w.field },
        op: w.op,
        value: toValue(w.value),
      },
    }));
    structuredQuery.where =
      filters.length === 1
        ? filters[0]
        : { compositeFilter: { op: "AND", filters } };
  }

  const token = await getServiceAccountAccessToken(env);
  const url = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery }),
  });
  if (!res.ok) throw new FirestoreError(res.status, await res.text());

  const results = (await res.json()) as Array<{ document?: FirestoreDocument }>;
  return results.filter((r) => r.document).map((r) => fromDoc(r.document!));
}

/** Atomically increment a KV-like counter stored in Firestore. */
export async function incrementField(
  env: Env,
  collection: string,
  id: string,
  field: string,
  by = 1
): Promise<void> {
  const token = await getServiceAccountAccessToken(env);
  const commitUrl = `${FIRESTORE_BASE}/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;
  const body = {
    writes: [
      {
        transform: {
          document: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${id}`,
          fieldTransforms: [{ fieldPath: field, increment: toValue(by) }],
        },
      },
    ],
  };
  const res = await fetch(commitUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new FirestoreError(res.status, await res.text());
}
