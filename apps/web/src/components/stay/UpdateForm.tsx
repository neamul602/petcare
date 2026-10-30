/** Post a daily update: photos (up to 4), a structured care log and a short note (page spec 3.6). */
import { useEffect, useState } from 'preact/hooks';

interface Props {
  bookingId: string;
  text: Record<string, string>;
}
const MAX_PHOTOS = 4;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const field =
  'h-12 w-full rounded-md border border-border bg-input px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const btn =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';

export default function UpdateForm({ bookingId, text }: Props) {
  const t = (key: string) => text[key] ?? key;
  const [note, setNote] = useState('');
  const [food, setFood] = useState('');
  const [mood, setMood] = useState('');
  const [meds, setMeds] = useState<Array<{ name: string; time: string }>>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [held, setHeld] = useState(false);
  const [error, setError] = useState('');

  const careLog = () => ({
    medicationsGiven: meds
      .filter((m) => m.name.trim() && TIME.test(m.time))
      .map((m) => ({ name: m.name.trim(), time: m.time })),
    ...(food ? { food } : {}),
    ...(mood ? { mood } : {}),
  });

  async function send() {
    if (busy) return;
    setError('');
    if (!navigator.onLine) {
      setHeld(true);
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append('note', note);
      body.append('careLog', JSON.stringify(careLog()));
      files.forEach((f) => body.append('photo', f));
      const response = await fetch(`/api/provider/bookings/${bookingId}/updates`, {
        method: 'POST',
        body,
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      setError(t('stay.update.error'));
    } catch {
      setError(t('stay.update.error'));
    } finally {
      setBusy(false);
    }
  }

  // An update held while offline is posted once, when the connection returns.
  useEffect(() => {
    if (!held) return;
    const go = () => {
      setHeld(false);
      void send();
    };
    if (navigator.onLine) {
      go();
      return;
    }
    window.addEventListener('online', go, { once: true });
    return () => window.removeEventListener('online', go);
  }, [held]);

  return (
    <form
      class="space-y-4 rounded-lg border border-border bg-card p-5"
      data-testid="update-form"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <h2 class="text-xl font-semibold">{t('stay.update.post')}</h2>
      <div class="space-y-2">
        <label for="u-note" class="block text-sm font-medium">
          {t('stay.update.note')}
        </label>
        <textarea
          id="u-note"
          data-testid="update-note"
          maxLength={500}
          class="min-h-24 w-full rounded-md border border-border bg-input p-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={note}
          onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
        />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <label for="u-food" class="block text-sm font-medium">
            {t('stay.update.food')}
          </label>
          <select
            id="u-food"
            data-testid="update-food"
            class={field}
            value={food}
            onChange={(e) => setFood((e.target as HTMLSelectElement).value)}
          >
            <option value="">{t('stay.update.none')}</option>
            {['ate_well', 'ate_some', 'refused'].map((v) => (
              <option key={v} value={v}>
                {t(`food.${v}`)}
              </option>
            ))}
          </select>
        </div>
        <div class="space-y-2">
          <label for="u-mood" class="block text-sm font-medium">
            {t('stay.update.mood')}
          </label>
          <select
            id="u-mood"
            data-testid="update-mood"
            class={field}
            value={mood}
            onChange={(e) => setMood((e.target as HTMLSelectElement).value)}
          >
            <option value="">{t('stay.update.none')}</option>
            {['happy', 'calm', 'anxious', 'unwell'].map((v) => (
              <option key={v} value={v}>
                {t(`mood.${v}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="font-medium">{t('stay.update.meds')}</h3>
        {meds.map((m, i) => (
          <div key={i} class="space-y-2 rounded-md bg-muted p-3">
            <label for={`m-name-${i}`} class="block text-sm font-medium">
              {t('stay.update.medName')}
            </label>
            <input
              id={`m-name-${i}`}
              data-testid={`med-name-${i}`}
              class={field}
              value={m.name}
              onInput={(e) =>
                setMeds(
                  meds.map((x, j) =>
                    j === i ? { ...x, name: (e.target as HTMLInputElement).value } : x,
                  ),
                )
              }
            />
            <label for={`m-time-${i}`} class="block text-sm font-medium">
              {t('stay.update.medTime')}
            </label>
            <input
              id={`m-time-${i}`}
              data-testid={`med-time-${i}`}
              class={field}
              value={m.time}
              onInput={(e) =>
                setMeds(
                  meds.map((x, j) =>
                    j === i ? { ...x, time: (e.target as HTMLInputElement).value } : x,
                  ),
                )
              }
            />
            <button
              type="button"
              class={btn}
              onClick={() => setMeds(meds.filter((_, j) => j !== i))}
            >
              {t('stay.update.remove')}
            </button>
          </div>
        ))}
        <button
          type="button"
          class={btn}
          data-testid="add-med"
          onClick={() => setMeds([...meds, { name: '', time: '' }])}
        >
          {t('stay.update.addMed')}
        </button>
      </div>
      <div class="space-y-2">
        <h3 class="font-medium">{t('stay.update.photos')}</h3>
        <ul class="space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} class="flex items-center gap-3">
              <span class="mr-auto text-sm">{f.name}</span>
              <button
                type="button"
                class={btn}
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
              >
                {t('stay.update.removePhoto')}
              </button>
            </li>
          ))}
        </ul>
        {files.length < MAX_PHOTOS && (
          <label class={`${btn} cursor-pointer`}>
            {t('stay.update.addPhoto')}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              data-testid="update-photos"
              class="sr-only"
              onChange={(e) => {
                const input = e.target as HTMLInputElement;
                setFiles([...files, ...Array.from(input.files ?? [])].slice(0, MAX_PHOTOS));
                input.value = '';
              }}
            />
          </label>
        )}
      </div>
      {held && (
        <p
          role="status"
          data-testid="update-held"
          class="rounded-md bg-info-soft px-4 py-3 text-info"
        >
          {t('stay.update.offline')}
        </p>
      )}
      {error && (
        <p
          role="alert"
          data-testid="update-error"
          class="rounded-md bg-destructive-soft px-4 py-3 text-destructive"
        >
          {error}
        </p>
      )}
      <p class="text-sm text-muted-foreground">{t('stay.update.immutable')}</p>
      <button
        type="submit"
        data-testid="update-send"
        disabled={busy || held}
        class="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {busy ? t('stay.update.sending') : t('stay.update.send')}
      </button>
    </form>
  );
}
