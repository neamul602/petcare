/** Lists source files under the given roots, skipping dependencies and build output. */
import { readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.astro',
  'coverage',
  'test-results',
  'playwright-report',
  'drizzle',
]);
const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.astro', '.json', '.css']);

export function listSourceFiles(roots) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (SOURCE_EXT.has(extname(entry))) files.push(path);
    }
  };
  for (const root of roots) walk(root);
  return files;
}
