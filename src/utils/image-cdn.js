// Image CDN helper — proxies R2 / external images through images.weserv.nl
// for on-the-fly resize + WebP/AVIF auto. Free, zero-config, well-cached.
//
// Why a wrapper: lets us swap proxy (wsrv → CF Worker → Vercel Image) by
// editing one file. Falls back to original URL if input isn't proxiable.

const WSRV = 'https://images.weserv.nl/?url='

// Skip proxy for: data URIs, relative paths, already-proxied URLs, SVG.
function shouldProxy(src) {
  if (!src) return false
  if (src.startsWith('data:')) return false
  if (src.startsWith('/')) return false
  if (src.includes('weserv.nl')) return false
  if (src.endsWith('.svg')) return false
  return true
}

/**
 * Build a CDN URL for a remote image.
 *
 * @param {string} src - source image URL
 * @param {object} opts
 * @param {number} [opts.w] - width in CSS pixels (DPR multiplier applied)
 * @param {number} [opts.q=78] - quality (0-100)
 * @param {number} [opts.dpr=2] - device pixel ratio
 * @returns {string} transformed URL, or original src if not proxiable
 */
export function cdnImage(src, opts = {}) {
  if (!shouldProxy(src)) return src
  const { w, q = 78, dpr = 2 } = opts
  // Strip protocol — wsrv accepts either, shorter URL.
  const cleaned = src.replace(/^https?:\/\//, '')
  const params = [`url=${encodeURIComponent(cleaned)}`, 'output=webp', `q=${q}`]
  if (w) params.push(`w=${Math.round(w * dpr)}`)
  return `${WSRV.split('?')[0]}?${params.join('&')}`
}
