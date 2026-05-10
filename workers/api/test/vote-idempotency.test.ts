/**
 * Unit tests for vote idempotency.
 * Verifies: composite ID construction, getDoc-before-write prevents double-count,
 * second vote returns alreadyVoted=true with no increment.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { votesRouter } from "../src/routes/votes-route-handler.js";
import type { Env } from "../src/cloudflare-worker-env.js";

// Stub auth middleware
vi.mock("../src/middleware/firebase-auth-verify-middleware.js", () => ({
  requireAuth: vi.fn(async (c: unknown, next: () => Promise<void>) => {
    (c as { set: (k: string, v: unknown) => void }).set("user", { uid: "voter-uid-42" });
    await next();
  }),
}));

// Stub Firestore client
vi.mock("../src/lib/firestore-rest-client.js", () => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  incrementField: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn(),
  queryCollection: vi.fn(),
  FirestoreError: class FirestoreError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
}));

import { getDoc, setDoc, incrementField } from "../src/lib/firestore-rest-client.js";
const mockGetDoc = vi.mocked(getDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockIncrementField = vi.mocked(incrementField);

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
  app.route("/api/votes", votesRouter);
  return app;
}

const VOTE_BODY = JSON.stringify({ targetType: "question", targetId: "q-abc" });
const VOTE_HEADERS = { "Content-Type": "application/json" };

describe("Vote idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates vote doc with composite ID on first vote", async () => {
    // No existing vote doc
    mockGetDoc.mockResolvedValueOnce(null);
    mockSetDoc.mockResolvedValueOnce({
      id: "question_q-abc_voter-uid-42",
      voterUid: "voter-uid-42",
      targetType: "question",
      targetId: "q-abc",
      createdAt: new Date().toISOString(),
    });

    const app = buildApp();
    const req = new Request("http://localhost/api/votes", {
      method: "POST",
      headers: VOTE_HEADERS,
      body: VOTE_BODY,
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(201);

    const body = await res.json() as { voted: boolean; alreadyVoted: boolean };
    expect(body.voted).toBe(true);
    expect(body.alreadyVoted).toBe(false);

    // Verify existence was checked with composite ID before write
    expect(mockGetDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_votes",
      "question_q-abc_voter-uid-42"
    );

    // Verify setDoc was called with createOnly
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_votes",
      "question_q-abc_voter-uid-42",
      expect.objectContaining({ voterUid: "voter-uid-42", targetType: "question", targetId: "q-abc" }),
      { createOnly: true }
    );

    // voteCount incremented
    expect(mockIncrementField).toHaveBeenCalledWith(
      expect.anything(),
      "btd_questions",
      "q-abc",
      "voteCount",
      1
    );
  });

  it("returns alreadyVoted=true and does NOT increment on duplicate vote", async () => {
    // Existing vote doc found
    mockGetDoc.mockResolvedValueOnce({
      id: "question_q-abc_voter-uid-42",
      voterUid: "voter-uid-42",
      targetType: "question",
      targetId: "q-abc",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    const app = buildApp();
    const req = new Request("http://localhost/api/votes", {
      method: "POST",
      headers: VOTE_HEADERS,
      body: VOTE_BODY,
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(200);

    const body = await res.json() as { voted: boolean; alreadyVoted: boolean };
    expect(body.voted).toBe(true);
    expect(body.alreadyVoted).toBe(true);

    // setDoc NOT called on duplicate
    expect(mockSetDoc).not.toHaveBeenCalled();
    // voteCount NOT incremented on duplicate
    expect(mockIncrementField).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid targetType", async () => {
    const app = buildApp();
    const req = new Request("http://localhost/api/votes", {
      method: "POST",
      headers: VOTE_HEADERS,
      body: JSON.stringify({ targetType: "comment", targetId: "x" }),
    });

    const res = await app.fetch(req, mockEnv as Env);
    expect(res.status).toBe(400);
  });

  it("uses composite ID format {targetType}_{targetId}_{voterUid}", async () => {
    mockGetDoc.mockResolvedValueOnce(null);
    mockSetDoc.mockResolvedValueOnce({ id: "answer_ans-99_voter-uid-42" });

    const app = buildApp();
    const req = new Request("http://localhost/api/votes", {
      method: "POST",
      headers: VOTE_HEADERS,
      body: JSON.stringify({ targetType: "answer", targetId: "ans-99" }),
    });

    await app.fetch(req, mockEnv as Env);

    expect(mockGetDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_votes",
      "answer_ans-99_voter-uid-42"
    );
  });
});
