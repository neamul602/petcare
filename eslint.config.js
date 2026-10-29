import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.specsmd/**',
      '.claude/**',
      'docs/**',
      'memory-bank/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/drizzle/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
);
