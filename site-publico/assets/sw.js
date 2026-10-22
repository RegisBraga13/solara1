/* Minimal service worker for PWA installability.
   Android Chrome requires a SW with a fetch handler before showing the
   install prompt; iOS Safari supports add-to-home-screen without one but
   ignores this file harmlessly. We don't pre-cache anything yet — the
   handler falls through to the network so requests behave as normal. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  /* No-op: presence of this listener is what Chrome checks for. */
});
