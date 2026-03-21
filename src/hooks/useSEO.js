import { useEffect } from 'react'

function getSiteUrl() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://battudao.com'
}

function isImmortality() {
  return typeof window !== 'undefined' && window.location.hostname.includes('immortality.vn')
}

const OG_DEFAULTS = {
  battudao: {
    title: 'Bất Tử Đạo - Immortality | Trí Tuệ Người Việt Nam',
    description: 'Nếu có thể tự lựa chọn cho mình một cuộc sống bất tử, sung sướng hay là chết, thì bạn có lựa chọn nào cho chính mình hay không?',
    siteName: 'BẤT TỬ ĐẠO',
    locale: 'vi_VN',
  },
  immortality: {
    title: 'Immortality - The Path of Eternal Wisdom',
    description: 'Discover the light within you — a healing journey from ancient Vietnamese wisdom. Solar energy, meditation, and cosmic intelligence.',
    siteName: 'IMMORTALITY',
    locale: 'en_US',
  },
}

/**
 * Update all OG meta tags based on current domain
 */
function updateOGMeta({ title, description, image, url }) {
  const setMeta = (selector, value) => {
    const el = document.querySelector(selector)
    if (el) el.setAttribute('content', value)
  }

  const defaults = isImmortality() ? OG_DEFAULTS.immortality : OG_DEFAULTS.battudao
  const ogTitle = title || defaults.title
  const ogDesc = description || defaults.description
  const ogImage = image || `${getSiteUrl()}/og-image.png`
  const ogUrl = url || window.location.href

  // Open Graph
  setMeta('meta[property="og:title"]', ogTitle)
  setMeta('meta[property="og:description"]', ogDesc)
  setMeta('meta[property="og:image"]', ogImage)
  setMeta('meta[property="og:url"]', ogUrl)
  setMeta('meta[property="og:site_name"]', defaults.siteName)
  setMeta('meta[property="og:locale"]', defaults.locale)

  // Twitter Card
  setMeta('meta[name="twitter:title"]', ogTitle)
  setMeta('meta[name="twitter:description"]', ogDesc)
  setMeta('meta[name="twitter:image"]', ogImage)

  // Page title & description
  document.title = ogTitle
  setMeta('meta[name="description"]', ogDesc)
}

/**
 * Update canonical and og:url to match current browser URL
 */
export function updateCanonical() {
  const url = window.location.href
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
}

/**
 * Manage canonical URL, OG tags, and structured data for each page
 */
export function useSEO(page, selectedArticle, selectedTopic, lang, topics) {
  useEffect(() => {
    const canonical = window.location.href

    let link = document.querySelector('link[rel="canonical"]')
    if (link) {
      link.setAttribute('href', canonical)
    }

    // Update OG tags based on page context
    if (page === 'article' && selectedArticle) {
      const d = selectedArticle[lang]
      if (d) {
        updateOGMeta({
          title: d.title,
          description: d.summary || d.question || '',
          url: canonical,
        })
      }
    } else {
      updateOGMeta({ url: canonical })
    }

    // Update hreflang (vi/en)
    updateHreflang(canonical)

    // Structured data (JSON-LD)
    updateStructuredData(page, selectedArticle, lang, canonical)
  }, [page, selectedArticle, selectedTopic, lang])
}

function updateHreflang(canonical) {
  // Remove existing hreflang links
  document.querySelectorAll('link[hreflang]').forEach(el => el.remove())

  const viLink = document.createElement('link')
  viLink.rel = 'alternate'
  viLink.hreflang = 'vi'
  viLink.href = canonical

  const enLink = document.createElement('link')
  enLink.rel = 'alternate'
  enLink.hreflang = 'en'
  enLink.href = canonical

  const defaultLink = document.createElement('link')
  defaultLink.rel = 'alternate'
  defaultLink.hreflang = 'x-default'
  defaultLink.href = canonical

  document.head.append(viLink, enLink, defaultLink)
}

function updateStructuredData(page, article, lang, url) {
  // Remove existing JSON-LD
  document.querySelector('script[data-seo="jsonld"]')?.remove()

  let data

  if (page === 'article' && article) {
    const d = article[lang]
    if (!d) return

    data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: d.title,
      description: d.summary || '',
      url,
      inLanguage: lang === 'vi' ? 'vi-VN' : 'en-US',
      publisher: {
        '@type': 'Organization',
        name: isImmortality() ? 'Immortality' : 'Bất Tử Đạo',
        url: getSiteUrl()
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }
    }

    if (article.createdAt) {
      data.datePublished = new Date(article.createdAt.seconds ? article.createdAt.seconds * 1000 : article.createdAt).toISOString()
    }
    if (article.image) {
      data.image = article.image
    }
  } else {
    const defaults = isImmortality() ? OG_DEFAULTS.immortality : OG_DEFAULTS.battudao
    data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: defaults.title,
      url: getSiteUrl(),
      description: defaults.description,
      inLanguage: ['vi-VN', 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${getSiteUrl()}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.seo = 'jsonld'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}
