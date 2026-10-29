import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SCREEN_ROUTES } from '../../apps/web/src/lib/routes.ts';
import { contextAs, type Role } from './sessions.ts';

// FND-06 / DR-19: WCAG 2.1 AA on every route, in Bangla and English, keyboard order and spacing.
const EXTRA_PAGES = ['/dev/kit', '/offline', '/no-such-page'];
const PATHS = [...new Set([...SCREEN_ROUTES.map((route) => route.path), ...EXTRA_PAGES])];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const ROLE_FOR_PATH = new Map<string, Role | null>(
  SCREEN_ROUTES.map((route) => [route.path, route.role]),
);
for (const path of ['/sign-in', '/admin/sign-in', ...EXTRA_PAGES]) ROLE_FOR_PATH.set(path, null); // opened as a guest

for (const locale of ['bn', 'en']) {
  test.describe(`axe scan (${locale})`, () => {
    for (const path of PATHS) {
      test(`${path} has no WCAG 2.1 AA violations`, async ({ browser, baseURL, viewport }) => {
        const context = await contextAs(browser, ROLE_FOR_PATH.get(path) ?? null, {
          baseURL,
          viewport,
        });
        await context.addCookies([{ name: 'pc_locale', value: locale, url: baseURL! }]);
        const page = await context.newPage();
        await page.goto(path, { waitUntil: 'networkidle' }); // settles first-compile reloads in dev
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        const summary = results.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
        );
        expect(summary).toEqual([]);
        await context.close();
      });
    }
  });
}

test.describe('keyboard and spacing', () => {
  test('the skip link is the first stop and focus is always visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const first = page.locator(':focus');
    await expect(first).toHaveAttribute('href', '#main');
    for (let i = 0; i < 6; i++) {
      const indicator = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement as HTMLElement);
        const outline = style.outlineStyle !== 'none' ? parseFloat(style.outlineWidth) : 0;
        // The design system draws focus as a solid ring: box-shadow with 0 blur and a coloured spread.
        const ring = [
          ...style.boxShadow.matchAll(
            /rgb\((?:\d+), (?:\d+), (?:\d+)\) 0px 0px 0px (\d+(?:\.\d+)?)px/g,
          ),
        ].map((m) => parseFloat(m[1]!));
        return Math.max(outline, ...ring, 0);
      });
      expect(indicator, 'focus indicator width in px').toBeGreaterThanOrEqual(2);
      await page.keyboard.press('Tab');
    }
  });

  test('adjacent touch targets are at least 8 px apart', async ({ browser, baseURL, viewport }) => {
    for (const [path, role] of [
      ['/', 'owner'],
      ['/provider', 'provider'],
      ['/admin', 'admin'],
    ] as const) {
      const context = await contextAs(browser, role, { baseURL, viewport });
      const page = await context.newPage();
      await page.goto(path);
      const boxes = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLElement>('header a, header button, nav a, aside a'),
        )
          .filter((el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed')
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              label: (el.textContent ?? '').trim().slice(0, 20),
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
            };
          })
          .filter((b) => b.right > b.left && b.bottom > b.top),
      );
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]!;
          const b = boxes[j]!;
          const dx = Math.max(0, a.left - b.right, b.left - a.right);
          const dy = Math.max(0, a.top - b.bottom, b.top - a.bottom);
          const gap = Math.hypot(dx, dy);
          expect(gap, `${path}: "${a.label}" and "${b.label}"`).toBeGreaterThanOrEqual(8);
        }
      }
      await context.close();
    }
  });
});
