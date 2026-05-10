/**
 * Output classifier for AI hỏi ngược responses.
 *
 * Post-stream guard: after Claude finishes, scan the buffered response for
 * forbidden patterns that indicate a direct answer slipped through.
 *
 * Two-tier check:
 *   1. Regex fast-path — catches obvious violations without extra API cost.
 *   2. If regex passes, optional Claude judge (disabled by default — cost $0.001/req).
 *
 * On flag: log to Firestore `btd_ai_flags` collection + signal caller to retry
 * with CLASSIFIER_RETRY_REMINDER injected into system prompt.
 */

export type ClassifierResult =
  | { flagged: false }
  | { flagged: true; reason: string; pattern: string };

/**
 * Patterns that indicate a declarative answer rather than a counter-question.
 * Ordered from most specific (high confidence) to broader (lower confidence).
 */
const FORBIDDEN_START_PATTERNS: RegExp[] = [
  /^Vâng[,\s]/i,
  /^Dạ[,\s]/i,
  /^Đây là/i,
  /^Đáp án (là|cho)/i,
  /^Theo /i,
  /^Có \d+ /i, // "Có 3 cách..."
  /^\d+\.\s/, // numbered list "1. ..."
  /^Bước \d/i, // "Bước 1..."
  /^Câu trả lời là/i,
  /^Tôi nghĩ rằng/i,
  /^Tôi cho rằng/i,
  /^Bạn nên/i,
  /^Anh nên/i,
  /^Chị nên/i,
  /^Hãy (làm|thực hiện|bắt đầu|cố gắng)/i,
  /^The answer is/i,
  /^Here (is|are)/i,
  /^You should/i,
];

/**
 * Body-level forbidden patterns — declarative statements in middle/end.
 * More lenient than start patterns to avoid false positives.
 */
const FORBIDDEN_BODY_PATTERNS: RegExp[] = [
  /\b(buông bỏ|giải thoát|niết bàn|nghiệp)\b/i, // Buddhist framing slipped through
  /\b(law of attraction|manifestation|mindset shift)\b/i, // self-help framing
];

/** Required: response must contain at least one question mark. */
function hasQuestionMark(text: string): boolean {
  // Match Vietnamese full-width "？" (U+FF1F) or ASCII "?"
  return /[?？]/.test(text);
}

/** Check if response exceeds maximum word count (proxy for rambling answer). */
function isOverLength(text: string, maxWords = 150): boolean {
  return text.trim().split(/\s+/).length > maxWords;
}

/**
 * Run the regex classifier against a completed AI response.
 * Returns flagged=true with reason if any violation found.
 */
export function classifyAiResponse(response: string): ClassifierResult {
  const trimmed = response.trim();

  // Must contain a question mark
  if (!hasQuestionMark(trimmed)) {
    return {
      flagged: true,
      reason: "Response contains no question mark — likely a declarative answer",
      pattern: "missing_question_mark",
    };
  }

  // Check start patterns
  for (const pattern of FORBIDDEN_START_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        flagged: true,
        reason: `Response starts with forbidden declarative pattern: ${pattern.source}`,
        pattern: pattern.source,
      };
    }
  }

  // Check body patterns
  for (const pattern of FORBIDDEN_BODY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        flagged: true,
        reason: `Response contains forbidden domain term: ${pattern.source}`,
        pattern: pattern.source,
      };
    }
  }

  // Over-length check
  if (isOverLength(trimmed)) {
    return {
      flagged: true,
      reason: "Response exceeds 150 words — likely contains explanatory content",
      pattern: "over_length",
    };
  }

  return { flagged: false };
}

/**
 * Build a Firestore `btd_ai_flags` document payload for a flagged response.
 * Caller writes this to Firestore for admin review queue.
 */
export function buildFlagDocument(params: {
  uid: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  classifierResult: ClassifierResult & { flagged: true };
}): Record<string, unknown> {
  return {
    uid: params.uid,
    sessionId: params.sessionId,
    userMessage: params.userMessage.slice(0, 500), // truncate PII-risk content
    aiResponse: params.aiResponse.slice(0, 1000),
    reason: params.classifierResult.reason,
    pattern: params.classifierResult.pattern,
    flaggedAt: new Date().toISOString(),
    reviewed: false,
  };
}
