/**
 * The project checks must fail on bad input, not only pass on good input.
 * Each check runs as a child process against a temporary directory.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const run = (script, args) => {
  try {
    const output = execFileSync('node', [`scripts/${script}`, ...args], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { code: 0, output };
  } catch (error) {
    return { code: error.status, output: `${error.stdout}${error.stderr}` };
  }
};
const tempDir = () => mkdtempSync(join(tmpdir(), 'petcare-check-'));

describe('i18n parity check', () => {
  it('passes on the real catalogs', () => {
    expect(run('check-i18n.mjs', []).code).toBe(0);
  });

  it('fails when a key is missing in one language', () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'en.json'), JSON.stringify({ a: 'A', b: 'B' }));
    writeFileSync(join(dir, 'bn.json'), JSON.stringify({ a: 'এ' }));
    const result = run('check-i18n.mjs', [dir]);
    expect(result.code).toBe(1);
    expect(result.output).toContain('"b" exists in en but is missing in bn');
  });

  it('fails on an empty message', () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'en.json'), JSON.stringify({ a: 'A' }));
    writeFileSync(join(dir, 'bn.json'), JSON.stringify({ a: ' ' }));
    expect(run('check-i18n.mjs', [dir]).code).toBe(1);
  });
});

describe('config literal check', () => {
  it('passes on the real source', () => {
    expect(run('check-config-literals.mjs', []).code).toBe(0);
  });

  it('fails when a training value is hard-coded elsewhere', () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'rule.ts'), 'export const disputeWindow = 4320;\n');
    const result = run('check-config-literals.mjs', [dir]);
    expect(result.code).toBe(1);
    expect(result.output).toContain('4320');
  });
});

describe('no Dummy calls from web', () => {
  it('passes on the real web app', () => {
    expect(run('check-no-dummy-in-web.mjs', []).code).toBe(0);
  });

  it('fails when web code calls a Dummy API', () => {
    const dir = tempDir();
    mkdirSync(join(dir, 'src'));
    writeFileSync(
      join(dir, 'src', 'pay.ts'),
      "fetch('http://localhost:4100/api/payments/authorizations');\n",
    );
    expect(run('check-no-dummy-in-web.mjs', [dir]).code).toBe(1);
  });
});

describe('contrast check', () => {
  it('passes on the real tokens', () => {
    expect(run('check-contrast.mjs', []).code).toBe(0);
  });

  it('fails on the original DESIGN.md amber, which is below AA', () => {
    const dir = tempDir();
    const css = `--color-warning: hsl(36 78% 46%);\n--color-warning-soft: hsl(36 78% 94%);\n`;
    writeFileSync(join(dir, 'tokens.css'), css);
    const result = run('check-contrast.mjs', [join(dir, 'tokens.css')]);
    expect(result.code).toBe(1);
    expect(result.output).toContain('warning on warning-soft');
  });
});
