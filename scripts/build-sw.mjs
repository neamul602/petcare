#!/usr/bin/env node
/* global caches -- used inside the generated service worker (a function body copied into sw.js) */
/**
 * Generates the Workbox service worker for the built web app (FND-04).
 *  - precaches the built styles, scripts, fonts, icons and manifest
 *  - pages you visit are cached (network first, 3 s, then cache) so they still open offline
 *  - admin pages and the language switch are never cached
 *  - a page never opened before falls back to /offline
 * Run after "astro build": node scripts/build-sw.mjs
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateSW } from 'workbox-build';

const root = process.argv[2] ?? 'apps/web/dist/client';

// Kept in a separate file so it can run inside the service worker next to the generated code.
writeFileSync(
  join(root, 'sw-offline.js'),
  `self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('petcare-offline').then((cache) => cache.add(new Request('/offline', { cache: 'reload' }))));
});
`,
);

const result = await generateSW({
  swDest: join(root, 'sw.js'),
  globDirectory: root,
  globPatterns: ['_astro/**/*.{js,css,woff2}', 'icons/*.{png,svg}', 'manifest.webmanifest'],
  importScripts: ['sw-offline.js'],
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  maximumFileSizeToCacheInBytes: 300 * 1024,
  runtimeCaching: [
    {
      urlPattern: ({ request, url }) =>
        request.mode === 'navigate' &&
        !url.pathname.startsWith('/admin') &&
        !url.pathname.startsWith('/locale'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'petcare-pages',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 40, maxAgeSeconds: 7 * 24 * 60 * 60 },
        plugins: [
          {
            handlerDidError: async () => {
              const cache = await caches.open('petcare-offline');
              return cache.match('/offline');
            },
          },
        ],
      },
    },
  ],
});

console.log(
  `Service worker written: ${result.count} files precached (${(result.size / 1024).toFixed(0)} KB)`,
);
for (const warning of result.warnings) console.warn(warning);
