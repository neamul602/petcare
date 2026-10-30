import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// Payment failure paths. They switch the shared Dummy gateway into decline or down mode, so this file runs
// in its own project after every other spec has finished (see playwright.config.ts).
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'money',
    'Money failure flows run once, in the money project',
  );
});
test.describe.configure({ mode: 'serial' });

const DUMMY = 'http://localhost:4100';
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const FROM = plus(20);
const TO = plus(28);
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const setPayments = (mode: string) =>
  fetch(`${DUMMY}/_training/payments/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode }),
  });

async function openBook(page: Page) {
  await page.goto(`/book/rashid?from=${FROM}&to=${TO}`, { waitUntil: 'networkidle' });
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

test.afterEach(async () => {
  await setPayments('none');
});

test('a declined payment is explained and no booking is made; the inputs are still there afterwards', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const page = await owner.newPage();
  await openBook(page);
  await toReview(page);
  await setPayments('decline');
  await page.getByTestId('submit-booking').click();
  await expect(page.getByTestId('submit-error')).toHaveText(
    'আপনার পেমেন্ট পদ্ধতি গ্রহণ করা হয়নি। অন্য পদ্ধতি চেষ্টা করুন।',
  );
  await expect(page).toHaveURL(/\/book\/rashid/);
  await page.reload({ waitUntil: 'networkidle' });
  await hydrated(page);
  await expect(page.getByTestId('step')).toContainText('3');
  await setPayments('down');
  await page.getByTestId('submit-booking').click();
  await expect(page.getByTestId('submit-error')).toContainText('কোনো টাকা কাটা হয়নি');
  await setPayments('none');
  await owner.close();
});
