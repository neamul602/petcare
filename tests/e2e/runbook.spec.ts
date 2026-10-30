import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// ACU-03, ACU-04 end to end: the admin works the runbook, messages the owner, resolves and writes the post-mortem.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Runbook flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:4321';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);

test('the admin works the runbook, messages the owner in Bangla, resolves and closes with a post-mortem', async ({
  browser,
}) => {
  const provider = await contextAs(browser, 'provider', { baseURL: BASE });
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 20 },
  });
  const owner = await contextAs(browser, 'bibi', { baseURL: BASE });
  const made = await owner.request.post(`${BASE}/api/owner/bookings`, {
    data: {
      key: `rb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
  await provider.request.post(`${BASE}/api/provider/bookings/${id}/acute-event`, {
    data: { type: 'injury', severity: 'minor', observation: 'Small cut on a paw' },
  });

  const admin = await contextAs(browser, 'admin', { baseURL: BASE });
  const events = (await (await admin.request.get(`${BASE}/api/admin/acute-events`)).json()) as {
    events: Array<{ id: string; bookingId: string }>;
  };
  const eventId = events.events.find((e) => e.bookingId === id)!.id;

  const page = await admin.newPage();
  await page.goto(`/admin/acute/${eventId}`);
  await expect(page.getByTestId('timers')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('done-confirm_trigger').click();
  await expect(page.getByTestId('status-confirm_trigger')).toHaveText('Done');
  await page.locator('#note-vet_lookup').fill('Provider already called the vet');
  await page.getByTestId('skip-vet_lookup').click();
  await expect(page.getByTestId('status-vet_lookup')).toHaveText('Skipped');
  await page.getByTestId('send-bn').click();
  await expect(page.getByTestId('status-owner_notification')).toHaveText('Done');
  await expect(page.getByTestId('owner-messages')).toContainText('Tito');

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.getByTestId('acute-message').first()).toContainText('Tito');

  await page.getByTestId('resolve-event').click();
  await expect(page.getByTestId('pm-form')).toBeVisible();
  for (const f of [
    'timelineAccuracy',
    'roles',
    'ownerCommunication',
    'directoryUse',
    'gaps',
    'lessons',
  ])
    await page.getByTestId(`pm-${f}`).fill(`${f} was fine`);
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('pm-save').click();
  await expect(page.getByTestId('pm-done')).toBeVisible();

  await page.goto('/admin/acute');
  await expect(page.getByTestId('post-mortems')).toContainText('lessons was fine');
  expect(await scan(page)).toEqual([]);
  await admin.close();
  await owner.close();
  await provider.close();
});
