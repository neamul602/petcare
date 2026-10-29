/**
 * Shown across the top while the device is offline (EXPERIENCE connectivity state).
 * Renders nothing on the server and when online, so it costs no layout.
 */
import { useEffect, useState } from 'preact/hooks';

export default function ConnectivityBanner({ message }: { message: string }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" data-testid="offline-banner">
      {!online && (
        <p class="fixed inset-x-0 top-0 z-50 bg-warning-soft px-4 py-3 text-center text-sm font-medium text-warning shadow-md">
          {message}
        </p>
      )}
    </div>
  );
}
