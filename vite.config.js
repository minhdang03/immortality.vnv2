import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // esnext targets modern browsers — smaller polyfills, faster parse.
    // Browsers <2 years old all support it; older fallback hits SW cache anyway.
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase core (app + firestore + auth) loads with first paint.
          // Analytics is dynamic-imported in firebase.js → Rollup auto-splits it.
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          react: ['react', 'react-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 700,
  }
})
