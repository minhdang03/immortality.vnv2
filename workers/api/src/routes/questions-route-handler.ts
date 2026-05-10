/**
 * Question route handlers.
 *
 * GET  /api/questions               — public list, paginated, filter by truc/depthTag
 * POST /api/questions               — create (auth required)
 * GET  /api/questions/:id           — public detail with answers
 * POST /api/questions/:id/answers   — add answer (auth required)
 * PATCH /api/questions/:id/chosen-answer — mark chosen answer (question author only)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getDoc,
  setDoc,
  updateDoc,
  queryCollection,
  incrementField,
} from "../lib/firestore-rest-client.js";
import { requireAuth } from "../middleware/firebase-auth-verify-middleware.js";
import {
  QuestionCreateSchema,
  QuestionListQuerySchema,
  ChosenAnswerSchema,
} from "../schemas/question-request-schemas.js";
import { AnswerCreateSchema } from "../schemas/answer-and-vote-request-schemas.js";
import type { Env } from "../cloudflare-worker-env.js";
import type { VerifiedUser } from "../lib/firebase-id-token-verifier.js";

type Variables = { user: VerifiedUser };

const Q_COLLECTION = "btd_questions";
const A_COLLECTION = "btd_answers";

/** Generate a UUID — Workers supports crypto.randomUUID() globally */
function newId(): string {
  return crypto.randomUUID();
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** GET /api/questions — public list */
app.get(
  "/",
  zValidator("query", QuestionListQuerySchema),
  async (c) => {
    const { truc, depthTag, sort, limit } = c.req.valid("query");

    const where: Array<{ field: string; op: "EQUAL" | "NOT_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "ARRAY_CONTAINS"; value: unknown }> = [];
    if (truc !== undefined) where.push({ field: "truc", op: "EQUAL", value: truc });
    if (depthTag) where.push({ field: "depthTag", op: "EQUAL", value: depthTag });

    const orderBy: Array<{ field: string; direction?: "ASCENDING" | "DESCENDING" }> =
      sort === "top"
        ? [{ field: "voteCount", direction: "DESCENDING" }]
        : [{ field: "createdAt", direction: "DESCENDING" }];

    const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : (limit ?? 20);

    const items = await queryCollection(c.env, Q_COLLECTION, {
      where,
      orderBy,
      limit: parsedLimit,
    });

    // Anti-FOMO: strip vote counts from list view — only show in detail where context is clear
    const sanitized = items.map((q) => ({
      id: q["id"],
      authorNickname: q["authorNickname"],
      title: q["title"],
      truc: q["truc"],
      depthTag: q["depthTag"],
      answerCount: q["answerCount"] ?? 0,
      hasChosenAnswer: Boolean(q["chosenAnswerId"]),
      createdAt: q["createdAt"],
    }));

    return c.json({ items: sanitized, nextCursor: null });
  }
);

/** POST /api/questions — create */
app.post(
  "/",
  requireAuth,
  zValidator("json", QuestionCreateSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    // Fetch author profile for denormalized nickname
    const profile = await getDoc(c.env, "btd_profiles", user.uid);
    const authorNickname =
      typeof profile?.["nickname"] === "string"
        ? profile["nickname"]
        : "Ẩn danh";

    const id = newId();
    const now = new Date().toISOString();

    const questionData: Record<string, unknown> = {
      authorUid: user.uid,
      authorNickname,
      title: body.title,
      body: body.body,
      truc: body.truc,
      depthTag: body.depthTag,
      voteCount: 0,
      answerCount: 0,
      chosenAnswerId: null,
      promotedFromMessageId: body.promotedFromMessageId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const doc = await setDoc(c.env, Q_COLLECTION, id, questionData);
    return c.json(doc, 201);
  }
);

/** GET /api/questions/:id — public detail */
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const question = await getDoc(c.env, Q_COLLECTION, id);
  if (!question) {
    return c.json({ error: { code: "NOT_FOUND", message: "Question not found" } }, 404);
  }

  // Fetch answers for this question (sorted by voteCount desc)
  const answers = await queryCollection(c.env, A_COLLECTION, {
    where: [{ field: "questionId", op: "EQUAL", value: id }],
    orderBy: [{ field: "voteCount", direction: "DESCENDING" }],
    limit: 50,
  });

  return c.json({ question, answers });
});

/** POST /api/questions/:id/answers — add answer */
app.post(
  "/:id/answers",
  requireAuth,
  zValidator("json", AnswerCreateSchema),
  async (c) => {
    const user = c.get("user");
    const { id: questionId } = c.req.param();
    const body = c.req.valid("json");

    const question = await getDoc(c.env, Q_COLLECTION, questionId);
    if (!question) {
      return c.json({ error: { code: "NOT_FOUND", message: "Question not found" } }, 404);
    }

    const profile = await getDoc(c.env, "btd_profiles", user.uid);
    const authorNickname =
      typeof profile?.["nickname"] === "string" ? profile["nickname"] : "Ẩn danh";

    const answerId = newId();
    const now = new Date().toISOString();

    const answerData: Record<string, unknown> = {
      questionId,
      authorUid: user.uid,
      authorNickname,
      body: body.body,
      voteCount: 0,
      isChosen: false,
      createdAt: now,
    };

    const doc = await setDoc(c.env, A_COLLECTION, answerId, answerData);

    // Increment question answerCount
    await incrementField(c.env, Q_COLLECTION, questionId, "answerCount", 1);

    return c.json(doc, 201);
  }
);

/** PATCH /api/questions/:id/chosen-answer — question author only */
app.patch(
  "/:id/chosen-answer",
  requireAuth,
  zValidator("json", ChosenAnswerSchema),
  async (c) => {
    const user = c.get("user");
    const { id: questionId } = c.req.param();
    const { answerId } = c.req.valid("json");

    const question = await getDoc(c.env, Q_COLLECTION, questionId);
    if (!question) {
      return c.json({ error: { code: "NOT_FOUND", message: "Question not found" } }, 404);
    }

    if (question["authorUid"] !== user.uid) {
      return c.json({ error: { code: "FORBIDDEN", message: "Only the question author can choose an answer" } }, 403);
    }

    // Verify answer belongs to this question
    const answer = await getDoc(c.env, A_COLLECTION, answerId);
    if (!answer || answer["questionId"] !== questionId) {
      return c.json({ error: { code: "NOT_FOUND", message: "Answer not found for this question" } }, 404);
    }

    const now = new Date().toISOString();

    // Unmark previous chosen answer if any
    const prevChosenId = question["chosenAnswerId"];
    if (typeof prevChosenId === "string" && prevChosenId !== answerId) {
      await updateDoc(c.env, A_COLLECTION, prevChosenId, { isChosen: false });
    }

    // Mark new chosen answer
    await updateDoc(c.env, A_COLLECTION, answerId, { isChosen: true });

    // Update question
    const updated = await updateDoc(c.env, Q_COLLECTION, questionId, {
      chosenAnswerId: answerId,
      updatedAt: now,
    });

    return c.json(updated);
  }
);

export { app as questionsRouter };
