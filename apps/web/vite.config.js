import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // .env lives at the monorepo root so all packages share one source of truth.
  envDir: '../../',
  build: {
    // esnext targets modern browsers — smaller polyfills, faster parse.
    // Browsers <2 years old all support it; older fallback hits SW cache anyway.
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 700,
  }
})
