import { useState, useEffect } from 'react'

// Admin can set default theme via siteSettings.defaultTheme ('dark' | 'light').
// Existing users with localStorage 'theme' are NOT overridden — only new/cleared visitors.
export function useTheme(defaultTheme) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    if (defaultTheme) return defaultTheme === 'dark'
    return true
  })

  // When siteSettings load async, apply admin default if user hasn't picked yet
  useEffect(() => {
    if (!defaultTheme) return
    if (localStorage.getItem('theme')) return
    setDark(defaultTheme === 'dark')
  }, [defaultTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
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
