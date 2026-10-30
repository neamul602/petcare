import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

// BKG-15 and BKG-11 end to end: completion, a cancellation request, a provider cancellation and a no-show.
// Dates are today and later; one step edits the end date in the end-to-end database so "the stay has ended" can be shown.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Completion flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const E2E_DB = 'postgres://petcare:petcare@localhost:5433/petcare_e2e';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);

async function confirmedBooking(browser: Browser, baseURL: string, from: number, to: number) {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const made = await owner.request.post(`${baseURL}/api/owner/bookings`, {
    data: {
      key: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(from),
      to: plus(to),
      method: 'bkash',
    },
  });
  expect(made.ok()).toBe(true);
  const id = ((await made.json()) as { booking: { id: string } }).booking.id;
  const provider = await contextAs(browser, 'provider', { baseURL });
  expect((await provider.request.post(`${baseURL}/api/provider/bookings/${id}/confirm`)).ok()).toBe(
    true,
  );
  return { owner, provider, id };
}

test.beforeAll(async ({ browser }, testInfo) => {
  // Stays that begin today keep Rashid's nights, so give him room for these tests and the other stay specs.
  if (testInfo.project.name !== 'phone') return;
  const provider = await contextAs(browser, 'provider', { baseURL: 'http://localhost:4321' });
  const dates = [0, 1, 2].map(plus);
  await provider.request.put('http://localhost:4321/api/provider/capacity', {
    data: { dates, capacity: 8 },
  });
  await provider.close();
});

test('the provider marks the stay complete and the owner confirms it', async ({
  browser,
  baseURL,
}) => {
  const { owner, provider, id } = await confirmedBooking(browser, baseURL!, 0, 2);
  expect((await provider.request.post(`${baseURL}/api/provider/bookings/${id}/start`)).ok()).toBe(
    true,
  );
  const client = new pg.Client({ connectionString: E2E_DB });
  await client.connect();
  await client.query(
    "UPDATE bookings SET end_date = (now() AT TIME ZONE 'Asia/Dhaka')::date WHERE id = $1",
    [id],
  );
  await client.end();

  const providerPage = await provider.newPage();
  await providerPage.goto(`/provider/bookings/${id}`);
  await expect(providerPage.getByTestId('mark-complete')).toBeVisible();
  expect(await scan(providerPage)).toEqual([]);
  await providerPage.getByTestId('mark-complete').click();
  await expect(providerPage.getByTestId('completion-waiting')).toBeVisible();

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.getByTestId('confirm-completion-card')).toBeVisible();
  expect(await scan(ownerPage)).toEqual([]);
  await ownerPage.getByTestId('confirm-completion').click();
  await expect(ownerPage.getByTestId('completed')).toBeVisible();
  await expect(ownerPage.locator('[data-state="completed"]')).toBeVisible();
  await providerPage.reload();
  await expect(providerPage.getByTestId('provider-completed')).toBeVisible();
  await owner.close();
  await provider.close();
});

test('the owner asks to cancel a confirmed booking and sees that PetCare decides', async ({
  browser,
  baseURL,
}) => {
  const { owner, provider, id } = await confirmedBooking(browser, baseURL!, 100, 102);
  const page = await owner.newPage();
  await page.goto(`/bookings/${id}`);
  await page.getByText('বাতিলের অনুরোধ করুন').click();
  await expect(page.getByTestId('request-cancel-sheet')).toContainText('নিজে থেকে ফেরত যায় না');
  expect(await scan(page)).toEqual([]);
  await page.locator('#cancel-note').fill('Trip cancelled');
  await page.getByTestId('request-cancel-send').click();
  await expect(page.getByTestId('cancel-requested')).toBeVisible();
  await expect(page.locator('[data-state="captured"]')).toBeVisible();
  await owner.close();
  await provider.close();
});

test('the provider cancels a confirmed booking with a reason; the booking stays until PetCare decides', async ({
  browser,
  baseURL,
}) => {
  const { owner, provider, id } = await confirmedBooking(browser, baseURL!, 110, 112);
  const page = await provider.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await page.getByText('এই বুকিং বাতিল করুন').click();
  expect(await scan(page)).toEqual([]);
  await page.locator('#pcancel-note').fill('I am ill');
  await page.getByTestId('provider-cancel-send').click();
  await expect(page).toHaveURL(new RegExp(`/provider/bookings/${id}$`));
  await expect(page.locator('[data-state="captured"]')).toBeVisible();
  const flags = await (await provider.request.get(`${baseURL}/api/provider/bookings/${id}`)).json();
  expect(flags.booking.state).toBe('captured');
  await owner.close();
  await provider.close();
});

test('the provider reports a no-show on the start date and the owner is told PetCare will review', async ({
  browser,
  baseURL,
}) => {
  const { owner, provider, id } = await confirmedBooking(browser, baseURL!, 0, 1);
  const page = await provider.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await page.getByTestId('flag-no-show').click();
  await expect(page.locator('[data-state="no-show"]')).toBeVisible();
  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.getByTestId('no-show')).toBeVisible();
  expect(await scan(ownerPage)).toEqual([]);
  await owner.close();
  await provider.close();
});
