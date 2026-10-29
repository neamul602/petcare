#!/usr/bin/env node
/**
 * Training-decision values live in one module only (FND-05, coding standards). Fails if a
 * distinctive TD value appears in application source outside that module. Test files may
 * reference values on purpose and are skipped.
 * Usage: node scripts/check-config-literals.mjs [root ...]
 */
import { readFileSync } from 'node:fs';
import { listSourceFiles } from './lib/source-files.mjs';

const CONFIG_FILE = 'packages/shared/src/config/training-decisions.ts';
const config = readFileSync(CONFIG_FILE, 'utf8');

// Distinctive values: minute durations, basis points and local times written in the config.
const watched = new Set();
for (const [, value] of config.matchAll(/(?:Minutes|tierA|tierAPeak|tierB):\s*(\d{3,})/g))
  watched.add(value);
for (const [, value] of config.matchAll(/localTime:\s*'(\d{2}:\d{2})'/g)) watched.add(value);

const roots = process.argv.length > 2 ? process.argv.slice(2) : ['apps', 'packages'];
const offenders = [];
for (const file of listSourceFiles(roots)) {
  if (
    file.endsWith('training-decisions.ts') ||
    /\.(test|spec)\.[tj]sx?$/.test(file) ||
    file.includes('fixtures')
  )
    continue;
  const text = readFileSync(file, 'utf8');
  for (const value of watched) {
    const pattern = new RegExp(`(?<![\\w.:])${value.replace(':', '\\:')}(?![\\w:])`);
    if (pattern.test(text)) offenders.push(`${file}: contains training value ${value}`);
  }
}

if (offenders.length) {
  console.error(
    `Config literal check failed; read these from @petcare/shared/config instead:\n- ${offenders.join('\n- ')}`,
  );
  process.exit(1);
}
console.log(
  `Config literal check passed: ${watched.size} training values found only in ${CONFIG_FILE}`,
);
