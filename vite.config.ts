import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const repoName = 'FollowLoseWieght'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repoName}/` : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'FollowLoseWieght',
        short_name: 'FollowLose',
        description: 'Suivi simple et objectif sur une durée.',
        theme_color: '#0B0B10',
        background_color: '#0B0B10',
        display: 'standalone',
        scope: `/${repoName}/`,
        start_url: `/${repoName}/`,
        icons: [
          { src: `/${repoName}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `/${repoName}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `/${repoName}/icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    }),
  ],
}))
