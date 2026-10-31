import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// PET-01..PET-06 end to end as Bibi (owner with Tito in the training seed). One profile, one test at a time.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Pet flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);

// 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test('a new owner sees the empty state, Bibi sees Tito, and a guest is sent to sign in', async ({
  browser,
  baseURL,
}) => {
  const fresh = await contextAs(browser, 'owner', { baseURL });
  const freshPage = await fresh.newPage();
  await freshPage.goto('/pets');
  await expect(freshPage.locator('[data-state="empty"]')).toBeVisible();
  expect(await scan(freshPage)).toEqual([]);
  await fresh.close();
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const page = await owner.newPage();
  await page.goto('/pets');
  await expect(page.getByTestId('pet-card').filter({ hasText: 'Tito' })).toBeVisible();
  await owner.close();
  const guest = await contextAs(browser, null, { baseURL });
  const guestPage = await guest.newPage();
  await guestPage.goto('/pets/new');
  await expect(guestPage).toHaveURL(/\/sign-in/);
  await guest.close();
});

test('Tito’s profile shows the care plan and an empty care history', async ({
  browser,
  baseURL,
}) => {
  const owner = await contextAs(browser, 'bibi', { baseURL });
  const page = await owner.newPage();
  await page.goto('/pets');
  await page.getByTestId('pet-card').filter({ hasText: 'Tito' }).click();
  await expect(page.getByTestId('pet-title')).toHaveText('Tito');
  await expect(page.getByTestId('pet-medications')).toContainText('08:00, 20:00');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('tab-history').click();
  await expect(page.getByTestId('pet-history')).toBeVisible();
  expect(await scan(page)).toEqual([]);
  await owner.close();
});

test('an owner adds a cat with a medicine and a photo, edits it, and archives it', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(60_000); // photo upload and four page loads: slow when the whole suite runs in parallel
  const owner = await contextAs(browser, 'owner', { baseURL });
  const page = await owner.newPage();
  await page.goto('/pets/new', { waitUntil: 'networkidle' });
  await hydrated(page);
  expect(await scan(page)).toEqual([]);

  // Mistakes are shown next to the field.
  await page.getByTestId('save-pet').click();
  await expect(page.getByTestId('error-summary')).toBeVisible();
  await expect(page.locator('#name-err')).toBeVisible();
  expect(await scan(page)).toEqual([]);

  // Species-specific fields switch.
  await expect(page.getByTestId('dog-fields')).toBeVisible();
  await page.getByTestId('pet-species-cat').click();
  await expect(page.getByTestId('cat-fields')).toBeVisible();
  await expect(page.getByTestId('dog-fields')).toHaveCount(0);

  await page.getByTestId('pet-name').fill('Mimi');
  await page.getByTestId('pet-breed').fill('Persian');
  await page.getByTestId('pet-age').fill('4');
  await page.getByTestId('pet-weight').fill('4.2');
  await page.getByTestId('add-medication').click();
  await page.getByTestId('med-name-0').fill('Thyroid tablet');
  await page.getByTestId('med-dose-0').fill('1 tablet');
  await page.getByTestId('med-times-0').fill('9am');
  await page.getByTestId('save-pet').click();
  await expect(page.locator('#med-times-0-err')).toBeVisible();
  await page.getByTestId('med-times-0').fill('09:00');
  await page.getByTestId('photo-input').setInputFiles({
    name: 'mimi.png',
    mimeType: 'image/png',
    buffer: PNG,
  });
  await page.getByTestId('save-pet').click();
  await expect(page).toHaveURL(/\/pets\/pet_[\w-]+$/);
  await expect(page.getByTestId('pet-title')).toHaveText('Mimi');
  await expect(page.getByTestId('pet-medications')).toContainText('Thyroid tablet');
  await expect(page.locator('main img').first()).toBeVisible();

  await page.getByTestId('edit-pet').click();
  await hydrated(page);
  await expect(page.getByTestId('pet-name')).toHaveValue('Mimi');
  await page.getByTestId('pet-weight').fill('4.5');
  await page.getByTestId('save-pet').click();
  await expect(page).toHaveURL(/\/pets\/pet_[\w-]+$/);
  await expect(page.locator('main')).toContainText('4.5');

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByTestId('archive-pet').click();
  await expect(page).toHaveURL(/\/pets$/);
  await expect(page.getByTestId('pet-card').filter({ hasText: 'Mimi' })).toHaveCount(0);
  await owner.close();
});

test('a pet that does not exist shows the friendly 404', async ({ browser, baseURL }) => {
  const owner = await contextAs(browser, 'owner', { baseURL });
  const page = await owner.newPage();
  const response = await page.goto('/pets/pet_missing');
  expect(response?.status()).toBe(404);
  await owner.close();
});
