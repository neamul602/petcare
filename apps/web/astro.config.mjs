// @ts-check
import node from '@astrojs/node';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Pages render on the server so the language cookie (pc_locale) decides the language
// without client-side JavaScript; only interactive parts are Preact islands.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
  vite: { plugins: [tailwindcss()] },
  server: { port: 4321, host: true },
});
