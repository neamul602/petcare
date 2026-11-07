import { expect, test } from '@playwright/test';

// JWT sign-up / sign-in and role-based access: guests browse, owners and providers sign up, the superuser
// makes a user an admin, and that admin makes another user an admin.
const API = 'http://localhost:3000';
const SUPERUSER = {
  email: 'ayaat@petcare.training',
  password: process.env.ADMIN_TRAINING_PASSWORD ?? 'training-admin-pass',
};
const run = Date.now();
const owner = {
  name: 'Rana Owner',
  email: `rana${run}@example.com`,
  password: 'password-123',
  role: 'owner',
  neighbourhood: 'gulshan',
};
const provider = {
  name: 'Pia Provider',
  email: `pia${run}@example.com`,
  password: 'password-123',
  role: 'provider',
  neighbourhood: 'gulshan',
};
const third = {
  name: 'Tia Third',
  email: `tia${run}@example.com`,
  password: 'password-123',
  role: 'owner',
  neighbourhood: 'gulshan',
};

const login = ({ email, password }: { email: string; password: string }) =>
  post('/auth/signin', { email, password });
const post = (path: string, body: unknown, token?: string) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
const get = (path: string, token?: string) =>
  fetch(`${API}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });

test.describe.configure({ mode: 'serial' });
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Account flows run once, on desktop');
});

test('guests see the public pages and are asked to sign in to book', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('find-care')).toBeVisible();
  await page.goto('/search');
  await expect(page).toHaveURL(/\/search/);
  await page.goto('/book/anything');
  await expect(page).toHaveURL(/\/sign-in\?next=/);
  await expect(page.getByTestId('to-sign-up')).toBeVisible();
});

test('a person signs up as an owner on the page and lands signed in', async ({ page }) => {
  await page.goto('/sign-up');
  await page.getByText('Pet owner').click();
  await page.getByTestId('name').fill(owner.name);
  await page.getByTestId('email').fill(owner.email);
  await page.getByTestId('password').fill(owner.password);
  await page.getByTestId('signup-submit').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('sign-in-link')).toHaveCount(0);
});

test('roles are enforced: owner, provider, anonymous and admin', async () => {
  const o = await (await login(owner)).json();
  expect(o.role).toBe('owner');
  const p = await post('/auth/signup', provider);
  expect(p.status).toBe(201);
  const pj = await p.json();
  expect(pj.role).toBe('provider');
  expect((await post('/auth/signup', provider)).status).toBe(409);
  expect((await login({ ...owner, password: 'wrong-wrong' })).status).toBe(401);
  expect((await get('/owner/me', o.token)).status).toBe(200);
  expect((await get('/provider/me', o.token)).status).toBe(403);
  expect((await get('/provider/me', pj.token)).status).toBe(200);
  expect((await get('/admin/users', o.token)).status).toBe(403);
  expect((await get('/admin/users')).status).toBe(401);
  expect((await get('/owner/me', 'not.a.token')).status).toBe(401);
});

test('the superuser makes a user admin, and that admin makes another user admin', async () => {
  await post('/auth/signup', third);
  const su = await (await post('/auth/signin', SUPERUSER)).json();
  expect(su.role).toBe('superuser');
  const list = (await (await get('/admin/users', su.token)).json()).users as Array<{
    id: string;
    email: string;
  }>;
  const rana = list.find((u) => u.email === owner.email)!;
  const tia = list.find((u) => u.email === third.email)!;
  expect((await post(`/admin/users/${rana.id}/make-admin`, {}, su.token)).status).toBe(201);

  const ranaAdmin = await (await login(owner)).json();
  expect(ranaAdmin.role).toBe('admin');
  expect((await get('/admin/users', ranaAdmin.token)).status).toBe(200);
  expect((await post(`/admin/users/${tia.id}/make-admin`, {}, ranaAdmin.token)).status).toBe(201);
  expect((await (await login(third)).json()).role).toBe('admin');
});
