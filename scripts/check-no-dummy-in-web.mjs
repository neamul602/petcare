#!/usr/bin/env node
/**
 * The web app never talks to external or Dummy systems directly (DR-22): only the API does,
 * through its ports. Fails if web source mentions the Dummy service port, host or API paths.
 * Usage: node scripts/check-no-dummy-in-web.mjs [root]
 */
import { readFileSync } from 'node:fs';
import { listSourceFiles } from './lib/source-files.mjs';

const root = process.argv[2] ?? 'apps/web';
const FORBIDDEN = [
  /\b4100\b/,
  /DUMMY_(PORT|URL|HOST)/,
  /dummy-services/,
  /\/api\/(payments|payouts|otp|notifications|photos)\b/,
];

const offenders = [];
for (const file of listSourceFiles([root])) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of FORBIDDEN) {
    if (pattern.test(text)) offenders.push(`${file}: matches ${pattern}`);
  }
}

if (offenders.length) {
  console.error(`Web must not call Dummy services directly (DR-22):\n- ${offenders.join('\n- ')}`);
  process.exit(1);
}
console.log('Dummy-in-web check passed');
