import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

// PAY-07 and PAY-08 end to end: provider earnings and the admin payouts screen.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Earnings flows run on the phone profile only');
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

test('a completed stay shows as a payout with commission and net; a freeze shows its reason; admin sees it and reconciliation', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 16 },
  });
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `earn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
  const admin = await contextAs(browser, 'admin', { baseURL: BASE });
  expect(
    (
      await admin.request.post(`${BASE}/api/admin/bookings/${id}/freeze`, {
        data: { reason: 'report:communication' },
      })
    ).ok(),
  ).toBe(true);

  const page = await provider.newPage();
  await page.goto('/provider/earnings');
  const line = page.getByTestId('earnings-line').first();
  await expect(line).toContainText('৳5,000');
  await expect(line).toContainText('10 %');
  await expect(line.getByTestId('earnings-net')).toContainText('৳4,500');
  await expect(line.getByTestId('earnings-reason')).toContainText('মালিক একটি সমস্যা জানিয়েছেন');
  await expect(page.locator('[data-state="payout-frozen"]').first()).toBeVisible();
  expect(await scan(page)).toEqual([]);

  const adminPage = await admin.newPage();
  await adminPage.goto('/admin/payouts');
  await expect(adminPage.getByTestId('frozen-line').filter({ hasText: id })).toBeVisible();
  await expect(adminPage.getByTestId('reconciliation-result')).toBeVisible();
  expect(await scan(adminPage)).toEqual([]);
  await adminPage.getByTestId('run-batch').click();
  await expect(adminPage.getByTestId('batch-result')).toBeVisible();
  await admin.close();
  await owner.close();
  await provider.close();
});
