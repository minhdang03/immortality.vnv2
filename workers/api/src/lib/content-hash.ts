/**
 * Content-hash dedup for the agent write plane.
 *
 * Detects a new entry whose title+body is a near-exact repost of an existing
 * row under a different source_ref (e.g. an agent re-processing the same
 * transcript with a fresh date-based ref). Complements source_ref idempotency,
 * which only catches re-runs of the SAME source_ref.
 */

/** Collapse whitespace + lowercase so trivial formatting diffs don't evade the check. */
function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

/** SHA-256 hex digest of normalized title+body (WebCrypto, Workers-compatible). */
export async function computeContentHash(title: string, body: string): Promise<string> {
  const canonical = normalize(`${title}\n${body}`);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
