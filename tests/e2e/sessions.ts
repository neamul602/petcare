/** Signed-in browser sessions created once in global setup (see global-setup.ts). */
import type { Browser, BrowserContext, BrowserContextOptions } from '@playwright/test';

export type Role = 'owner' | 'provider' | 'admin';
export const authFile = (role: Role) => new URL(`./.auth/${role}.json`, import.meta.url).pathname;

/** A fresh browser context signed in as the given role (or a guest when role is null). */
export async function contextAs(
  browser: Browser,
  role: Role | null,
  options: BrowserContextOptions = {},
): Promise<BrowserContext> {
  return browser.newContext({ ...options, ...(role ? { storageState: authFile(role) } : {}) });
}
