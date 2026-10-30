import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

// BKG-16, BKG-17 end to end: the bookings list and Book again from a completed stay.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Book again flows run on the phone profile only');
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
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

test('Bibi books Rashid again from a completed stay, pre-filled, in well under 4 minutes', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 14 },
  });
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `again-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(0),
      to: plus(2),
      method: 'bkash',
      instructions: 'Insulin with food, please',
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

  const page = await owner.newPage();
  await page.goto('/bookings');
  await expect(page.getByTestId('group-past').getByTestId('booking-row').first()).toBeVisible();
  await expect(page.locator('[data-state="completed"]').first()).toBeVisible();
  expect(await scan(page)).toEqual([]);

  await page.goto('/');
  await expect(page.getByTestId('home-book-again')).toBeVisible();
  await page.getByTestId('home-book-again-button').click();
  await expect(page).toHaveURL(/\/book\/rashid\?again=ba_/);
  await hydrated(page);
  await expect(page.getByTestId('again-note')).toContainText('Tito');
  await expect(page.getByTestId('again-elapsed')).toBeVisible();
  await page.getByTestId('book-from').fill(plus(60));
  await page.getByTestId('book-to').fill(plus(63));
  await expect(page.getByTestId('nights-free')).toBeVisible();
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('book-instructions')).toHaveValue('Insulin with food, please');
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('review')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('submit-booking').click();
  await expect(page).toHaveURL(/\/bookings\/bk_[0-9a-f]+$/);
  await expect(page.locator('[data-state="authorized"]')).toBeVisible();
  await owner.close();
  await provider.close();
});

test('Book again for a provider who can no longer be booked says so and offers other providers', async ({
  browser,
}) => {
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const client = new pg.Client({ connectionString: E2E_DB });
  await client.connect();
  const { rows } = await client.query(
    "SELECT id FROM bookings WHERE owner_id = 'bibi' AND state = 'completed' LIMIT 1",
  );
  const started = await owner.request.post(`${BASE}/api/owner/book-again`, {
    data: { bookingId: rows[0].id },
  });
  const { timerId } = (await started.json()) as { timerId: string };
  await client.query("UPDATE providers SET status = 'suspended' WHERE id = 'kamrul'");
  await client.query("UPDATE bookings SET provider_id = 'kamrul' WHERE id = $1", [rows[0].id]);
  const page = await owner.newPage();
  await page.goto(`/book/kamrul?again=${timerId}`);
  await expect(page.getByTestId('provider-unavailable')).toBeVisible();
  await expect(page.getByTestId('provider-unavailable').getByRole('link')).toHaveAttribute(
    'href',
    '/search',
  );
  expect(await scan(page)).toEqual([]);
  await client.query("UPDATE providers SET status = 'approved' WHERE id = 'kamrul'");
  await client.query("UPDATE bookings SET provider_id = 'rashid' WHERE id = $1", [rows[0].id]);
  await client.end();
  await owner.close();
});
