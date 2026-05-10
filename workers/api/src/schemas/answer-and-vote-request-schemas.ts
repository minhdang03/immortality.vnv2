/**
 * Zod schemas for answer and vote API request bodies.
 */

import { z } from "zod";

/** POST /api/questions/:id/answers */
export const AnswerCreateSchema = z.object({
  body: z.string().min(10).max(4096),
});

/** GET /api/answers query params */
export const AnswerListQuerySchema = z.object({
  qid: z.string().min(1),
  sort: z.enum(["newest", "top"]).default("top"),
});

/** POST /api/votes */
export const VoteCreateSchema = z.object({
  targetType: z.enum(["question", "answer"]),
  targetId: z.string().min(1),
});
