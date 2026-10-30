import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// ACU-01, ACU-02 end to end: the provider reports a concern during a stay; the owner sees the calm banner.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Acute event flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:4321';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);

test('Rashid reports a concern; the owner sees a calm banner and the vet clinics', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 12 },
  });
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `acu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

  const page = await provider.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await page.getByText('উদ্বেগের কথা জানান').click();
  await expect(page.getByTestId('vet-clinics')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('acute-type').selectOption('illness');
  await page.getByTestId('acute-severity').selectOption('serious');
  await page.getByTestId('acute-observation').fill('Tito is not eating and is vomiting');
  await page.getByTestId('acute-send').click();
  await expect(page.getByTestId('acute-sent')).toBeVisible();
  await expect(page.getByTestId('concern-sheet')).toHaveCount(0);

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.getByTestId('acute-banner')).toContainText('Tito-এর সঙ্গে কিছু ঘটেছে');
  await expect(ownerPage.getByTestId('acute-banner')).toContainText('অসুস্থতা');
  await expect(ownerPage.getByTestId('vet-call').first()).toBeVisible();
  await expect(ownerPage.getByTestId('report-sheet')).toBeVisible(); // the dispute window is open straight away
  expect(await scan(ownerPage)).toEqual([]);

  const events = await (
    await (
      await contextAs(browser, 'admin', { baseURL: BASE })
    ).request.get(`${BASE}/api/admin/acute-events`)
  ).json();
  expect(events.events.some((e: { bookingId: string }) => e.bookingId === id)).toBe(true);
  await owner.close();
  await provider.close();
});
