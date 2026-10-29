import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contextAs } from './sessions.ts';

// SRC-01, SRC-04, SRC-05 end to end: home, the shortlist, availability on the provider page, the provider calendar.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Search flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);

const plus = (days: number) => {
  const d = new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000);
  return d.toISOString().slice(0, 10);
};
const FROM = plus(10);
const TO = plus(13);
const query = `from=${FROM}&to=${TO}&species=dog`;

test('a guest sees the promise and how it works with no invented numbers, and can start a search', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('বিশ্বস্ত ঘরোয়া যত্ন');
  await expect(page.getByTestId('search-form')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/\d{2,}\+|%|★/);
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('find-care').click();
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByTestId('search-form')).toBeVisible();
});

test('a signed-in owner searches from the home screen', async ({ browser, baseURL }) => {
  const owner = await contextAs(browser, 'owner', { baseURL });
  const page = await owner.newPage();
  await page.goto('/');
  await expect(page.getByTestId('search-form')).toBeVisible();
  await expect(page.locator('#area option')).toHaveCount(4);
  await page.locator('#from').fill(FROM);
  await page.locator('#to').fill(TO);
  await page.getByTestId('search-submit').click();
  await expect(page).toHaveURL(/\/search\?/);
  await expect(page.getByTestId('result')).toHaveCount(3);
  await owner.close();
});

test('the shortlist shows 3 providers, Tier-A first, each with its reason, and View all lists everyone', async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([{ name: 'pc_locale', value: 'en', url: baseURL! }]);
  await page.goto(`/search?${query}`);
  const results = page.getByTestId('result');
  await expect(results).toHaveCount(3);
  await expect(results.first()).toContainText('Rashid');
  await expect(results.first()).toContainText('Introduced by PetCare');
  await expect(page.getByTestId('reason').first()).toHaveText(
    'Tier A · Gulshan · free every night',
  );
  await expect(results.last()).toContainText('Kamrul');
  await expect(page.locator('main')).not.toContainText(/sponsor|km away|distance/i);
  expect(await scan(page)).toEqual([]);
  await page.getByTestId('view-all').click();
  await expect(results).toHaveCount(4);
  await expect(page.getByText('Not free for every night')).toHaveCount(1);
  expect(await scan(page)).toEqual([]);
});

test('Bangla results and an empty result with a next step', async ({ page }) => {
  await page.goto(`/search?${query}`);
  await expect(page.getByTestId('reason').first()).toHaveText(
    'টিয়ার এ · গুলশান · প্রতি রাতে খালি',
  );
  expect(await scan(page)).toEqual([]);
  await page.goto(`/search?from=${FROM}&to=${TO}&species=dog&area=baridhara`);
  await expect(page.getByTestId('result')).toHaveCount(1);
  await expect(page.getByTestId('suggest')).toBeVisible();
  await page.goto(`/search?from=${FROM}&to=${TO}&species=cat&area=baridhara`);
  await expect(page.locator('[data-state="empty"]')).toBeVisible();
});

test('a result opens the provider page with availability for the chosen nights and carries the dates to Book', async ({
  page,
}) => {
  await page.goto(`/search?${query}`);
  await page.getByTestId('result').first().click();
  await expect(page.getByTestId('provider-title')).toHaveText('রশিদ');
  await expect(page.getByTestId('availability')).toContainText('প্রতি রাতে খালি');
  await expect(page.getByTestId('book-button')).toHaveAttribute(
    'href',
    `/book/rashid?from=${FROM}&to=${TO}`,
  );
  expect(await scan(page)).toEqual([]);
});

test('bad dates are explained', async ({ page }) => {
  await page.goto(`/search?from=${TO}&to=${FROM}&species=dog`);
  await expect(page.getByTestId('search-error')).toHaveText('চেক-আউট চেক-ইনের পরে হতে হবে।');
  await page.goto(`/search?from=2020-01-01&to=2020-01-03&species=dog`);
  await expect(page.getByTestId('search-error')).toHaveText('চেক-ইন অতীতের তারিখ হতে পারে না।');
});

test('a provider changes room for chosen nights and sees the night details', async ({
  browser,
  baseURL,
}) => {
  const start = plus(40);
  const provider = await contextAs(browser, 'provider', { baseURL });
  const page = await provider.newPage();
  await page.goto(`/provider/calendar?from=${start}`);
  await expect(page.getByTestId(`info-${start}`)).toContainText('2টির জায়গা');
  expect(await scan(page)).toEqual([]);
  await page.getByTestId(`night-${start}`).check();
  await page.locator('#capacity').fill('4');
  await page.locator('#note').fill('Eid week');
  await page.getByTestId('save-capacity').click();
  await expect(page.getByTestId('saved')).toBeVisible();
  await expect(page.getByTestId(`info-${start}`)).toContainText('4টির জায়গা');
  await expect(page.getByTestId(`info-${start}`)).toContainText('Eid week');
  const next = plus(41);
  await expect(page.getByTestId(`info-${next}`)).toContainText('2টির জায়গা');

  await page.getByTestId(`night-${start}`).check();
  await page.locator('#capacity').fill('0');
  await page.getByTestId('save-capacity').click();
  await expect(page.getByTestId(`info-${start}`)).toContainText('0টির জায়গা');
  await page.getByTestId(`night-${start}`).check();
  await page.locator('#capacity').fill('2');
  await page.locator('#note').fill('');
  await page.getByTestId('save-capacity').click();
  await expect(page.getByTestId('saved')).toBeVisible();
  await provider.close();
});
