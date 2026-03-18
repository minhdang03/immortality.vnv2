import { useEffect } from 'react'

function getSiteUrl() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://battudao.com'
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
 * Manage canonical URL and structured data for each page
 */
export function useSEO(page, selectedArticle, selectedTopic, lang, topics) {
  useEffect(() => {
    const canonical = window.location.href

    let link = document.querySelector('link[rel="canonical"]')
    if (link) {
      link.setAttribute('href', canonical)
    }

    // Update og:url
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical)

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
        name: 'Bất Tử Đạo',
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
    data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Bất Tử Đạo - Immortality',
      url: getSiteUrl(),
      description: 'Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.',
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
