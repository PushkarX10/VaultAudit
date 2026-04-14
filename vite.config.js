import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

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
