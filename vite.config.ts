import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

// Backend packages live in src/backend/functions/node_modules; tests resolve them from there so vi.mock hits the copy the code loads.
const functionsEntry = fileURLToPath(new URL('./src/backend/functions/src/index.js', import.meta.url));
const backendDeps: Plugin = {
  name: 'backend-deps',
  enforce: 'pre',
  resolveId(id, importer, options) {
    if (!/^(firebase-functions|firebase-admin|@google-cloud\/)/.test(id) || importer === functionsEntry) return null;
    return this.resolve(id, functionsEntry, { ...options, skipSelf: true });
  },
};

export default defineConfig({
  base: '/', // Cloudflare Pages serves from the root
  plugins: [react(), backendDeps],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { sourcemap: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    include: ['tests/{unit,component,integration,parity}/**/*.test.{ts,tsx,js}'],
  },
});
