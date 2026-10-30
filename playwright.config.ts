import { defineConfig, devices } from '@playwright/test';

const DEV = 'http://localhost:4321';
const PROD = 'http://localhost:4322';
const E2E_DATABASE = 'postgres://petcare:petcare@localhost:5433/petcare_e2e';
const PRODUCTION_SPECS = /(pwa|performance)\.spec\.ts/;
// These switch the shared Dummy gateway into failure modes, so they run alone, after everything else.
const MONEY_SPECS = /payment-failures\.spec\.ts/;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'retain-on-failure' },
  globalSetup: './tests/e2e/global-setup.ts',
  webServer: [
    {
      // PetCare API on its own end-to-end database (seeded by global-setup).
      command: 'npm run start -w @petcare/api',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        DATABASE_URL: E2E_DATABASE,
        API_PORT: '3000',
        DUMMY_URL: 'http://localhost:4100',
        OTP_SEND_LIMIT_MAX: '1000', // the browser tests send many codes to the same few numbers
      },
    },
    {
      // The Dummy SMS/OTP service the API talks to.
      command: 'npm run start -w @petcare/dummy-services',
      url: 'http://localhost:4100/health',
      reuseExistingServer: true,
      timeout: 60_000,
      env: { DUMMY_PORT: '4100' },
    },
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
      testIgnore: [PRODUCTION_SPECS, MONEY_SPECS],
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        baseURL: DEV,
      },
    },
    {
      name: 'desktop',
      testIgnore: [PRODUCTION_SPECS, MONEY_SPECS],
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 }, baseURL: DEV },
    },
    {
      name: 'money',
      testMatch: MONEY_SPECS,
      dependencies: ['phone', 'desktop', 'production'],
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        baseURL: DEV,
      },
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
