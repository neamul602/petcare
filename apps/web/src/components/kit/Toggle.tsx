/**
 * "Use saved" switch (DESIGN.md toggle primary-soft). Always paired with visible text;
 * the whole row is the touch target so it meets 44 px even though the track is 36x20.
 */
import { useState } from 'preact/hooks';

interface Props {
  label: string;
  name?: string;
  defaultChecked?: boolean;
}

export default function Toggle({ label, name, defaultChecked = false }: Props) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label class="inline-flex min-h-11 cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        class={`relative h-5 w-9 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          on ? 'border-primary/30 bg-primary-soft' : 'border-border bg-muted'
        }`}
      >
        <span
          aria-hidden="true"
          class={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full transition-transform ${
            on ? 'translate-x-4 bg-primary' : 'translate-x-0 bg-muted-foreground'
          }`}
        />
      </button>
      {name && <input type="hidden" name={name} value={on ? 'on' : 'off'} />}
      <span>{label}</span>
    </label>
  );
}
