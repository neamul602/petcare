#!/usr/bin/env node
/**
 * WCAG 2.1 AA contrast for every text/background token pair the UI kit uses (FND-02, UC-22).
 * Reads colours from the design token stylesheet. Usage: node scripts/check-contrast.mjs [tokens.css]
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'apps/web/src/styles/tokens.css';
const css = readFileSync(file, 'utf8');
const tokens = {};
for (const [, name, h, s, l] of css.matchAll(
  /--color-([\w-]+):\s*hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/g,
)) {
  tokens[name] = [Number(h), Number(s) / 100, Number(l) / 100];
}

const toRgb = ([h, s, l]) => {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
};
const luminance = (rgb) =>
  rgb
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (fg, bg) => {
  const [a, b] = [luminance(toRgb(fg)), luminance(toRgb(bg))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

// [text, background, minimum]: 4.5 for body text, 3 for large text and UI components.
const PAIRS = [
  ['foreground', 'background', 4.5],
  ['foreground', 'card', 4.5],
  ['foreground', 'muted', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'muted', 4.5],
  ['muted-foreground', 'card', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['primary', 'background', 4.5],
  ['primary', 'card', 4.5],
  ['primary-soft-foreground', 'primary-soft', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['accent-soft-foreground', 'accent-soft', 4.5],
  ['success', 'success-soft', 4.5],
  ['warning', 'warning-soft', 4.5],
  ['destructive', 'destructive-soft', 4.5],
  ['destructive-foreground', 'destructive', 4.5],
  ['info', 'info-soft', 4.5],
  ['ring', 'background', 3],
];

const failures = [];
for (const [fg, bg, min] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) {
    failures.push(`missing token ${tokens[fg] ? bg : fg}`);
    continue;
  }
  const value = ratio(tokens[fg], tokens[bg]);
  if (value < min) failures.push(`${fg} on ${bg}: ${value.toFixed(2)} (needs ${min})`);
}

if (failures.length) {
  console.error(`Contrast check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Contrast check passed: ${PAIRS.length} pairs meet WCAG 2.1 AA`);
