import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/checkers/',
  plugins: [
    react()
  ],
  server: {
    host: true, // Allow access from network
    port: 5174,
    strictPort: true,
  },
  define: {
    // Polyfill for Pi SDK which expects Node.js globals
    'global': 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define global for esbuild
      define: {
        global: 'globalThis'
      }
    }
  }
})
