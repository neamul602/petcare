/* eslint-disable @typescript-eslint/no-explicit-any -- demo loader reads loose API responses */
/**
 * Rich training data for demonstrations (workbook Step 40).
 *   npm run seed            reset the database and load the base training seed
 *   npm run dev             start web, API and Dummy services
 *   npm run seed:demo       add owners, pets with photos, stays in every state, reviews, payouts, reports, an acute event, vetting
 * Everything goes through the real API as the people involved, so every rule runs exactly as in the product. The running
 * servers use the real clock, so stays that "already happened" are placed in the past by editing their dates afterwards.
 * Every record is training data; no rating or count is invented (they come from the completed stays created here).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SystemClock } from '@petcare/shared/clock';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase } from '../db/client.ts';

const API = process.env.API_URL ?? 'http://localhost:3000';
const DUMMY = process.env.DUMMY_URL ?? 'http://localhost:4100';
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const IMAGES = fileURLToPath(
  new URL('../../../../packages/shared/seed/demo-images/', import.meta.url),
);

const { db, pool } = createDatabase(DATABASE_URL);
const store = createSessionStore(db, new SystemClock());
const cookies = new Map<string, string>();

async function cookieFor(who: string) {
  if (cookies.has(who)) return cookies.get(who)!;
  const admin = who === 'admin';
  const { token } = await store.create(
    admin ? 'admin' : 'user',
    admin ? 'ayaat' : who,
    30 * 86_400_000,
  );
  const cookie = `${admin ? 'pc_admin_session' : 'pc_session'}=${token}`;
  cookies.set(who, cookie);
  return cookie;
}

async function api<T = any>(
  method: string,
  path: string,
  who: string | null,
  body?: unknown,
  allow: number[] = [],
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(who ? { cookie: await cookieFor(who) } : {}),
      ...(body && !(body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
    },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json().catch(() => ({}))) as T;
  if (!response.ok && !allow.includes(response.status))
    throw new Error(`${method} ${path} as ${who} -> ${response.status} ${JSON.stringify(json)}`);
  return json;
}

const plus = (days: number) =>
  new Date(Date.now() + days * 86_400_000 + 6 * 3_600_000).toISOString().slice(0, 10);
const image = (name: string) =>
  new Blob([readFileSync(`${IMAGES}${name}.jpg`)], { type: 'image/jpeg' });
const sql = (text: string, params: unknown[] = []) => pool.query(text, params);
let counter = 0;
const key = () => `demo-${Date.now()}-${++counter}-abcdefgh`;
const log = (message: string) => console.log(`  ${message}`);

// ---- people and providers (account rows are created directly: nobody can sign up as a provider)
async function people() {
  const owners = [
    ['nadia', '+8801712000011', 'Nadia Rahman', 'gulshan', 'bn'],
    ['imran', '+8801712000012', 'Imran Chowdhury', 'banani', 'en'],
    ['farhana', '+8801712000013', 'Farhana Akter', 'baridhara', 'bn'],
    ['tanvir', '+8801712000014', 'Tanvir Hossain', 'gulshan', 'en'],
  ];
  for (const [id, phone, name, area, language] of owners)
    await sql(
      "INSERT INTO users (id, role, phone, name, neighbourhood_id, language, is_training_data) VALUES ($1,'owner',$2,$3,$4,$5,true) ON CONFLICT DO NOTHING",
      [id, phone, name, area, language],
    );
  const providers = [
    [
      'lamia',
      '+8801712000006',
      'Lamia',
      'লামিয়া',
      'A',
      'banani',
      ['cat', 'dog'],
      3,
      200000,
      ['anxious-pets', 'medication-administration'],
      'Quiet Banani flat with a sunny reading room. I look after cats and small dogs, and I am comfortable with medication and shy pets.',
      'বনানীর শান্ত ফ্ল্যাট, রোদেলা পড়ার ঘর। আমি বিড়াল ও ছোট কুকুরের যত্ন নিই, ওষুধ খাওয়াতে এবং লাজুক পোষা প্রাণীর সঙ্গে স্বচ্ছন্দ।',
    ],
    [
      'hasan',
      '+8801712000007',
      'Hasan',
      'হাসান',
      'B',
      'baridhara',
      ['dog'],
      4,
      190000,
      ['large-yard', 'senior-pets'],
      'Baridhara house with a big fenced garden. Dogs of every size are welcome, and I have years of experience with older dogs.',
      'বারিধারার বাড়ি, বড় ঘেরা বাগান। সব আকারের কুকুর স্বাগত, বয়স্ক কুকুরের যত্নে আমার বহু বছরের অভিজ্ঞতা।',
    ],
  ];
  for (const [
    id,
    phone,
    nameEn,
    nameBn,
    tier,
    area,
    species,
    capacity,
    price,
    caps,
    en,
    bn,
  ] of providers as any[]) {
    await sql(
      "INSERT INTO users (id, role, phone, name, neighbourhood_id, language, is_training_data) VALUES ($1,'provider',$2,$3,$4,'bn',true) ON CONFLICT DO NOTHING",
      [id, phone, nameEn, area],
    );
    await sql(
      "INSERT INTO providers (id, user_id, slug, name_en, name_bn, tier, status, neighbourhood_id, species, capacity_small, price_per_night_poisha, capabilities, experience_en, experience_bn, is_training_data) VALUES ($1,$1,$1,$2,$3,$4,'approved',$5,$6,$7,$8,$9,$10,$11,true) ON CONFLICT DO NOTHING",
      [id, nameEn, nameBn, tier, area, species, capacity, price, caps, en, bn],
    );
  }
  log('owners Nadia, Imran, Farhana, Tanvir and providers Lamia, Hasan');
}

// ---- pets with photos
const behaviour = (energy: string, goodWith: string[], triggers = '') => ({
  energy,
  goodWith,
  triggers,
  notes: '',
});
async function pets() {
  const make = async (who: string, pet: Record<string, unknown>, photos: string[]) => {
    const created = await api('POST', '/owner/pets', who, pet);
    for (const photo of photos) {
      const form = new FormData();
      form.append('file', image(photo), `${photo}.jpg`);
      await api('POST', `/owner/pets/${created.pet.id}/photos`, who, form);
    }
    return created.pet.id as string;
  };
  const ids = {} as { tito: string; mimi: string; max: string; luna: string; bruno: string };
  ids.tito = 'tito';
  for (const photo of ['tito-1', 'tito-2', 'tito-3']) {
    const form = new FormData();
    form.append('file', image(photo), `${photo}.jpg`);
    await api('POST', '/owner/pets/tito/photos', 'bibi', form);
  }
  const emptyPlan = {
    conditions: [],
    medications: [],
    allergies: [],
    anxiety: null,
    diet: null,
    senior: false,
    extraAttention: false,
    instructions: '',
    vet: null,
  };
  ids.mimi = await make(
    'nadia',
    {
      name: 'Mimi',
      species: 'cat',
      breed: 'Persian',
      ageYears: 12,
      weightKg: 4.1,
      sex: 'female',
      neutered: true,
      vaccination: 'up_to_date',
      behaviour: behaviour('calm', ['cats', 'children']),
      catDetails: { litterBox: 'covered', indoorOutdoor: 'indoor', company: 'single' },
      carePlan: {
        ...emptyPlan,
        conditions: [{ name: 'arthritis', notes: 'stiff in the mornings' }],
        medications: [{ name: 'joint supplement', dose: '1 tablet', schedule: ['09:00'] }],
        senior: true,
        instructions: 'Warm bed near the window, please.',
        diet: {
          type: 'wet',
          brand: 'Whiskas Senior',
          schedule: '08:00 and 18:00',
          treats: 'none',
          restrictions: [],
        },
      },
    },
    ['mimi-1'],
  );
  ids.max = await make(
    'imran',
    {
      name: 'Max',
      species: 'dog',
      breed: 'Labrador',
      ageYears: 4,
      weightKg: 28,
      sex: 'male',
      neutered: true,
      vaccination: 'up_to_date',
      behaviour: behaviour('high', ['dogs', 'children'], 'thunder and loud bangs'),
      dogDetails: { walksPerDay: 3, outdoorAccess: 'garden' },
      carePlan: {
        ...emptyPlan,
        anxiety: { triggers: 'thunder and fireworks', comfort: 'a worn blanket and a quiet room' },
        extraAttention: true,
        instructions: 'Two long walks and a game of fetch every day.',
      },
    },
    ['max-1'],
  );
  ids.luna = await make(
    'farhana',
    {
      name: 'Luna',
      species: 'cat',
      breed: 'British Shorthair',
      ageYears: 3,
      weightKg: 5.2,
      sex: 'female',
      neutered: true,
      vaccination: 'up_to_date',
      behaviour: behaviour('moderate', ['cats']),
      catDetails: { litterBox: 'open', indoorOutdoor: 'indoor', company: 'multi_ok' },
      carePlan: emptyPlan,
    },
    ['luna-1'],
  );
  ids.bruno = await make(
    'tanvir',
    {
      name: 'Bruno',
      species: 'dog',
      breed: 'Golden Retriever',
      ageYears: 6,
      weightKg: 32,
      sex: 'male',
      neutered: true,
      vaccination: 'up_to_date',
      behaviour: behaviour('moderate', ['dogs', 'children', 'strangers']),
      dogDetails: { walksPerDay: 2, outdoorAccess: 'yard' },
      carePlan: {
        ...emptyPlan,
        allergies: ['chicken'],
        diet: {
          type: 'dry',
          brand: 'Royal Canin',
          schedule: '07:30 and 19:00',
          treats: 'carrots only',
          restrictions: ['no chicken'],
        },
        instructions: 'Loves swimming; keep him off the road.',
      },
    },
    ['bruno-1'],
  );
  log('pets with photos: Tito, Mimi, Max, Luna, Bruno');
  return ids;
}

// ---- stays
const free = (bookingId: string) =>
  sql(
    `UPDATE night_capacity nc SET booked = GREATEST(booked - 1, 0) FROM night_reservations r
     WHERE r.booking_id = $1 AND r.released_at IS NULL AND nc.provider_id = r.provider_id AND nc.date = r.date`,
    [bookingId],
  ).then(() =>
    sql(
      'UPDATE night_reservations SET released_at = now() WHERE booking_id = $1 AND released_at IS NULL',
      [bookingId],
    ),
  );

/** Moves a stay's dates and, for a stay that is happening now, holds the real nights again. */
async function moveStay(
  bookingId: string,
  provider: string,
  start: string,
  end: string,
  hold: boolean,
) {
  await free(bookingId);
  await sql(
    'UPDATE bookings SET start_date = $2, end_date = $3, nights = ($3::date - $2::date), created_at = ($2::date - 6)::timestamptz WHERE id = $1',
    [bookingId, start, end],
  );
  if (hold)
    await sql(
      `WITH n AS (SELECT d::date AS date FROM generate_series($2::date, $3::date - 1, '1 day') d),
            c AS (INSERT INTO night_capacity (provider_id, date, booked) SELECT $4, date, 1 FROM n
                  ON CONFLICT (provider_id, date) DO UPDATE SET booked = night_capacity.booked + 1 RETURNING 1)
       INSERT INTO night_reservations (booking_id, provider_id, date) SELECT $1, $4, date FROM n`,
      [bookingId, start, end, provider],
    );
}

