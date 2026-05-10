/**
 * POST /api/ai/ask — AI hỏi ngược SSE streaming endpoint.
 *
 * Flow:
 *   1. Verify Firebase auth token (uid extraction)
 *   2. Check Pro entitlement: btd_profiles/{uid}.proExpiresAt > now
 *   3. Check daily quota: KV_QUOTA key=quota:{uid}:{date}, default 100/day
 *   4. Truncate history to last 5 turns / ~2K tokens
 *   5. Stream Claude Sonnet 4.6 response via SSE
 *   6. Post-stream: run output classifier
 *   7. If flagged: log to btd_ai_flags + retry once with stronger system reminder
 *   8. Log usage to btd_ai_usage for billing telemetry
 */

import type { Context } from "hono";
import type { Env } from "./cloudflare-worker-env.js";
import {
  SYSTEM_PROMPT_V0_2,
  SYSTEM_PROMPT_VERSION,
  CLASSIFIER_RETRY_REMINDER,
  computeSystemPromptHash,
  SYSTEM_PROMPT_V0_2_SHA256,
} from "./ai-hokinguoc-system-prompt.js";
import {
  classifyAiResponse,
  buildFlagDocument,
} from "./ai-response-output-classifier.js";
import { getDoc, setDoc, addDoc } from "./firestore-rest-client.js";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

interface AskRequestBody {
  sessionId?: string;
  message: string;
  history?: ConversationTurn[];
}

interface AnthropicStreamEvent {
  type: string;
  delta?: { type: string; text?: string };
  usage?: { input_tokens: number; output_tokens: number };
  message?: { usage?: { input_tokens: number; output_tokens: number } };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const MAX_HISTORY_TURNS = 5; // server-enforced truncation
const APPROX_TOKENS_PER_CHAR = 0.4; // rough estimate for truncation
const MAX_HISTORY_TOKENS = 2000;

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Extract uid from Firebase ID token via Google tokeninfo endpoint.
 * Lightweight — no JWT library needed; trades one extra RTT for simplicity.
 * For production: switch to local JWT verify using JWKS (like api worker does).
 */
async function extractUidFromBearerToken(
  authHeader: string | undefined
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { sub?: string; error?: string };
    return data.sub ?? null;
  } catch {
    return null;
  }
}

// ── Pro entitlement check ─────────────────────────────────────────────────────

async function checkProEntitlement(env: Env, uid: string): Promise<boolean> {
  const profile = await getDoc(env, "btd_profiles", uid);
  if (!profile) return false;

  const proExpiresAt = profile.proExpiresAt as string | null;
  if (!proExpiresAt) return false;

  return new Date(proExpiresAt) > new Date();
}

// ── Daily quota check ─────────────────────────────────────────────────────────

function todayKey(uid: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `quota:${uid}:${date}`;
}

async function checkAndIncrementQuota(
  env: Env,
  uid: string
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const limit = parseInt(env.AI_DAILY_QUOTA ?? "100", 10);
  const key = todayKey(uid);

  const raw = await env.KV_QUOTA.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= limit) {
    return { allowed: false, count, limit };
  }

  // Increment with TTL of 25h to auto-expire
  await env.KV_QUOTA.put(key, String(count + 1), { expirationTtl: 90000 });
  return { allowed: true, count: count + 1, limit };
}

// ── History truncation ────────────────────────────────────────────────────────

function truncateHistory(history: ConversationTurn[]): ConversationTurn[] {
  // Keep last MAX_HISTORY_TURNS turns
  const turns = history.slice(-MAX_HISTORY_TURNS);

  // Also truncate by approximate token count
  let totalChars = 0;
  const result: ConversationTurn[] = [];
  for (let i = turns.length - 1; i >= 0; i--) {
    totalChars += turns[i].content.length;
    if (totalChars * APPROX_TOKENS_PER_CHAR > MAX_HISTORY_TOKENS) break;
    result.unshift(turns[i]);
  }
  return result;
}

// ── Anthropic streaming call ──────────────────────────────────────────────────

async function callAnthropicStream(
  apiKey: string,
  messages: ConversationTurn[],
  systemPrompt: string,
  maxTokens: number
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  if (!res.body) throw new Error("Anthropic returned no response body");
  return res.body;
}

/**
 * Call Anthropic without streaming — used for retry after classifier flag.
 * Returns full response text.
 */
async function callAnthropicSync(
  apiKey: string,
  messages: ConversationTurn[],
  systemPrompt: string,
  maxTokens: number
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
    usage: { input_tokens: number; output_tokens: number };
  };

  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");

  return {
    text,
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
  };
}

// ── SSE helpers ───────────────────────────────────────────────────────────────

function sseEvent(event: string, data: string): string {
  return `event: ${event}\ndata: ${data}\n\n`;
}

// ── Usage logging ─────────────────────────────────────────────────────────────

