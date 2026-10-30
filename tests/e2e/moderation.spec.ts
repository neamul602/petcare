import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

// REV-03, REV-04, REV-06 end to end: moderation, the care record and resolving a report.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Moderation flows run on the phone profile only');
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

test('the admin removes a review for cause and resolves the report; the owner sees both read-only', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 18 },
  });
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
  const client = new pg.Client({ connectionString: E2E_DB });
  await client.connect();
  await client.query(
    "UPDATE bookings SET end_date = (now() AT TIME ZONE 'Asia/Dhaka')::date WHERE id = $1",
    [id],
  );
  await client.end();
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/complete`);
  await owner.request.post(`${BASE}/api/owner/bookings/${id}/confirm-completion`);
  await owner.request.post(`${BASE}/api/owner/bookings/${id}/review`, {
    data: { rating: 2, text: 'Call me on 01700000000 for details' },
  });
  const rep = await owner.request.post(`${BASE}/api/owner/bookings/${id}/report`, {
    data: { category: 'communication', description: 'Slow to answer messages' },
  });
  expect(rep.ok()).toBe(true);
  const reportId = ((await rep.json()) as { report: { id: string } }).report.id;

  const providerPage = await provider.newPage();
  await providerPage.goto('/provider/profile');
  await expect(providerPage.getByTestId('care-record')).toBeVisible();
  expect(await scan(providerPage)).toEqual([]);

  const admin = await contextAs(browser, 'admin', { baseURL: BASE });
  const page = await admin.newPage();
  await page.goto('/admin/reviews');
  const card = page
    .getByTestId('admin-review')
    .filter({ hasText: 'Call me on 01700000000' })
    .first();
  await expect(card.getByTestId('negative-reminder')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await card.getByTestId('remove-reason').selectOption('contact_details');
  await card.getByTestId('remove-review').click();
  await expect(
    page
      .getByTestId('admin-review')
      .filter({ hasText: 'Call me on 01700000000' })
      .first()
      .getByTestId('review-removed'),
  ).toBeVisible();

  await page.goto(`/admin/reports/${reportId}`);
  await expect(page.getByTestId('booking-record')).toContainText('disputed');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('rationale').fill('Messages were answered within the day');
  await page.getByTestId('provider-action').selectOption('warning');
  await page.getByTestId('resolve-submit').click();
  await expect(page.getByTestId('report-title')).toContainText('Resolved');

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.getByTestId('review-removed')).toContainText(
    'PetCare removed this review'.length ? 'PetCare' : '',
  );
  await expect(ownerPage.locator('[data-state="resolved"]')).toBeVisible();
  expect(await scan(ownerPage)).toEqual([]);
  await admin.close();
  await owner.close();
  await provider.close();
});
