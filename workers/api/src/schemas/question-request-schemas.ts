/**
 * Zod schemas for question and answer API request bodies.
 */

import { z } from "zod";

export const TrucSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const DepthTagSchema = z.enum(["co-ban", "di-sau", "nang-cao"]);

export const QuestionSortSchema = z.enum(["newest", "top"]).default("newest");

/** POST /api/questions */
export const QuestionCreateSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(4096),
  truc: TrucSchema,
  depthTag: DepthTagSchema,
  promotedFromMessageId: z.string().optional(),
});

/** GET /api/questions query params */
export const QuestionListQuerySchema = z.object({
  truc: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(TrucSchema)
    .optional(),
  depthTag: DepthTagSchema.optional(),
  sort: QuestionSortSchema,
  cursor: z.string().optional(),
  limit: z
    .string()
    .transform((v) => Math.min(parseInt(v, 10) || 20, 50))
    .optional()
    .default("20"),
});

/** PATCH /api/questions/:id/chosen-answer */
export const ChosenAnswerSchema = z.object({
  answerId: z.string().min(1),
});
