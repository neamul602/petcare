import { expect, test } from '@playwright/test';
import { contextAs } from './sessions.ts';

// EXPERIENCE.md accessibility floor: primary targets are at least 44x44 px (FND-02).
test.describe('touch targets', () => {
  test('owner and provider navigation and header controls are at least 44 px tall', async ({
    browser,
    baseURL,
    viewport,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Measured on the phone profile');
    for (const [path, role] of [
      ['/', 'owner'],
      ['/provider', 'provider'],
    ] as const) {
      const context = await contextAs(browser, role, { baseURL, viewport });
      const page = await context.newPage();
      await page.goto(path);
      const controls = page.locator(
        'header a:visible, header button:visible, [data-testid="tab-bar"] a:visible',
      );
      const count = await controls.count();
      expect(count).toBeGreaterThan(3);
      for (let i = 0; i < count; i++) {
        const box = await controls.nth(i).boundingBox();
        expect(box?.height, `${path} control ${i}`).toBeGreaterThanOrEqual(44);
      }
      await context.close();
    }
  });

  test('buttons, inputs and the sheet trigger in the kit meet 44 px (small buttons use a 44 px hit area)', async ({
    page,
  }) => {
    await page.goto('/dev/kit');
    for (const name of [
      'Primary',
      'Secondary',
      'Outline',
      'Ghost',
      'Destructive',
      'Large',
      'Open sheet',
    ]) {
      const box = await page.getByRole('button', { name, exact: true }).first().boundingBox();
      expect(box?.height, name).toBeGreaterThanOrEqual(44);
    }
    const input = await page.getByLabel('Pet name').boundingBox();
    expect(input?.height).toBeGreaterThanOrEqual(44);
  });
});
