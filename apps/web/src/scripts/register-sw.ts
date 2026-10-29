/** Registers the Workbox service worker in production builds only (never in development). */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      /* The app works without it; installability and offline pages are the only loss. */
    });
  });
}
