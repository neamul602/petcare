/**
 * Bottom sheet on phones, centred dialog on larger screens (EXPERIENCE "Sheet").
 * Has a Close button, closes on Escape, and returns focus to the trigger.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
  triggerLabel: string;
  title: string;
  closeLabel: string;
  children: ComponentChildren;
}

export default function Sheet({ triggerLabel, title, closeLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const firstFocusable = dialog.current?.querySelector<HTMLElement>(
      'button, a, input, select, textarea',
    );
    firstFocusable?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      trigger.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        class="min-h-11 rounded-md border border-border px-4 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {triggerLabel}
      </button>
      {open && (
        <div
          class="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
            class="w-full rounded-t-xl bg-card p-6 shadow-xl md:max-w-md md:rounded-xl"
          >
            <div class="mb-4 flex items-center justify-between gap-4">
              <h2 class="text-xl font-semibold">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                class="min-h-11 rounded-md px-3 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {closeLabel}
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
