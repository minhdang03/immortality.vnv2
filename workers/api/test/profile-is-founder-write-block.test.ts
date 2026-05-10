/**
 * Unit tests verifying isFounder (and proExpiresAt) cannot be set by client.
 * Tests both POST /api/profiles and PATCH /api/profiles/me endpoints.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { profilesRouter } from "../src/routes/profiles-route-handler.js";
import type { Env } from "../src/cloudflare-worker-env.js";

vi.mock("../src/middleware/firebase-auth-verify-middleware.js", () => ({
  requireAuth: vi.fn(async (c: unknown, next: () => Promise<void>) => {
    (c as { set: (k: string, v: unknown) => void }).set("user", { uid: "test-uid-99" });
    await next();
  }),
}));

vi.mock("../src/lib/firestore-rest-client.js", () => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  FirestoreError: class FirestoreError extends Error {
    constructor(public status: number, message: string) { super(message); }
  },
}));

import { getDoc, setDoc, updateDoc } from "../src/lib/firestore-rest-client.js";
const mockGetDoc = vi.mocked(getDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockUpdateDoc = vi.mocked(updateDoc);

const mockEnv: Partial<Env> = {
  FIREBASE_PROJECT_ID: "immortalityvn",
  ENV: "development",
  CORS_ORIGINS: "http://localhost:8081",
  KV_JWKS: {} as KVNamespace,
  KV_CACHE: {} as KVNamespace,
  FIREBASE_SERVICE_ACCOUNT_JSON: "{}",
};

function buildApp() {
  const app = new Hono<{ Bindings: Env }>();
  app.route("/api/profiles", profilesRouter);
  return app;
}

const VALID_PROFILE_BODY = {
  nickname: "Practitioner",
  avatarType: "gradient",
  avatarSeed: "lotus-seed-42",
};

describe("Profile isFounder write block", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/profiles strips isFounder before writing to Firestore", async () => {
    // No existing profile
    mockGetDoc.mockResolvedValueOnce(null);
    mockSetDoc.mockResolvedValueOnce({
      id: "test-uid-99",
      nickname: "Practitioner",
      avatarType: "gradient",
      avatarSeed: "lotus-seed-42",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const app = buildApp();
    const req = new Request("http://localhost/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...VALID_PROFILE_BODY, isFounder: true }),
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(201);

    // Verify isFounder was stripped from setDoc call
    const setDocCall = mockSetDoc.mock.calls[0];
    const writtenData = setDocCall[3] as Record<string, unknown>;
    expect(writtenData).not.toHaveProperty("isFounder");
    expect(writtenData).not.toHaveProperty("proExpiresAt");
  });

  it("PATCH /api/profiles/me strips isFounder from update", async () => {
    const existingProfile = {
      id: "test-uid-99",
      nickname: "Practitioner",
      avatarType: "gradient",
      avatarSeed: "lotus-seed-42",
      isFounder: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    mockGetDoc.mockResolvedValueOnce(existingProfile);
    mockUpdateDoc.mockResolvedValueOnce({
      ...existingProfile,
      bio: "Updated bio",
      updatedAt: new Date().toISOString(),
    });

    const app = buildApp();
    const req = new Request("http://localhost/api/profiles/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: "Updated bio", isFounder: true, proExpiresAt: "2099-01-01" }),
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(200);

    // Verify isFounder and proExpiresAt stripped from updateDoc call
    const updateCall = mockUpdateDoc.mock.calls[0];
    const updatedFields = updateCall[3] as Record<string, unknown>;
    expect(updatedFields).not.toHaveProperty("isFounder");
    expect(updatedFields).not.toHaveProperty("proExpiresAt");
    expect(updatedFields).toHaveProperty("bio", "Updated bio");
  });

  it("Response from GET /api/profiles/:uid never includes isFounder", async () => {
    mockGetDoc.mockResolvedValueOnce({
      id: "test-uid-99",
      nickname: "Practitioner",
      avatarType: "gradient",
      avatarSeed: "lotus-seed-42",
      isFounder: true,        // in DB
      proExpiresAt: "2099",   // in DB
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const app = buildApp();
    const req = new Request("http://localhost/api/profiles/test-uid-99");

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    expect(body).not.toHaveProperty("isFounder");
    expect(body).not.toHaveProperty("proExpiresAt");
    expect(body).toHaveProperty("nickname", "Practitioner");
  });

  it("POST /api/profiles with invalid nickname length returns 400", async () => {
    const app = buildApp();
    const req = new Request("http://localhost/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: "x", avatarType: "gradient", avatarSeed: "s" }),
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(400);
  });
});
