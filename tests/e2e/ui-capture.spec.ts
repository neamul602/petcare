import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { mkdirSync } from 'node:fs';
import { contextAs } from './sessions.ts';

/**
 * Workbook Step 33 helper: takes screenshots of the application in the states the mockups show, and of the mockups
 * themselves, so they can be compared side by side. It only runs when UI_CAPTURE=1 (it is not part of the normal suite).
 *   UI_CAPTURE=1 npx playwright test tests/e2e/ui-capture.spec.ts --project=phone
 */
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    !process.env.UI_CAPTURE || testInfo.project.name !== 'phone',
    'Screenshot capture is on demand only',
  );
});

const BASE = 'http://localhost:4321';
const E2E_DB = 'postgres://petcare:petcare@localhost:5433/petcare_e2e';
const OUT = new URL('../../evidence/STEP-33-ui-validation/', import.meta.url).pathname;
const MOCKUPS = new URL('../../docs/ux/mockups/', import.meta.url).pathname;
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const shot = async (page: Page, name: string) => {
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}app/${name}.png`, fullPage: true });
};

test('capture the mockups and the matching application screens', async ({ browser }) => {
  test.setTimeout(240_000);
  mkdirSync(`${OUT}app`, { recursive: true });
  mkdirSync(`${OUT}mockup`, { recursive: true });

  // The mockups themselves (390 px phone frames; the three admin desktop mockups at 1280 px).
  const desktop = ['06-admin-queue', '42-acute-event-runbook', '47-review-moderation-queue'];
  const names = [
    '01-home',
    '02-search-results',
    '03-provider-profile',
    '04-booking-configuration',
    '05-booking-confirmation',
    '06-admin-queue',
    '07-provider-calendar',
    '08-acute-event',
    '13-curated-shortlist',
    '15-pet-profile-management',
    '17-booking-submission-payment',
    '21-care-history-view',
    '22-book-again-path',
    '35-in-stay-management',
    '36-daily-update-composer',
    '42-acute-event-runbook',
    '47-review-moderation-queue',
    '57-acute-event-trigger',
  ];
  for (const name of names) {
    const context = await browser.newContext({
      viewport: desktop.includes(name) ? { width: 1280, height: 800 } : { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`file://${MOCKUPS}${name}.html`);
    await page.waitForLoadState('load');
    await page.screenshot({ path: `${OUT}mockup/${name}.png`, fullPage: true });
    await context.close();
  }

  const phone = { baseURL: BASE, viewport: { width: 390, height: 844 } };
  const owner = await contextAs(browser, 'bibi', phone);
  const provider = await contextAs(browser, 'provider', phone);
  const admin = await contextAs(browser, 'admin', {
    baseURL: BASE,
    viewport: { width: 1280, height: 800 },
  });
  const db = new pg.Client({ connectionString: E2E_DB });
  await db.connect();
  const FROM = plus(400);
  const TO = plus(408);
  await provider.request.put(`${BASE}/api/provider/capacity`, {
    data: { dates: [0, 1, 2].map(plus), capacity: 20 },
  });

  const o = await owner.newPage();
  await o.goto('/');
  await shot(o, '01-home');
  await o.goto(`/search?from=${FROM}&to=${TO}&species=dog`);
  await shot(o, '13-curated-shortlist');
  await shot(o, '02-search-results');
  await o.goto(`/providers/rashid?from=${FROM}&to=${TO}&species=dog`);
  await shot(o, '03-provider-profile');
  await o.goto(`/book/rashid?from=${FROM}&to=${TO}`);
  await hydrated(o);
  await expect(o.getByTestId('nights-free')).toBeVisible();
  await shot(o, '04-booking-configuration');
  await o.getByTestId('step-next').click();
  await o.getByTestId('step-next').click();
  await expect(o.getByTestId('review')).toBeVisible();
  await shot(o, '17-booking-submission-payment');
  await o.getByTestId('submit-booking').click();
  await expect(o).toHaveURL(/\/bookings\/bk_/);
  const id = o.url().split('/').pop()!;
  await shot(o, '05-booking-waiting');
  await o.goto('/pets/tito/edit');
  await hydrated(o);
  await shot(o, '15-pet-profile-management');

  const p = await provider.newPage();
  await p.goto('/provider/calendar');
  await shot(p, '07-provider-calendar');
  await p.goto(`/provider/bookings/${id}`);
  await shot(p, '03-request-view');
  await p.getByTestId('confirm-request').click();
  await expect(p.locator('[data-state="captured"]')).toBeVisible();
  await o.goto(`/bookings/${id}`);
  await shot(o, '05-booking-confirmation');
  await db.query(
    "UPDATE bookings SET start_date = (now() AT TIME ZONE 'Asia/Dhaka')::date - 8, end_date = (now() AT TIME ZONE 'Asia/Dhaka')::date WHERE id = $1",
    [id],
  );
  await p.reload();
  await p.getByTestId('start-stay').click();
  await expect(p.locator('[data-state="in-stay"]')).toBeVisible();
  await hydrated(p);
  await p.getByTestId('update-note').fill('Tito had his insulin and a long walk');
  await p.getByTestId('update-food').selectOption('ate_well');
  await p
    .getByTestId('update-photos')
    .setInputFiles({ name: 'tito.png', mimeType: 'image/png', buffer: PNG });
  await shot(p, '36-daily-update-composer');
  await p.getByTestId('update-send').click();
  await expect(p.getByTestId('update')).toHaveCount(1);
  await shot(p, '35-in-stay-management');
  await p.getByText('উদ্বেগের কথা জানান').click();
  await shot(p, '57-acute-event-trigger');
  await p.getByTestId('acute-observation').fill('Tito skipped one meal');
  await p.getByTestId('acute-send').click();
  await expect(p.getByTestId('acute-sent')).toBeVisible();
  await shot(p, '08-acute-event-provider');
  await o.goto(`/bookings/${id}`);
  await shot(o, '08-acute-event');

  const a = await admin.newPage();
  await a.goto('/admin');
  await shot(a, '06-admin-queue');
  await a.locator('[data-kind="acute"]').first().click();
  await a.getByTestId('done-confirm_trigger').click();
  await a.getByTestId('send-bn').click();
  await expect(a.getByTestId('status-owner_notification')).toHaveText('Done');
  await shot(a, '42-acute-event-runbook');

  await p.goto(`/provider/bookings/${id}`);
  await p.getByTestId('mark-complete').click();
  await o.goto(`/bookings/${id}`);
  await o.getByTestId('confirm-completion').click();
  await expect(o.getByTestId('completed')).toBeVisible();
  await o.getByTestId('review-rating').selectOption('2');
  await o.getByTestId('review-text').fill('Not what I hoped for');
  await o.getByTestId('review-send').click();
  await expect(o.getByTestId('your-review')).toBeVisible();
  await o.goto('/pets/tito?tab=history');
  await shot(o, '21-care-history-view');
  await o.goto('/');
  await o.getByTestId('home-book-again-button').click();
  await hydrated(o);
  await shot(o, '22-book-again-path');
  await a.goto('/admin/reviews');
  await shot(a, '47-review-moderation-queue');

  await db.end();
  await owner.close();
  await provider.close();
  await admin.close();
});