async function logUsage(
  env: Env,
  uid: string,
  sessionId: string,
  inputTokens: number,
  outputTokens: number,
  flagged: boolean
): Promise<void> {
  try {
    await addDoc(env, "btd_ai_usage", {
      uid,
      sessionId,
      model: CLAUDE_MODEL,
      promptVersion: SYSTEM_PROMPT_VERSION,
      inputTokens,
      outputTokens,
      flagged,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Non-fatal: billing log failure should not break user response
    console.error("[ai-ask] Failed to log usage to Firestore");
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function handleAiAsk(c: Context<{ Bindings: Env }>): Promise<Response> {
  const env = c.env;

  // 0. Verify system prompt integrity at request time (cheap crypto.subtle call)
  if (SYSTEM_PROMPT_V0_2_SHA256 !== "PENDING_LOCK_AFTER_FIRST_RUN") {
    const actualHash = await computeSystemPromptHash();
    if (actualHash !== SYSTEM_PROMPT_V0_2_SHA256) {
      console.error(
        `[ai-ask] SYSTEM PROMPT INTEGRITY FAILURE: expected ${SYSTEM_PROMPT_V0_2_SHA256}, got ${actualHash}`
      );
      return c.json({ error: "System prompt integrity check failed" }, 500);
    }
  }

  // 1. Auth
  const uid = await extractUidFromBearerToken(c.req.header("Authorization"));
  if (!uid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 2. Pro entitlement check (server-side, no client trust)
  const isPro = await checkProEntitlement(env, uid);
  if (!isPro) {
    return c.json(
      { error: "Pro subscription required", code: "PRO_REQUIRED" },
      403
    );
  }

  // 3. Daily quota
  const quota = await checkAndIncrementQuota(env, uid);
  if (!quota.allowed) {
    return c.json(
      {
        error: "Daily request limit reached",
        code: "QUOTA_EXCEEDED",
        limit: quota.limit,
        resetAt: "midnight UTC",
      },
      429
    );
  }

  // 4. Parse body
  let body: AskRequestBody;
  try {
    body = await c.req.json<AskRequestBody>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
    return c.json({ error: "message is required" }, 400);
  }

  if (body.message.length > 2000) {
    return c.json({ error: "message too long (max 2000 chars)" }, 400);
  }

  const sessionId = body.sessionId ?? crypto.randomUUID();
  const maxOutputTokens = parseInt(env.AI_MAX_OUTPUT_TOKENS ?? "800", 10);

  // 5. Build messages array with truncated history
  const history = truncateHistory(body.history ?? []);
  const messages: ConversationTurn[] = [
    ...history,
    { role: "user", content: body.message.trim() },
  ];

  // 6. Stream response via SSE
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  let inputTokens = 0;
  let outputTokens = 0;
  let flagged = false;

  // Run stream in background — return SSE response immediately
  (async () => {
    try {
      const stream = await callAnthropicStream(
        env.ANTHROPIC_API_KEY,
        messages,
        SYSTEM_PROMPT_V0_2,
        maxOutputTokens
      );

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let bufferedResponse = "";
      let streamBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;

          let event: AnthropicStreamEvent;
          try {
            event = JSON.parse(dataStr) as AnthropicStreamEvent;
          } catch {
            continue;
          }

          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            const text = event.delta.text ?? "";
            bufferedResponse += text;
            await writer.write(encoder.encode(sseEvent("delta", JSON.stringify({ text }))));
          }

          if (event.type === "message_delta" && event.usage) {
            outputTokens = event.usage.output_tokens;
          }

          if (event.type === "message_start" && event.message?.usage) {
            inputTokens = event.message.usage.input_tokens;
          }
        }
      }

      // 7. Post-stream classifier
      const classResult = classifyAiResponse(bufferedResponse);

      if (classResult.flagged) {
        flagged = true;
        console.warn(`[ai-ask] Classifier flagged response for uid=${uid}: ${classResult.reason}`);

        // Log flag to Firestore (non-blocking)
        addDoc(env, "btd_ai_flags", buildFlagDocument({
          uid,
          sessionId,
          userMessage: body.message,
          aiResponse: bufferedResponse,
          classifierResult: classResult,
        })).catch(() => {});

        // Retry once with stronger system reminder (non-streaming for simplicity)
        const retrySystem = `${CLASSIFIER_RETRY_REMINDER}\n\n${SYSTEM_PROMPT_V0_2}`;
        const retryMessages: ConversationTurn[] = [
          ...messages,
          { role: "assistant", content: bufferedResponse },
          {
            role: "user",
            content: "Hãy thử lại — chỉ hỏi, không trả lời.",
          },
        ];

        const retry = await callAnthropicSync(
          env.ANTHROPIC_API_KEY,
          retryMessages,
          retrySystem,
          maxOutputTokens
        );

        outputTokens += retry.outputTokens;
        inputTokens += retry.inputTokens;

        // Send retry response as a replacement delta
        await writer.write(
          encoder.encode(sseEvent("retry", JSON.stringify({ text: retry.text })))
        );
      }

      await writer.write(
        encoder.encode(
          sseEvent(
            "done",
            JSON.stringify({ sessionId, inputTokens, outputTokens, flagged })
          )
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[ai-ask] Stream error for uid=${uid}: ${message}`);
      await writer.write(
        encoder.encode(sseEvent("error", JSON.stringify({ error: message })))
      );
    } finally {
      await writer.close();
      // Log usage (non-blocking)
      logUsage(env, uid, sessionId, inputTokens, outputTokens, flagged).catch(() => {});
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Session-Id": sessionId,
      "X-Quota-Remaining": String(quota.limit - quota.count),
    },
  });
}
