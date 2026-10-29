import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/**/src/**/*.test.ts',
      'apps/api/src/**/*.test.ts',
      'apps/dummy-services/src/**/*.test.ts',
      'scripts/**/*.test.mjs',
    ],
    environment: 'node',
    env: { NODE_ENV: 'test' },
    testTimeout: 20_000,
  },
});
