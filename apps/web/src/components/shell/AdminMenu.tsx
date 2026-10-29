/** Collapsible admin navigation for screens narrower than 768 px. */
import { useState } from 'preact/hooks';

interface Item {
  href: string;
  label: string;
  active: boolean;
}

export default function AdminMenu({
  items,
  menuLabel,
  navLabel,
}: {
  items: Item[];
  menuLabel: string;
  navLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div class="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen(!open)}
        class="min-h-11 rounded-md border border-border px-4 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {menuLabel}
      </button>
      {open && (
        <nav
          id="admin-mobile-nav"
          aria-label={navLabel}
          class="absolute inset-x-0 top-full border-b border-border bg-card shadow-lg"
        >
          <ul class="p-2">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.active ? 'page' : undefined}
                  class={`flex min-h-11 items-center rounded-md px-3 font-medium hover:bg-muted ${item.active ? 'text-primary' : ''}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
