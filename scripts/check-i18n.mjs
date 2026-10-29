#!/usr/bin/env node
/**
 * Bangla/English parity check (FR-47, NFR-12): fails if any message key exists in one
 * owner/provider catalog but not the other, or if a message is empty.
 * Usage: node scripts/check-i18n.mjs [catalogDir]
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'packages/shared/src/i18n';
const load = (name) => JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
const catalogs = { bn: load('bn'), en: load('en') };

const problems = [];
for (const [locale, other] of [
  ['bn', 'en'],
  ['en', 'bn'],
]) {
  for (const key of Object.keys(catalogs[locale])) {
    if (!(key in catalogs[other]))
      problems.push(`"${key}" exists in ${locale} but is missing in ${other}`);
    if (String(catalogs[locale][key]).trim() === '')
      problems.push(`"${key}" is empty in ${locale}`);
  }
}

if (problems.length) {
  console.error(`i18n parity check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`i18n parity check passed: ${Object.keys(catalogs.en).length} keys in bn and en`);
