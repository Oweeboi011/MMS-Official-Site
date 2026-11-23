import { defineConfig, devices } from '@playwright/test';

// Post-deploy smoke: the signed-out smoke spec against the live site (npm run test:smoke). SMOKE_URL overrides the target.
export default defineConfig({
  testDir: '../tests/e2e',
  testMatch: 'smoke.spec.ts',
  outputDir: '../test-results',
  retries: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: process.env.SMOKE_URL ?? 'https://www.metropolitanms.org', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
