/**
 * reading-session.js — ephemeral anonymous session id for reading analytics.
 *
 * session_id is stored in sessionStorage (cleared on tab close).
 * It carries NO user identity or PII — it's a random UUID used only to
 * group paragraph events from the same reading session for drop-off analysis.
 *
 * Re-generated on each browser tab open. Not persisted to localStorage.
 */

const SESSION_KEY = 'btd_reading_sid'

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/** Get or create the anonymous session id for this tab. */
export function getReadingSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = generateId()
      sessionStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    // sessionStorage blocked (private mode edge case) — return a one-off id
    return generateId()
  }
}
