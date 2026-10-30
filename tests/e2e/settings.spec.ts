import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// ACC-05 end to end: name and language are saved, the phone is read-only.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Settings flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);

test('an owner changes name and language, sees the phone read-only, and the language is used everywhere', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'owner', { baseURL });
  const page = await owner.newPage();
  await page.goto('/settings');
  await expect(page.getByTestId('settings-phone')).toHaveAttribute('readonly', '');
  await expect(page.getByTestId('settings-phone')).toHaveValue('+8801799000100');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('settings-name').fill('E2E Owner Renamed');
  await page.getByTestId('settings-language').selectOption('en');
  await page.getByTestId('settings-save').click();
  await expect(page.getByTestId('settings-saved')).toHaveText('Saved.');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await expect(page.getByTestId('signed-in-as')).toContainText('E2E Owner Renamed');
  await page.goto('/pets');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your pets');
  expect(await scan(page)).toEqual([]);
  // put it back for the other specs
  await page.goto('/settings');
  await page.getByTestId('settings-name').fill('E2E Owner');
  await page.getByTestId('settings-language').selectOption('bn');
  await page.getByTestId('settings-save').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('সেটিংস');
  await owner.close();
});

test('a provider can change their name', async ({ browser, baseURL }) => {
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto('/provider/settings');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('settings-name').fill('Rashid');
  await page.getByTestId('settings-save').click();
  await expect(page.getByTestId('settings-saved')).toBeVisible();
  await provider.close();
});
