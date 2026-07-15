/**
 * Format a millisecond reading duration for the admin analytics tables.
 * Raw ms ("37590") is unreadable at a glance — render as "38 giây" / "1 phút 13 giây".
 */
export function formatDwell(ms, lang) {
  if (ms == null) return '—'
  const total = Number(ms)
  if (!Number.isFinite(total) || total < 0) return '—'

  const vi = lang === 'vi'

  // Sub-second dwells are real signal (a paragraph scrolled past), so keep one decimal.
  if (total < 1000) {
    const s = (total / 1000).toFixed(1)
    return vi ? `${s.replace('.', ',')} giây` : `${s}s`
  }

  const seconds = Math.round(total / 1000)
  if (seconds < 60) return vi ? `${seconds} giây` : `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (rest === 0) return vi ? `${minutes} phút` : `${minutes}m`
  return vi ? `${minutes} phút ${rest} giây` : `${minutes}m ${rest}s`
}
