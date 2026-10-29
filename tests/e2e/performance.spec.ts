import { expect, test } from '@playwright/test';

// FND-06 / NFR-1, NFR-2: initial payload under 500 KB and interactive within 3 s on throttled 4G.
// TTI is measured as a proxy: the time until the page has loaded and every interactive island has
// hydrated, with a slow-4G network (1.6 Mbps, 150 ms) and a 4x slower CPU. A full Lighthouse report
// is produced at workbook Step 32.
const BUDGET_BYTES = 500 * 1024;
const BUDGET_MS = 3000;

for (const path of ['/', '/provider', '/pets']) {
  test(`${path} loads under budget on slow 4G`, async ({ browser, baseURL }) => {
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

    let transferred = 0;
    client.on('Network.loadingFinished', (event: { encodedDataLength: number }) => {
      transferred += event.encodedDataLength;
    });

    const started = Date.now();
    await page.goto(`${baseURL}${path}`, { waitUntil: 'load' });
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('astro-island')).every(
        (island) => !island.hasAttribute('ssr'),
      ),
    );
    const interactiveAfter = Date.now() - started;
    await page.waitForLoadState('networkidle');

    console.log(
      `${path}: ${(transferred / 1024).toFixed(0)} KB transferred, interactive after ${interactiveAfter} ms`,
    );
    expect(transferred, 'transferred bytes').toBeLessThan(BUDGET_BYTES);
    expect(interactiveAfter, 'time to interactive (proxy)').toBeLessThan(BUDGET_MS);
    await context.close();
  });
}
