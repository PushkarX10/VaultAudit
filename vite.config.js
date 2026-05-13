import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'VaultAudit',
        short_name: 'VaultAudit',
        description: 'Privacy-first, offline-capable personal financial auditor',
        theme_color: '#ffffff',
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
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10MB to accommodate PGLite wasm
      }
    })
  ],

  // PGLite uses WASM modules that must be excluded from Vite's
  // dependency optimization to avoid bundling issues.
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },

  // ES module format required for PGLite multi-tab worker support.
  worker: {
    format: 'es',
  },
});
