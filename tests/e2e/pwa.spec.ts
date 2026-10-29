import { expect, test, type Page } from '@playwright/test';

// FND-04: installable, usable offline for pages already visited, honest offline page for the rest.
// Runs against the production build (the service worker is not registered in development).

async function waitForControl(page: Page) {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

test.describe('installable PWA', () => {
  test('manifest is linked and complete, icons load', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBe('/manifest.webmanifest');
    const manifest = await (await request.get(href!)).json();
    expect(manifest).toMatchObject({
      name: 'PetCare',
      short_name: 'PetCare',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      lang: 'bn',
    });
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some((icon: { purpose: string }) => icon.purpose === 'maskable')).toBe(
      true,
    );
    for (const icon of manifest.icons) {
      const response = await request.get(icon.src);
      expect(response.status(), icon.src).toBe(200);
      expect(response.headers()['content-type']).toContain('image/png');
    }
  });

  test('service worker registers and takes control', async ({ page }) => {
    await waitForControl(page);
    const scope = await page.evaluate(
      async () => (await navigator.serviceWorker.getRegistration())?.scope,
    );
    expect(scope).toMatch(/\/$/);
  });
});

test.describe('offline behaviour', () => {
  test('a page opened before still opens offline and the banner tells the visitor', async ({
    page,
    context,
  }) => {
    await waitForControl(page);
    await page.goto('/search');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('যত্নকারী খুঁজুন');
    await context.setOffline(true);
    await page.goto('/search');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('যত্নকারী খুঁজুন');
    await expect(page.getByTestId('offline-banner')).toContainText('অফলাইন');
    await context.setOffline(false);
    await expect(page.getByTestId('offline-banner')).not.toContainText('অফলাইন');
  });

  test('a page never opened before shows the offline page with a way back', async ({
    page,
    context,
  }) => {
    await waitForControl(page);
    await context.setOffline(true);
    await page.goto('/inbox');
    await expect(page.locator('[data-screen="offline"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('আপনি অফলাইনে আছেন');
    await expect(page.getByRole('link', { name: 'আবার চেষ্টা করুন' })).toBeVisible();
  });

  test('admin pages are never kept for offline use', async ({ page, context }) => {
    await waitForControl(page);
    await page.goto('/admin');
    await context.setOffline(true);
    await page.goto('/admin').catch(() => undefined);
    await expect(page.locator('[data-shell="admin"]')).toHaveCount(0);
  });
});

test.describe('offline page content', () => {
  test('offline page is available directly in both languages', async ({ page, context }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('আপনি অফলাইনে আছেন');
    await context.addCookies([{ name: 'pc_locale', value: 'en', url: 'http://localhost:4322' }]);
    await page.goto('/offline');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText("You're offline");
  });
});
