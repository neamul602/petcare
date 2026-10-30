import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// SRC-02 and SRC-06 end to end: the admin adds a peak window, the provider expands for peak, Insights shows the neighbourhood table.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Peak flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);

test('the admin adds a peak window and sees the neighbourhood table', async ({
  browser,
  baseURL,
}) => {
  const admin = await contextAs(browser, 'admin', { baseURL });
  const page = await admin.newPage();
  await page.goto('/admin/insights');
  await expect(page.getByTestId('neighbourhood-insights')).toContainText('admin decision');
  await page.locator('#peak-name').fill('Eid (training)');
  await page.locator('#peak-start').fill(plus(70));
  await page.locator('#peak-end').fill(plus(74));
  await page.getByTestId('peak-create').click();
  await expect(page.getByTestId('peak-window').filter({ hasText: 'Eid (training)' })).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await admin.close();
});

test('the provider sees the peak prompt with the Tier-A commission and expands for the window', async ({
  browser,
  baseURL,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto(`/provider/calendar?from=${plus(69)}`);
  await expect(page.getByTestId('peak-prompt').first()).toContainText('Eid (training)');
  await expect(page.getByTestId('peak-tier-a').first()).toContainText('8 %');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('peak-capacity').first().fill('6');
  await page.getByTestId('peak-expand').first().click();
  await expect(page.getByTestId('peak-done')).toContainText('5');
  await expect(page.getByTestId(`info-${plus(71)}`)).toContainText('6');
  await expect(page.getByText('ব্যস্ত সময়').first()).toBeVisible();
  await provider.close();
});
