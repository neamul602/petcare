import { expect, test } from '@playwright/test';
import { contextAs } from './sessions.ts';

// The provider calendar: one click selects the next 5, 7 or 10 nights.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Calendar quick select runs on desktop only');
});

test('quick select ticks the next 5, 7 or 10 nights and can be cleared', async ({
  browser,
  baseURL,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto('/provider/calendar');
  const checked = page.locator('input[name="dates"]:checked');
  for (const n of [5, 7, 10]) {
    await page.getByTestId(`quick-${n}`).click();
    await expect(checked).toHaveCount(n);
  }
  await page.getByTestId('quick-clear').click();
  await expect(checked).toHaveCount(0);
  await provider.close();
});
