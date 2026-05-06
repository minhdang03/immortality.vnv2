// Server-side slug helpers — mirror src/utils/slug.js so API can stamp viSlug/enSlug.
// Keep in sync with src/utils/slug.js + functions/index.js (toSlug must be identical).

const VI_MAP = 'àáạảãâầấậẩẫăằắặẳẵ→a,èéẹẻẽêềếệểễ→e,ìíịỉĩ→i,òóọỏõôồốộổỗơờớợởỡ→o,ùúụủũưừứựửữ→u,ỳýỵỷỹ→y,đ→d'
const SLUG_MAP = {}
VI_MAP.split(',').forEach(group => {
  const [chars, to] = group.split('→')
  for (const c of chars) SLUG_MAP[c] = to
})

export function toSlug(str) {
  if (!str) return ''
  return str.toLowerCase().split('').map(c => SLUG_MAP[c] || c).join('')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function articleSlugFields(article) {
  return {
    viSlug: toSlug(article?.vi?.title) || '',
    enSlug: toSlug(article?.en?.title) || '',
  }
}
