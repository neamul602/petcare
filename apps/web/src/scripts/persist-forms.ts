/**
 * Keeps what people type on the device so a dropped connection or a reload never loses it
 * (EXPERIENCE "Form persistence"). Opt in with <form data-persist="unique-name">.
 * Nothing is sent anywhere. Passwords, files and fields marked data-persist-skip are never saved.
 * Stories clear a form after a successful save with: document.dispatchEvent(new CustomEvent('pc:persist-clear', { detail: 'unique-name' })).
 */
const PREFIX = 'pc:form:';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type Saved = { savedAt: number; values: Record<string, string | boolean> };

const fieldsOf = (form: HTMLFormElement) =>
  Array.from(form.elements).filter(
    (el): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
      (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement) &&
      !!el.name &&
      !el.hasAttribute('data-persist-skip') &&
      !(
        el instanceof HTMLInputElement &&
        ['password', 'file', 'hidden', 'submit', 'button'].includes(el.type)
      ),
  );

function save(form: HTMLFormElement, key: string) {
  const values: Saved['values'] = {};
  for (const el of fieldsOf(form)) {
    values[el.name] =
      el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')
        ? el.checked
        : el.value;
  }
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ savedAt: Date.now(), values } satisfies Saved),
    );
  } catch {
    /* Storage full or blocked: typing still works, it just is not kept. */
  }
}

function restore(form: HTMLFormElement, key: string) {
  let saved: Saved | null;
  try {
    saved = JSON.parse(localStorage.getItem(PREFIX + key) ?? 'null') as Saved | null;
  } catch {
    saved = null;
  }
  if (!saved || Date.now() - saved.savedAt > MAX_AGE_MS) return;
  for (const el of fieldsOf(form)) {
    const value = saved.values[el.name];
    if (value === undefined) continue;
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio'))
      el.checked = value === true;
    else el.value = String(value);
  }
}

function init() {
  for (const form of document.querySelectorAll<HTMLFormElement>('form[data-persist]')) {
    const key = form.dataset.persist!;
    restore(form, key);
    form.addEventListener('input', () => save(form, key));
    form.addEventListener('change', () => save(form, key));
  }
}

document.addEventListener('pc:persist-clear', (event) => {
  try {
    localStorage.removeItem(PREFIX + String((event as CustomEvent).detail));
  } catch {
    /* ignore */
  }
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
