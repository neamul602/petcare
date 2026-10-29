import { expect, test } from '@playwright/test';
import { SCREEN_ROUTES } from '../../apps/web/src/lib/routes.ts';

const shellFor = { owner: 'owner', provider: 'provider', admin: 'admin' } as const;

test.describe('every blueprint route opens in the right shell (FND-01)', () => {
  for (const route of SCREEN_ROUTES) {
    test(`${route.id} ${route.path}`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator(`[data-shell="${shellFor[route.role]}"]`)).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
    });
  }

  test('unknown route shows the friendly 404 with a way home', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.locator('[data-screen="not-found"]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'হোমে যান' })).toBeVisible();
  });

  test('no horizontal scroll at 320 px on every shell', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const path of ['/', '/provider', '/admin']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('navigation per role (FND-01)', () => {
  test('owner sees Home, Bookings, Pets, Inbox', async ({ page, isMobile }) => {
    await page.goto('/');
    const nav = page.getByTestId(isMobile ? 'tab-bar' : 'top-nav');
    await expect(nav).toBeVisible();
    for (const label of ['হোম', 'বুকিং', 'পোষা প্রাণী', 'ইনবক্স']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('provider sees Today, Calendar, Bookings, Earnings, Profile', async ({ page, isMobile }) => {
    await page.goto('/provider');
    const nav = page.getByTestId(isMobile ? 'tab-bar' : 'top-nav');
    for (const label of ['আজ', 'ক্যালেন্ডার', 'বুকিং', 'আয়', 'প্রোফাইল']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('active tab is marked for assistive technology', async ({ page, isMobile }) => {
    await page.goto('/pets');
    const nav = page.getByTestId(isMobile ? 'tab-bar' : 'top-nav');
    await expect(nav.getByRole('link', { name: 'পোষা প্রাণী' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('admin shows a sidebar on desktop and a Menu button on phones', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/admin');
    if (isMobile) {
      await expect(page.getByTestId('admin-sidebar')).toBeHidden();
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click();
      for (const label of ['Queue', 'Providers', 'Reviews', 'Payouts', 'Insights', 'Audit log']) {
        await expect(
          page
            .getByRole('navigation', { name: 'Admin navigation' })
            .getByRole('link', { name: label }),
        ).toBeVisible();
      }
    } else {
      const sidebar = page.getByTestId('admin-sidebar');
      for (const label of ['Queue', 'Providers', 'Reviews', 'Payouts', 'Insights', 'Audit log']) {
        await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
      }
    }
  });
});
