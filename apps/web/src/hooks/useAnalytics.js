import { useEffect, useRef } from 'react'
import { logEvent } from '../lib/ga4-analytics'

/**
 * Track page views when page/article changes
 */
export function usePageView(page, selectedArticle, lang) {
  const prevPage = useRef(null)

  useEffect(() => {
    const pageName = page === 'article' && selectedArticle
      ? `article/${selectedArticle[lang]?.title || selectedArticle.id}`
      : page

    if (pageName === prevPage.current) return
    prevPage.current = pageName

    logEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      content_group: page,
      language: lang
    })
  }, [page, selectedArticle, lang])
}

/**
 * Track article reading behavior
 */
export function useArticleAnalytics(article, lang) {
  const startTime = useRef(null)

  useEffect(() => {
    if (!article) return
    startTime.current = Date.now()

    logEvent('article_view', {
      article_id: article.id,
      article_title: article[lang]?.title || '',
      article_topic: article.topic || '',
      language: lang
    })

    // Track scroll depth
    let maxScroll = 0
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      if (scrollPercent > maxScroll) maxScroll = scrollPercent

      // Log milestones: 25%, 50%, 75%, 100%
      if (maxScroll >= 25 && maxScroll < 50 && scrollPercent >= 25) {
        logEvent('scroll_depth', { depth: 25, article_id: article.id })
      }
      if (maxScroll >= 50 && maxScroll < 75 && scrollPercent >= 50) {
        logEvent('scroll_depth', { depth: 50, article_id: article.id })
      }
      if (maxScroll >= 75 && maxScroll < 100 && scrollPercent >= 75) {
        logEvent('scroll_depth', { depth: 75, article_id: article.id })
      }
      if (scrollPercent >= 98) {
        logEvent('scroll_depth', { depth: 100, article_id: article.id })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      // Track reading time on unmount
      if (startTime.current) {
        const readingTime = Math.round((Date.now() - startTime.current) / 1000)
        logEvent('article_read_time', {
          article_id: article.id,
          seconds: readingTime,
          max_scroll: maxScroll
        })
      }
    }
  }, [article?.id, lang])
}

/**
 * Track user interactions
 */
export function trackEvent(eventName, params = {}) {
  logEvent(eventName, params)
}

// Common tracking helpers
export const trackShare = (method, contentId) =>
  logEvent('share', { method, content_type: 'article', content_id: contentId })

export const trackSearch = (searchTerm, resultsCount) =>
  logEvent('search', { search_term: searchTerm, results_count: resultsCount })

export const trackThemeToggle = (theme) =>
  logEvent('theme_toggle', { theme })

export const trackLanguageChange = (language) =>
  logEvent('language_change', { language })

export const trackNavigation = (from, to) =>
  logEvent('navigation', { from_page: from, to_page: to })
