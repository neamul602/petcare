/* eslint-disable @typescript-eslint/no-explicit-any -- demo loader reads loose API responses */
/**
 * Rich training data for demonstrations (workbook Step 40).
 *   npm run seed            reset the database and load the base training seed
 *   npm run dev             start web, API and Dummy services
 *   npm run seed:demo       add owners (phone and email sign-up), providers, pets with photos, stays in every state, reviews, payouts, reports, an acute event, vetting
 * Illustrated pet portraits and home/garden scenes live in packages/shared/seed/demo-images (generated cartoons, no real photos).
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

const EMAIL_PASSWORD = 'DemoPass123';
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
    ['sumaiya', '+8801712000031', 'Sumaiya Islam', 'gulshan', 'en'],
    ['karim', '+8801712000032', 'Karim Uddin', 'banani', 'bn'],
    ['anika', '+8801712000033', 'Anika Tabassum', 'baridhara', 'en'],
    ['rezwan', '+8801712000034', 'Rezwan Kabir', 'gulshan', 'en'],
    ['tasfia', '+8801712000035', 'Tasfia Nawar', 'banani', 'bn'],
    ['shahed', '+8801712000036', 'Shahed Alam', 'baridhara', 'en'],
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
    [
      'sabrina',
      '+8801712000015',
      'Sabrina',
      'সাবরিনা',
      'A',
      'gulshan',
      ['dog', 'cat'],
      3,
      300000,
      ['medication-administration', 'senior-pets'],
      'Spacious Gulshan apartment with a balcony garden. I am a former vet-clinic assistant, so I am confident giving tablets and injections and caring for older pets.',
      'গুলশানের প্রশস্ত অ্যাপার্টমেন্ট, বারান্দায় ছোট বাগান। আমি আগে ভেট ক্লিনিকে সহকারী ছিলাম, তাই ওষুধ, ইনজেকশন ও বয়স্ক পোষা প্রাণীর যত্নে আমি আত্মবিশ্বাসী।',
    ],
    [
      'rafiq',
      '+8801712000016',
      'Rafiq',
      'রফিক',
      'B',
      'baridhara',
      ['dog'],
      5,
      160000,
      ['large-yard'],
      'Family home in Baridhara with a large walled yard. Big energetic dogs are my favourite; we play fetch morning and evening.',
      'বারিধারায় বড় পাঁচিলঘেরা উঠানসহ পারিবারিক বাড়ি। বড় ও চঞ্চল কুকুর আমার প্রিয়; সকাল-সন্ধ্যা আমরা বল খেলি।',
    ],
    [
      'tasnim',
      '+8801712000017',
      'Tasnim',
      'তাসনিম',
      'A',
      'banani',
      ['cat'],
      2,
      280000,
      ['cats-only', 'anxious-pets'],
      'A calm cats-only home in Banani with climbing shelves and a sunny window seat. I have fostered shy and rescued cats for eight years.',
      'বনানীতে শান্ত শুধু-বিড়ালের বাড়ি, উঠার তাক ও রোদেলা জানালার ধারে বসার জায়গা। আট বছর ধরে লাজুক ও উদ্ধার করা বিড়াল লালন-পালন করছি।',
    ],
    [
      'mahfuz',
      '+8801712000018',
      'Mahfuz',
      'মাহফুজ',
      'B',
      'gulshan',
      ['dog', 'cat'],
      4,
      150000,
      [],
      'Friendly Gulshan household with a rooftop terrace. Our own two dogs love company, and we are home all day.',
      'গুলশানে হাসিখুশি পরিবার, ছাদে খোলা টেরেস। আমাদের নিজেদের দুটি কুকুর সঙ্গ ভালোবাসে, আমরা সারাদিন বাসায় থাকি।',
    ],
    [
      'shirin',
      '+8801712000019',
      'Shirin',
      'শিরিন',
      'A',
      'baridhara',
      ['dog', 'cat'],
      3,
      340000,
      ['senior-pets', 'medication-administration', 'anxious-pets'],
      'Retired nurse in Baridhara. I give every pet one-to-one attention, keep a written medication log and send updates three times a day.',
      'বারিধারার অবসরপ্রাপ্ত নার্স। প্রতিটি পোষা প্রাণীকে আলাদা মনোযোগ দিই, ওষুধের লিখিত খাতা রাখি এবং দিনে তিনবার খবর পাঠাই।',
    ],
    [
      'arif',
      '+8801712000020',
      'Arif',
      'আরিফ',
      'A',
      'banani',
      ['dog'],
      4,
      240000,
      ['large-yard', 'anxious-pets'],
      'Dog trainer based in Banani with a secure garden. I work gently with nervous dogs and do two proper walks every day.',
      'বনানীর কুকুর প্রশিক্ষক, নিরাপদ বাগানসহ বাড়ি। ভীতু কুকুরের সঙ্গে নরমভাবে কাজ করি এবং প্রতিদিন দুবার ভালোমতো হাঁটাই।',
    ],
    [
      'mehnaz',
      '+8801712000021',
      'Mehnaz',
      'মেহনাজ',
      'B',
      'gulshan',
      ['cat'],
      3,
      180000,
      ['cats-only'],
      'Cat lover in Gulshan with a quiet second-floor flat. Cats get their own room, fresh water fountain and lots of play time.',
      'গুলশানের বিড়ালপ্রেমী, দোতলার শান্ত ফ্ল্যাট। প্রতিটি বিড়াল পায় আলাদা ঘর, পরিষ্কার পানির ফোয়ারা আর অনেকক্ষণ খেলার সময়।',
    ],
    [
      'zubair',
      '+8801712000022',
      'Zubair',
      'জুবায়ের',
      'B',
      'banani',
      ['dog', 'cat'],
      2,
      200000,
      [],
      'Software engineer working from home in Banani, so your pet is never alone. Small and medium dogs and cats are welcome.',
      'বনানীতে বাসা থেকে কাজ করা সফটওয়্যার ইঞ্জিনিয়ার, তাই আপনার পোষা প্রাণী কখনো একা থাকে না। ছোট ও মাঝারি কুকুর এবং বিড়াল স্বাগত।',
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
  // two owners who signed up with email and password, through the public sign-up endpoint
  for (const [name, email, area] of [
    ['Ayesha Siddika', 'ayesha.siddika@example.com', 'banani'],
    ['Farid Ahmed', 'farid.ahmed@example.com', 'gulshan'],
  ]) {
    await api(
      'POST',
      '/auth/signup',
      null,
      { name, email, password: EMAIL_PASSWORD, role: 'owner', neighbourhood: area },
      [409],
    );
  }
  log(
    'owners (phone and email sign-up) and eight more providers across Gulshan, Banani, Baridhara',
  );
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
  const ids = {} as Record<string, string> & {
    tito: string;
    mimi: string;
    max: string;
    luna: string;
    bruno: string;
  };
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

  // more households: each pet has a distinct look, care needs and one or two portraits
  const ayesha = (await sql("SELECT id FROM users WHERE email = 'ayesha.siddika@example.com'"))
    .rows[0].id as string;
  const farid = (await sql("SELECT id FROM users WHERE email = 'farid.ahmed@example.com'")).rows[0]
    .id as string;
  ids.ayesha = ayesha;
  ids.farid = farid;
  interface Extra {
    energy?: string;
    goodWith?: string[];
    triggers?: string;
    walks?: number;
    outdoor?: string;
    plan?: Record<string, unknown>;
    neutered?: boolean;
  }
  const dog = (
    who: string,
    key: string,
    name: string,
    breed: string,
    age: number,
    kg: number,
    sex: string,
    photos: string[],
    o: Extra = {},
  ) =>
    make(
      who,
      {
        name,
        species: 'dog',
        breed,
        ageYears: age,
        weightKg: kg,
        sex,
        neutered: o.neutered ?? true,
        vaccination: 'up_to_date',
        behaviour: behaviour(
          o.energy ?? 'moderate',
          o.goodWith ?? ['dogs', 'strangers'],
          o.triggers,
        ),
        dogDetails: { walksPerDay: o.walks ?? 2, outdoorAccess: o.outdoor ?? 'yard' },
        carePlan: { ...emptyPlan, ...o.plan },
      },
      photos,
    ).then((id) => (ids[key] = id));
  const cat = (
    who: string,
    key: string,
    name: string,
    breed: string,
    age: number,
    kg: number,
    sex: string,
    photos: string[],
    o: Extra = {},
  ) =>
    make(
      who,
      {
        name,
        species: 'cat',
        breed,
        ageYears: age,
        weightKg: kg,
        sex,
        neutered: o.neutered ?? true,
        vaccination: 'up_to_date',
        behaviour: behaviour(o.energy ?? 'moderate', o.goodWith ?? ['cats'], o.triggers),
        catDetails: { litterBox: 'covered', indoorOutdoor: 'indoor', company: 'multi_ok' },
        carePlan: { ...emptyPlan, ...o.plan },
      },
      photos,
    ).then((id) => (ids[key] = id));
  const food = (type: string, brand: string, schedule: string, restrictions: string[] = []) => ({
    type,
    brand,
    schedule,
    treats: 'a few small treats',
    restrictions,
  });
  await cat('sumaiya', 'coco', 'Coco', 'Siamese', 2, 3.6, 'female', ['coco-1', 'coco-2'], {
    energy: 'moderate',
    plan: { diet: food('wet', 'Royal Canin Kitten', '08:00 and 19:00') },
  });
  await dog('sumaiya', 'bella', 'Bella', 'Beagle', 3, 11, 'female', ['bella-1', 'bella-2'], {
    energy: 'high',
    goodWith: ['dogs', 'children', 'strangers'],
    walks: 2,
    outdoor: 'garden',
    plan: {
      allergies: ['beef'],
      diet: food('dry', 'Pedigree Adult', '07:30 and 18:30', ['no beef']),
      instructions: 'Beagles sniff everything: please keep the gate closed.',
    },
  });
  await dog('karim', 'rocky', 'Rocky', 'German Shepherd', 5, 34, 'male', ['rocky-1', 'rocky-2'], {
    energy: 'high',
    walks: 3,
    plan: {
      conditions: [{ name: 'mild hip dysplasia', notes: 'avoid long jumping games' }],
      medications: [{ name: 'glucosamine chew', dose: '1 chew', schedule: ['08:00'] }],
      instructions: 'Loves a morning run; no stairs after dinner.',
    },
  });
  await cat('karim', 'simba', 'Simba', 'Orange Tabby', 4, 5.4, 'male', ['simba-1', 'simba-2'], {
    energy: 'high',
    plan: {
      diet: food('mixed', 'Me-O', '07:00 and 20:00'),
      instructions: 'Will try to escape through the door.',
    },
  });
  await dog('anika', 'daisy', 'Daisy', 'Shih Tzu', 11, 7.2, 'female', ['daisy-1'], {
    energy: 'calm',
    walks: 1,
    outdoor: 'indoor_only',
    plan: {
      conditions: [{ name: 'early kidney disease', notes: 'needs a renal diet' }],
      medications: [
        { name: 'renal support tablet', dose: '1 tablet', schedule: ['09:00', '21:00'] },
      ],
      diet: food('wet', 'Hill’s Kidney Care', '08:00 and 18:00', ['low protein']),
      senior: true,
      extraAttention: true,
      instructions: 'Hand-feed if she hesitates. Keep her warm at night.',
      vet: { name: 'Dr. Mahmud', clinic: 'Gulshan Pet Clinic' },
    },
  });
  await cat('anika', 'oreo', 'Oreo', 'Domestic Shorthair', 6, 4.8, 'male', ['oreo-1', 'oreo-2'], {
    energy: 'calm',
    triggers: 'fireworks and the vacuum cleaner',
    plan: {
      anxiety: { triggers: 'loud noises, strangers', comfort: 'a box to hide in and a quiet room' },
    },
  });
  await dog('anika', 'ginger', 'Ginger', 'Indian Pariah', 3, 18, 'female', ['ginger-1'], {
    energy: 'high',
    goodWith: ['dogs', 'cats', 'children', 'strangers'],
    walks: 3,
    outdoor: 'garden',
    plan: { instructions: 'Rescued as a puppy; very friendly and clever.' },
  });
  await dog('rezwan', 'zeus', 'Zeus', 'Rottweiler', 5, 42, 'male', ['zeus-1'], {
    energy: 'moderate',
    goodWith: ['children'],
    triggers: 'other male dogs',
    walks: 3,
    plan: { extraAttention: true, instructions: 'Strong on the lead; please use his harness.' },
  });
  await cat('tasfia', 'chloe', 'Chloe', 'Ragdoll', 3, 5.6, 'female', ['chloe-1'], {
    energy: 'calm',
    goodWith: ['cats', 'children'],
    plan: {
      diet: food('dry', 'Royal Canin Indoor', '08:00 and 19:00'),
      instructions: 'Brush her coat daily.',
    },
  });
  await dog(
    'tasfia',
    'toffee',
    'Toffee',
    'Cocker Spaniel',
    2,
    12,
    'male',
    ['toffee-1', 'toffee-2'],
    {
      energy: 'high',
      goodWith: ['dogs', 'children', 'strangers'],
      plan: {
        conditions: [{ name: 'ear infections', notes: 'clean ears after baths' }],
        allergies: ['wheat'],
      },
    },
  );
  await dog('shahed', 'milo', 'Milo', 'Pug', 3, 9, 'male', ['milo-1'], {
    energy: 'moderate',
    walks: 2,
    outdoor: 'indoor_only',
    plan: {
      conditions: [{ name: 'brachycephalic breathing', notes: 'keep cool, avoid midday heat' }],
      instructions: 'Keep him in the air-conditioned room in the afternoon.',
    },
  });
  await dog(
    ayesha,
    'pepper',
    'Pepper',
    'Border Collie',
    4,
    19,
    'female',
    ['pepper-1', 'pepper-2'],
    {
      energy: 'high',
      goodWith: ['dogs', 'children'],
      walks: 4,
      outdoor: 'garden',
      plan: { extraAttention: true, instructions: 'Needs mental games: puzzle feeders and fetch.' },
    },
  );
  await cat(ayesha, 'snow', 'Snow', 'Turkish Angora', 5, 4.3, 'female', ['snow-1'], {
    energy: 'moderate',
    plan: { diet: food('wet', 'Felix', '08:00 and 18:00') },
  });
  await dog(farid, 'charlie', 'Charlie', 'Pomeranian', 5, 3.4, 'male', ['charlie-1'], {
    energy: 'high',
    goodWith: ['strangers'],
    walks: 1,
    outdoor: 'indoor_only',
    plan: { instructions: 'Small but bossy; barks at the doorbell.' },
  });
  await cat(farid, 'nala', 'Nala', 'Bengal', 2, 4.1, 'female', ['nala-1', 'nala-2'], {
    energy: 'high',
    plan: {
      diet: food('raw', 'home prepared', '07:30 and 19:30'),
      instructions: 'Loves climbing; needs a tall cat tree.',
    },
  });
  log('pets with photos: 20 dogs and cats across 12 households');
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
    updates?: Array<{ note: string; photos: string[]; med?: boolean; medName?: string }>;
    report?: { category: string; description: string };
    acute?: boolean;
  },
) {
  window = 140; // the nights are freed again below, so every past stay can reuse the same booking window
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
        medicationsGiven: u.med ? [{ name: u.medName ?? 'insulin', time: '08:05' }] : [],
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

  // a second wave of completed stays: the new providers and owners build up ratings and reviews
  const SCENES: Record<string, string[]> = {
    sabrina: ['scene-1', 'scene-6'],
    rafiq: ['scene-8', 'scene-6'],
    tasnim: ['scene-2', 'scene-4'],
    mahfuz: ['scene-5', 'scene-10'],
    shirin: ['scene-3', 'scene-9'],
    arif: ['scene-8', 'scene-10'],
    mehnaz: ['scene-4', 'scene-7'],
    zubair: ['scene-2', 'scene-5'],
    lamia: ['scene-1'],
    kamrul: ['scene-6'],
    farzana: ['scene-9'],
    nusrat: ['scene-7'],
    hasan: ['scene-8'],
  };
  const DOG_NOTES = [
    'Good morning walk and a long play in the garden.',
    'Ate all of his dinner and met the other dog at the gate.',
    'Quiet afternoon nap, then a game of fetch.',
    'A bit shy at first, but now wagging at everyone.',
  ];
  const CAT_NOTES = [
    'Settled in nicely and found the sunniest spot.',
    'Played with the feather toy and ate everything.',
    'Purring on my lap this evening.',
    'Explored the room, then slept on the window seat.',
  ];
  let turn = 0;
  const dogs = ['walk-1', 'play-1', 'garden-1', 'garden-2', 'meal-1', 'nap-2'];
  const cats = ['nap-1', 'meal-2', 'play-2'];
  const auto = (provider: string, species: 'dog' | 'cat', count: number, med?: string) =>
    Array.from({ length: count }, (_, i) => {
      turn += 1;
      const pool = species === 'dog' ? dogs : cats;
      const notes = species === 'dog' ? DOG_NOTES : CAT_NOTES;
      const home = SCENES[provider] ?? ['scene-1'];
      return {
        note: notes[turn % notes.length]!,
        photos:
          i === 0
            ? [home[turn % home.length]!, pool[turn % pool.length]!]
            : [pool[turn % pool.length]!],
        med: med !== undefined && i === 0,
        medName: med,
      };
    });
  type Past = [
    owner: string,
    provider: string,
    pet: string,
    species: 'dog' | 'cat',
    nights: number,
    endedDaysAgo: number,
    rating: number,
    review: string,
    extra?: { med?: string; photos?: boolean; updates?: number },
  ];
  const history: Past[] = [
    [
      'sumaiya',
      'sabrina',
      'coco',
      'cat',
      3,
      95,
      5,
      'Coco came home relaxed and clearly well looked after. Sabrina sent a photo every evening.',
      { photos: true },
    ],
    [
      'karim',
      'rafiq',
      'rocky',
      'dog',
      5,
      92,
      4,
      'Rocky had a huge yard and plenty of runs. Pick-up was a little late, otherwise perfect.',
    ],
    [
      'anika',
      'tasnim',
      'oreo',
      'cat',
      4,
      88,
      5,
      'Tasnim is wonderful with nervous cats. Oreo hides for days elsewhere but was on her lap by day two.',
      { photos: true },
    ],
    [
      'rezwan',
      'arif',
      'zeus',
      'dog',
      3,
      85,
      4,
      'Zeus is a big boy and Arif handled him confidently. Good updates and a clean home.',
    ],
    [
      'tasfia',
      'mehnaz',
      'chloe',
      'cat',
      3,
      82,
      5,
      'Chloe was brushed every day and came back purring. Highly recommend.',
      { photos: true },
    ],
    [
      'shahed',
      'mahfuz',
      'milo',
      'dog',
      2,
      80,
      3,
      'Milo was fine, but the house was warm and he struggles in the heat. Mahfuz moved him to the cooler room once I mentioned it.',
    ],
    [
      'ayesha',
      'shirin',
      'pepper',
      'dog',
      4,
      78,
      4,
      'Pepper got lots of exercise. I would have liked a few more photos, but she was happy.',
    ],
    [
      'farid',
      'zubair',
      'charlie',
      'dog',
      3,
      76,
      5,
      'Charlie is bossy but Zubair was patient. Working from home means he was never alone.',
    ],
    [
      'anika',
      'shirin',
      'daisy',
      'dog',
      5,
      72,
      5,
      'Daisy is eleven and needs her tablets on time. Shirin did everything on schedule and treated her like family.',
      { med: 'renal support tablet', photos: true, updates: 3 },
    ],
    [
      'karim',
      'sabrina',
      'simba',
      'cat',
      3,
      70,
      4,
      'Simba tried to escape twice but Sabrina was careful. Great communication.',
    ],
    [
      'sumaiya',
      'mahfuz',
      'bella',
      'dog',
      4,
      68,
      3,
      'Bella enjoyed the walks but the updates were short and came late in the day.',
    ],
    [
      'tasfia',
      'arif',
      'toffee',
      'dog',
      3,
      64,
      5,
      'Toffee loves Arif. He came home tired and happy, and his ears were clean.',
      { photos: true },
    ],
    [
      'ayesha',
      'tasnim',
      'snow',
      'cat',
      4,
      60,
      5,
      'Snow is fussy with strangers but Tasnim won her over. Lovely, quiet home.',
      { photos: true },
    ],
    [
      'farid',
      'mehnaz',
      'nala',
      'cat',
      3,
      58,
      4,
      'Nala was active and well fed. The cat tree was a hit.',
    ],
    [
      'rezwan',
      'rafiq',
      'zeus',
      'dog',
      4,
      54,
      5,
      'Rafiq’s yard is perfect for Zeus. He sent a video call on the second evening, which I appreciated.',
      { photos: true },
    ],
    [
      'shahed',
      'zubair',
      'milo',
      'dog',
      3,
      50,
      4,
      'Milo stayed cool and comfortable. Zubair followed the heat instructions to the letter.',
    ],
    [
      'karim',
      'shirin',
      'rocky',
      'dog',
      3,
      45,
      5,
      'Shirin gave Rocky his glucosamine every morning and kept the walks gentle for his hips.',
      { med: 'glucosamine chew' },
    ],
    [
      'anika',
      'sabrina',
      'ginger',
      'dog',
      4,
      42,
      5,
      'Ginger adored the balcony garden. Sabrina is kind and very organised.',
      { photos: true },
    ],
    [
      'sumaiya',
      'tasnim',
      'coco',
      'cat',
      3,
      40,
      5,
      'Second time with Tasnim. Coco ran straight to her.',
    ],
    [
      'ayesha',
      'arif',
      'pepper',
      'dog',
      5,
      37,
      5,
      'Arif plays proper games with Pepper. She came back calm, which is rare.',
      { photos: true },
    ],
    [
      'sumaiya',
      'zubair',
      'bella',
      'dog',
      3,
      33,
      4,
      'Bella got on well with Zubair. A good, simple stay.',
    ],
    [
      'tasfia',
      'sabrina',
      'chloe',
      'cat',
      4,
      30,
      4,
      'Chloe was comfortable. The apartment is lovely; only wish pick-up times were more flexible.',
    ],
    [
      'farid',
      'shirin',
      'charlie',
      'dog',
      3,
      27,
      5,
      'Shirin kept Charlie calm and the log of his meals was so thorough.',
      { photos: true },
    ],
    [
      'rezwan',
      'mahfuz',
      'zeus',
      'dog',
      2,
      24,
      3,
      'Zeus was fine but the house felt busy for him, and I had to ask twice for an update.',
    ],
    [
      'ayesha',
      'mehnaz',
      'snow',
      'cat',
      3,
      22,
      5,
      'Mehnaz gave Snow her own room and a water fountain. Snow was glossy and calm.',
      { photos: true },
    ],
    [
      'karim',
      'mehnaz',
      'simba',
      'cat',
      3,
      19,
      4,
      'Simba had the run of a quiet flat and no complaints.',
    ],
    [
      'shahed',
      'rafiq',
      'milo',
      'dog',
      4,
      17,
      5,
      'Rafiq’s family doted on Milo. He was kept inside during the hot hours as asked.',
      { photos: true },
    ],
    [
      'tasfia',
      'hasan',
      'toffee',
      'dog',
      3,
      16,
      5,
      'Hasan’s garden is wonderful and Toffee came back smelling of grass.',
    ],
    [
      'karim',
      'farzana',
      'simba',
      'cat',
      3,
      35,
      5,
      'Farzana was gentle and firm with a very clever cat. Great photos.',
      { photos: true },
    ],
    [
      'anika',
      'nusrat',
      'oreo',
      'cat',
      3,
      26,
      5,
      'Nusrat kept the house quiet for Oreo, who relaxed within hours.',
    ],
    [
      'tasfia',
      'farzana',
      'chloe',
      'cat',
      3,
      15,
      4,
      'Chloe was well cared for. Updates were regular.',
    ],
    [
      'ayesha',
      'nusrat',
      'snow',
      'cat',
      3,
      10,
      5,
      'Nusrat is lovely. Snow was spoiled with attention.',
    ],
    ['anika', 'zubair', 'oreo', 'cat', 2, 13, 4, 'Short stay and everything went smoothly.'],
    [
      'farid',
      'tasnim',
      'nala',
      'cat',
      3,
      11,
      5,
      'Tasnim was great with Nala’s energy. Climbing shelves everywhere!',
      { photos: true },
    ],
    [
      'anika',
      'rafiq',
      'ginger',
      'dog',
      3,
      8,
      4,
      'Ginger enjoyed the yard. A few more updates would have been nice.',
    ],
    [
      'ayesha',
      'hasan',
      'pepper',
      'dog',
      4,
      0,
      5,
      'A big garden and a patient host. Pepper was exhausted in the best way.',
      { photos: true },
    ],
    [
      'sumaiya',
      'lamia',
      'coco',
      'cat',
      3,
      1,
      5,
      'Lamia is a gem. Coco was relaxed and fed on time.',
    ],
    ['sumaiya', 'kamrul', 'bella', 'dog', 3, 2, 4, 'Bella loved the yard and made a new friend.'],
  ];
  for (const [owner, provider, pet, species, nights, ended, rating, review, extra] of history)
    await pastStay({
      owner: p[owner] ?? owner,
      provider,
      pet: p[pet] ?? pet,
      nights,
      endedDaysAgo: ended,
      rating,
      review,
      reviewPhotos: extra?.photos,
      updates: auto(provider, species, extra?.updates ?? 2, extra?.med),
    });
  // a second resolved dispute with a partial refund
  const lateUpdates = await pastStay({
    owner: 'rezwan',
    provider: 'mahfuz',
    pet: p.zeus!,
    nights: 2,
    endedDaysAgo: 3,
    rating: 2,
    review: 'Almost no updates, and Zeus came back dirty and hungry.',
    updates: auto('mahfuz', 'dog', 1),
    report: {
      category: 'communication',
      description: 'I asked twice for a photo and only got one short message on the last day.',
    },
  });
  log(`${history.length + 1} more completed stays with reviews across all eleven providers`);

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

  const pepperStay = await request({
    owner: p.ayesha!,
    provider: 'arif',
    pet: p.pepper!,
    nights: 5,
    instructions: 'Please give her lots of fetch and a puzzle feeder.',
  });
  await api('POST', `/provider/bookings/${pepperStay}/confirm`, 'arif');
  await moveStay(pepperStay, 'arif', plus(-3), plus(2), true);
  await api('POST', `/provider/bookings/${pepperStay}/start`, 'arif');
  for (const [note, photos, mood] of [
    ['Pepper settled in fast and chased the ball for an hour.', ['scene-8', 'play-1'], 'happy'],
    [
      'Training game with treats this morning, she is brilliant.',
      ['pepper-2', 'garden-2'],
      'happy',
    ],
    ['Long evening walk. She is asleep at my feet now.', ['walk-1'], 'calm'],
  ] as Array<[string, string[], string]>)
    await update(
      pepperStay,
      'arif',
      note,
      { medicationsGiven: [], food: 'ate_well', mood },
      photos,
    );
  const dasiyStay = await request({
    owner: 'anika',
    provider: 'shirin',
    pet: p.daisy!,
    nights: 4,
    instructions: 'Renal diet and her two daily tablets, please.',
  });
  await api('POST', `/provider/bookings/${dasiyStay}/confirm`, 'shirin');
  await moveStay(dasiyStay, 'shirin', plus(-1), plus(3), true);
  await api('POST', `/provider/bookings/${dasiyStay}/start`, 'shirin');
  await update(
    dasiyStay,
    'shirin',
    'Daisy had both tablets and ate half her dinner. Warm blanket for the night.',
    {
      medicationsGiven: [{ name: 'renal support tablet', time: '09:05' }],
      food: 'ate_some',
      mood: 'calm',
    },
    ['scene-3', 'nap-2'],
  );
  log('four stays in progress, one with an open acute event and a half-finished runbook');

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

  // more upcoming work for the new providers' calendars and requests lists
  const later = async (
    owner: string,
    provider: string,
    pet: string,
    from: number,
    to: number,
    confirm: boolean,
  ) => {
    const id = await request(
      { owner: p[owner] ?? owner, provider, pet, nights: to - from },
      { from: plus(from), to: plus(to) },
    );
    if (confirm) await api('POST', `/provider/bookings/${id}/confirm`, provider);
    return id;
  };
  await later('sumaiya', 'sabrina', p.bella!, 8, 11, true);
  await later('karim', 'tasnim', p.simba!, 9, 12, false);
  await later('rezwan', 'rafiq', p.zeus!, 11, 15, false);
  await later('tasfia', 'mehnaz', p.chloe!, 14, 17, true);
  await later('farid', 'zubair', p.nala!, 18, 21, false);
  await later('shahed', 'mahfuz', p.milo!, 22, 24, true);
  await later('ayesha', 'shirin', p.snow!, 26, 30, true);
  await later('farid', 'arif', p.charlie!, 45, 48, true);
  await later('anika', 'sabrina', p.ginger!, 52, 56, false);
  const declined2 = await later('rezwan', 'shirin', p.zeus!, 33, 36, false);
  await api('POST', `/provider/bookings/${declined2}/decline`, 'shirin', {
    reason: 'care-requirements-exceed-capacity',
  });
  const canceled2 = await later('karim', 'zubair', p.rocky!, 38, 41, false);
  await api('POST', `/owner/bookings/${canceled2}/cancel`, 'karim');
  log('more upcoming, waiting, declined and canceled stays for the new households');

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

  const lateReport = ((await api('GET', '/admin/reports', 'admin')).reports as any[]).find(
    (r) => r.bookingId === lateUpdates,
  );
  if (lateReport)
    await api('POST', `/admin/reports/${lateReport.id}/resolve`, 'admin', {
      refundPoisha: 150000,
      providerAction: 'warning',
      rationale:
        'Very few updates were sent; one night refunded and the provider was reminded of the update rule.',
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
    '\nDemo data is ready. Sign in as Bibi (01712000001), Rashid (01712000002), Nadia (01712000011), Imran (01712000012), Sabrina (01712000015), Sumaiya (01712000031), ayesha.siddika@example.com (password DemoPass123) or the admin.',
  );
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
