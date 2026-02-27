
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    qrcode(),
  ],
  server: {
    host: true, // Allow access from network
    port: 5100,
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
