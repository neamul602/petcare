import { expect, test } from '@playwright/test';

test.describe('Bangla default and English parity (FND-03)', () => {
  test('first visit is Bangla', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'আপনার পোষা প্রাণীর জন্য যত্ন খুঁজুন',
    );
  });

  test('the toggle switches to English, stays on the same page and persists across pages and reloads', async ({
    page,
  }) => {
    await page.goto('/pets');
    await page.getByTestId('language-toggle').click();
    await expect(page).toHaveURL(/\/pets$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your pets');
    await page.goto('/provider/earnings');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Earnings');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('English can be switched back to Bangla', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('language-toggle').click();
    await page.getByTestId('language-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });

  test('admin is English with no language toggle, even for a Bangla visitor', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByTestId('language-toggle')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Queue');
  });

  test('the language switch never redirects off-site', async ({ page }) => {
    const response = await page.goto('/locale?to=en&back=//evil.example', { waitUntil: 'commit' });
    expect(new URL(page.url()).host).toBe('localhost:4321');
    expect(response?.status()).toBeLessThan(400);
  });
});
