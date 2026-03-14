import { useState, useEffect } from 'react'

export function useFontSize(defaultSize) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize')
    // If user has previously set a size, use it; otherwise use admin default or 100
    return saved ? parseInt(saved, 10) : (defaultSize || 100)
  })

  // Sync with admin default when it loads (only if user never set their own)
  useEffect(() => {
    if (defaultSize && !localStorage.getItem('fontSize')) {
      setFontSize(defaultSize)
    }
  }, [defaultSize])

  useEffect(() => {
    localStorage.setItem('fontSize', String(fontSize))
    document.documentElement.style.setProperty('--reader-scale', fontSize / 100)
  }, [fontSize])

  const increase = () => setFontSize(s => Math.min(s + 10, 150))
  const decrease = () => setFontSize(s => Math.max(s - 10, 80))
  const reset = () => {
    localStorage.removeItem('fontSize')
    setFontSize(defaultSize || 100)
  }

  return { fontSize, increase, decrease, reset }
}
