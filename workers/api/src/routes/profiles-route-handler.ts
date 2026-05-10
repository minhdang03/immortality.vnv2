/**
 * Profile route handlers.
 *
 * GET  /api/profiles/:uid  — public read (only public fields)
 * POST /api/profiles       — create profile on first auth (owner only, uid from token)
 * PATCH /api/profiles/me   — update own profile (isFounder + proExpiresAt blocked)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getDoc, setDoc, updateDoc } from "../lib/firestore-rest-client.js";
import { requireAuth } from "../middleware/firebase-auth-verify-middleware.js";
import { ProfileCreateSchema, ProfilePatchSchema } from "../schemas/profile-request-schemas.js";
import type { Env } from "../cloudflare-worker-env.js";
import type { VerifiedUser } from "../lib/firebase-id-token-verifier.js";

type Variables = { user: VerifiedUser };

const COLLECTION = "btd_profiles";

/** Fields returned on public profile read — no internal flags echoed. */
const PUBLIC_FIELDS = new Set([
  "id",
  "nickname",
  "avatarType",
  "avatarSeed",
  "photoUrl",
  "bio",
  "currentFocus",
  "createdAt",
  "updatedAt",
]);

function pickPublicFields(doc: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(doc).filter(([k]) => PUBLIC_FIELDS.has(k))
  );
}

/** BLOCKED fields: client can NEVER set these. Server-managed only. */
const SERVER_ONLY_FIELDS = ["isFounder", "proExpiresAt", "fcmTokens"] as const;

function stripServerOnlyFields(
  data: Record<string, unknown>
): Record<string, unknown> {
  const clean = { ...data };
  for (const field of SERVER_ONLY_FIELDS) {
    delete clean[field];
  }
  return clean;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** GET /api/profiles/:uid — public */
app.get("/:uid", async (c) => {
  const { uid } = c.req.param();
  const doc = await getDoc(c.env, COLLECTION, uid);
  if (!doc) {
    return c.json({ error: { code: "NOT_FOUND", message: "Profile not found" } }, 404);
  }
  return c.json(pickPublicFields(doc));
});

/** POST /api/profiles — create on first auth */
app.post(
  "/",
  requireAuth,
  zValidator("json", ProfileCreateSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    // Check profile doesn't already exist
    const existing = await getDoc(c.env, COLLECTION, user.uid);
    if (existing) {
      return c.json(pickPublicFields(existing), 200);
    }

    const now = new Date().toISOString();
    const profileData: Record<string, unknown> = {
      ...stripServerOnlyFields(body as Record<string, unknown>),
      uid: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    const doc = await setDoc(c.env, COLLECTION, user.uid, profileData);
    return c.json(pickPublicFields(doc), 201);
  }
);

/** PATCH /api/profiles/me — update own profile */
app.patch(
  "/me",
  requireAuth,
  zValidator("json", ProfilePatchSchema),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    const existing = await getDoc(c.env, COLLECTION, user.uid);
    if (!existing) {
      return c.json({ error: { code: "NOT_FOUND", message: "Profile not found — create it first via POST /api/profiles" } }, 404);
    }

    const partial: Record<string, unknown> = {
      ...stripServerOnlyFields(body as Record<string, unknown>),
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateDoc(c.env, COLLECTION, user.uid, partial);
    return c.json(pickPublicFields(updated));
  }
);

export { app as profilesRouter };
