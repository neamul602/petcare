import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// BKG-10, BKG-12, BKG-14, BKG-18 end to end: confirmed to in stay, daily update with photos, vet clinics, owner view.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Stay flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test('Rashid starts a stay that begins today, posts an update with photos, and Bibi sees it with the vet clinics', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const made = await owner.request.post(`${baseURL}/api/owner/bookings`, {
    data: {
      key: `stay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(0),
      to: plus(2),
      method: 'bkash',
    },
  });
  expect(made.ok()).toBe(true);
  const id = ((await made.json()) as { booking: { id: string } }).booking.id;

  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await page.getByTestId('confirm-request').click();
  await expect(page.locator('[data-state="captured"]')).toBeVisible();
  await expect(page.getByTestId('vet-clinics')).toContainText('গুলশান');
  await expect(page.getByTestId('vet-clinics')).toContainText('শুধু খুঁজে দেখার তালিকা');
  await page.getByTestId('start-stay').click();
  await expect(page.locator('[data-state="in-stay"]')).toBeVisible();
  await hydrated(page);
  expect(await scan(page)).toEqual([]);

  await page.getByTestId('update-note').fill('Tito ate well and had a long walk');
  await page.getByTestId('update-food').selectOption('ate_well');
  await page.getByTestId('update-mood').selectOption('happy');
  await page.getByTestId('add-med').click();
  await page.getByTestId('med-name-0').fill('insulin');
  await page.getByTestId('med-time-0').fill('08:05');
  await page.getByTestId('update-photos').setInputFiles([
    { name: 'a.png', mimeType: 'image/png', buffer: PNG },
    { name: 'b.png', mimeType: 'image/png', buffer: PNG },
  ]);
  await page.getByTestId('update-send').click();
  await expect(page.getByTestId('update')).toHaveCount(1);
  await expect(page.getByTestId('update')).toContainText('Tito ate well');
  await expect(page.getByTestId('update')).toContainText('insulin 08:05');
  await expect(page.getByTestId('update').locator('img')).toHaveCount(2);
  await hydrated(page);
  await page.getByTestId('update-note').fill('Second update, note only');
  await page.getByTestId('update-send').click();
  await expect(page.getByTestId('update')).toHaveCount(2);
  await expect(page.getByTestId('update').first()).toContainText('Second update');

  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/bookings/${id}`);
  await expect(ownerPage.locator('[data-state="in-stay"]')).toBeVisible();
  await expect(ownerPage.getByTestId('update')).toHaveCount(2);
  await expect(ownerPage.getByTestId('update').first()).toContainText('Second update');
  const image = ownerPage.getByTestId('update').nth(1).locator('img').first();
  await expect(image).toBeVisible();
  expect(await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(
    true,
  );
  await expect(ownerPage.getByTestId('vet-call').first()).toHaveAttribute('href', /^tel:\+8801/);
  await expect(ownerPage.getByTestId('vet-clinics')).toContainText('সুপারিশ নয়');
  expect(await scan(ownerPage)).toEqual([]);
  await provider.close();
  await owner.close();
});

test('a stay that starts in the future cannot be started yet', async ({ browser, baseURL }) => {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const made = await owner.request.post(`${baseURL}/api/owner/bookings`, {
    data: {
      key: `early-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: plus(90),
      to: plus(92),
      method: 'bkash',
    },
  });
  const id = ((await made.json()) as { booking: { id: string } }).booking.id;
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto(`/provider/bookings/${id}`);
  await page.getByTestId('confirm-request').click();
  await expect(page.locator('[data-state="captured"]')).toBeVisible();
  await expect(page.getByTestId('start-stay')).toHaveCount(0);
  const attempt = await provider.request.post(`${baseURL}/api/provider/bookings/${id}/start`);
  expect(attempt.status()).toBe(409);
  await provider.close();
  await owner.close();
});
