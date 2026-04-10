import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { getDeployPathConfig } from './src/lib/deployment-path'

// https://vite.dev/config/
const deployPath = getDeployPathConfig(process.env.GITHUB_PAGES_REPO)

export default defineConfig({
  base: deployPath.base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/earth-chat-192.svg',
        'icons/earth-chat-512.svg',
      ],
      manifest: {
        name: 'Earth Chat',
        short_name: 'Earth Chat',
        description: 'One global chat room for the world.',
        theme_color: '#0b0f0e',
        background_color: '#0b0f0e',
        display: 'standalone',
        scope: deployPath.scope,
        start_url: deployPath.startUrl,
        icons: [
          {
            src: 'icons/earth-chat-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/earth-chat-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
