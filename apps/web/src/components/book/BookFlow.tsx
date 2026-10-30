/**
 * The Book flow in three short steps (page specs 1.6, 1.7): pet and dates, care plan, review and pay.
 * Inputs are kept on the device. One submission key per checkout makes a double tap or a retry the same booking.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { formatMoney } from '@petcare/shared/locale';

interface Props {
  provider: { slug: string; name: string; pricePerNightPoisha: number; species: string[] };
  pets: Array<{ id: string; name: string; species: string }>;
  initial: { from: string; to: string; petId: string; instructions?: string };
  again?: { id: string; startedAt: string; petName: string; nights: number } | null;
  methods: string[];
  today: string;
  text: Record<string, string>;
}

interface Saved {
  step: number;
  petId: string;
  from: string;
  to: string;
  useSaved: boolean;
  instructions: string;
  declaredClinical: boolean;
  confirmedNotClinical: boolean;
  method: string;
  key: string;
  held: boolean;
}

const newKey = () => `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const nightsBetween = (from: string, to: string) =>
  from && to
    ? Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
    : 0;

const field =
  'h-12 w-full rounded-md border border-border bg-input px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const btn =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';
const primary =
  'inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';

export default function BookFlow({ provider, pets, initial, again, methods, today, text }: Props) {
  const storageKey = `pc:book:${provider.slug}`;
  const [s, setS] = useState<Saved>({
    step: 1,
    petId: initial.petId || pets[0]?.id || '',
    from: initial.from,
    to: initial.to,
    useSaved: true,
    instructions: initial.instructions ?? '',
    declaredClinical: false,
    confirmedNotClinical: false,
    method: methods[0] ?? 'bkash',
    key: newKey(),
    held: false,
  });
  const [full, setFull] = useState<string[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [carePlan, setCarePlan] = useState<{
    conditions?: Array<{ name: string }>;
    medications?: Array<{ name: string; dose: string; schedule: string[] }>;
  } | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const restored = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!again) return;
    const tick = () =>
      setElapsed(Math.max(0, Math.round((Date.now() - Date.parse(again.startedAt)) / 1000)));
    tick();
    const handle = window.setInterval(tick, 1000);
    return () => window.clearInterval(handle);
  }, []);
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

  const t = (key: string, params?: Record<string, string | number>) =>
    (text[key] ?? key).replace(/\{(\w+)\}/g, (m, k: string) =>
      params && k in params ? String(params[k]) : m,
    );
  const set = <K extends keyof Saved>(key: K, value: Saved[K]) =>
    setS((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as {
        at: number;
        state: Saved;
      } | null;
      // Book again starts from the earlier stay, not from a half-finished draft.
      if (!again && saved && Date.now() - saved.at < 24 * 3_600_000) {
        const keep = { ...saved.state };
        if (initial.from && initial.to) {
          keep.from = initial.from;
          keep.to = initial.to;
        }
        setS(keep);
      }
    } catch {
      /* nothing kept */
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ at: Date.now(), state: s }));
    } catch {
      /* blocked */
    }
  }, [s]);

  const pet = pets.find((p) => p.id === s.petId);
  const nights = nightsBetween(s.from, s.to);
  const total = nights > 0 ? nights * provider.pricePerNightPoisha : 0;
  const speciesOk = !pet || provider.species.includes(pet.species);

  // Step 1: are all nights free?
  useEffect(() => {
    setFull(null);
    if (!(nights > 0) || s.from < today) return;
    setChecking(true);
    let live = true;
    fetch(`/api/providers/${provider.slug}/availability?from=${s.from}&to=${s.to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { nights: Array<{ date: string; available: boolean }> } | null) => {
        if (live && body) setFull(body.nights.filter((n) => !n.available).map((n) => n.date));
      })
      .catch(() => undefined)
      .finally(() => live && setChecking(false));
    return () => {
      live = false;
    };
  }, [s.from, s.to]);

  // Step 2: the saved care plan for the chosen pet.
  useEffect(() => {
    if (s.step !== 2 || !s.petId) return;
    fetch(`/api/owner/pets/${s.petId}/prefill`)
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { carePlan: typeof carePlan } | null) => setCarePlan(b?.carePlan ?? null))
      .catch(() => setCarePlan(null));
  }, [s.step, s.petId]);

  const datesOk = nights > 0 && s.from >= today;
  const step1Ready = !!pet && speciesOk && datesOk && full !== null && full.length === 0;

  async function screen() {
    setBlocked(false);
    const response = await fetch('/api/owner/intake/screen', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        petId: s.petId,
        declaredClinical: s.declaredClinical,
        confirmedNotClinical: s.confirmedNotClinical,
        text: s.instructions,
      }),
    }).catch(() => null);
    if (!response || response.ok) {
      setNeedsConfirm(false);
      return true;
    }
    const body = (await response.json().catch(() => ({}))) as { error?: { code?: string } };
    if (body.error?.code === 'clinical_request_rejected') setBlocked(true);
    if (body.error?.code === 'needs_confirmation') setNeedsConfirm(true);
    return false;
  }

  async function submit() {
    if (busy) return;
    setError('');
    if (!navigator.onLine) {
      set('held', true);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/owner/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          key: s.key,
          providerSlug: provider.slug,
          petId: s.petId,
          from: s.from,
          to: s.to,
          method: s.method,
          instructions: s.instructions,
          declaredClinical: s.declaredClinical,
          confirmedNotClinical: s.confirmedNotClinical,
          ...(again ? { bookAgainId: again.id } : {}),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        booking?: { id: string };
        error?: { code?: string };
      };
      if (response.ok && body.booking) {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        window.location.assign(`/bookings/${body.booking.id}`);
        return;
      }
      const code = body.error?.code ?? 'generic';
      // A declined payment is final for that reference; the next attempt (maybe another method) is a new one.
      if (code === 'payment_declined') set('key', newKey());
      setError(text[`book.error.${code}`] ?? t('book.error.generic'));
    } catch {
      setError(t('book.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  // A request held while offline is sent once, when the connection returns.
  useEffect(() => {
    if (!s.held) return;
    const send = () => {
      set('held', false);
      void submit();
    };
    if (navigator.onLine) {
      send();
      return;
    }
    window.addEventListener('online', send, { once: true });
    return () => window.removeEventListener('online', send);
  }, [s.held]);

  const Stepper = () => (
    <p class="text-sm text-muted-foreground" data-testid="step">
      {t('book.step', { n: s.step })} · {t(`book.step${s.step}`)}
    </p>
  );

  if (pets.length === 0)
    return (
      <div class="space-y-4">
        <p data-testid="no-pet">{t('book.noPet')}</p>
        <a href="/pets/new" class={primary}>
          {t('book.addPet')}
        </a>
      </div>
    );

  return (
    <div class="space-y-5 pb-28">
      {again && (
        <p
          class="rounded-md bg-primary-soft px-4 py-3 text-primary-soft-foreground"
          data-testid="again-note"
        >
          {t('book.again.from', { pet: again.petName, n: again.nights })} ·{' '}
          <span data-testid="again-elapsed">{t('book.again.elapsed', { time: clock })}</span>
        </p>
      )}
      <Stepper />
      {s.step === 1 && (
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="pet" class="block text-sm font-medium">
              {t('book.pet')}
            </label>
            <select
              id="pet"
              data-testid="book-pet"
              class={field}
              value={s.petId}
              onChange={(e) => set('petId', (e.target as HTMLSelectElement).value)}
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <a href="/pets/new" class="inline-flex min-h-11 items-center text-primary underline">
              {t('book.addPet')}
            </a>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <label for="from" class="block text-sm font-medium">
                {t('search.from')}
              </label>
              <input
                id="from"
                data-testid="book-from"
                type="date"
                min={today}
                class={field}
                value={s.from}
                onInput={(e) => set('from', (e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="space-y-2">
              <label for="to" class="block text-sm font-medium">
                {t('search.to')}
              </label>
              <input
                id="to"
                data-testid="book-to"
                type="date"
                class={field}
                value={s.to}
                onInput={(e) => set('to', (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          {!speciesOk && (
            <p role="alert" class="rounded-md bg-warning-soft px-4 py-3 text-warning">
              {t('book.speciesNotHosted', { species: t(`pets.species.${pet!.species}`) })}
            </p>
          )}
          {!datesOk && s.from && s.to && (
            <p role="alert" class="rounded-md bg-warning-soft px-4 py-3 text-warning">
              {t('book.datesNeeded')}
            </p>
          )}
          {checking && <p role="status">{t('book.checking')}</p>}
          {full && full.length > 0 && (
            <p
              role="alert"
              data-testid="nights-full"
              class="rounded-md bg-warning-soft px-4 py-3 text-warning"
            >
              {t('book.nightsFull', { dates: full.join(', ') })}
            </p>
          )}
          {full && full.length === 0 && datesOk && (
            <p
              role="status"
              data-testid="nights-free"
              class="rounded-md bg-primary-soft px-4 py-3 text-primary-soft-foreground"
            >
              {t('book.nightsFree')}
            </p>
          )}
          <button
            type="button"
            class={primary}
            data-testid="step-next"
            disabled={!step1Ready}
            onClick={() => set('step', 2)}
          >
            {t('book.next')}
          </button>
        </div>
      )}

      {s.step === 2 && (
        <div class="space-y-4">
          <label class="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              data-testid="use-saved"
              class="h-5 w-5 accent-primary"
              checked={s.useSaved}
              onChange={(e) => set('useSaved', (e.target as HTMLInputElement).checked)}
            />
            <span>{t('book.care.saved', { name: pet?.name ?? '' })}</span>
          </label>
          <div class="rounded-md bg-muted p-4 text-sm" data-testid="care-summary">
            {carePlan &&
            ((carePlan.conditions?.length ?? 0) > 0 || (carePlan.medications?.length ?? 0) > 0) ? (
              <ul class="list-disc ps-5">
                {carePlan.conditions?.map((c) => (
                  <li key={c.name}>{c.name}</li>
                ))}
                {carePlan.medications?.map((m) => (
                  <li key={m.name}>
                    {m.name}, {m.dose}, {m.schedule.join(', ')}
                  </li>
                ))}
              </ul>
            ) : (
              t('book.care.none')
            )}
            <p class="mt-2 text-muted-foreground">{t('book.care.savedHint')}</p>
          </div>
          <div class="space-y-2">
            <label for="instructions" class="block text-sm font-medium">
              {t('book.care.instructions')}
            </label>
            <textarea
              id="instructions"
              data-testid="book-instructions"
              class="min-h-24 w-full rounded-md border border-border bg-input p-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={1000}
              value={s.instructions}
              onInput={(e) => {
                set('instructions', (e.target as HTMLTextAreaElement).value);
                setNeedsConfirm(false);
              }}
            />
          </div>
          <label class="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              data-testid="declare-clinical"
              class="h-5 w-5 accent-primary"
              checked={s.declaredClinical}
              onChange={(e) => {
                set('declaredClinical', (e.target as HTMLInputElement).checked);
                setBlocked(false);
              }}
            />
            <span>{t('book.care.clinical')}</span>
          </label>
          {blocked && (
            <p
              role="alert"
              data-testid="clinical-blocked"
              class="rounded-md bg-destructive-soft px-4 py-3 text-destructive"
            >
              {t('book.care.clinicalBlocked')}
            </p>
          )}
          {needsConfirm && (
            <div
              class="space-y-2 rounded-md bg-warning-soft p-4 text-warning"
              role="alert"
              data-testid="needs-confirm"
            >
              <p>{t('book.care.needsConfirm')}</p>
              <label class="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  data-testid="confirm-not-clinical"
                  class="h-5 w-5 accent-primary"
                  checked={s.confirmedNotClinical}
                  onChange={(e) =>
                    set('confirmedNotClinical', (e.target as HTMLInputElement).checked)
                  }
                />
                <span>{t('book.care.confirmNotClinical')}</span>
              </label>
            </div>
          )}
          <div class="flex gap-3">
            <button type="button" class={btn} onClick={() => set('step', 1)}>
              {t('book.back')}
            </button>
            <button
              type="button"
              class={primary}
              data-testid="step-next"
              onClick={async () => {
                if (s.declaredClinical) {
                  setBlocked(true);
                  return;
                }
                if (await screen()) set('step', 3);
              }}
            >
              {t('book.next')}
            </button>
          </div>
        </div>
      )}

      {s.step === 3 && (
        <div class="space-y-4">
          <div class="space-y-2 rounded-lg border border-border bg-card p-5" data-testid="review">
            <p class="font-semibold">
              {provider.name} · {pet?.name}
            </p>
            <p>
              {s.from} → {s.to}
            </p>
            <p data-testid="breakdown">
              {t('book.review.breakdown', {
                n: nights,
                price: formatMoney(provider.pricePerNightPoisha),
              })}
            </p>
            <p class="text-xl font-semibold" data-testid="total">
              {t('book.review.total')}: {formatMoney(total)}
            </p>
          </div>
          <fieldset class="space-y-1">
            <legend class="text-sm font-medium">{t('book.review.method')}</legend>
            {methods.map((m) => (
              <label key={m} class="flex min-h-11 items-center gap-3">
                <input
                  type="radio"
                  name="method"
                  data-testid={`method-${m}`}
                  class="h-5 w-5 accent-primary"
                  checked={s.method === m}
                  onChange={() => set('method', m)}
                />
                <span>{t(`pay.${m}`)}</span>
              </label>
            ))}
          </fieldset>
          <p class="text-sm">{t('book.review.charge', { name: provider.name })}</p>
          <p class="text-sm text-muted-foreground">{t('book.review.rule')}</p>
          {s.held && (
            <p role="status" data-testid="held" class="rounded-md bg-info-soft px-4 py-3 text-info">
              {t('book.offlineHeld')}
            </p>
          )}
          {error && (
            <p
              role="alert"
              data-testid="submit-error"
              class="rounded-md bg-destructive-soft px-4 py-3 text-destructive"
            >
              {error}
            </p>
          )}
          <div class="flex gap-3">
            <button type="button" class={btn} onClick={() => set('step', 2)}>
              {t('book.back')}
            </button>
            <button
              type="button"
              class={primary}
              data-testid="submit-booking"
              disabled={busy || s.held}
              onClick={submit}
            >
              {busy ? t('book.submitting') : t('book.submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
