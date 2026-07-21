/**
 * Generate URL-friendly slug from Vietnamese text
 * "Phương pháp Phi Thuyền chữa mất ngủ" → "phuong-phap-phi-thuyen-chua-mat-ngu"
 */
const VIETNAMESE_MAP = {
  'à':'a','á':'a','ạ':'a','ả':'a','ã':'a','â':'a','ầ':'a','ấ':'a','ậ':'a','ẩ':'a','ẫ':'a','ă':'a','ằ':'a','ắ':'a','ặ':'a','ẳ':'a','ẵ':'a',
  'è':'e','é':'e','ẹ':'e','ẻ':'e','ẽ':'e','ê':'e','ề':'e','ế':'e','ệ':'e','ể':'e','ễ':'e',
  'ì':'i','í':'i','ị':'i','ỉ':'i','ĩ':'i',
  'ò':'o','ó':'o','ọ':'o','ỏ':'o','õ':'o','ô':'o','ồ':'o','ố':'o','ộ':'o','ổ':'o','ỗ':'o','ơ':'o','ờ':'o','ớ':'o','ợ':'o','ở':'o','ỡ':'o',
  'ù':'u','ú':'u','ụ':'u','ủ':'u','ũ':'u','ư':'u','ừ':'u','ứ':'u','ự':'u','ử':'u','ữ':'u',
  'ỳ':'y','ý':'y','ỵ':'y','ỷ':'y','ỹ':'y',
  'đ':'d',
}

export function toSlug(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .split('')
    .map(c => VIETNAMESE_MAP[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Get slug for an article — uses VI title as primary
 */
export function articleSlug(article) {
  const title = article?.vi?.title || article?.en?.title || ''
  return toSlug(title) || article.id
}

/**
 * Return { viSlug, enSlug } fields for Supabase — enables O(1) crawler lookup
 */
export function articleSlugFields(article) {
  return {
    viSlug: toSlug(article?.vi?.title),
    enSlug: toSlug(article?.en?.title),
  }
}

/**
 * Get slug for a story — uses order + VI title
 * e.g. "01-thoat-chet-duoi-duoi-ao-nuoc"
 */
export function storySlug(story) {
  const num = String(story.order || 1).padStart(2, '0')
  const title = story.titleVi || story.titleEn || ''
  const slug = toSlug(title)
  return slug ? `${num}-${slug}` : num
}

/**
 * Get slug for a Khai Trí Q&A item — uses order + VI title
 */
export function khaitriSlug(item) {
  const num = String(item.order || 1).padStart(2, '0')
  const title = item.vi?.title || item.en?.title || ''
  const slug = toSlug(title)
  return slug ? `${num}-${slug}` : num
}

/**
 * Humanize a slug for display — "tam-linh" → "Tâm linh" guess fallback.
 * Used as last-resort label when topic doc has empty vi/en field.
 */
export function humanizeSlug(slug) {
  if (!slug) return ''
  return slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}
