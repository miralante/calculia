/* ==========================================================================
   Calculia — Service worker registration.
   Shared by every entry point (root, 404, site/, settings/, legal/,
   tools/<slug>/) so it can run as an external file: the CSP in
   `_headers` is `script-src 'self'` with no `unsafe-inline`, so an
   inline <script> here would be silently blocked by the browser.
   Uses an absolute path so the same file works at any page depth.
   ========================================================================== */
(function () {
  'use strict';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
