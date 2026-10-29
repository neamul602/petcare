/**
 * Owner and provider sign-in (page spec 1.2): phone, then the 6-digit code, then (first time only)
 * name and neighbourhood. Calls /api/auth/* on the web origin. Every message arrives translated from the server.
 */
import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
  next: string;
  resendAfterSeconds: number;
  neighbourhoods: Array<{ id: string; label: string }>;
  text: Record<string, string>;
}

type Step = 'phone' | 'code' | 'profile';
type SignedIn = { status: 'signed_in'; redirect: string };
type NeedsProfile = { status: 'profile_needed'; setupToken: string };

const inputClass =
  'h-12 w-full rounded-md border border-border bg-input px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const primaryClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
const linkClass =
  'inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-muted-foreground';

async function call(path: string, body: unknown) {
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, json } as {
    ok: boolean;
    json: { error?: { code?: string }; [key: string]: unknown };
  };
}

const safeNext = (value: string) =>
  value.startsWith('/') && !value.startsWith('//') ? value : '/';

export default function SignInFlow({ next, resendAfterSeconds, neighbourhoods, text }: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  const t = (key: string, params?: Record<string, string | number>) =>
    (text[key] ?? key).replace(/\{(\w+)\}/g, (match, k: string) =>
      params && k in params ? String(params[k]) : match,
    );
  const fail = (json: { error?: { code?: string } }) =>
    setError(
      t(`signin.error.${json.error?.code ?? 'generic'}`) === `signin.error.${json.error?.code}`
        ? t('signin.error.generic')
        : t(`signin.error.${json.error?.code ?? 'generic'}`),
    );

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  function done(result: SignedIn) {
    const target = result.redirect === '/provider' ? '/provider' : safeNext(next);
    window.location.assign(target);
  }

  async function sendCode(event?: Event) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { ok, json } = await call('/auth/otp/send', { phone });
      if (!ok) return fail(json);
      setSentTo(typeof json.phone === 'string' ? json.phone : phone);
      setCode('');
      setStep('code');
      setWait(resendAfterSeconds);
    } catch {
      setError(t('signin.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: Event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { ok, json } = await call('/auth/otp/verify', { phone, code });
      if (!ok) return fail(json);
      const result = json as unknown as SignedIn | NeedsProfile;
      if (result.status === 'profile_needed') {
        setSetupToken(result.setupToken);
        setStep('profile');
      } else done(result);
    } catch {
      setError(t('signin.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function finish(event: Event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { ok, json } = await call('/auth/profile', { setupToken, name, neighbourhood });
      if (!ok) {
        if (json.error?.code === 'setup_expired') setStep('phone');
        return fail(json);
      }
      done(json as unknown as SignedIn);
    } catch {
      setError(t('signin.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  const errorBox = error && (
    <p
      role="alert"
      data-testid="error-message"
      class="rounded-md bg-destructive-soft px-4 py-3 text-sm text-destructive"
    >
      {error}
    </p>
  );

  return (
    <div class="space-y-5">
      <h1 ref={heading} tabIndex={-1} class="text-2xl font-semibold leading-snug outline-none">
        {step === 'profile' ? t('signin.profile.title') : t('signin.title')}
      </h1>

      {step === 'phone' && (
        <form class="space-y-4" onSubmit={sendCode} data-persist-skip>
          <p class="text-muted-foreground">{t('signin.intro')}</p>
          <div class="space-y-2">
            <label for="phone" class="block text-sm font-medium">
              {t('signin.phone.label')}
            </label>
            <input
              id="phone"
              data-testid="phone-input"
              class={inputClass}
              type="tel"
              inputMode="tel"
              autocomplete="tel"
              required
              value={phone}
              onInput={(e) => setPhone((e.target as HTMLInputElement).value)}
              aria-describedby="phone-hint"
            />
            <p id="phone-hint" class="text-sm text-muted-foreground">
              {t('signin.phone.hint')}
            </p>
          </div>
          {errorBox}
          <button
            type="submit"
            data-testid="send-code"
            class={primaryClass}
            disabled={busy || phone.trim() === ''}
          >
            {busy ? t('signin.sending') : t('signin.send')}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form class="space-y-4" onSubmit={verify}>
          <p class="text-muted-foreground" data-testid="code-hint">
            {t('signin.code.hint', { phone: sentTo })}
          </p>
          <div class="space-y-2">
            <label for="code" class="block text-sm font-medium">
              {t('signin.code.label')}
            </label>
            <input
              id="code"
              data-testid="code-input"
              class={`${inputClass} tracking-[0.4em]`}
              type="text"
              inputMode="numeric"
              autocomplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              value={code}
              onInput={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, ''))}
            />
          </div>
          {errorBox}
          <button
            type="submit"
            data-testid="verify"
            class={primaryClass}
            disabled={busy || code.length !== 6}
          >
            {busy ? t('signin.verifying') : t('signin.verify')}
          </button>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="resend"
              class={linkClass}
              disabled={busy || wait > 0}
              onClick={() => sendCode()}
            >
              {wait > 0 ? t('signin.resendIn', { seconds: wait }) : t('signin.resend')}
            </button>
            <button
              type="button"
              data-testid="change-phone"
              class={linkClass}
              onClick={() => {
                setError(null);
                setStep('phone');
              }}
            >
              {t('signin.changePhone')}
            </button>
          </div>
        </form>
      )}

      {step === 'profile' && (
        <form class="space-y-4" onSubmit={finish}>
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium">
              {t('signin.profile.name')}
            </label>
            <input
              id="name"
              data-testid="name-input"
              class={inputClass}
              type="text"
              autocomplete="name"
              required
              maxLength={80}
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="space-y-2">
            <label for="neighbourhood" class="block text-sm font-medium">
              {t('signin.profile.neighbourhood')}
            </label>
            <select
              id="neighbourhood"
              data-testid="neighbourhood-select"
              class={inputClass}
              required
              value={neighbourhood}
              onChange={(e) => setNeighbourhood((e.target as HTMLSelectElement).value)}
            >
              <option value="">{t('signin.profile.choose')}</option>
              {neighbourhoods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {errorBox}
          <button
            type="submit"
            data-testid="finish"
            class={primaryClass}
            disabled={busy || name.trim() === '' || neighbourhood === ''}
          >
            {t('signin.profile.finish')}
          </button>
        </form>
      )}
    </div>
  );
}
