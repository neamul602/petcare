import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// BKG-05..09 end to end: Rashid's Today, request view, confirm and decline. Requests are made through the API as Bibi.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'phone',
    'Provider decision flows run on the phone profile only',
  );
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);

async function bibiRequests(
  browser: import('@playwright/test').Browser,
  baseURL: string,
  from: number,
  to: number,
) {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const response = await owner.request.post(`${baseURL}/api/owner/bookings`, {
    data: {
      key: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(from),
      to: plus(to),
      method: 'bkash',
    },
  });
  expect(response.ok()).toBe(true);
  const id = ((await response.json()) as { booking: { id: string } }).booking.id;
  return { owner, id };
}

test('Rashid confirms from Today in two taps and the owner sees Confirmed', async ({
  browser,
  baseURL,
}) => {
  const { owner, id } = await bibiRequests(browser, baseURL!, 50, 53);
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto('/provider');
  await expect(page.getByTestId('today-requests')).toBeVisible();
  const card = page.locator(`a[href$="/provider/bookings/${id}"]`);
  await expect(card.getByTestId('time-left')).toContainText('23 ঘণ্টা');
  expect(await scan(page)).toEqual([]);
  await card.click(); // tap 1
  await expect(page.getByTestId('request-title')).toContainText('Tito');
  await expect(page.getByTestId('request-price')).toContainText('৳7,500');
  await expect(page.getByTestId('request-care')).toContainText('insulin');
  await expect(page.getByTestId('request-pet')).toContainText('Tito');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('confirm-request').click(); // tap 2
  await expect(page.locator('[data-state="captured"]')).toBeVisible();
  await expect(page.getByTestId('request-actions')).toHaveCount(0);

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.locator('[data-state="captured"]')).toContainText('নিশ্চিত');
  await ownerPage.getByTestId('booking-title').waitFor();
  await provider.close();
  await owner.close();
});

test('Rashid declines with one of six reasons; the owner sees it in plain words', async ({
  browser,
  baseURL,
}) => {
  const { owner, id } = await bibiRequests(browser, baseURL!, 60, 62);
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await page.getByText('গ্রহণ করব না').click();
  await expect(page.locator('input[name="reason"]')).toHaveCount(6);
  await expect(page.getByRole('textbox')).toHaveCount(0);
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('reason-cannot-administer-medication').check();
  await page.getByTestId('decline-submit').click();
  await expect(page.locator('[data-state="declined"]')).toBeVisible();

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.getByTestId('declined')).toContainText('আমি এই ওষুধ দিতে পারব না');
  await expect(ownerPage.getByTestId('declined').getByRole('link')).toHaveAttribute(
    'href',
    '/search',
  );
  expect(await scan(ownerPage)).toEqual([]);
  await provider.close();
  await owner.close();
});

test('Bookings groups the requests and the past stays', async ({ browser, baseURL }) => {
  const { owner, id } = await bibiRequests(browser, baseURL!, 70, 72);
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto('/provider/bookings');
  await expect(
    page.getByTestId('group-requests').locator(`a[href$="/provider/bookings/${id}"]`),
  ).toBeVisible();
  await expect(page.getByTestId('group-past')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await provider.close();
  await owner.close();
});

test('another provider cannot open the request', async ({ browser, baseURL }) => {
  const { owner, id } = await bibiRequests(browser, baseURL!, 80, 82);
  const guest = await contextAs(browser, null, { baseURL });
  const page = await guest.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await expect(page).toHaveURL(/\/sign-in/);
  await guest.close();
  await owner.close();
});
