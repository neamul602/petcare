/** Acute-event runbook, owner messages, templates and post-mortems against real PostgreSQL (ACU-03, ACU-04). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { createDummyPayouts } from '../payouts/dummy-payouts.ts';
import { createDummyPhotos } from '../pets/dummy-photos.ts';
import { runSeed } from '../seed/run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_runbook';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', admin: '' };
let seq = 0;

const call = (
  method: 'GET' | 'POST' | 'PUT',
  url: string,
  who: keyof typeof cookies | null,
  payload?: unknown,
) =>
  app.inject({
    method,
    url,
    payload: payload as object,
    headers: who ? { cookie: cookies[who] } : {},
  });
const pm = {
  timelineAccuracy: 'Timeline matched',
  roles: 'Roles were clear',
  ownerCommunication: 'Owner told within 5 minutes',
  directoryUse: 'Clinic reached on first call',
  gaps: 'No night contact list',
  lessons: 'Add a night contact',
};

async function event() {
  clock.set('2026-12-01T06:00:00Z');
  const id = (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `rb-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: '2026-12-10',
      to: '2026-12-13',
      method: 'bkash',
    })
  ).json().booking.id as string;
  await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
  clock.set('2026-12-10T04:00:00Z');
  await call('POST', `/provider/bookings/${id}/start`, 'rashid');
  await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', {
    type: 'illness',
    severity: 'serious',
    observation: 'Not eating, vomiting',
  });
  const evt = (await call('GET', '/admin/acute-events', 'admin'))
    .json()
    .events.find((e: { bookingId: string }) => e.bookingId === id);
  return { id, eventId: evt.id as string };
}

beforeAll(async () => {
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  const url = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  app = await buildApp({
    db,
    otp: { send: async () => undefined } as never,
    payments: createDummyPayments(url, 2000),
    payouts: createDummyPayouts(url, 2000),
    photos: createDummyPhotos(url, 2000),
    clock,
  });
  const store = createSessionStore(db, clock);
  const long = 400 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, long)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', long)).token}`;
});
afterAll(async () => {
  await app?.close();
  await dummy?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});
beforeEach(async () => {
  await pool.query('TRUNCATE update_photos, daily_updates');
  await pool.query(
    'DELETE FROM acute_post_mortems; DELETE FROM acute_messages; DELETE FROM acute_steps; DELETE FROM acute_templates; DELETE FROM acute_events; DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('ACU-03 runbook coordination', () => {
  it('shows the seven steps pending, with timers, the vet clinics and the booking', async () => {
    const { id, eventId } = await event();
    clock.advanceMinutes(2);
    const view = (await call('GET', `/admin/acute-events/${eventId}`, 'admin')).json();
    expect(view.steps.map((s: { step: string }) => s.step)).toEqual([
      'confirm_trigger',
      'provider_role',
      'admin_role',
      'vet_lookup',
      'owner_notification',
      'payout',
      'post_mortem',
    ]);
    expect(view.steps.every((s: { status: string }) => s.status === 'pending')).toBe(true);
    expect(view.booking).toMatchObject({ id, state: 'in_stay' });
    expect(view.vetClinics.length).toBeGreaterThan(0);
    expect(view.timers).toEqual({ elapsedSeconds: 120, secondsToFirstAdminEntry: null });
    expect((await call('GET', '/admin/acute-events/nope', 'admin')).statusCode).toBe(404);
    expect((await call('GET', `/admin/acute-events/${eventId}`, 'bibi')).statusCode).toBe(403);
  });
  it('marks steps done or skipped (a skip needs a note), keeps a timeline and shows time to the first admin entry', async () => {
    const { eventId } = await event();
    clock.advanceMinutes(3);
    expect(
      (
        await call('POST', `/admin/acute-events/${eventId}/steps`, 'admin', {
          step: 'confirm_trigger',
          status: 'done',
        })
      ).statusCode,
    ).toBe(200);
    clock.advanceMinutes(1);
    expect(
      (
        await call('POST', `/admin/acute-events/${eventId}/steps`, 'admin', {
          step: 'vet_lookup',
          status: 'skipped',
        })
      ).statusCode,
    ).toBe(422);
    expect(
      (
        await call('POST', `/admin/acute-events/${eventId}/steps`, 'admin', {
          step: 'vet_lookup',
          status: 'skipped',
          note: 'Provider already called the vet',
        })
      ).statusCode,
    ).toBe(200);
    const view = (await call('GET', `/admin/acute-events/${eventId}`, 'admin')).json();
    expect(view.steps.find((s: { step: string }) => s.step === 'vet_lookup')).toMatchObject({
      status: 'skipped',
      note: 'Provider already called the vet',
    });
    expect(view.timeline.map((t: { step: string }) => t.step)).toEqual([
      'confirm_trigger',
      'vet_lookup',
    ]);
    expect(view.timers.secondsToFirstAdminEntry).toBe(180);
    expect(
      (
        await call('POST', `/admin/acute-events/${eventId}/steps`, 'admin', {
          step: 'dance',
          status: 'done',
        })
      ).statusCode,
    ).toBe(400);
  });
  it('sends the Bangla or English template to the owner, records the time, and the owner sees it', async () => {
    const { id, eventId } = await event();
    clock.advanceMinutes(4);
    const sent = await call('POST', `/admin/acute-events/${eventId}/owner-message`, 'admin', {
      language: 'bn',
    });
    expect(sent.statusCode).toBe(201);
    expect(sent.json().text).toContain('Tito');
    await call('POST', `/admin/acute-events/${eventId}/owner-message`, 'admin', { language: 'en' });
    const view = (await call('GET', `/admin/acute-events/${eventId}`, 'admin')).json();
    expect(view.steps.find((s: { step: string }) => s.step === 'owner_notification').status).toBe(
      'done',
    );
    expect(view.messages).toHaveLength(2);
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(owner.acuteEvent.messages.map((m: { language: string }) => m.language)).toEqual([
      'bn',
      'en',
    ]);
  });
  it('edited templates apply to future events and the edit is audit-logged', async () => {
    expect((await call('GET', '/admin/acute-templates', 'admin')).json().templates.en).toContain(
      '{pet}',
    );
    expect(
      (await call('PUT', '/admin/acute-templates/en', 'admin', { text: 'We are on it for {pet}.' }))
        .statusCode,
    ).toBe(200);
    const { eventId } = await event();
    const sent = await call('POST', `/admin/acute-events/${eventId}/owner-message`, 'admin', {
      language: 'en',
    });
    expect(sent.json().text).toBe('We are on it for Tito.');
    expect(
      (await pool.query("SELECT 1 FROM event_log WHERE action='acute.template_edited'")).rowCount,
    ).toBeGreaterThan(0);
    expect(
      (await call('PUT', '/admin/acute-templates/fr', 'admin', { text: 'abc' })).statusCode,
    ).toBe(400);
    expect(
      (await call('PUT', '/admin/acute-templates/en', 'bibi', { text: 'abc' })).statusCode,
    ).toBe(403);
  });
});

describe('ACU-04 close with a post-mortem', () => {
  it('needs the event resolved and all six answers; one post-mortem per event', async () => {
    const { eventId } = await event();
    expect(
      (await call('POST', `/admin/acute-events/${eventId}/post-mortem`, 'admin', pm)).json().error
        .code,
    ).toBe('not_resolved');
    expect((await call('POST', `/admin/acute-events/${eventId}/resolve`, 'admin')).json()).toEqual({
      resolved: true,
      already: false,
    });
    expect(
      (await call('POST', `/admin/acute-events/${eventId}/resolve`, 'admin')).json().already,
    ).toBe(true);
    expect(
      (
        await call('POST', `/admin/acute-events/${eventId}/post-mortem`, 'admin', {
          ...pm,
          lessons: '',
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (await call('POST', `/admin/acute-events/${eventId}/post-mortem`, 'admin', pm)).statusCode,
    ).toBe(201);
    expect(
      (await call('POST', `/admin/acute-events/${eventId}/post-mortem`, 'admin', pm)).json().error
        .code,
    ).toBe('already_written');
    expect(
      (await call('GET', `/admin/acute-events/${eventId}`, 'admin'))
        .json()
        .steps.find((s: { step: string }) => s.step === 'post_mortem').status,
    ).toBe('done');
  });
  it('reminds after 48 hours without a post-mortem, and lists past post-mortems (admin only)', async () => {
    const { eventId } = await event();
    await call('POST', `/admin/acute-events/${eventId}/resolve`, 'admin');
    expect((await call('GET', '/admin/acute-events-reminders', 'admin')).json().reminders).toEqual(
      [],
    );
    clock.advanceMinutes(48 * 60 - 1);
    expect((await call('GET', '/admin/acute-events-reminders', 'admin')).json().reminders).toEqual(
      [],
    );
    clock.advanceMinutes(1);
    expect(
      (await call('GET', '/admin/acute-events-reminders', 'admin')).json().reminders,
    ).toMatchObject([{ eventId }]);
    await call('POST', `/admin/acute-events/${eventId}/post-mortem`, 'admin', pm);
    expect((await call('GET', '/admin/acute-events-reminders', 'admin')).json().reminders).toEqual(
      [],
    );
    const list = (await call('GET', '/admin/post-mortems', 'admin')).json().postMortems;
    expect(list).toMatchObject([{ eventId, lessons: 'Add a night contact', type: 'illness' }]);
    expect((await call('GET', '/admin/post-mortems', 'rashid')).statusCode).toBe(403);
    expect((await call('GET', '/admin/post-mortems', null)).statusCode).toBe(401);
  });
});
