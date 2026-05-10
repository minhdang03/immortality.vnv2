import { useState, useEffect } from 'react'

// Admin can set default theme via siteSettings.defaultTheme ('dark' | 'light').
// Existing users with localStorage 'theme' are NOT overridden — only new/cleared visitors.
export function useTheme(defaultTheme) {
  const [dark, setDark] = useState(() => {
    // Trust the inline-bootstrap-set data-theme on <html> as initial state
    // (set in index.html before React mounts) — avoids flicker on first paint.
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    const domTheme = document.documentElement.getAttribute('data-theme')
    if (domTheme) return domTheme === 'dark'
    if (defaultTheme) return defaultTheme === 'dark'
    return false
  })

  // When siteSettings load async, apply admin default if user hasn't picked yet
  useEffect(() => {
    if (!defaultTheme) return
    if (localStorage.getItem('theme')) return
    setDark(defaultTheme === 'dark')
  }, [defaultTheme])

  useEffect(() => {
    const next = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    // Cache resolved theme so next F5 bootstrap can preset correct theme → no flash
    try { localStorage.setItem('theme:resolved', next) } catch (e) { /* private mode */ }
  }, [dark])

  const toggle = () => {
    setDark(d => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return { dark, toggle }
}
