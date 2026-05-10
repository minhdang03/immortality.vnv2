/**
 * Zod schemas for Bất Tử Đạo REST API — request/response validation.
 * Shared across: workers/api (server-side), apps/mobile, apps/web (client-side).
 * Import these to validate API responses in mobile/web and requests in workers.
 */

import { z } from "zod";

// ── Primitive schemas ─────────────────────────────────────────────────────────

export const ISOTimestampSchema = z.string().datetime({ offset: true });

export const ChuNoSchema = z.enum([
  "thieu-hieu-biet",
  "ong-ba-lac-hau",
  "dinh-kien",
  "chu-no-giau-mat",
]).nullable();

export const DepthTagSchema = z.enum(["co-ban", "di-sau", "nang-cao"]);

export const TrucSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const VoteTargetTypeSchema = z.enum(["question", "answer"]);

// ── Profile schemas ───────────────────────────────────────────────────────────

export const CurrentFocusSchema = z.object({
  chuNo: ChuNoSchema,
  capLuyen: z.number().int().min(0).max(100),
  technique: z.string().max(100),
});

export const ProfileSchema = z.object({
  id: z.string(),
  nickname: z.string().min(2).max(30),
  avatarType: z.enum(["gradient", "photo"]),
  avatarSeed: z.string(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(200).optional(),
  currentFocus: CurrentFocusSchema.optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

export const ProfileCreateSchema = z.object({
  nickname: z.string().min(2).max(30),
  avatarType: z.enum(["gradient", "photo"]),
  avatarSeed: z.string().min(1).max(100),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(200).optional(),
  currentFocus: CurrentFocusSchema.optional(),
});

export const ProfilePatchSchema = ProfileCreateSchema.partial();

// ── Question schemas ──────────────────────────────────────────────────────────

export const QuestionSchema = z.object({
  id: z.string(),
  authorUid: z.string(),
  authorNickname: z.string(),
  title: z.string(),
  body: z.string(),
  truc: TrucSchema,
  depthTag: DepthTagSchema,
  voteCount: z.number().int().min(0),
  answerCount: z.number().int().min(0),
  chosenAnswerId: z.string().nullable().optional(),
  promotedFromMessageId: z.string().nullable().optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

export const QuestionSummarySchema = z.object({
  id: z.string(),
  authorNickname: z.string(),
  title: z.string(),
  truc: TrucSchema,
  depthTag: DepthTagSchema,
  answerCount: z.number().int().min(0),
  hasChosenAnswer: z.boolean(),
  createdAt: ISOTimestampSchema,
});

export const QuestionCreateSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(4096),
  truc: TrucSchema,
  depthTag: DepthTagSchema,
  promotedFromMessageId: z.string().optional(),
});

export const QuestionListQuerySchema = z.object({
  truc: TrucSchema.optional(),
  depthTag: DepthTagSchema.optional(),
  sort: z.enum(["newest", "top"]).default("newest"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const ChosenAnswerSchema = z.object({
  answerId: z.string().min(1),
});

// ── Answer schemas ────────────────────────────────────────────────────────────

export const AnswerSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  authorUid: z.string(),
  authorNickname: z.string(),
  body: z.string(),
  voteCount: z.number().int().min(0),
  isChosen: z.boolean(),
  createdAt: ISOTimestampSchema,
});

export const AnswerCreateSchema = z.object({
  body: z.string().min(10).max(4096),
});

// ── Vote schemas ──────────────────────────────────────────────────────────────

export const VoteCreateSchema = z.object({
  targetType: VoteTargetTypeSchema,
  targetId: z.string().min(1),
});

export const VoteResponseSchema = z.object({
  voted: z.literal(true),
  alreadyVoted: z.boolean(),
});

// ── Paginated response ────────────────────────────────────────────────────────

export function PaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
}

// ── Error schema ──────────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// ── Inferred types (convenience re-exports) ───────────────────────────────────

export type ProfileInput = z.infer<typeof ProfileCreateSchema>;
export type ProfilePatchInput = z.infer<typeof ProfilePatchSchema>;
export type QuestionInput = z.infer<typeof QuestionCreateSchema>;
export type AnswerInput = z.infer<typeof AnswerCreateSchema>;
export type VoteInput = z.infer<typeof VoteCreateSchema>;
