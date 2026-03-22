import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Hide the inline HTML skeleton once React takes over
const htmlSkeleton = document.getElementById('root-skeleton')
if (htmlSkeleton) htmlSkeleton.classList.add('hide')
setTimeout(() => htmlSkeleton?.remove(), 300)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register Service Worker for app shell precaching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
