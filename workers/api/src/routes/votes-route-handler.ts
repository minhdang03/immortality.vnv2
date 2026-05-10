/**
 * Vote route handler.
 *
 * POST /api/votes — up-only, idempotent vote.
 *
 * Idempotency: composite document ID = `{targetType}_{targetId}_{voterUid}`.
 * Firestore createOnly write: if doc exists → 200 (already voted, no increment).
 * If doc created → 201 + increment target voteCount via field transform.
 *
 * Anti-pattern: vote list is NEVER publicly readable (Firestore rules deny read).
 * No downvote. No vote removal.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getDoc,
  setDoc,
  incrementField,
} from "../lib/firestore-rest-client.js";
import { requireAuth } from "../middleware/firebase-auth-verify-middleware.js";
import { VoteCreateSchema } from "../schemas/answer-and-vote-request-schemas.js";
import type { Env } from "../cloudflare-worker-env.js";
import type { VerifiedUser } from "../lib/firebase-id-token-verifier.js";

type Variables = { user: VerifiedUser };

const VOTES_COLLECTION = "btd_votes";
const TARGET_COLLECTIONS: Record<string, string> = {
  question: "btd_questions",
  answer: "btd_answers",
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** POST /api/votes — idempotent up-vote */
app.post(
  "/",
  requireAuth,
  zValidator("json", VoteCreateSchema),
  async (c) => {
    const user = c.get("user");
    const { targetType, targetId } = c.req.valid("json");

    // Validate target collection exists
    const targetCollection = TARGET_COLLECTIONS[targetType];
    if (!targetCollection) {
      return c.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid targetType" } },
        400
      );
    }

    // Composite doc ID — enforces one vote per user per target
    const voteId = `${targetType}_${targetId}_${user.uid}`;

    // Check for existing vote first — idempotent read before write
    const existing = await getDoc(c.env, VOTES_COLLECTION, voteId);
    if (existing) {
      return c.json({ voted: true, alreadyVoted: true }, 200);
    }

    // New vote — create doc then increment target voteCount atomically
    const voteData: Record<string, unknown> = {
      voterUid: user.uid,
      targetType,
      targetId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(c.env, VOTES_COLLECTION, voteId, voteData, { createOnly: true });
    await incrementField(c.env, targetCollection, targetId, "voteCount", 1);

    return c.json({ voted: true, alreadyVoted: false }, 201);
  }
);

export { app as votesRouter };
