import { defineConfig, devices } from '@playwright/test';

// Signed-in specs against the Firebase emulators and the Vite dev server (emulator mode is dev-only on purpose).
// Run via npm run test:e2e:signedin, which starts the emulators first. Needs Java.
const PORT = 4174;
export default defineConfig({
  testDir: '../tests/e2e',
  testMatch: 'signedin.spec.ts',
  outputDir: '../test-results',
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    cwd: '..',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    env: {
      VITE_USE_EMULATORS: 'true',
      VITE_FIREBASE_API_KEY: 'demo-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'demo-mms.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-mms',
      VITE_FIREBASE_APP_ID: 'demo-app',
    },
  },
});
