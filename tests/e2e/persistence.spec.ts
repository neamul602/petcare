import { expect, test } from '@playwright/test';

// FND-04: what people type is kept on the device and restored; passwords never are.
test.describe('form persistence', () => {
  test('typed text survives a reload, passwords do not, and the clear event removes it', async ({
    page,
  }) => {
    await page.goto('/dev/kit');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('Typed text is kept on this device').fill('Tito needs insulin at 7');
    await page.getByLabel('Passwords are never kept').fill('hunter2');
    await page.reload();
    await expect(page.getByLabel('Typed text is kept on this device')).toHaveValue(
      'Tito needs insulin at 7',
    );
    await expect(page.getByLabel('Passwords are never kept')).toHaveValue('');
    expect(await page.evaluate(() => localStorage.getItem('pc:form:kit-demo'))).not.toContain(
      'hunter2',
    );
    await page.evaluate(() =>
      document.dispatchEvent(new CustomEvent('pc:persist-clear', { detail: 'kit-demo' })),
    );
    await page.reload();
    await expect(page.getByLabel('Typed text is kept on this device')).toHaveValue('');
  });

  test('shared loading, empty and error states render with clear next actions', async ({
    page,
  }) => {
    await page.goto('/dev/kit');
    await expect(page.locator('[data-state="loading"]')).toBeVisible();
    await expect(page.locator('[data-state="empty"] a')).toHaveText('Find care');
    for (const variant of ['network', 'server', 'permission', 'offline']) {
      const card = page.locator(`[data-state="error"][data-variant="${variant}"]`);
      await expect(card).toBeVisible();
      await expect(card.getByRole('link')).toHaveCount(1);
      await expect(card).not.toContainText(/sorry/i);
    }
  });
});
