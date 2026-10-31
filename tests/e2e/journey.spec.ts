import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

/**
 * Workbook Step 34: the whole PetCare journey in one recorded run.
 * Bibi signs in with an OTP, finds care for Eid, books Rashid, Rashid confirms, the stay has updates and an acute event,
 * the stay completes with a verified review, the payout is queued net of commission, Bibi books again, and the admin
 * handles the dispute with a payout freeze and a refund.
 * The running server cannot move its clock, so one step edits the booking's dates in the end-to-end database to make
 * the stay "already happened". Booking chat is a deferred feature and is not part of this journey.
 */
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'journey',
    'The final journey runs once, in the journey project',
  );
});

const BASE = 'http://localhost:4321';
const VIDEO_DIR = new URL('../../evidence/STEP-34-videos/', import.meta.url).pathname;
const video = (name: string) => ({
  recordVideo: { dir: `${VIDEO_DIR}${name}`, size: { width: 390, height: 844 } },
});
const DUMMY = 'http://localhost:4100';
const E2E_DB = 'postgres://petcare:petcare@localhost:5433/petcare_e2e';
const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const gateway = async (bookingId: string) => {
  const body = (await (await fetch(`${DUMMY}/_training/payments/inspect`)).json()) as {
    state: {
      authorizations: Array<{
        bookingRef: string;
        status: string;
        amount: number;
        refundedTotal: number;
      }>;
    };
  };
  return body.state.authorizations.find((a) => a.bookingRef === bookingId);
};

