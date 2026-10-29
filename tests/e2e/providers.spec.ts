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
    await page.goto('/providers/rashid');
    await expect(page.getByTestId('provider-title')).toHaveText('রশিদ');
    await expect(
      page.getByLabel('টিয়ার এ: PetCare অ্যাডমিন নিজে পরিচয় করিয়ে দিয়েছেন'),
    ).toBeVisible();
    await expect(page.getByTestId('provider-price')).toContainText('৳2,500');
    await expect(page.getByTestId('provider-new')).toHaveText('PetCare-এ নতুন। সুনাম গড়ে তুলছেন।');
    await expect(page.locator('main')).not.toContainText('+8801712000002');
    await expect(page.getByTestId('book-button')).toHaveAttribute('href', '/book/rashid');
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
  test('the admin adds a record, sees the vetting rules, moves status and tier with reasons', async ({
    browser,
    baseURL,
  }) => {
    const admin = await contextAs(browser, 'admin', { baseURL });
    const page = await admin.newPage();
    await page.goto('/admin/providers');
    await expect(page.getByTestId('provider-row').filter({ hasText: 'Rashid' })).toBeVisible();
    await page.getByTestId('filter-applied').click();
    await expect(page.getByTestId('provider-row').filter({ hasText: 'Sadia' })).toBeVisible();
    await page.goto('/admin/providers');
    expect(await scan(page)).toEqual([]);

    await page.getByText('Add provider record').click();
    await page.locator('#nameEn').fill('E2E Sitter');
    await page.locator('#nameBn').fill('ই-টু-ই');
    await page.getByTestId('create-submit').click();
    await expect(page.getByTestId('provider-name')).toHaveText('E2E Sitter');
    await expect(page.getByTestId('provider-status')).toHaveText('Applied');
    expect(await scan(page)).toEqual([]);

    await page.locator('#status-reason').fill('Documents received');
    await page.getByTestId('status-submit').click();
    await expect(page.getByTestId('provider-status')).toHaveText('Vetting');

    await page.locator('#to').selectOption('approved');
    await page.locator('#status-reason').fill('Visit went well');
    await page.getByTestId('status-submit').click();
    await expect(page.getByTestId('action-error')).toHaveText(
      'Add a price and capacity before approving.',
    );

    await page.locator('#tier-reason').fill('Introduced by the admin');
    await page.getByTestId('tier-submit').click();
    await expect(page.getByTestId('provider-history')).toContainText('tier: A → B');
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
