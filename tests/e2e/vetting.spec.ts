import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// SUP-02, SUP-03, SUP-05 end to end: the vetting gate, decisions list, appeals, and the provider profile editor.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Vetting flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:4321';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);

test('the admin cannot approve until the vetting checks are done; a declined provider can be appealed; decisions are listed', async ({
  browser,
}) => {
  const admin = await contextAs(browser, 'admin', { baseURL: BASE });
  const create = async (name: string) =>
    (
      (await (
        await admin.request.post(`${BASE}/api/admin/providers`, {
          data: {
            name: { en: name, bn: name },
            tier: 'B',
            neighbourhood: 'banani',
            species: ['dog'],
          },
        })
      ).json()) as { provider: { id: string } }
    ).provider.id;
  const vetId = await create('E2E Vetting');
  await admin.request.post(`${BASE}/api/admin/providers/${vetId}/status`, {
    data: { to: 'vetting', reason: 'Documents received' },
  });

  const page = await admin.newPage();
  await page.goto(`/admin/providers/${vetId}`);
  await page.locator('#to').selectOption('approved');
  await page.locator('#status-reason').fill('Looks good');
  await page.getByTestId('status-submit').click();
  await expect(page.getByTestId('action-error')).toContainText('identity, address, capability');
  expect(await scan(page)).toEqual([]);

  await page.getByTestId('vet-identity').check();
  await page.getByTestId('vet-address').check();
  await page.getByTestId('vet-capability').check();
  await page.locator('#vet-artifacts').fill('nid-ref-77');
  await page.getByTestId('vet-save').click();
  await expect(page.getByText('Vetting record saved.')).toBeVisible();
  await page.locator('#to').selectOption('approved');
  await page.locator('#status-reason').fill('Looks good');
  await page.getByTestId('status-submit').click();
  await expect(page.getByTestId('action-error')).toContainText('price and capacity');

  await page.getByTestId('info-note').fill('Please send a utility bill');
  await page.getByTestId('info-send').click();
  await expect(page.getByTestId('awaiting-info')).toContainText('utility bill');

  const declinedId = await create('E2E Declined');
  await admin.request.post(`${BASE}/api/admin/providers/${declinedId}/status`, {
    data: { to: 'removed', reason: 'Could not verify address' },
  });
  await page.goto(`/admin/providers/${declinedId}`);
  await page.getByTestId('appeal-note').fill('Provider sent a new utility bill');
  await page.getByTestId('appeal-send').click();
  await expect(page.getByTestId('appeals')).toContainText('Provider sent a new utility bill');
  expect(await scan(page)).toEqual([]);

  await page.goto('/admin/providers');
  await expect(page.getByTestId('decision').filter({ hasText: 'E2E Declined' })).toContainText(
    'declined',
  );
  await expect(
    page.getByTestId('decision').filter({ hasText: 'Could not verify address' }),
  ).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await admin.close();
});

test('Rashid edits his profile text and the public page shows it; the completeness list names what is missing', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  const page = await provider.newPage();
  await page.goto('/provider/profile');
  await expect(page.getByTestId('completeness')).toContainText('সম্পূর্ণ');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('exp-en').fill('Calm home with a dedicated pet room and a balcony');
  await page.getByTestId('profile-save').click();
  await expect(page.getByTestId('profile-saved')).toBeVisible();
  const guest = await contextAs(browser, null, { baseURL: BASE });
  await guest.addCookies([{ name: 'pc_locale', value: 'en', url: BASE }]);
  const pub = await guest.newPage();
  await pub.goto('/providers/rashid');
  await expect(pub.locator('main')).toContainText('dedicated pet room and a balcony');
  await guest.close();
  // put the text back for the other specs
  await page
    .getByTestId('exp-en')
    .fill(
      'Home sitter for cats and small dogs in a Gulshan apartment with a dedicated pet room. Training data.',
    );
  await page.getByTestId('profile-save').click();
  await expect(page.getByTestId('profile-saved')).toBeVisible();
  await provider.close();
});
