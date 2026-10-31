import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import pg from 'pg';
import { contextAs } from './sessions.ts';

// ADM-04, ADM-05 end to end: provider flags, Evaluate now, outreach and a defection signal.
// Playwright requires an object pattern as the first argument, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'phone',
    'Provider health flows run on the phone profile only',
  );
});
test.describe.configure({ mode: 'serial' });

const BASE = 'http://localhost:4321';
const E2E_DB = 'postgres://petcare:petcare@localhost:5433/petcare_e2e';
const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  ).violations.map((v) => v.id);

test('a provider approved 100 days ago with no bookings is flagged; the admin records outreach and tags a signal', async ({
  browser,
}) => {
  const client = new pg.Client({ connectionString: E2E_DB });
  await client.connect();
  const before = (await client.query("SELECT created_at FROM providers WHERE id = 'nusrat'"))
    .rows[0].created_at as Date;
  await client.query(
    "UPDATE providers SET created_at = now() - interval '100 days' WHERE id = 'nusrat'",
  );
  try {
    const admin = await contextAs(browser, 'admin', { baseURL: BASE });
    const page = await admin.newPage();
    await page.goto('/admin/providers');
    await page.getByTestId('evaluate-now').click();
    const row = page.getByTestId('provider-row').filter({ hasText: 'Nusrat' });
    await expect(row.getByTestId('provider-flags')).toContainText('Low utilization (day 90)');
    expect(await scan(page)).toEqual([]);

    await row.click();
    await expect(page.getByTestId('health-flags')).toContainText('Low utilization (day 90)');
    await page.getByTestId('o-flag').fill('low_utilization_90');
    await page.getByTestId('o-what').fill('Called Nusrat about her calendar');
    await page.getByTestId('o-out').fill('She will open more nights next week');
    await page.getByTestId('o-save').click();
    await expect(page.getByTestId('outreach-entry').first()).toContainText('open more nights');
    await page.getByTestId('s-note').fill('Owner said Nusrat asked to pay directly');
    await page.getByTestId('s-save').click();
    await expect(page.getByTestId('signal-entry').first()).toContainText('pay directly');
    await expect(page.getByTestId('health')).toContainText('never suspend');
    expect(await scan(page)).toEqual([]);

    await page.goto('/admin/providers');
    await expect(
      page.getByTestId('provider-row').filter({ hasText: 'Nusrat' }).getByTestId('provider-flags'),
    ).toContainText('Defection signal');
    await expect(page.getByTestId('provider-row').filter({ hasText: 'Nusrat' })).toContainText(
      'Approved',
    );
    await admin.close();
  } finally {
    await client.query("UPDATE providers SET created_at = $1 WHERE id = 'nusrat'", [before]);
    await client.end();
  }
});
