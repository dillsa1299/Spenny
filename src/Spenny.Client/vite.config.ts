import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // When VITE_API_BASE_URL is unset, the client calls same-origin /api/* and Vite forwards to Spenny.Api.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
    },
  },
})
