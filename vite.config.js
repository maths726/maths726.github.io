import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/suivi-client/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Suivi Client - Mécanicien',
        short_name: 'Suivi Client',
        description: 'Application de suivi client pour travaux mécaniques',
        theme_color: '#16588E',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/suivi-client/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    testTimeout: 15000,
    hookTimeout: 15000,
    env: {
      NODE_ENV: 'test'
    },
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    }
  }
})
