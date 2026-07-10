import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'VaultAudit AI',
        short_name: 'VaultAudit',
        description: 'Privacy-first, offline-capable personal financial auditor with AI insights',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        share_target: {
          action: '/receive-share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'image',
                accept: ['image/*']
              }
            ]
          }
        }
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        importScripts: ['/share-target-sw.js'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },

  worker: {
    format: 'es',
  },
});
