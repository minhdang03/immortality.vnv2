/**
 * Hono global error handler middleware.
 * Normalizes all thrown errors to { error: { code, message } } JSON responses.
 * Prevents stack traces leaking to clients in production.
 */

import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { Env } from "../cloudflare-worker-env.js";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function buildErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ErrorResponse {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

/**
 * Register as Hono app.onError handler:
 *   app.onError(globalErrorHandler)
 */
export function globalErrorHandler(
  err: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  c: Context<any>
): Response {
  const env = (c.env as Env | undefined);
  const isDev = env?.ENV === "development";

  // Hono HTTP exceptions (thrown by routes with c.json(..., status))
  if (err instanceof HTTPException) {
    return c.json(
      buildErrorResponse("HTTP_ERROR", err.message),
      err.status
    );
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      buildErrorResponse(
        "VALIDATION_ERROR",
        "Request validation failed",
        err.flatten().fieldErrors
      ),
      400
    );
  }

  // Auth errors
  if (err instanceof Error && err.message.includes("token")) {
    return c.json(
      buildErrorResponse("UNAUTHENTICATED", "Invalid or expired token"),
      401
    );
  }

  // Unknown errors — log in dev, generic in prod
  console.error("[BTD API Error]", err);
  const message =
    isDev && err instanceof Error ? err.message : "Internal server error";
  return c.json(buildErrorResponse("INTERNAL_ERROR", message), 500);
}
