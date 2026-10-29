import { expect, test } from '@playwright/test';

// FND-06 / NFR-1, NFR-2: initial payload under 500 KB and interactive within 3 s on throttled 4G.
// TTI is measured as a proxy: the time until the page has loaded and every interactive island has
// hydrated, with a slow-4G network (1.6 Mbps, 150 ms) and a 4x slower CPU. Each page is loaded cold
// three times and the median is used, so a busy machine cannot fail the check on one slow run.
// A full Lighthouse report is produced at workbook Step 32.
const BUDGET_BYTES = 500 * 1024;
const BUDGET_MS = 3000;
const RUNS = 3;

test.describe.configure({ mode: 'serial' }); // measuring in parallel would measure the machine, not the page

// Public screens: signed-in screens are placeholders until their bolts build them.
for (const path of ['/', '/search', '/sign-in']) {
  test(`${path} loads under budget on slow 4G`, async ({ browser, baseURL }) => {
    const times: number[] = [];
    let transferred = 0;
    for (let run = 0; run < RUNS; run++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        serviceWorkers: 'block',
      }); // cold, no cache
      const page = await context.newPage();
      const client = await context.newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
      });
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      let bytes = 0;
      client.on('Network.loadingFinished', (event: { encodedDataLength: number }) => {
        bytes += event.encodedDataLength;
      });

      const started = Date.now();
      await page.goto(`${baseURL}${path}`, { waitUntil: 'load' });
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('astro-island')).every(
          (island) => !island.hasAttribute('ssr'),
        ),
      );
      times.push(Date.now() - started);
      await page.waitForLoadState('networkidle');
      transferred = Math.max(transferred, bytes);
      await context.close();
    }
    const median = [...times].sort((a, b) => a - b)[Math.floor(RUNS / 2)]!;
    console.log(
      `${path}: ${(transferred / 1024).toFixed(0)} KB transferred, interactive after ${median} ms (runs: ${times.join(', ')})`,
    );
    expect(transferred, 'transferred bytes').toBeLessThan(BUDGET_BYTES);
    expect(median, 'median time to interactive (proxy)').toBeLessThan(BUDGET_MS);
  });
}
