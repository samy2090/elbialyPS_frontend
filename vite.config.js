import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false, // Allow port fallback if 5173 is busy
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost',
      overlay: true // Show error overlay on screen
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  },
  build: {
    // Dashboard chunk is ~525 kB; warning threshold is 500 kB by default.
    // Raising limit avoids the warning; consider lazy-loading dashboard sections later to reduce size.
    chunkSizeWarningLimit: 600,
  },
})