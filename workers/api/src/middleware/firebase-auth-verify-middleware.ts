/**
 * Hono middleware: verify Firebase ID token from Authorization: Bearer header.
 * Attaches verified user to Hono context as `c.get('user')`.
 * Returns 401 if token is missing or invalid.
 *
 * Usage:
 *   app.use('/api/protected/*', firebaseAuthMiddleware)
 *   // In route handler:
 *   const user = c.get('user')  // VerifiedUser | undefined
 */

import { createMiddleware } from "hono/factory";
import { verifyFirebaseIdToken, type VerifiedUser } from "../lib/firebase-id-token-verifier.js";
import type { Env } from "../cloudflare-worker-env.js";

type Variables = {
  user: VerifiedUser;
};

/**
 * Strict auth middleware — rejects unauthenticated requests with 401.
 * Use on routes that REQUIRE authentication.
 */
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Authorization header required" } }, 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Bearer token is empty" } }, 401);
  }

  try {
    const user = await verifyFirebaseIdToken(token, c.env);
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: { code: "UNAUTHENTICATED", message: "Invalid or expired token" } }, 401);
  }
});

/**
 * Optional auth middleware — parses token if present but does NOT reject
 * unauthenticated requests. Sets `c.get('user')` only when token is valid.
 * Use on public routes that optionally show personalized content.
 */
export const optionalAuth = createMiddleware<{
  Bindings: Env;
  Variables: Partial<Variables>;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const user = await verifyFirebaseIdToken(token, c.env);
        // Cast: Hono Variables typing requires exact match; partial set is safe here
        (c as Parameters<typeof requireAuth>[0]).set("user", user);
      } catch {
        // Invalid token on optional route — silently ignore, treat as anonymous
      }
    }
  }
  await next();
});