test('Bibi and Rashid: from first visit to refund', async ({ browser }, testInfo) => {
  testInfo.setTimeout(240_000);
  const FROM = plus(200);
  const TO = plus(208); // 8 nights inside the Eid window
  const db = new pg.Client({ connectionString: E2E_DB });
  await db.connect();

  // Setup the way the product expects it: the admin defines the Eid peak window; Rashid raises his Eid room.
  const admin = await contextAs(browser, 'admin', {
    baseURL: BASE,
    viewport: { width: 390, height: 844 },
    ...video('3-admin'),
  });
  const provider = await contextAs(browser, 'provider', {
    baseURL: BASE,
    viewport: { width: 390, height: 844 },
    ...video('2-provider'),
  });
  await admin.request.post(`${BASE}/api/admin/peak-windows`, {
    data: { name: 'Eid (training)', startDate: FROM, endDate: plus(208) },
  });
  const peak = (await (await provider.request.get(`${BASE}/api/peak-windows`)).json()) as {
    windows: Array<{ id: string; name: string }>;
  };
  await provider.request.post(`${BASE}/api/provider/capacity/expand-peak`, {
    data: { windowId: peak.windows.find((w) => w.name === 'Eid (training)')!.id, capacity: 3 },
  });

  // 1. Open PetCare and sign in with an OTP as Bibi.
  const owner = await browser.newContext({
    baseURL: BASE,
    viewport: { width: 390, height: 844 },
    ...video('1-owner'),
  });
  const page = await owner.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('বিশ্বস্ত ঘরোয়া যত্ন');
  await page.goto('/sign-in');
  await hydrated(page);
  await page.getByTestId('phone-input').fill('01712000001');
  await page.getByTestId('send-code').click();
  await expect(page.getByTestId('code-input')).toBeVisible();
  const challenges = (await (await fetch(`${DUMMY}/_training/otp/inspect`)).json()) as {
    state: { challenges: Array<{ phone: string; code: string }> };
  };
  await page
    .getByTestId('code-input')
    .fill(challenges.state.challenges.find((c) => c.phone === '+8801712000001')!.code);
  await page.getByTestId('verify').click();
  await expect(page).toHaveURL(/\/$/);

  // 2. Tito's care profile.
  await page.goto('/pets');
  await page.getByTestId('pet-card').filter({ hasText: 'Tito' }).click();
  await expect(page.getByTestId('pet-medications')).toContainText('08:00, 20:00');

  // 3. Curated shortlist for the Eid window, with the reason shown.
  await page.goto('/');
  await page.locator('#from').fill(FROM);
  await page.locator('#to').fill(TO);
  await page.getByTestId('search-submit').click();
  await expect(page.getByTestId('result').first()).toContainText('রশিদ');
  await expect(page.getByTestId('reason').first()).toContainText('গুলশান');

  // 4. Rashid's Tier-A profile, then configure the stay and authorize BDT 20,000 with bKash.
  await page.getByTestId('result').first().click();
  await expect(page.getByTestId('provider-title')).toHaveText('রশিদ');
  await expect(page.getByTestId('availability')).toContainText('প্রতি রাতে খালি');
  await page.getByTestId('book-button').click();
  await hydrated(page);
  await expect(page.getByTestId('nights-free')).toBeVisible();
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('care-summary')).toContainText('insulin');
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('total')).toContainText('৳20,000');
  await expect(page.getByTestId('method-bkash')).toBeChecked();
  await page.getByTestId('submit-booking').click();
  await expect(page).toHaveURL(/\/bookings\/bk_[0-9a-f]+$/);
  const bookingId = page.url().split('/').pop()!;
  await expect(page.getByTestId('hold')).toContainText('৳20,000');
  expect((await gateway(bookingId))?.status).toBe('authorized'); // held, nothing captured yet

  // 5. Rashid confirms from Today; the payment is captured once.
  const rashid = await provider.newPage();
  await rashid.goto('/provider');
  await rashid.locator(`a[href$="/provider/bookings/${bookingId}"]`).click();
  await expect(rashid.getByTestId('request-care')).toContainText('insulin');
  await rashid.getByTestId('confirm-request').click();
  await expect(rashid.locator('[data-state="captured"]')).toBeVisible();
  const captured = await gateway(bookingId);
  expect(captured).toMatchObject({ status: 'captured', amount: 2_000_000 });
  const rate = await db.query('SELECT commission_basis_points AS bp FROM bookings WHERE id = $1', [
    bookingId,
  ]);
  expect(rate.rows[0].bp).toBe(800); // Tier-A inside the Eid window

  // 6. The stay: move the booking's dates into the past, start it, post a daily update with a photo, check the vet directory.
  await db.query(
    "UPDATE bookings SET start_date = (now() AT TIME ZONE 'Asia/Dhaka')::date - 8, end_date = (now() AT TIME ZONE 'Asia/Dhaka')::date WHERE id = $1",
    [bookingId],
  );
  await rashid.reload();
  await rashid.getByTestId('start-stay').click();
  await expect(rashid.locator('[data-state="in-stay"]')).toBeVisible();
  await hydrated(rashid);
  await rashid.getByTestId('update-note').fill('Tito had his insulin and a long walk');
  await rashid.getByTestId('update-food').selectOption('ate_well');
  await rashid.getByTestId('add-med').click();
  await rashid.getByTestId('med-name-0').fill('insulin');
  await rashid.getByTestId('med-time-0').fill('08:05');
  await rashid
    .getByTestId('update-photos')
    .setInputFiles({ name: 'tito.png', mimeType: 'image/png', buffer: PNG });
  await rashid.getByTestId('update-send').click();
  await expect(rashid.getByTestId('update')).toHaveCount(1);
  await expect(rashid.getByTestId('vet-clinics')).toBeVisible();

  // 7. Acute event: Rashid reports a concern; the admin runbook; the owner is told.
  await rashid.getByText('উদ্বেগের কথা জানান').click();
  await rashid.getByTestId('acute-type').selectOption('illness');
  await rashid.getByTestId('acute-severity').selectOption('minor');
  await rashid.getByTestId('acute-observation').fill('Tito skipped one meal');
  await rashid.getByTestId('acute-send').click();
  await expect(rashid.getByTestId('acute-sent')).toBeVisible();
  const adminPage = await admin.newPage();
  await adminPage.goto('/admin');
  await expect(adminPage.locator('[data-kind="acute"]').first()).toBeVisible();
  await adminPage.locator('[data-kind="acute"]').first().click();
  await adminPage.getByTestId('done-confirm_trigger').click();
  await adminPage.getByTestId('send-bn').click();
  await expect(adminPage.getByTestId('status-owner_notification')).toHaveText('Done');
  await page.goto(`/bookings/${bookingId}`);
  await expect(page.getByTestId('acute-banner')).toContainText('Tito');
  await expect(page.getByTestId('acute-message').first()).toContainText('Tito');
  await expect(page.getByTestId('update')).toHaveCount(1);

  // 8. Completion, then a verified review with a stay photo.
  await rashid.goto(`/provider/bookings/${bookingId}`);
  await rashid.getByTestId('mark-complete').click();
  await expect(rashid.getByTestId('completion-waiting')).toBeVisible();
  await page.goto(`/bookings/${bookingId}`);
  await page.getByTestId('confirm-completion').click();
  await expect(page.getByTestId('completed')).toBeVisible();
  await page.getByTestId('review-rating').selectOption('5');
  await page.getByTestId('review-text').fill('Tito was happy and his insulin was never missed');
  await page.getByTestId('review-photo').first().check();
  await page.getByTestId('review-send').click();
  await expect(page.getByTestId('your-review')).toContainText('5/5');

  // 9. The payout is queued net of the commission (held while the acute event is open).
  await rashid.goto('/provider/earnings');
  const line = rashid.getByTestId('earnings-line').first();
  await expect(line).toContainText('৳20,000');
  await expect(line).toContainText('8 %');
  await expect(line.getByTestId('earnings-net')).toContainText('৳18,400');

  // 10. Book again, timed: well under 4 minutes.
  await page.goto('/');
  await page.getByTestId('home-book-again-button').click();
  await hydrated(page);
  await expect(page.getByTestId('again-note')).toContainText('Tito');
  await page.getByTestId('book-from').fill(plus(300));
  await page.getByTestId('book-to').fill(plus(303));
  await expect(page.getByTestId('nights-free')).toBeVisible();
  await page.getByTestId('step-next').click();
  await page.getByTestId('step-next').click();
  await page.getByTestId('submit-booking').click();
  await expect(page).toHaveURL(/\/bookings\/bk_[0-9a-f]+$/);
  const timer = await db.query(
    'SELECT started_at, submitted_at FROM book_again_timers WHERE submitted_at IS NOT NULL ORDER BY started_at DESC LIMIT 1',
  );
  const seconds =
    (timer.rows[0].submitted_at.getTime() - timer.rows[0].started_at.getTime()) / 1000;
  expect(seconds).toBeLessThan(240);

  // 11. Admin: the owner reports a problem, the payout stays frozen, the admin refunds part of it.
  await page.goto(`/bookings/${bookingId}`);
  await page.getByText('সমস্যা জানান').click();
  await page.getByTestId('report-category').selectOption('care-not-as-agreed');
  await page.getByTestId('report-description').fill('One evening walk was skipped');
  await page.getByTestId('report-send').click();
  await expect(page.getByTestId('report-sent')).toBeVisible();
  const payout = await db.query('SELECT status FROM payouts WHERE booking_id = $1', [bookingId]);
  expect(payout.rows[0].status).toBe('frozen');
  await adminPage.goto('/admin');
  await adminPage.locator('[data-kind="report"]').first().click();
  await adminPage.getByTestId('rationale').fill('One walk missed; part refund agreed');
  await adminPage.getByTestId('refund').fill('500000');
  await adminPage.getByTestId('resolve-submit').click();
  await expect(adminPage.getByTestId('report-title')).toContainText('Resolved');
  expect((await gateway(bookingId))?.refundedTotal).toBe(500_000);
  await page.goto(`/bookings/${bookingId}`);
  await expect(page.locator('[data-state="refunded"]')).toBeVisible();
  const net = await db.query('SELECT net_poisha, status FROM payouts WHERE booking_id = $1', [
    bookingId,
  ]);
  expect(net.rows[0]).toEqual({ net_poisha: 1_380_000, status: 'queued' }); // (20,000 - 5,000) less 8 %

  // 12. The audit log and the operating ceiling, then Bangla and English.
  await adminPage.goto('/admin/audit?action=report.resolved');
  await expect(adminPage.getByTestId('audit-entry').first()).toContainText('report.resolved');
  await adminPage.goto('/admin/insights');
  await expect(adminPage.getByTestId('ceiling')).toContainText('of 25');
  await page.goto('/pets');
  await page.getByTestId('language-toggle').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your pets');

  await db.end();
  await owner.close();
  await admin.close();
  await provider.close();
});
