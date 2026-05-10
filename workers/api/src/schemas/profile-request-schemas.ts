/**
 * Zod schemas for profile API request bodies.
 * Used in route validation and shared via @btd/shared for mobile/web clients.
 */

import { z } from "zod";

export const ChuNoSchema = z.enum([
  "thieu-hieu-biet",
  "ong-ba-lac-hau",
  "dinh-kien",
  "chu-no-giau-mat",
]);

export const CurrentFocusSchema = z.object({
  chuNo: ChuNoSchema.nullable(),
  capLuyen: z.number().int().min(0).max(100),
  technique: z.string().max(100),
});

/** Fields the client is allowed to set on profile create/update. */
export const ProfileWritableSchema = z.object({
  nickname: z.string().min(2).max(30),
  avatarType: z.enum(["gradient", "photo"]),
  avatarSeed: z.string().min(1).max(100),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(200).optional(),
  currentFocus: CurrentFocusSchema.optional(),
  fcmTokens: z.array(z.string()).max(5).optional(),
});

/** PATCH /api/profiles/me — all fields optional */
export const ProfilePatchSchema = ProfileWritableSchema.partial();

/** POST /api/profiles — create profile on first auth */
export const ProfileCreateSchema = ProfileWritableSchema;
