/**
 * Add or edit a pet (page spec 1.5): about, behaviour, species fields, the structured care plan and photos.
 * Everything is translated by the server and sent in `text`. Typed input is kept on the device until the pet is saved.
 */
import { useEffect, useRef, useState } from 'preact/hooks';

type Json = Record<string, unknown>;
export interface PetView {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  ageYears: number;
  weightKg: number;
  sex: string;
  neutered: boolean;
  vaccination: string;
  behaviour: { energy?: string; goodWith?: string[]; triggers?: string; notes?: string };
  dogDetails: { walksPerDay: number; outdoorAccess: string } | null;
  catDetails: { litterBox: string; indoorOutdoor: string; company: string } | null;
  carePlan: {
    conditions: Array<{ name: string; notes?: string }>;
    medications: Array<{ name: string; dose: string; schedule: string[] }>;
    allergies: string[];
    anxiety: { triggers: string; comfort: string } | null;
    diet: {
      type: string;
      brand?: string;
      schedule?: string;
      treats?: string;
      restrictions: string[];
    } | null;
    senior: boolean;
    extraAttention: boolean;
    instructions: string;
    vet: { name: string; clinic?: string; phone?: string } | null;
  };
  photos: Array<{ id: string; url: string }>;
}

interface Props {
  mode: 'create' | 'edit';
  pet?: PetView;
  text: Record<string, string>;
}

const OPTIONS = {
  sex: ['male', 'female', 'unknown'],
  vaccination: ['up_to_date', 'not_up_to_date', 'not_known', 'not_applicable'],
  energy: ['calm', 'moderate', 'high'],
  goodWith: ['dogs', 'cats', 'children', 'strangers'],
  outdoor: ['indoor_only', 'yard', 'garden'],
  litter: ['covered', 'open', 'any'],
  place: ['indoor', 'outdoor', 'both'],
  company: ['single', 'multi_ok'],
  diet: ['low-carb-kibble', 'dry', 'wet', 'raw', 'home-cooked', 'mixed', 'other'],
};
const MAX_PHOTOS = 5;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

interface State {
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  ageYears: string;
  weightKg: string;
  sex: string;
  neutered: boolean;
  vaccination: string;
  energy: string;
  goodWith: string[];
  triggers: string;
  notes: string;
  walksPerDay: string;
  outdoorAccess: string;
  litterBox: string;
  indoorOutdoor: string;
  company: string;
  conditions: Array<{ name: string; notes: string }>;
  medications: Array<{ name: string; dose: string; times: string }>;
  allergies: string;
  anxietyOn: boolean;
  anxietyTriggers: string;
  anxietyComfort: string;
  dietType: string;
  brand: string;
  dietSchedule: string;
  treats: string;
  restrictions: string;
  senior: boolean;
  extraAttention: boolean;
  instructions: string;
  vetName: string;
  vetClinic: string;
  vetPhone: string;
}

const split = (value: string) =>
  value
    .split(/[,،]/)
    .map((part) => part.trim())
    .filter(Boolean);

