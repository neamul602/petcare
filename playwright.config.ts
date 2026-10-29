import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4321', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -w @petcare/web',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  },
  projects: [
    {
      name: 'phone',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
  ],
});
