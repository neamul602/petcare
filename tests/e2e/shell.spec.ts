import { expect, test } from '@playwright/test';
import { SCREEN_ROUTES } from '../../apps/web/src/lib/routes.ts';
import { contextAs, type Role } from './sessions.ts';

const shellFor = { owner: 'owner', provider: 'provider', admin: 'admin' } as const;
const PUBLIC_PATHS = ['/sign-in', '/admin/sign-in'];

/** Opens a page already signed in as the role (or as a guest). */
async function openAs(
  browser: import('@playwright/test').Browser,
  role: Role | null,
  options: import('@playwright/test').BrowserContextOptions,
) {
  const context = await contextAs(browser, role, options);
  return { context, page: await context.newPage() };
}

test.describe('every blueprint route opens in the right shell (FND-01)', () => {
  for (const route of SCREEN_ROUTES) {
    test(`${route.id} ${route.path}`, async ({ browser, baseURL, viewport }) => {
      const { context, page } = await openAs(
        browser,
        PUBLIC_PATHS.includes(route.path) ? null : route.role,
        { baseURL, viewport },
      );
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator(`[data-shell="${shellFor[route.role]}"]`)).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
      await context.close();
    });
  }

  test('unknown route shows the friendly 404 with a way home', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.locator('[data-screen="not-found"]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'হোমে যান' })).toBeVisible();
  });

  test('no horizontal scroll at 320 px on every shell', async ({ browser, baseURL }) => {
    for (const [path, role] of [
      ['/', 'owner'],
      ['/provider', 'provider'],
      ['/admin', 'admin'],
    ] as const) {
      const { context, page } = await openAs(browser, role, {
        baseURL,
        viewport: { width: 320, height: 700 },
      });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
      await context.close();
    }
  });
});

test.describe('navigation per role (FND-01)', () => {
  test('owner sees Home, Bookings, Pets, Inbox', async ({
    browser,
    baseURL,
    viewport,
    isMobile,
  }) => {
    const { context, page } = await openAs(browser, 'owner', { baseURL, viewport });
    await page.goto('/');
    const nav = page.getByTestId(isMobile ? 'tab-bar' : 'top-nav');
    await expect(nav).toBeVisible();
    for (const label of ['হোম', 'বুকিং', 'পোষা প্রাণী', 'ইনবক্স']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
    await context.close();
  });

  test('provider sees Today, Calendar, Bookings, Earnings, Profile', async ({
    browser,
    baseURL,
    viewport,
    isMobile,
  }) => {
    const { context, page } = await openAs(browser, 'provider', { baseURL, viewport });
    await page.goto('/provider');
    const nav = page.getByTestId(isMobile ? 'tab-bar' : 'top-nav');
    for (const label of ['আজ', 'ক্যালেন্ডার', 'বুকিং', 'আয়', 'প্রোফাইল']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
    await context.close();
  });

  test('active tab is marked for assistive technology', async ({
    browser,
    baseURL,
    viewport,
    isMobile,
  }) => {
    const { context, page } = await openAs(browser, 'owner', { baseURL, viewport });
    await page.goto('/pets');
    const nav = page.getByTestId(isMobile ? 'tab-bar' : 'top-nav');
    await expect(nav.getByRole('link', { name: 'পোষা প্রাণী' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await context.close();
  });

  test('a guest sees a Sign in button instead of Settings', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('sign-in-link')).toBeVisible();
    await expect(page.getByRole('link', { name: 'সেটিংস' })).toHaveCount(0);
  });

  test('admin shows a sidebar on desktop and a Menu button on phones', async ({
    browser,
    baseURL,
    viewport,
    isMobile,
  }) => {
    const { context, page } = await openAs(browser, 'admin', { baseURL, viewport });
    await page.goto('/admin');
    const labels = ['Queue', 'Providers', 'Reviews', 'Payouts', 'Insights', 'Audit log'];
    if (isMobile) {
      await expect(page.getByTestId('admin-sidebar')).toBeHidden();
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click();
      for (const label of labels) {
        await expect(
          page
            .getByRole('navigation', { name: 'Admin navigation' })
            .getByRole('link', { name: label }),
        ).toBeVisible();
      }
    } else {
      for (const label of labels)
        await expect(
          page.getByTestId('admin-sidebar').getByRole('link', { name: label }),
        ).toBeVisible();
    }
    await context.close();
  });
});
