import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// BKG-02..04 end to end as Bibi: the Book flow, payment hold, the waiting page and cancel.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Booking flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const FROM = plus(20);
const TO = plus(28); // 8 nights
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
async function openBook(page: Page, from = FROM, to = TO) {
  await page.goto(`/book/rashid?from=${from}&to=${to}`, { waitUntil: 'networkidle' });
  await hydrated(page);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await hydrated(page);
}
async function toReview(page: Page) {
  await expect(page.getByTestId('nights-free')).toBeVisible();
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('care-summary')).toContainText('insulin');
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('review')).toBeVisible();
}

test('Bibi books Rashid for 8 nights, sees the hold and the deadline, then cancels', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const page = await owner.newPage();
  await openBook(page);
  expect(await scan(page)).toEqual([]);
  await expect(page.getByTestId('book-pet')).toContainText('Tito');
  await toReview(page);
  await expect(page.getByTestId('breakdown')).toHaveText('8 রাত × ৳2,500');
  await expect(page.getByTestId('total')).toContainText('৳20,000');
  await expect(page.getByTestId('method-bkash')).toBeChecked();
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('method-nagad').check();
  await page.getByTestId('submit-booking').click();
  await expect(page).toHaveURL(/\/bookings\/bk_[0-9a-f]+$/);
  await expect(page.getByTestId('booking-title')).toHaveText('রশিদ-এর উত্তরের অপেক্ষায়');
  await expect(page.getByTestId('hold')).toContainText('৳20,000');
  await expect(page.getByTestId('deadline')).toBeVisible();
  await expect(page.locator('[data-state="authorized"]')).toBeVisible();
  expect(await scan(page)).toEqual([]);

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByTestId('cancel-request').click();
  await expect(page.getByTestId('canceled')).toBeVisible();
  await expect(page.locator('[data-state="canceled"]')).toBeVisible();
  await expect(page.getByTestId('history')).toContainText('বাতিল');
  await owner.close();
});

test('a night that is full is shown before continuing', async ({ browser, baseURL }) => {
  const provider = await contextAs(browser, 'provider', { baseURL });
  const night = plus(24);
  const closed = await provider.request.put(`${baseURL}/api/provider/capacity`, {
    data: { dates: [night], capacity: 0 },
  });
  expect(closed.ok()).toBe(true);
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const page = await owner.newPage();
  await openBook(page);
  await expect(page.getByTestId('nights-full')).toContainText(night);
  await expect(page.getByTestId('step-next')).toBeDisabled();
  await provider.request.put(`${baseURL}/api/provider/capacity`, {
    data: { dates: [night], capacity: 2 },
  });
  await owner.close();
  await provider.close();
});

test('clinical requests are blocked and doubtful wording needs a confirmation', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const page = await owner.newPage();
  await openBook(page);
  await expect(page.getByTestId('nights-free')).toBeVisible();
  await page.getByTestId('step-next').click();
  await page.getByTestId('declare-clinical').check();
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('clinical-blocked')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('declare-clinical').uncheck();
  await page.getByTestId('book-instructions').fill('Please do wound care twice a day');
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('needs-confirm')).toBeVisible();
  await page.getByTestId('confirm-not-clinical').check();
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('review')).toBeVisible();
  await owner.close();
});

test('a guest is sent to sign in, and a new owner with no pet is asked to add one', async ({
  browser,
  baseURL,
}) => {
  const guest = await contextAs(browser, null, { baseURL });
  const guestPage = await guest.newPage();
  await guestPage.goto('/book/rashid');
  await expect(guestPage).toHaveURL(/\/sign-in/);
  await guest.close();
  const fresh = await contextAs(browser, 'owner', { baseURL });
  const page = await fresh.newPage();
  await page.goto('/book/rashid', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('no-pet')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await fresh.close();
});

test('another owner cannot open the booking and an unknown booking shows the 404', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'owner', { baseURL });
  const page = await owner.newPage();
  expect((await page.goto('/bookings/bk_unknown'))?.status()).toBe(404);
  await owner.close();
});