interface Stay {
  owner: string;
  provider: string;
  pet: string;
  nights: number;
  method?: string;
  instructions?: string;
  /** days since the stay ended (0 or more) for a past stay; omit to build a stay that has not happened yet */
  endedDaysAgo?: number;
}
let window = 140;
const reserveWindow = (nights: number) => {
  const from = plus(window);
  window += nights + 6;
  return { from, to: plus(window - 6) };
};

async function request(s: Stay, dates?: { from: string; to: string }) {
  const d = dates ?? reserveWindow(s.nights);
  const res = await api('POST', '/owner/bookings', s.owner, {
    key: key(),
    providerSlug: s.provider,
    petId: s.pet,
    from: d.from,
    to: d.to,
    method: s.method ?? 'bkash',
    instructions: s.instructions,
  });
  return res.booking.id as string;
}
const update = async (
  id: string,
  provider: string,
  note: string,
  careLog: unknown,
  photos: string[],
) => {
  const form = new FormData();
  form.append('note', note);
  form.append('careLog', JSON.stringify(careLog));
  for (const p of photos) form.append('photo', image(p), `${p}.jpg`);
  await api('POST', `/provider/bookings/${id}/updates`, provider, form);
};

/** A stay that already happened: request, confirm, start, updates, completion, review, report. */
async function pastStay(
  s: Stay & {
    rating?: number;
    review?: string;
    reviewPhotos?: boolean;
    updates?: Array<{ note: string; photos: string[]; med?: boolean }>;
    report?: { category: string; description: string };
    acute?: boolean;
  },
) {
  const ended = s.endedDaysAgo ?? 10;
  const id = await request(s);
  await api('POST', `/provider/bookings/${id}/confirm`, s.provider);
  await moveStay(id, s.provider, plus(-ended - s.nights), plus(-ended), false);
  await api('POST', `/provider/bookings/${id}/start`, s.provider);
  for (const u of s.updates ?? [])
    await update(
      id,
      s.provider,
      u.note,
      {
        medicationsGiven: u.med ? [{ name: 'insulin', time: '08:05' }] : [],
        food: 'ate_well',
        mood: 'happy',
      },
      u.photos,
    );
  if (s.acute)
    await api('POST', `/provider/bookings/${id}/acute-event`, s.provider, {
      type: 'illness',
      severity: 'minor',
      observation: 'Skipped one meal and seemed tired',
    });
  await api('POST', `/provider/bookings/${id}/complete`, s.provider);
  await api('POST', `/owner/bookings/${id}/confirm-completion`, s.owner);
  if (s.rating) {
    const photoIds = s.reviewPhotos
      ? ((await api('GET', `/bookings/${id}/updates`, s.owner)).updates as any[]).flatMap((u) =>
          u.photos.map((p: string) => p.split('/').pop()),
        )
      : [];
    await api('POST', `/owner/bookings/${id}/review`, s.owner, {
      rating: s.rating,
      text: s.review ?? '',
      photoIds: photoIds.slice(0, 3),
    });
  }
  if (s.report) await api('POST', `/owner/bookings/${id}/report`, s.owner, s.report);
  // The report window runs from completion, so the completion date is moved back only after the report.
  await sql(
    "UPDATE bookings SET completed_at = (end_date::timestamp + interval '6 hours') AT TIME ZONE 'Asia/Dhaka' WHERE id = $1",
    [id],
  );
  await sql(
    "UPDATE payouts SET eligible_at = (SELECT completed_at FROM bookings WHERE id = $1) + interval '72 hours' WHERE booking_id = $1",
    [id],
  );
  return id;
}

