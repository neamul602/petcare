import { defineConfig, devices } from '@playwright/test';

const DEV = 'http://localhost:4321';
const PROD = 'http://localhost:4322';
const PRODUCTION_SPECS = /(pwa|performance)\.spec\.ts/;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'npm run dev -w @petcare/web',
      url: DEV,
      reuseExistingServer: true,
      timeout: 120_000,
      env: { ASTRO_TELEMETRY_DISABLED: '1' },
    },
    {
      // PWA and performance are measured on the production build, which has the service worker.
      command: 'npm run build && PORT=4322 HOST=127.0.0.1 node apps/web/dist/server/entry.mjs',
      url: PROD,
      reuseExistingServer: true,
      timeout: 180_000,
      env: { ASTRO_TELEMETRY_DISABLED: '1' },
    },
  ],
  projects: [
    {
      name: 'phone',
      testIgnore: PRODUCTION_SPECS,
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        baseURL: DEV,
      },
    },
    {
      name: 'desktop',
      testIgnore: PRODUCTION_SPECS,
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 }, baseURL: DEV },
    },
    {
      name: 'production',
      testMatch: PRODUCTION_SPECS,
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        baseURL: PROD,
        serviceWorkers: 'allow',
      },
    },
  ],
});
