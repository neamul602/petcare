import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

// REV-01, REV-02, REV-05 end to end: a completed stay is reviewed and reported. The stay is completed through the API;
// its end date is moved to today in the end-to-end database so completion can happen now.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Review flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:4321';
const E2E_DB = 'postgres://petcare:petcare@localhost:5433/petcare_e2e';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.beforeAll(async ({ browser }, testInfo) => {
  if (testInfo.project.name !== 'phone') return;
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 10 },
  });
  await provider.close();
});

async function completedStay(browser: import('@playwright/test').Browser) {
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(0),
      to: plus(2),
      method: 'bkash',
    },
  });
  const id = ((await made.json()) as { booking: { id: string } }).booking.id;
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/confirm`);
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/start`);
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/updates`, {
    multipart: {
      note: 'Walk done',
      careLog: '{}',
      photo: { name: 'a.png', mimeType: 'image/png', buffer: PNG },
    },
  });
  const client = new pg.Client({ connectionString: E2E_DB });
  await client.connect();
  await client.query(
    "UPDATE bookings SET end_date = (now() AT TIME ZONE 'Asia/Dhaka')::date WHERE id = $1",
    [id],
  );
  await client.end();
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/complete`);
  await owner.request.post(`${BASE}/api/owner/bookings/${id}/confirm-completion`);
  return { owner, provider, id };
}

test('Bibi reviews a completed stay with a stay photo and the review shows on the provider page', async ({
  browser,
}) => {
  const { owner, provider, id } = await completedStay(browser);
  const page = await owner.newPage();
  await page.goto(`/bookings/${id}`);
  await expect(page.getByTestId('review-card')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('review-rating').selectOption('5');
  await page.getByTestId('review-text').fill('Tito was happy and well looked after');
  await page.getByTestId('review-photo').first().check();
  await page.getByTestId('review-send').click();
  await expect(page.getByTestId('your-review')).toContainText('5/5');
  await expect(page.getByTestId('review-card')).toHaveCount(0);

  const guest = await contextAs(browser, null, { baseURL: BASE });
  const publicPage = await guest.newPage();
  await publicPage.goto('/providers/rashid');
  await expect(publicPage.getByTestId('reviews')).toBeVisible();
  await expect(publicPage.getByTestId('review').first()).toContainText('Tito was happy');
  await expect(publicPage.getByTestId('review').first()).toContainText('যাচাই করা থাকা');
  const image = publicPage.getByTestId('review').first().locator('img').first();
  await expect(image).toBeVisible();
  expect(await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(
    true,
  );
  expect(await scan(publicPage)).toEqual([]);
  await guest.close();
  await owner.close();
  await provider.close();
});

test('Bibi reports a problem; the booking is disputed and the payout waits', async ({
  browser,
}) => {
  const { owner, provider, id } = await completedStay(browser);
  const page = await owner.newPage();
  await page.goto(`/bookings/${id}`);
  await page.getByText('সমস্যা জানান').click();
  await expect(page.locator('#report-category option')).toHaveCount(6);
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('report-category').selectOption('care-not-as-agreed');
  await page.getByTestId('report-description').fill('The evening walk was skipped');
  await page.getByTestId('report-send').click();
  await expect(page.getByTestId('report-sent')).toBeVisible();
  await expect(page.locator('[data-state="disputed"]')).toBeVisible();
  await expect(page.getByTestId('report-sheet')).toHaveCount(0);
  await owner.close();
  await provider.close();
});
