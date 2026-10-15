import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/// <reference types="vitest/config" />

const repoRoot = path.resolve(__dirname, '../..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '')
  const apiProxyTarget = env.SPENNY_API_HTTP_URL?.trim() || 'http://127.0.0.1:5050'

  return {
    envDir: repoRoot,
    esbuild: {
      jsx: 'automatic',
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '@/test', replacement: path.resolve(__dirname, './test/support') },
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/support/setup.ts'],
      include: ['test/**/*.test.{ts,tsx}'],
    },
    server: {
      // When VITE_API_BASE_URL is unset, the client calls same-origin /api/* and Vite forwards to Spenny.Api.
      proxy: {
        '/api': {
          target: apiProxyTarget,
          // Keep the browser Host (localhost:5173) so the API builds OAuth redirect URIs on the SPA origin.
          changeOrigin: false,
        },
      },
    },
  }
})