function fromPet(pet?: PetView): State {
  const plan = pet?.carePlan;
  return {
    name: pet?.name ?? '',
    species: pet?.species ?? 'dog',
    breed: pet?.breed ?? '',
    ageYears: pet ? String(pet.ageYears) : '',
    weightKg: pet ? String(pet.weightKg) : '',
    sex: pet?.sex ?? 'unknown',
    neutered: pet?.neutered ?? false,
    vaccination: pet?.vaccination ?? 'not_known',
    energy: pet?.behaviour.energy ?? 'moderate',
    goodWith: pet?.behaviour.goodWith ?? [],
    triggers: pet?.behaviour.triggers ?? '',
    notes: pet?.behaviour.notes ?? '',
    walksPerDay: pet?.dogDetails ? String(pet.dogDetails.walksPerDay) : '2',
    outdoorAccess: pet?.dogDetails?.outdoorAccess ?? 'indoor_only',
    litterBox: pet?.catDetails?.litterBox ?? 'covered',
    indoorOutdoor: pet?.catDetails?.indoorOutdoor ?? 'indoor',
    company: pet?.catDetails?.company ?? 'single',
    conditions: (plan?.conditions ?? []).map((c) => ({ name: c.name, notes: c.notes ?? '' })),
    medications: (plan?.medications ?? []).map((m) => ({
      name: m.name,
      dose: m.dose,
      times: m.schedule.join(', '),
    })),
    allergies: (plan?.allergies ?? []).join(', '),
    anxietyOn: !!plan?.anxiety,
    anxietyTriggers: plan?.anxiety?.triggers ?? '',
    anxietyComfort: plan?.anxiety?.comfort ?? '',
    dietType: plan?.diet?.type ?? '',
    brand: plan?.diet?.brand ?? '',
    dietSchedule: plan?.diet?.schedule ?? '',
    treats: plan?.diet?.treats ?? '',
    restrictions: (plan?.diet?.restrictions ?? []).join(', '),
    senior: plan?.senior ?? false,
    extraAttention: plan?.extraAttention ?? false,
    instructions: plan?.instructions ?? '',
    vetName: plan?.vet?.name ?? '',
    vetClinic: plan?.vet?.clinic ?? '',
    vetPhone: plan?.vet?.phone ?? '',
  };
}

function toPayload(s: State): Json {
  return {
    name: s.name.trim(),
    species: s.species,
    breed: s.breed.trim(),
    ageYears: Number(s.ageYears),
    weightKg: Number(s.weightKg),
    sex: s.sex,
    neutered: s.neutered,
    vaccination: s.vaccination,
    behaviour: { energy: s.energy, goodWith: s.goodWith, triggers: s.triggers, notes: s.notes },
    dogDetails:
      s.species === 'dog'
        ? { walksPerDay: Number(s.walksPerDay), outdoorAccess: s.outdoorAccess }
        : null,
    catDetails:
      s.species === 'cat'
        ? { litterBox: s.litterBox, indoorOutdoor: s.indoorOutdoor, company: s.company }
        : null,
    carePlan: {
      conditions: s.conditions
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          ...(c.notes.trim() ? { notes: c.notes.trim() } : {}),
        })),
      medications: s.medications
        .filter((m) => m.name.trim() || m.dose.trim() || m.times.trim())
        .map((m) => ({
          name: m.name.trim(),
          dose: m.dose.trim(),
          schedule: split(m.times.replace(/\s+/g, ',')),
        })),
      allergies: split(s.allergies),
      anxiety: s.anxietyOn
        ? { triggers: s.anxietyTriggers.trim(), comfort: s.anxietyComfort.trim() }
        : null,
      diet: s.dietType
        ? {
            type: s.dietType,
            brand: s.brand.trim(),
            schedule: s.dietSchedule.trim(),
            treats: s.treats.trim(),
            restrictions: split(s.restrictions),
          }
        : null,
      senior: s.senior,
      extraAttention: s.extraAttention,
      instructions: s.instructions.trim(),
      vet: s.vetName.trim()
        ? { name: s.vetName.trim(), clinic: s.vetClinic.trim(), phone: s.vetPhone.trim() }
        : null,
    },
  };
}

const field =
  'h-12 w-full rounded-md border bg-input px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const area =
  'min-h-24 w-full rounded-md border bg-input p-4 text-base leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const btn =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';

