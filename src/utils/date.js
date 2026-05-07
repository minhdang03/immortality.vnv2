// Locale-aware date formatting for article/khaitri/story cards.
// Input is YYYY-MM-DD string; output e.g. "6 thg 5, 2026" / "May 6, 2026".

export function formatLocaleDate(dateStr, lang = 'vi') {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return dateStr
  const [, y, mm, dd] = m
  const d = new Date(Number(y), Number(mm) - 1, Number(dd))
  if (Number.isNaN(d.getTime())) return dateStr
  const locale = lang === 'en' ? 'en-US' : 'vi-VN'
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  } catch {
    return dateStr
  }
}
