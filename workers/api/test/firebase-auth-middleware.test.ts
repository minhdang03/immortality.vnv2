/**
 * Unit tests for Firebase auth middleware.
 * Tests: valid token pass-through, missing header 401, invalid token 401.
 *
 * Uses vi.mock to stub verifyFirebaseIdToken — no real Firebase calls.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { requireAuth } from "../src/middleware/firebase-auth-verify-middleware.js";
import type { Env } from "../src/cloudflare-worker-env.js";

// Stub the verifier so tests don't need real Firebase
vi.mock("../src/lib/firebase-id-token-verifier.js", () => ({
  verifyFirebaseIdToken: vi.fn(),
}));

import { verifyFirebaseIdToken } from "../src/lib/firebase-id-token-verifier.js";
const mockVerify = vi.mocked(verifyFirebaseIdToken);

// Minimal env stub
const mockEnv: Partial<Env> = {
  FIREBASE_PROJECT_ID: "immortalityvn",
  ENV: "development",
  KV_JWKS: {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace,
  KV_CACHE: {} as KVNamespace,
  CORS_ORIGINS: "http://localhost:8081",
  FIREBASE_SERVICE_ACCOUNT_JSON: "{}",
};

function buildApp() {
  const app = new Hono<{ Bindings: Env }>();
  app.get("/protected", requireAuth, (c) => {
    // Cast to access the user variable set by middleware
    const user = (c as unknown as { get: (k: string) => unknown }).get("user");
    return c.json({ uid: (user as { uid: string }).uid });
  });
  return app;
}

describe("requireAuth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes request when token is valid", async () => {
    mockVerify.mockResolvedValueOnce({ uid: "user-123" });

    const app = buildApp();
    const req = new Request("http://localhost/protected", {
      headers: { Authorization: "Bearer valid-token" },
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(200);
    const body = await res.json() as { uid: string };
    expect(body.uid).toBe("user-123");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const app = buildApp();
    const req = new Request("http://localhost/protected");

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 when token verification fails", async () => {
    mockVerify.mockRejectedValueOnce(new Error("JWTExpired"));

    const app = buildApp();
    const req = new Request("http://localhost/protected", {
      headers: { Authorization: "Bearer expired-token" },
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 when Bearer token is empty string", async () => {
    const app = buildApp();
    const req = new Request("http://localhost/protected", {
      headers: { Authorization: "Bearer " },
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(401);
  });
});
