import { useState, useEffect } from 'react'

export function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('fontSize') || '100', 10)
  })

  useEffect(() => {
    localStorage.setItem('fontSize', String(fontSize))
    document.documentElement.style.setProperty('--reader-scale', fontSize / 100)
  }, [fontSize])

  const increase = () => setFontSize(s => Math.min(s + 10, 150))
  const decrease = () => setFontSize(s => Math.max(s - 10, 80))
  const reset = () => setFontSize(100)

  return { fontSize, increase, decrease, reset }
}
