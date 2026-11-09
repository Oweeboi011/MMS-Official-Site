import { defineConfig, devices } from '@playwright/test';

// Run via npm run test:e2e (-c .config/playwright.config.ts); paths are relative to this file.
// E2E runs against the production build (vite preview). Chromium only to keep it fast.
export default defineConfig({
  testDir: '../tests/e2e',
  outputDir: '../test-results',
  fullyParallel: true,
  workers: 2, // more parallel tabs overload `vite preview` locally (goto aborts)
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run build && npm run preview', cwd: '..', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
});
