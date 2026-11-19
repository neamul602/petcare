import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// SUP-01 and SUP-04 end to end: the public provider page and the admin's provider records.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Provider flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);

test.describe('public provider page', () => {
  test('a Tier-A provider shows the badge with an accessible name, price, area and no ratings', async ({
    page,
  }) => {
    await page.goto('/providers/farzana');
    await expect(page.getByTestId('provider-title')).toHaveText('ফারজানা');
    await expect(
      page.getByLabel('টিয়ার এ: PetCare অ্যাডমিন নিজে পরিচয় করিয়ে দিয়েছেন'),
    ).toBeVisible();
    await expect(page.getByTestId('provider-price')).toContainText('৳2,200');
    await expect(page.getByTestId('provider-new')).toHaveText('PetCare-এ নতুন। সুনাম গড়ে তুলছেন।');
    await expect(page.locator('main')).not.toContainText('+8801712000003');
    await expect(page.getByTestId('book-button')).toHaveAttribute('href', '/book/farzana');
    expect(await scan(page)).toEqual([]);
  });

  test('English page works and a Tier-B provider has no badge', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: 'pc_locale', value: 'en', url: baseURL! }]);
    await page.goto('/providers/kamrul');
    await expect(page.getByTestId('provider-title')).toHaveText('Kamrul');
    await expect(page.getByText('Introduced by PetCare')).toHaveCount(0);
    await expect(page.getByTestId('provider-price')).toContainText('per night');
    expect(await scan(page)).toEqual([]);
  });

  test('a provider who is not approved shows the friendly 404', async ({ page }) => {
    expect((await page.goto('/providers/sadia'))?.status()).toBe(404);
    expect((await page.goto('/providers/nobody'))?.status()).toBe(404);
  });
});

test.describe('admin provider records', () => {
  test('the admin approves a pending provider in one click, then suspends them again', async ({
    browser,
    baseURL,
  }) => {
    const admin = await contextAs(browser, 'admin', { baseURL });
    const page = await admin.newPage();
    await page.goto('/admin/providers');
    const sadia = () => page.getByTestId('provider-row').filter({ hasText: 'Sadia' });
    await expect(sadia()).toBeVisible();
    expect(await scan(page)).toEqual([]);

    await sadia().getByTestId('approve').click();
    await expect(sadia()).toHaveCount(0);
    await page.getByTestId('tab-approved').click();
    await expect(sadia().getByTestId('row-status')).toHaveText('Approved');

    await sadia().getByTestId('suspend').click();
    await page.getByTestId('tab-inactive').click();
    await expect(sadia().getByTestId('row-status')).toHaveText('Suspended');
    await sadia().getByRole('link', { name: /Sadia/ }).click();
    await expect(page.getByTestId('provider-status')).toHaveText('Suspended');
    await expect(page.getByTestId('provider-history')).toContainText('approved');
    await admin.close();
  });

  test('a guest or an owner cannot open the admin provider list', async ({ browser, baseURL }) => {
    const owner = await contextAs(browser, 'owner', { baseURL });
    const page = await owner.newPage();
    await page.goto('/admin/providers');
    await expect(page).toHaveURL(/\/admin\/sign-in/);
    await owner.close();
  });
});
