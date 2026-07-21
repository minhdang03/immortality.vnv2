/**
 * useReadingTracker — per-paragraph reading analytics via IntersectionObserver.
 *
 * Behaviour:
 *  - Observes all [data-para] elements within `containerRef`.
 *  - Records first-seen timestamp per paragraph; on leave computes dwell_ms.
 *  - Sets reached_end = true when the last paragraph becomes visible.
 *  - Buffers all events in a ref (no per-paragraph network call).
 *  - Flushes once on `visibilitychange → hidden` or `beforeunload` via
 *    supabase.from('reading_events').insert(batch). RLS allows anon INSERT.
 *  - sendBeacon fallback not used here because Supabase JS doesn't expose a
 *    beacon transport; single insert on exit is sufficient (analytics, not billing).
 *
 * @param {string|null} contentId - Supabase content.id for the current article
 * @param {React.RefObject} containerRef - ref to the article body container
 */
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase-client'
import { getReadingSessionId } from '../lib/reading-session'

/** Flush the buffer to Supabase. Fire-and-forget; errors logged, not thrown. */
async function flushEvents(buffer, contentId) {
  if (!supabase || !contentId || buffer.length === 0) return
  const sessionId = getReadingSessionId()
  const rows = buffer.map(ev => ({
    content_id: contentId,
    session_id: sessionId,
    para_index: ev.paraIndex,
    dwell_ms: ev.dwellMs,
    reached_end: ev.reachedEnd,
  }))
  try {
    const { error } = await supabase.from('reading_events').insert(rows)
    if (error) console.warn('[useReadingTracker] insert error', error.message)
  } catch (e) {
    console.warn('[useReadingTracker] flush error', e)
  }
}

export function useReadingTracker(contentId, containerRef) {
  // buffer: Array<{ paraIndex, dwellMs, reachedEnd }>
  const bufferRef = useRef([])
  // entryTimes: Map<paraIndex, timestamp> — when each para first entered viewport
  const entryTimesRef = useRef(new Map())
  const flushedRef = useRef(false)
  const contentIdRef = useRef(contentId)

  useEffect(() => { contentIdRef.current = contentId }, [contentId])

  useEffect(() => {
    if (!contentId) return

    // Reset state for new content
    bufferRef.current = []
    entryTimesRef.current = new Map()
    flushedRef.current = false

    const container = containerRef?.current
    if (!container) return

    const paras = Array.from(container.querySelectorAll('[data-para]'))
    if (paras.length === 0) return

    const lastParaIndex = paras.reduce((max, el) => {
      const idx = Number(el.dataset.para)
      return isNaN(idx) ? max : Math.max(max, idx)
    }, -1)

    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now()
        for (const entry of entries) {
          const paraIndex = Number(entry.target.dataset.para)
          if (isNaN(paraIndex)) continue

          if (entry.isIntersecting) {
            // Para entered viewport — record entry time
            entryTimesRef.current.set(paraIndex, now)
          } else {
            // Para left viewport — compute dwell and buffer event
            const enteredAt = entryTimesRef.current.get(paraIndex)
            if (enteredAt == null) continue
            const dwellMs = now - enteredAt
            entryTimesRef.current.delete(paraIndex)
            // Only record if dwell ≥ 300ms (filter accidental scrolls)
            if (dwellMs < 300) continue
            bufferRef.current.push({
              paraIndex,
              dwellMs,
              reachedEnd: paraIndex === lastParaIndex,
            })
          }
        }
      },
      { threshold: 0.5 } // paragraph must be 50% visible to count
    )

    paras.forEach(el => observer.observe(el))

    const doFlush = () => {
      if (flushedRef.current) return
      flushedRef.current = true
      // Capture any paragraphs still in viewport at flush time
      const now = Date.now()
      for (const [paraIndex, enteredAt] of entryTimesRef.current.entries()) {
        const dwellMs = now - enteredAt
        if (dwellMs >= 300) {
          bufferRef.current.push({
            paraIndex,
            dwellMs,
            reachedEnd: paraIndex === lastParaIndex,
          })
        }
      }
      flushEvents(bufferRef.current, contentIdRef.current)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') doFlush()
    }
    const onBeforeUnload = () => doFlush()

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', onBeforeUnload)
      // Flush on component unmount (SPA navigation away from article)
      doFlush()
    }
  }, [contentId]) // re-run when navigating to different article
}