async function main() {
  console.log('Loading demo data through the API...');
  await people();
  const p = await pets();
  const auth = (w: string, id: string) => `${w}:${id}`;
  void auth;

  // peak window and capacity prompts
  await api('POST', '/admin/peak-windows', 'admin', {
    name: 'Eid ul-Fitr (training dates)',
    startDate: plus(30),
    endDate: plus(37),
  });
  const peak = (await api('GET', '/peak-windows', null)).windows[0].id as string;
  await api('POST', '/provider/capacity/expand-peak', 'rashid', { windowId: peak, capacity: 4 });
  await api('POST', '/provider/capacity/expand-peak', 'farzana', { windowId: peak, capacity: 5 });
  await api('PUT', '/provider/capacity', 'kamrul', {
    dates: [plus(9), plus(10)],
    capacity: 0,
    note: 'Family event',
  });
  log('Eid peak window, raised and closed nights');

  // completed history across three months and all three neighbourhoods (feeds Insights, earnings and reviews)
  const U = (note: string, photos: string[], med = false) => ({ note, photos, med });
  await pastStay({
    owner: 'bibi',
    provider: 'rashid',
    pet: 'tito',
    nights: 5,
    endedDaysAgo: 78,
    rating: 5,
    review:
      'Tito got his insulin on time every single day and came home relaxed. The photo updates were lovely.',
    reviewPhotos: true,
    updates: [
      U('Morning insulin done, then a long walk by the lake.', ['tito-1'], true),
      U('Tito made friends with the neighbour’s cat.', ['play-1']),
    ],
  });
  await pastStay({
    owner: 'nadia',
    provider: 'farzana',
    pet: p.mimi,
    nights: 4,
    endedDaysAgo: 66,
    rating: 4,
    review: 'Mimi was warm and comfortable, and the joint supplement was given daily.',
    updates: [U('Mimi spent the morning on the sunny window sill.', ['nap-1'])],
  });
  await pastStay({
    owner: 'farhana',
    provider: 'nusrat',
    pet: p.luna,
    nights: 3,
    endedDaysAgo: 55,
    rating: 5,
    review: 'A calm cat-only home. Luna was relaxed and well fed.',
    reviewPhotos: true,
    updates: [U('Luna is exploring the quiet room.', ['luna-1'])],
  });
  await pastStay({
    owner: 'tanvir',
    provider: 'hasan',
    pet: p.bruno,
    nights: 6,
    endedDaysAgo: 47,
    rating: 5,
    review: 'Bruno loved the garden. Hasan sent updates every evening.',
    reviewPhotos: true,
    updates: [
      U('Bruno chased the ball for an hour.', ['bruno-1', 'garden-1']),
      U('Garden swim and an early night.', ['walk-1']),
    ],
  });
  await pastStay({
    owner: 'imran',
    provider: 'kamrul',
    pet: p.max,
    nights: 4,
    endedDaysAgo: 38,
    rating: 4,
    review: 'Max had plenty of space to run.',
    updates: [U('Max met a new friend in the yard.', ['max-1'])],
  });
  await pastStay({
    owner: 'bibi',
    provider: 'rashid',
    pet: 'tito',
    nights: 7,
    endedDaysAgo: 29,
    rating: 5,
    review: 'Second stay and just as good. Rashid already knew Tito’s routine.',
    reviewPhotos: true,
    updates: [
      U('Evening insulin on schedule, Tito ate well.', ['tito-2'], true),
      U('A calm day at home.', ['meal-1'], true),
    ],
  });
  await pastStay({
    owner: 'nadia',
    provider: 'lamia',
    pet: p.mimi,
    nights: 3,
    endedDaysAgo: 21,
    rating: 5,
    review: 'Lamia understood Mimi straight away.',
    reviewPhotos: true,
    updates: [U('Mimi purred all afternoon.', ['mimi-1'])],
  });
  await pastStay({
    owner: 'tanvir',
    provider: 'rashid',
    pet: p.bruno,
    nights: 3,
    endedDaysAgo: 14,
    rating: 4,
    review: 'Great communication. Bruno was happy.',
    updates: [U('Short walks and cuddles.', ['walk-1'])],
  });
  // a review with a phone number, removed by the admin for cause
  const contactReview = await pastStay({
    owner: 'farhana',
    provider: 'lamia',
    pet: p.luna,
    nights: 2,
    endedDaysAgo: 12,
    rating: 3,
    review: 'Fine stay. Call me on 01700000000 for a discount next time.',
    updates: [U('Luna settled in quickly.', ['luna-1'])],
  });
  // a stay with an acute event that is fully handled: runbook, resolved, post-mortem
  const acuteDone = await pastStay({
    owner: 'imran',
    provider: 'hasan',
    pet: p.max,
    nights: 3,
    endedDaysAgo: 9,
    rating: 5,
    review: 'Hasan stayed calm and kept me informed when Max skipped a meal.',
    updates: [U('Max missed breakfast, we watched him closely.', ['max-1'])],
    acute: true,
  });
  // a refunded dispute
  await pastStay({
    owner: 'nadia',
    provider: 'rashid',
    pet: p.mimi,
    nights: 3,
    endedDaysAgo: 6,
    rating: 3,
    review: 'Mimi’s supplement was missed on one day.',
    updates: [U('Quiet day.', ['nap-1'])],
    report: {
      category: 'care-not-as-agreed',
      description: 'The joint supplement was not given on the second day.',
    },
  });
  log('nine completed stays, one with a removed review, one with an acute event, one disputed');

  // an open dispute, with the payout frozen and a 2-star review
  await pastStay({
    owner: 'imran',
    provider: 'kamrul',
    pet: p.max,
    nights: 3,
    endedDaysAgo: 1,
    rating: 2,
    review: 'Max came home anxious and the updates were thin.',
    updates: [U('Short update.', ['max-1'])],
    report: {
      category: 'communication',
      description: 'I hardly heard anything from the provider during the stay.',
    },
  });

  // stays in progress now
  const tito = await request({
    owner: 'bibi',
    provider: 'rashid',
    pet: 'tito',
    nights: 5,
    instructions: 'Insulin with food at 08:00 and 20:00, please.',
  });
  await api('POST', `/provider/bookings/${tito}/confirm`, 'rashid');
  await moveStay(tito, 'rashid', plus(-2), plus(3), true);
  await api('POST', `/provider/bookings/${tito}/start`, 'rashid');
  await update(
    tito,
    'rashid',
    'Tito arrived happy. Insulin given with breakfast.',
    { medicationsGiven: [{ name: 'insulin', time: '08:05' }], food: 'ate_well', mood: 'happy' },
    ['tito-1', 'garden-1'],
  );
  await update(
    tito,
    'rashid',
    'Long walk this morning and a nap in the sun.',
    { medicationsGiven: [{ name: 'insulin', time: '20:10' }], food: 'ate_some', mood: 'calm' },
    ['walk-1'],
  );
  await api('POST', `/provider/bookings/${tito}/acute-event`, 'rashid', {
    type: 'illness',
    severity: 'minor',
    observation: 'Tito skipped his evening meal and seemed tired.',
  });
  const livingEvent = ((await api('GET', '/admin/acute-events', 'admin')).events as any[]).find(
    (e) => e.bookingId === tito,
  ).id as string;
  await api('POST', `/admin/acute-events/${livingEvent}/steps`, 'admin', {
    step: 'confirm_trigger',
    status: 'done',
  });
  await api('POST', `/admin/acute-events/${livingEvent}/owner-message`, 'admin', {
    language: 'bn',
  });
  const luna = await request({ owner: 'farhana', provider: 'lamia', pet: p.luna, nights: 4 });
  await api('POST', `/provider/bookings/${luna}/confirm`, 'lamia');
  await moveStay(luna, 'lamia', plus(-1), plus(3), true);
  await api('POST', `/provider/bookings/${luna}/start`, 'lamia');
  await update(
    luna,
    'lamia',
    'Luna is settling in beautifully.',
    { medicationsGiven: [], food: 'ate_well', mood: 'happy' },
    ['luna-1'],
  );
  log('two stays in progress, one with an open acute event and a half-finished runbook');

  // upcoming, waiting, declined, cancelled, cancellation request, no-show
  await api(
    'POST',
    `/provider/bookings/${await request({ owner: 'tanvir', provider: 'hasan', pet: p.bruno, nights: 4 }, { from: plus(6), to: plus(10) })}/confirm`,
    'hasan',
  );
  await request(
    { owner: 'nadia', provider: 'rashid', pet: p.mimi, nights: 3 },
    { from: plus(12), to: plus(15) },
  );
  const declined = await request(
    {
      owner: 'bibi',
      provider: 'farzana',
      pet: 'tito',
      nights: 3,
      instructions: 'Insulin twice a day.',
    },
    { from: plus(16), to: plus(19) },
  );
  await api('POST', `/provider/bookings/${declined}/decline`, 'farzana', {
    reason: 'cannot-administer-medication',
  });
  const canceled = await request(
    { owner: 'imran', provider: 'hasan', pet: p.max, nights: 2 },
    { from: plus(20), to: plus(22) },
  );
  await api('POST', `/owner/bookings/${canceled}/cancel`, 'imran');
  const cancelReq = await request(
    { owner: 'farhana', provider: 'nusrat', pet: p.luna, nights: 3 },
    { from: plus(24), to: plus(27) },
  );
  await api('POST', `/provider/bookings/${cancelReq}/confirm`, 'nusrat');
  await api('POST', `/owner/bookings/${cancelReq}/request-cancellation`, 'farhana', {
    note: 'My trip was cancelled.',
  });
  const noShow = await request(
    { owner: 'tanvir', provider: 'kamrul', pet: p.bruno, nights: 2 },
    { from: plus(40), to: plus(42) },
  );
  await api('POST', `/provider/bookings/${noShow}/confirm`, 'kamrul');
  await moveStay(noShow, 'kamrul', plus(0), plus(2), true);
  await api('POST', `/provider/bookings/${noShow}/no-show`, 'kamrul', {
    note: 'The owner did not arrive and did not answer calls.',
  });
  log('upcoming, waiting, declined, canceled, a cancellation request and a no-show');

  // admin: finish the handled acute event, moderate, vet, appeal
  const done = ((await api('GET', '/admin/acute-events', 'admin')).events as any[]).find(
    (e) => e.bookingId === acuteDone,
  ).id as string;
  for (const step of ['confirm_trigger', 'provider_role', 'admin_role', 'vet_lookup'])
    await api('POST', `/admin/acute-events/${done}/steps`, 'admin', { step, status: 'done' });
  await api('POST', `/admin/acute-events/${done}/owner-message`, 'admin', { language: 'en' });
  await api('POST', `/admin/acute-events/${done}/resolve`, 'admin');
  await api('POST', `/admin/acute-events/${done}/post-mortem`, 'admin', {
    timelineAccuracy: 'The timeline matched what the provider told us.',
    roles: 'Roles were clear; the provider called the vet first.',
    ownerCommunication: 'The owner was messaged within minutes.',
    directoryUse: 'The clinic list was used and reached on the first call.',
    gaps: 'No night contact number for the admin.',
    lessons: 'Add a night contact to the runbook.',
  });
  await api('POST', `/admin/bookings/${acuteDone}/release-freeze`, 'admin');
  const reviewId = ((await api('GET', '/admin/reviews', 'admin')).reviews as any[]).find(
    (r) => r.bookingId === contactReview,
  ).id as string;
  await api('POST', `/admin/reviews/${reviewId}/remove`, 'admin', {
    reason: 'contact_details',
    note: 'Phone number in the review text',
  });
  const reportId = ((await api('GET', '/admin/reports', 'admin')).reports as any[]).find(
    (r) => r.category === 'care-not-as-agreed',
  ).id as string;
  await api('POST', `/admin/reports/${reportId}/resolve`, 'admin', {
    refundPoisha: 250000,
    providerAction: 'warning',
    rationale: 'A missed supplement on one day; one night refunded and a warning given.',
  });

  // vetting queue, a declined provider with an appeal, outreach and a signal
  const sadia = 'sadia';
  await api('PUT', `/admin/providers/${sadia}/vetting`, 'admin', {
    identityDone: true,
    addressDone: false,
    capabilityDone: false,
    referencesNote: 'Two neighbours',
    outreachNote: '',
    artifacts: ['nid-ref-sadia'],
  });
  await api('POST', `/admin/providers/${sadia}/request-info`, 'admin', {
    note: 'Please send a recent utility bill for the address check.',
  });
  const tahmid = (
    await api('POST', '/admin/providers', 'admin', {
      name: { en: 'Tahmid', bn: 'তাহমিদ' },
      tier: 'A',
      neighbourhood: 'gulshan',
      species: ['dog', 'cat'],
    })
  ).provider.id as string;
  await api('POST', `/admin/providers/${tahmid}/status`, 'admin', {
    to: 'vetting',
    reason: 'Introduced personally; documents received',
  });
  await api('PUT', `/admin/providers/${tahmid}/vetting`, 'admin', {
    identityDone: true,
    addressDone: true,
    capabilityDone: true,
    referencesNote: 'Vet clinic reference',
    outreachNote: 'Met in person at a pet meetup',
    artifacts: ['nid-ref-tahmid'],
  });
  const rina = (
    await api('POST', '/admin/providers', 'admin', {
      name: { en: 'Rina', bn: 'রিনা' },
      tier: 'B',
      neighbourhood: 'banani',
      species: ['cat'],
    })
  ).provider.id as string;
  await api('POST', `/admin/providers/${rina}/status`, 'admin', {
    to: 'removed',
    reason: 'Could not verify the address',
  });
  await api('POST', `/admin/providers/${rina}/appeals`, 'admin', {
    note: 'Rina sent a new tenancy document and asks for a second look.',
  });
  await sql(
    "UPDATE providers SET created_at = now() - interval '100 days' WHERE id = 'nusrat'; UPDATE providers SET created_at = now() - interval '70 days' WHERE id = 'kamrul'; UPDATE providers SET created_at = now() - interval '45 days' WHERE id = 'farzana'",
  );
  await api('POST', '/admin/providers/nusrat/outreach', 'admin', {
    flag: 'low_utilization_90',
    outreach: 'Called Nusrat about her quiet calendar',
    outcome: 'She will open more weekend nights',
  });
  await api('POST', '/admin/providers/nusrat/signals', 'admin', {
    sourceType: 'feedback',
    note: 'An owner said Nusrat suggested paying her directly next time.',
  });
  log('vetting queue, an appeal, outreach and a defection signal');

  // payouts: run the weekly batch for everything past its dispute window and let the payout service settle it
  await api('POST', '/admin/payouts/run-batch', 'admin');
  await fetch(`${DUMMY}/_training/payouts/settle-now`, { method: 'POST' });
  await api('GET', '/admin/payouts', 'admin');
  log(
    'weekly payout batch sent and settled; later payouts are queued; frozen ones wait for the admin',
  );

  await pool.end();
  console.log(
    '\nDemo data is ready. Sign in as Bibi (01712000001), Rashid (01712000002), Nadia (01712000011), Imran (01712000012) or the admin.',
  );
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
