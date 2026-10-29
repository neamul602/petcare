import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// ACC-01 / ACC-02 end to end: sign-in, protected areas, sign-out. Runs against the web app (dev),
// the PetCare API and the Dummy OTP service. One browser profile only, one test at a time: the
// code service and the per-number send limit are shared state.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Sign-in flows run on the phone profile only');
});
test.describe.configure({ mode: 'serial' });

const DUMMY = 'http://localhost:4100';
const ADMIN = {
  email: 'ayaat@petcare.training',
  password: process.env.ADMIN_TRAINING_PASSWORD ?? 'training-admin-pass',
};
const BIBI = '01712000001';
const RASHID = '01712000002';

const codeFor = async (normalised: string) => {
  const { state } = (await (await fetch(`${DUMMY}/_training/otp/inspect`)).json()) as {
    state: { challenges: Array<{ phone: string; code: string }> };
  };
  return state.challenges.find((c) => c.phone === normalised)!.code;
};
const setOtpMode = (mode: string) =>
  fetch(`${DUMMY}/_training/otp/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode }),
  });

/** The sign-in form is a Preact island: wait until it is interactive before using it. */
const hydrated = (page: Page) =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

async function sendCode(page: Page, phone: string) {
  await hydrated(page);
  await page.getByTestId('phone-input').fill(phone);
  await page.getByTestId('send-code').click();
}
async function enterCode(page: Page, normalised: string) {
  await expect(page.getByTestId('code-input')).toBeVisible();
  await page.getByTestId('code-input').fill(await codeFor(normalised));
  await page.getByTestId('verify').click();
}

test.beforeEach(async () => {
  await fetch(`${DUMMY}/_training/reset-all`, { method: 'POST' });
});

test('a guest is sent to sign in and comes back to the page they wanted', async ({ page }) => {
  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fbookings$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('PetCare-এ সাইন ইন করুন');
  await sendCode(page, BIBI);
  await enterCode(page, '+8801712000001');
  await expect(page).toHaveURL(/\/bookings$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('আপনার বুকিং');
});

test('Bibi signs in, stays signed in after a reload, and signs out from Settings', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await sendCode(page, '01712-000001');
  await expect(page.getByTestId('code-hint')).toContainText('+8801712000001');
  await enterCode(page, '+8801712000001');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('sign-in-link')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('sign-in-link')).toHaveCount(0);
  await page.goto('/settings');
  await expect(page.getByTestId('signed-in-as')).toHaveText('Bibi হিসেবে সাইন ইন করা আছে');
  await page.getByTestId('sign-out').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('sign-in-link')).toBeVisible();
  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('the sign-in cookie cannot be read by page scripts', async ({ page, context }) => {
  await page.goto('/sign-in');
  await sendCode(page, BIBI);
  await enterCode(page, '+8801712000001');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => document.cookie)).not.toContain('pc_session');
  const cookie = (await context.cookies()).find((c) => c.name === 'pc_session');
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
});

test('a wrong code is explained in Bangla and the right code then works', async ({ page }) => {
  await page.goto('/sign-in');
  await sendCode(page, BIBI);
  await expect(page.getByTestId('code-input')).toBeVisible();
  const real = await codeFor('+8801712000001');
  await page.getByTestId('code-input').fill(real === '000000' ? '111111' : '000000');
  await page.getByTestId('verify').click();
  await expect(page.getByTestId('error-message')).toHaveText(
    'কোডটি সঠিক নয়। দেখে আবার চেষ্টা করুন।',
  );
  await expect(page.getByTestId('code-input')).toBeVisible();
  await page.getByTestId('code-input').fill(real);
  await page.getByTestId('verify').click();
  await expect(page).toHaveURL(/\/$/);
});

test('the resend button counts down before it can be used and the page can switch to English', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByTestId('language-toggle').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in to PetCare');
  await sendCode(page, '01712000010');
  await expect(page.getByTestId('resend')).toBeDisabled();
  await expect(page.getByTestId('resend')).toContainText(/Send a new code in \d+s/);
  await page.getByTestId('change-phone').click();
  await expect(page.getByTestId('phone-input')).toBeVisible();
});

test('a new number gives a name and a neighbourhood once, then signs in as an owner', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await sendCode(page, '01799000123');
  await enterCode(page, '+8801799000123');
  await expect(page.getByTestId('name-input')).toBeVisible();
  await expect(page.getByTestId('neighbourhood-select').locator('option')).toHaveText([
    'একটি বেছে নিন',
    'গুলশান',
    'বনানী',
    'বারিধারা',
  ]);
  await page.getByTestId('name-input').fill('Nadia');
  await page.getByTestId('neighbourhood-select').selectOption('banani');
  await page.getByTestId('finish').click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/settings');
  await expect(page.getByTestId('signed-in-as')).toContainText('Nadia');
});

test('when the code service is down sign-in says so and works again afterwards', async ({
  page,
}) => {
  await setOtpMode('down');
  await page.goto('/sign-in');
  await sendCode(page, '01712000011');
  await expect(page.getByTestId('error-message')).toHaveText(
    'কোড পাঠানোর সেবা এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
  );
  await expect(page.getByTestId('phone-input')).toBeVisible();
  await setOtpMode('none');
  await page.getByTestId('send-code').click();
  await enterCode(page, '+8801712000011').catch(() => undefined);
  await expect(page.getByTestId('code-input')).toBeVisible();
});

test("a provider lands on the provider home, and the two sides keep out of each other's areas", async ({
  page,
}) => {
  await page.goto('/sign-in');
  await sendCode(page, RASHID);
  await enterCode(page, '+8801712000002');
  await expect(page).toHaveURL(/\/provider$/);
  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/provider$/);
  await page.goto('/provider/settings');
  await expect(page.getByTestId('signed-in-as')).toContainText('Rashid');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/sign-in$/);
});

test('an owner cannot open provider pages', async ({ page }) => {
  await page.goto('/sign-in');
  await sendCode(page, '01799000124');
  await enterCode(page, '+8801799000124');
  await page.getByTestId('name-input').fill('Owner Only');
  await page.getByTestId('neighbourhood-select').selectOption('gulshan');
  await page.getByTestId('finish').click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/provider/calendar');
  await expect(page).toHaveURL(/\/$/);
});

test.describe('admin', () => {
  test('/admin needs the admin to sign in, a wrong password is refused in English, the right one works and signs out', async ({
    page,
  }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/sign-in$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Admin sign in');
    await expect(page.getByTestId('language-toggle')).toHaveCount(0);
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByTestId('error-message')).toHaveText(
      'The email or password is not right.',
    );
    await page.getByLabel('Email').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByTestId('sign-out-mobile')).toBeVisible();
    await page.goto('/admin/providers');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Providers');
    await page.goto('/admin/sign-in');
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByTestId('sign-out-mobile').click();
    await expect(page).toHaveURL(/\/admin\/sign-in$/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/sign-in$/);
  });

  test('an owner session does not open the admin console', async ({ page }) => {
    await page.goto('/sign-in');
    await sendCode(page, BIBI);
    await enterCode(page, '+8801712000001');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/sign-in$/);
  });
});

test.describe('sign-in steps are accessible', () => {
  for (const locale of ['bn', 'en']) {
    test(`code step and profile step have no WCAG 2.1 AA violations (${locale})`, async ({
      page,
      context,
      baseURL,
    }) => {
      await context.addCookies([{ name: 'pc_locale', value: locale, url: baseURL! }]);
      const scan = async () =>
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
        ).violations.map((v) => v.id);
      const raw = locale === 'bn' ? '01799000201' : '01799000202';
      await page.goto('/sign-in', { waitUntil: 'networkidle' });
      await sendCode(page, raw);
      await expect(page.getByTestId('code-input')).toBeVisible();
      expect(await scan()).toEqual([]);
      await enterCode(page, `+88${raw}`);
      await expect(page.getByTestId('name-input')).toBeVisible();
      expect(await scan()).toEqual([]);
    });
  }
});