function uploadPhoto(
  petId: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ id: string; url: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/owner/pets/${petId}/photos`);
    xhr.upload.onprogress = (event) =>
      event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () => {
      let body: { photo?: { id: string; url: string }; error?: { code?: string } } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* not JSON */
      }
      if (xhr.status === 201 && body.photo) resolve(body.photo);
      else reject(new Error(body.error?.code ?? 'photo_unavailable'));
    };
    xhr.onerror = () => reject(new Error('photo_unavailable'));
    xhr.send(form);
  });
}

export default function PetForm({ mode, pet, text }: Props) {
  const storageKey = `pc:form:pet-${pet?.id ?? 'new'}`;
  const [s, setS] = useState<State>(() => fromPet(pet));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [photos, setPhotos] = useState(pet?.photos ?? []);
  const [pending, setPending] = useState<File[]>([]);
  const [uploads, setUploads] = useState<
    Array<{ key: string; name: string; percent: number; error?: string; file: File }>
  >([]);
  const restored = useRef(false);

  const t = (key: string, params?: Record<string, string | number>) =>
    (text[key] ?? key).replace(/\{(\w+)\}/g, (m, k: string) =>
      params && k in params ? String(params[k]) : m,
    );
  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setS((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as {
        at: number;
        state: State;
      } | null;
      if (saved && Date.now() - saved.at < 7 * 24 * 60 * 60 * 1000) setS(saved.state);
    } catch {
      /* nothing kept */
    }
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ at: Date.now(), state: s }));
    } catch {
      /* storage full or blocked */
    }
  }, [s]);

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!s.name.trim()) e.name = t('pets.error.required');
    if (!s.breed.trim()) e.breed = t('pets.error.required');
    const age = Number(s.ageYears);
    if (s.ageYears.trim() === '' || !Number.isInteger(age) || age < 0 || age > 30)
      e.ageYears = t('pets.error.age');
    const weight = Number(s.weightKg);
    if (s.weightKg.trim() === '' || !(weight >= 0.1 && weight <= 100))
      e.weightKg = t('pets.error.weight');
    s.medications.forEach((m, i) => {
      if (!(m.name.trim() || m.dose.trim() || m.times.trim())) return;
      if (!m.name.trim()) e[`med-name-${i}`] = t('pets.error.required');
      if (!m.dose.trim()) e[`med-dose-${i}`] = t('pets.error.required');
      const times = split(m.times.replace(/\s+/g, ','));
      if (times.length === 0 || times.some((time) => !TIME.test(time)))
        e[`med-times-${i}`] = t('pets.error.time');
    });
    return e;
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list);
    if (mode === 'create') {
      setPending((previous) => [...previous, ...files].slice(0, MAX_PHOTOS));
      return;
    }
    for (const file of files) {
      const key = `${file.name}-${Date.now()}-${Math.random()}`;
      await sendFile(key, file);
    }
  }
  async function sendFile(key: string, file: File) {
    setUploads((previous) => [
      ...previous.filter((u) => u.key !== key),
      { key, name: file.name, percent: 0, file },
    ]);
    try {
      const photo = await uploadPhoto(pet!.id, file, (percent) =>
        setUploads((previous) => previous.map((u) => (u.key === key ? { ...u, percent } : u))),
      );
      setPhotos((previous) => [...previous, photo]);
      setUploads((previous) => previous.filter((u) => u.key !== key));
    } catch (error) {
      const code = (error as Error).message;
      setUploads((previous) =>
        previous.map((u) =>
          u.key === key
            ? { ...u, error: text[`pets.error.${code}`] ?? t('pets.error.photo_unavailable') }
            : u,
        ),
      );
    }
  }
  async function removePhoto(id: string) {
    const response = await fetch(`/api/owner/pets/${pet!.id}/photos/${id}`, { method: 'DELETE' });
    if (response.ok) setPhotos((previous) => previous.filter((photo) => photo.id !== id));
  }

  async function submit(event: Event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setSummary(Object.keys(found).length > 0);
    setFailure('');
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        mode === 'create' ? '/api/owner/pets' : `/api/owner/pets/${pet!.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(toPayload(s)),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        pet?: { id: string };
        error?: { details?: Array<{ path: Array<string | number> }> };
      };
      if (!response.ok || !body.pet) {
        const server: Record<string, string> = {};
        for (const issue of body.error?.details ?? [])
          if (typeof issue.path[0] === 'string') server[issue.path[0]] = t('pets.error.required');
        setErrors(server);
        setSummary(true);
        setFailure(t('pets.error.generic'));
        return;
      }
      let photoFailed = false;
      if (mode === 'create')
        for (const file of pending)
          await uploadPhoto(body.pet.id, file, () => undefined).catch(() => {
            photoFailed = true;
          });
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      window.location.assign(photoFailed ? `/pets/${body.pet.id}/edit` : `/pets/${body.pet.id}`);
    } catch {
      setFailure(t('pets.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  const Err = ({ id }: { id: string }) =>
    errors[id] ? (
      <p id={`${id}-err`} role="alert" class="text-sm text-destructive">
        {errors[id]}
      </p>
    ) : null;
  const inv = (id: string) => ({
    'aria-invalid': errors[id] ? ('true' as const) : undefined,
    'aria-describedby': errors[id] ? `${id}-err` : undefined,
  });
  const bd = (id: string) => (errors[id] ? 'border-destructive' : 'border-border');
  const Label = ({ for: id, children }: { for: string; children: string }) => (
    <label for={id} class="block text-sm font-medium">
      {children}
    </label>
  );
  const Select = ({
    id,
    value,
    options,
    label,
    onChange,
    prefix,
  }: {
    id: string;
    value: string;
    options: string[];
    label: string;
    onChange: (v: string) => void;
    prefix: string;
  }) => (
    <div class="space-y-2">
      <Label for={id}>{label}</Label>
      <select
        id={id}
        data-testid={id}
        class={`${field} border-border`}
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {t(`${prefix}.${option}`)}
          </option>
        ))}
      </select>
    </div>
  );
  const Check = ({
    id,
    checked,
    label,
    onChange,
  }: {
    id: string;
    checked: boolean;
    label: string;
    onChange: (v: boolean) => void;
  }) => (
    <label class="flex min-h-11 items-center gap-3">
      <input
        id={id}
        data-testid={id}
        type="checkbox"
        class="h-5 w-5 accent-primary"
        checked={checked}
        onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
      />
      <span>{label}</span>
    </label>
  );
  const Section = ({ title, children }: { title: string; children: preact.ComponentChildren }) => (
    <section class="space-y-4 rounded-lg border border-border bg-card p-5 shadow-md">
      <h2 class="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );

  return (
    <form class="space-y-5 pb-24" onSubmit={submit} noValidate data-testid="pet-form">
      {summary && (
        <p
          role="alert"
          data-testid="error-summary"
          class="rounded-md bg-destructive-soft px-4 py-3 text-sm text-destructive"
        >
          {failure || t('pets.error.summary')}
        </p>
      )}

      <Section title={t('pets.section.about')}>
        <div class="space-y-2">
          <Label for="name">{t('pets.field.name')}</Label>
          <input
            id="name"
            data-testid="pet-name"
            class={`${field} ${bd('name')}`}
            value={s.name}
            onInput={(e) => set('name', (e.target as HTMLInputElement).value)}
            maxLength={60}
            {...inv('name')}
          />
          <Err id="name" />
        </div>
        <div class="space-y-2">
          <span id="species-label" class="block text-sm font-medium">
            {t('pets.field.species')}
          </span>
          <div role="radiogroup" aria-labelledby="species-label" class="grid grid-cols-2 gap-3">
            {(['dog', 'cat'] as const).map((species) => (
              <button
                key={species}
                type="button"
                role="radio"
                aria-checked={s.species === species}
                data-testid={`pet-species-${species}`}
                onClick={() => set('species', species)}
                class={`min-h-12 rounded-md border px-4 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${s.species === species ? 'border-primary bg-primary-soft text-primary-soft-foreground' : 'border-border bg-card'}`}
              >
                {t(`pets.species.${species}`)}
              </button>
            ))}
          </div>
        </div>
        <div class="space-y-2">
          <Label for="breed">{t('pets.field.breed')}</Label>
          <input
            id="breed"
            data-testid="pet-breed"
            class={`${field} ${bd('breed')}`}
            value={s.breed}
            onInput={(e) => set('breed', (e.target as HTMLInputElement).value)}
            maxLength={80}
            {...inv('breed')}
          />
          <Err id="breed" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="ageYears">{t('pets.field.age')}</Label>
            <input
              id="ageYears"
              data-testid="pet-age"
              class={`${field} ${bd('ageYears')}`}
              inputMode="numeric"
              value={s.ageYears}
              onInput={(e) => set('ageYears', (e.target as HTMLInputElement).value)}
              {...inv('ageYears')}
            />
            <Err id="ageYears" />
          </div>
          <div class="space-y-2">
            <Label for="weightKg">{t('pets.field.weight')}</Label>
            <input
              id="weightKg"
              data-testid="pet-weight"
              class={`${field} ${bd('weightKg')}`}
              inputMode="decimal"
              value={s.weightKg}
              onInput={(e) => set('weightKg', (e.target as HTMLInputElement).value)}
              {...inv('weightKg')}
            />
            <Err id="weightKg" />
          </div>
        </div>
        <Select
          id="sex"
          value={s.sex}
          options={OPTIONS.sex}
          label={t('pets.field.sex')}
          onChange={(v) => set('sex', v)}
          prefix="pets.sex"
        />
        <Check
          id="neutered"
          checked={s.neutered}
          label={t('pets.field.neutered')}
          onChange={(v) => set('neutered', v)}
        />
        <Select
          id="vaccination"
          value={s.vaccination}
          options={OPTIONS.vaccination}
          label={t('pets.field.vaccination')}
          onChange={(v) => set('vaccination', v)}
          prefix="pets.vaccination"
        />
      </Section>

      <Section title={t('pets.section.behaviour')}>
        <Select
          id="energy"
          value={s.energy}
          options={OPTIONS.energy}
          label={t('pets.field.energy')}
          onChange={(v) => set('energy', v)}
          prefix="pets.energy"
        />
        <fieldset class="space-y-1">
          <legend class="text-sm font-medium">{t('pets.field.goodWith')}</legend>
          {OPTIONS.goodWith.map((option) => (
            <Check
              key={option}
              id={`goodWith-${option}`}
              checked={s.goodWith.includes(option)}
              label={t(`pets.goodWith.${option}`)}
              onChange={(v) =>
                set(
                  'goodWith',
                  v ? [...s.goodWith, option] : s.goodWith.filter((x) => x !== option),
                )
              }
            />
          ))}
        </fieldset>
        <div class="space-y-2">
          <Label for="triggers">{t('pets.field.triggers')}</Label>
          <textarea
            id="triggers"
            class={`${area} border-border`}
            value={s.triggers}
            onInput={(e) => set('triggers', (e.target as HTMLTextAreaElement).value)}
            maxLength={500}
          />
        </div>
        {s.species === 'dog' ? (
          <div class="grid grid-cols-2 gap-3" data-testid="dog-fields">
            <div class="space-y-2">
              <Label for="walks">{t('pets.dog.walks')}</Label>
              <select
                id="walks"
                data-testid="walks"
                class={`${field} border-border`}
                value={s.walksPerDay}
                onChange={(e) => set('walksPerDay', (e.target as HTMLSelectElement).value)}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <Select
              id="outdoor"
              value={s.outdoorAccess}
              options={OPTIONS.outdoor}
              label={t('pets.dog.outdoor')}
              onChange={(v) => set('outdoorAccess', v)}
              prefix="pets.outdoor"
            />
          </div>
        ) : (
          <div class="space-y-4" data-testid="cat-fields">
            <Select
              id="litter"
              value={s.litterBox}
              options={OPTIONS.litter}
              label={t('pets.cat.litter')}
              onChange={(v) => set('litterBox', v)}
              prefix="pets.litter"
            />
            <Select
              id="place"
              value={s.indoorOutdoor}
              options={OPTIONS.place}
              label={t('pets.cat.place')}
              onChange={(v) => set('indoorOutdoor', v)}
              prefix="pets.place"
            />
            <Select
              id="company"
              value={s.company}
              options={OPTIONS.company}
              label={t('pets.cat.company')}
              onChange={(v) => set('company', v)}
              prefix="pets.company"
            />
          </div>
        )}
      </Section>

      <Section title={t('pets.section.care')}>
        <div class="space-y-3">
          <h3 class="font-medium">{t('pets.care.conditions')}</h3>
          {s.conditions.map((c, i) => (
            <div key={i} class="space-y-2 rounded-md bg-muted p-3">
              <input
                aria-label={t('pets.care.conditionName')}
                data-testid={`condition-name-${i}`}
                class={`${field} border-border`}
                placeholder={t('pets.care.conditionName')}
                value={c.name}
                onInput={(e) =>
                  set(
                    'conditions',
                    s.conditions.map((x, j) =>
                      j === i ? { ...x, name: (e.target as HTMLInputElement).value } : x,
                    ),
                  )
                }
              />
              <input
                aria-label={t('pets.care.conditionNotes')}
                class={`${field} border-border`}
                placeholder={t('pets.care.conditionNotes')}
                value={c.notes}
                onInput={(e) =>
                  set(
                    'conditions',
                    s.conditions.map((x, j) =>
                      j === i ? { ...x, notes: (e.target as HTMLInputElement).value } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                class={btn}
                onClick={() =>
                  set(
                    'conditions',
                    s.conditions.filter((_, j) => j !== i),
                  )
                }
              >
                {t('pets.care.remove')}
              </button>
            </div>
          ))}
          <button
            type="button"
            data-testid="add-condition"
            class={btn}
            onClick={() => set('conditions', [...s.conditions, { name: '', notes: '' }])}
          >
            {t('pets.care.addCondition')}
          </button>
        </div>

        <div class="space-y-3">
          <h3 class="font-medium">{t('pets.care.medications')}</h3>
          {s.medications.map((m, i) => (
            <div key={i} class="space-y-2 rounded-md bg-muted p-3">
              <div class="space-y-1">
                <Label for={`med-name-${i}`}>{t('pets.care.medName')}</Label>
                <input
                  id={`med-name-${i}`}
                  data-testid={`med-name-${i}`}
                  class={`${field} ${bd(`med-name-${i}`)}`}
                  value={m.name}
                  onInput={(e) =>
                    set(
                      'medications',
                      s.medications.map((x, j) =>
                        j === i ? { ...x, name: (e.target as HTMLInputElement).value } : x,
                      ),
                    )
                  }
                  {...inv(`med-name-${i}`)}
                />
                <Err id={`med-name-${i}`} />
              </div>
              <div class="space-y-1">
                <Label for={`med-dose-${i}`}>{t('pets.care.medDose')}</Label>
                <input
                  id={`med-dose-${i}`}
                  data-testid={`med-dose-${i}`}
                  class={`${field} ${bd(`med-dose-${i}`)}`}
                  value={m.dose}
                  onInput={(e) =>
                    set(
                      'medications',
                      s.medications.map((x, j) =>
                        j === i ? { ...x, dose: (e.target as HTMLInputElement).value } : x,
                      ),
                    )
                  }
                  {...inv(`med-dose-${i}`)}
                />
                <Err id={`med-dose-${i}`} />
              </div>
              <div class="space-y-1">
                <Label for={`med-times-${i}`}>{t('pets.care.medTimes')}</Label>
                <input
                  id={`med-times-${i}`}
                  data-testid={`med-times-${i}`}
                  class={`${field} ${bd(`med-times-${i}`)}`}
                  value={m.times}
                  onInput={(e) =>
                    set(
                      'medications',
                      s.medications.map((x, j) =>
                        j === i ? { ...x, times: (e.target as HTMLInputElement).value } : x,
                      ),
                    )
                  }
                  {...inv(`med-times-${i}`)}
                />
                <Err id={`med-times-${i}`} />
              </div>
              <button
                type="button"
                class={btn}
                onClick={() =>
                  set(
                    'medications',
                    s.medications.filter((_, j) => j !== i),
                  )
                }
              >
                {t('pets.care.remove')}
              </button>
            </div>
          ))}
          <button
            type="button"
            data-testid="add-medication"
            class={btn}
            onClick={() =>
              set('medications', [...s.medications, { name: '', dose: '', times: '' }])
            }
          >
            {t('pets.care.addMedication')}
          </button>
        </div>

        <div class="space-y-2">
          <Label for="allergies">{t('pets.care.allergies')}</Label>
          <input
            id="allergies"
            data-testid="allergies"
            class={`${field} border-border`}
            value={s.allergies}
            onInput={(e) => set('allergies', (e.target as HTMLInputElement).value)}
          />
        </div>

        <Check
          id="anxiety-on"
          checked={s.anxietyOn}
          label={t('pets.care.anxiety')}
          onChange={(v) => set('anxietyOn', v)}
        />
        {s.anxietyOn && (
          <div class="space-y-3">
            <div class="space-y-2">
              <Label for="anxiety-triggers">{t('pets.care.anxietyTriggers')}</Label>
              <textarea
                id="anxiety-triggers"
                class={`${area} border-border`}
                value={s.anxietyTriggers}
                onInput={(e) => set('anxietyTriggers', (e.target as HTMLTextAreaElement).value)}
                maxLength={500}
              />
            </div>
            <div class="space-y-2">
              <Label for="anxiety-comfort">{t('pets.care.anxietyComfort')}</Label>
              <textarea
                id="anxiety-comfort"
                class={`${area} border-border`}
                value={s.anxietyComfort}
                onInput={(e) => set('anxietyComfort', (e.target as HTMLTextAreaElement).value)}
                maxLength={500}
              />
            </div>
          </div>
        )}

        <div class="space-y-3">
          <h3 class="font-medium">{t('pets.care.diet')}</h3>
          <div class="space-y-2">
            <Label for="diet-type">{t('pets.care.diet')}</Label>
            <select
              id="diet-type"
              data-testid="diet-type"
              class={`${field} border-border`}
              value={s.dietType}
              onChange={(e) => set('dietType', (e.target as HTMLSelectElement).value)}
            >
              <option value="">{t('pets.diet.none')}</option>
              {OPTIONS.diet.map((d) => (
                <option key={d} value={d}>
                  {t(`pets.diet.${d}`)}
                </option>
              ))}
            </select>
          </div>
          {s.dietType && (
            <>
              <div class="space-y-2">
                <Label for="brand">{t('pets.care.brand')}</Label>
                <input
                  id="brand"
                  class={`${field} border-border`}
                  value={s.brand}
                  onInput={(e) => set('brand', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="space-y-2">
                <Label for="diet-schedule">{t('pets.care.dietSchedule')}</Label>
                <input
                  id="diet-schedule"
                  class={`${field} border-border`}
                  value={s.dietSchedule}
                  onInput={(e) => set('dietSchedule', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="space-y-2">
                <Label for="treats">{t('pets.care.treats')}</Label>
                <input
                  id="treats"
                  class={`${field} border-border`}
                  value={s.treats}
                  onInput={(e) => set('treats', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="space-y-2">
                <Label for="restrictions">{t('pets.care.restrictions')}</Label>
                <input
                  id="restrictions"
                  class={`${field} border-border`}
                  value={s.restrictions}
                  onInput={(e) => set('restrictions', (e.target as HTMLInputElement).value)}
                />
              </div>
            </>
          )}
        </div>

        <Check
          id="senior"
          checked={s.senior}
          label={t('pets.care.senior')}
          onChange={(v) => set('senior', v)}
        />
        <Check
          id="extra-attention"
          checked={s.extraAttention}
          label={t('pets.care.extraAttention')}
          onChange={(v) => set('extraAttention', v)}
        />
        <div class="space-y-2">
          <Label for="instructions">{t('pets.care.instructions')}</Label>
          <textarea
            id="instructions"
            data-testid="instructions"
            class={`${area} border-border`}
            value={s.instructions}
            onInput={(e) => set('instructions', (e.target as HTMLTextAreaElement).value)}
            maxLength={1000}
          />
        </div>
        <div class="space-y-3">
          <h3 class="font-medium">{t('pets.care.vet')}</h3>
          <div class="space-y-2">
            <Label for="vet-name">{t('pets.care.vetName')}</Label>
            <input
              id="vet-name"
              class={`${field} border-border`}
              value={s.vetName}
              onInput={(e) => set('vetName', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="space-y-2">
            <Label for="vet-clinic">{t('pets.care.vetClinic')}</Label>
            <input
              id="vet-clinic"
              class={`${field} border-border`}
              value={s.vetClinic}
              onInput={(e) => set('vetClinic', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="space-y-2">
            <Label for="vet-phone">{t('pets.care.vetPhone')}</Label>
            <input
              id="vet-phone"
              type="tel"
              class={`${field} border-border`}
              value={s.vetPhone}
              onInput={(e) => set('vetPhone', (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </Section>

      <Section title={t('pets.section.photos')}>
        <p class="text-sm text-muted-foreground">
          {t('pets.photos.hint')}
          {mode === 'create' ? ` ${t('pets.photos.saveFirst')}` : ''}
        </p>
        <ul class="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <li key={photo.id} class="space-y-2">
              <img src={photo.url} alt="" class="aspect-square w-full rounded-md object-cover" />
              <button type="button" class={`${btn} w-full`} onClick={() => removePhoto(photo.id)}>
                {t('pets.photos.remove')}
              </button>
            </li>
          ))}
          {pending.map((file, index) => (
            <li key={`${file.name}-${index}`} class="space-y-2">
              <div class="flex aspect-square w-full items-center justify-center rounded-md bg-muted p-2 text-center text-xs">
                {file.name}
              </div>
              <button
                type="button"
                class={`${btn} w-full`}
                onClick={() => setPending(pending.filter((_, j) => j !== index))}
              >
                {t('pets.photos.remove')}
              </button>
            </li>
          ))}
        </ul>
        {uploads.map((u) => (
          <div key={u.key} role="status" class="space-y-2 rounded-md bg-muted p-3 text-sm">
            <p>{u.error ?? t('pets.photos.uploading', { name: u.name, percent: u.percent })}</p>
            {u.error && (
              <button
                type="button"
                data-testid="retry-photo"
                class={btn}
                onClick={() => sendFile(u.key, u.file)}
              >
                {t('pets.photos.retry')}
              </button>
            )}
          </div>
        ))}
        {photos.length + pending.length < MAX_PHOTOS && (
          <label class={`${btn} cursor-pointer`}>
            {t('pets.photos.add')}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              data-testid="photo-input"
              class="sr-only"
              onChange={(e) => {
                addFiles((e.target as HTMLInputElement).files);
                (e.target as HTMLInputElement).value = '';
              }}
            />
          </label>
        )}
      </Section>

      <div class="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 md:bottom-0">
        <a href={mode === 'edit' && pet ? `/pets/${pet.id}` : '/pets'} class={`${btn} mr-auto`}>
          {t('pets.discard')}
        </a>
        <button
          type="submit"
          data-testid="save-pet"
          disabled={busy}
          class="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {busy ? t('pets.saving') : mode === 'create' ? t('pets.create') : t('pets.save')}
        </button>
      </div>
    </form>
  );
}
