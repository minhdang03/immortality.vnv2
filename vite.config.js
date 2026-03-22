import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk — React renders while this loads async
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/analytics'],
          react: ['react', 'react-dom'],
        }
      }
    },
    target: 'es2020'
  }
})
