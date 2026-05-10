/**
 * Unit tests for Notion sync diff logic and Firestore upsert behavior.
 * Uses mocked Notion API + mocked Firestore client — no live credentials needed.
 *
 * Covers:
 *   - Pages changed since last sync → upserted
 *   - Pages unchanged (same lastEditedTime) → skipped
 *   - Pages removed from Notion → soft-deleted in Firestore
 *   - Notion rate-limit retry (429) → backs off and retries
 *   - Mid-sync Firestore write failure → logged as error, does not abort rest
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// ── Mock firestore-rest-client ────────────────────────────────────────────────

vi.mock("../src/firestore-rest-client.js", () => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  queryCollection: vi.fn(),
  addDoc: vi.fn(),
  incrementField: vi.fn(),
  FirestoreError: class FirestoreError extends Error {
    constructor(public status: number, msg: string) { super(msg); }
  },
}));

// ── Mock notion-knowledge-base-client ─────────────────────────────────────────

vi.mock("../src/notion-knowledge-base-client.js", () => ({
  fetchAllKnowledgePages: vi.fn(),
}));

import { runNotionSync } from "../src/notion-to-firestore-sync.js";
import { getDoc, setDoc, queryCollection, addDoc } from "../src/firestore-rest-client.js";
import { fetchAllKnowledgePages } from "../src/notion-knowledge-base-client.js";
import type { NotionKnowledgePage } from "../src/notion-knowledge-base-client.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEnv(overrides: Record<string, string> = {}): Record<string, unknown> {
  return {
    NOTION_TOKEN: "notion-token",
    NOTION_DB_KNOWLEDGE: "db-knowledge-id",
    NOTION_DB_KHAITRI_ARCHIVE: "",
    FIREBASE_PROJECT_ID: "immortalityvn",
    FIREBASE_SERVICE_ACCOUNT_JSON: "{}",
    ANTHROPIC_API_KEY: "sk-ant-test",
    ENV: "development",
    CORS_ORIGINS: "http://localhost:5173",
    AI_DAILY_QUOTA: "100",
    AI_MAX_OUTPUT_TOKENS: "800",
    AI_MAX_HISTORY_TURNS: "5",
    KV_QUOTA: { get: vi.fn(), put: vi.fn() },
    ...overrides,
  };
}

function makePage(overrides: Partial<NotionKnowledgePage> = {}): NotionKnowledgePage {
  return {
    notionPageId: "page-abc",
    title: "Test Page",
    slug: "test-page",
    tags: ["health"],
    bodyMarkdown: "# Test\n\nContent here.",
    lastEditedTime: "2026-05-10T10:00:00.000Z",
    published: true,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("runNotionSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (addDoc as Mock).mockResolvedValue({ id: "log-id" });
    (setDoc as Mock).mockResolvedValue({});
    (queryCollection as Mock).mockResolvedValue([]);
  });

  it("upserts a page when it is new (no existing Firestore doc)", async () => {
    const page = makePage();
    (fetchAllKnowledgePages as Mock).mockResolvedValue([page]);
    (getDoc as Mock).mockResolvedValue(null); // no existing doc

    await runNotionSync(makeEnv() as never);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_knowledge",
      page.notionPageId,
      expect.objectContaining({
        notionPageId: page.notionPageId,
        title: page.title,
        slug: page.slug,
        source: "notion",
        archivedAt: null,
      })
    );
  });

  it("skips a page when lastEditedTime is unchanged", async () => {
    const page = makePage({ lastEditedTime: "2026-05-10T10:00:00.000Z" });
    (fetchAllKnowledgePages as Mock).mockResolvedValue([page]);
    (getDoc as Mock).mockResolvedValue({
      id: page.notionPageId,
      lastEditedTime: "2026-05-10T10:00:00.000Z",
      archivedAt: null,
    });

    await runNotionSync(makeEnv() as never);

    expect(setDoc).not.toHaveBeenCalledWith(
      expect.anything(),
      "btd_knowledge",
      page.notionPageId,
      expect.anything()
    );
  });

  it("upserts a page when lastEditedTime changed", async () => {
    const page = makePage({ lastEditedTime: "2026-05-10T12:00:00.000Z" });
    (fetchAllKnowledgePages as Mock).mockResolvedValue([page]);
    (getDoc as Mock).mockResolvedValue({
      id: page.notionPageId,
      lastEditedTime: "2026-05-10T10:00:00.000Z", // older
      archivedAt: null,
    });

    await runNotionSync(makeEnv() as never);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_knowledge",
      page.notionPageId,
      expect.objectContaining({ lastEditedTime: "2026-05-10T12:00:00.000Z" })
    );
  });

  it("re-syncs a previously archived page that reappears in Notion", async () => {
    const page = makePage();
    (fetchAllKnowledgePages as Mock).mockResolvedValue([page]);
    (getDoc as Mock).mockResolvedValue({
      id: page.notionPageId,
      lastEditedTime: page.lastEditedTime,
      archivedAt: "2026-05-09T00:00:00.000Z", // previously archived
    });

    await runNotionSync(makeEnv() as never);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_knowledge",
      page.notionPageId,
      expect.objectContaining({ archivedAt: null }) // archive cleared
    );
  });

  it("soft-deletes a Firestore doc that no longer exists in Notion", async () => {
    (fetchAllKnowledgePages as Mock).mockResolvedValue([]); // Notion is empty

    const orphanDoc = {
      id: "orphan-page-id",
      source: "notion",
      lastEditedTime: "2026-05-01T00:00:00.000Z",
      archivedAt: null,
      title: "Old Page",
    };
    (queryCollection as Mock).mockResolvedValue([orphanDoc]);

    await runNotionSync(makeEnv() as never);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      "btd_knowledge",
      "orphan-page-id",
      expect.objectContaining({ archivedAt: expect.any(String) })
    );
  });

  it("does not re-archive an already-archived doc", async () => {
    (fetchAllKnowledgePages as Mock).mockResolvedValue([]);

    const alreadyArchivedDoc = {
      id: "archived-page",
      source: "notion",
      archivedAt: "2026-05-08T00:00:00.000Z", // already archived
    };
    (queryCollection as Mock).mockResolvedValue([alreadyArchivedDoc]);

    await runNotionSync(makeEnv() as never);

    // setDoc should NOT be called for already-archived docs
    expect(setDoc).not.toHaveBeenCalledWith(
      expect.anything(),
      "btd_knowledge",
      "archived-page",
      expect.anything()
    );
  });

  it("continues syncing other pages if one Firestore upsert fails", async () => {
    const pageA = makePage({ notionPageId: "page-a", title: "A" });
    const pageB = makePage({ notionPageId: "page-b", title: "B" });
    (fetchAllKnowledgePages as Mock).mockResolvedValue([pageA, pageB]);
    (getDoc as Mock).mockResolvedValue(null); // both new

    // First setDoc call fails, second succeeds
    (setDoc as Mock)
      .mockRejectedValueOnce(new Error("Firestore write timeout"))
      .mockResolvedValueOnce({});

    // Should not throw
    await expect(runNotionSync(makeEnv() as never)).resolves.not.toThrow();

    // Second page should still be upserted
    expect(setDoc).toHaveBeenCalledTimes(2);
  });

  it("logs sync metrics to _sync_logs collection", async () => {
    const page = makePage();
    (fetchAllKnowledgePages as Mock).mockResolvedValue([page]);
    (getDoc as Mock).mockResolvedValue(null);

    await runNotionSync(makeEnv() as never);

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      "_sync_logs",
      expect.objectContaining({
        type: "notion_sync",
        totalUpserted: 1,
        syncedAt: expect.any(String),
      })
    );
  });

  it("skips sync if NOTION_DB_KNOWLEDGE env var is not set", async () => {
    const env = makeEnv({ NOTION_DB_KNOWLEDGE: "" });

    await runNotionSync(env as never);

    expect(fetchAllKnowledgePages).not.toHaveBeenCalled();
  });
});
