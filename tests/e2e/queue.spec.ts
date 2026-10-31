import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// ADM-01..03 end to end: the urgency queue, one-tap detail, a decision, the audit log and the ceiling.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Admin queue flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:4321';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
// The urgency groups: acute events, reports, other open items (any order inside), awaiting confirmation, in stay.
const GROUP: Record<string, number> = {
  acute: 0,
  report: 1,
  owner_cancellation_request: 2,
  provider_cancellation: 2,
  owner_no_show: 2,
  missed_start: 2,
  awaiting_confirmation: 3,
  in_stay: 4,
};

test('the queue is sorted by urgency; a cancellation request opens in one tap and is decided; the audit log shows it', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [120, 121, 122].map(plus), capacity: 20 },
  });
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(120),
      to: plus(122),
      method: 'bkash',
    },
  });
  const id = ((await made.json()) as { booking: { id: string } }).booking.id;
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/confirm`);
  await owner.request.post(`${BASE}/api/owner/bookings/${id}/request-cancellation`, {
    data: { note: 'Trip cancelled' },
  });

  const admin = await contextAs(browser, 'admin', { baseURL: BASE });
  const page = await admin.newPage();
  await page.goto('/admin');
  await expect(page.getByTestId('count-vet')).toBeVisible();
  const kinds = await page
    .getByTestId('queue-row')
    .evaluateAll((rows) => rows.map((r) => r.getAttribute('data-kind')!));
  const ranks = kinds.map((k) => GROUP[k] ?? -1);
  expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  expect(ranks).not.toContain(-1);
  expect(await scan(page)).toEqual([]);

  await page.locator(`[data-kind="owner_cancellation_request"][href$="${id}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/admin/bookings/${id}$`));
  await expect(page.getByTestId('open-item')).toContainText('Trip cancelled');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('cancel-decision').selectOption('refund_full');
  await page.getByTestId('cancel-note').fill('Within policy, refund in full');
  await page.getByTestId('cancel-apply').click();
  await expect(page.getByTestId('open-items')).toContainText('No open items');
  await expect(page.getByTestId('booking-title')).toContainText('canceled');

  await page.goto(`/admin/audit?action=booking.cancellation&targetId=${id}`);
  await expect(page.getByTestId('audit-entry').first()).toContainText(
    'booking.cancellation_resolved',
  );
  expect(await scan(page)).toEqual([]);
  const refused = await admin.request.delete(`${BASE}/api/admin/audit/1`);
  expect(refused.status()).toBe(405);

  await page.goto('/admin/insights');
  await expect(page.getByTestId('ceiling')).toContainText('of 25');
  expect(await scan(page)).toEqual([]);
  await admin.close();
  await owner.close();
  await provider.close();
});
