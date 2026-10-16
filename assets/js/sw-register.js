/* ==========================================================================
   Calculia — Service worker registration.
   Shared by every entry point (root, 404, config/, legal/,
   tools/<slug>/) so it can run as an external file: the CSP in
   `_headers` is `script-src 'self'` with no `unsafe-inline`, so an
   inline <script> here would be silently blocked by the browser.
   Uses an absolute path so the same file works at any page depth.
   ========================================================================== */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  /* Reload once when a NEW worker takes control. Only when a worker already
     controlled this page: the very first install claims the page without a
     reload, so a first visit is never interrupted. */
  var hadController = !!navigator.serviceWorker.controller;
  var reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });

  /* updateViaCache: 'none' makes the browser fetch sw.js from the network
     for the update check, never from the HTTP cache. */
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
    .then(function (registration) {
      /* Ask for a new sw.js whenever the tab comes back into view, so an
         open tab picks up a deploy without a manual refresh. */
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') registration.update().catch(function () {});
      });
    })
    .catch(function () {});
})();
