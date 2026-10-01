/* ==========================================================================
   Calculia — Locale picker configuration.
   Must be an external file, not an inline <script>: the CSP in `_headers`
   is `script-src 'self'` with no `unsafe-inline`, so the browser blocked
   the inline block and window.LocalePickerConfig stayed undefined. The
   component then fell back to ITS OWN defaults — `js/strings` (a folder
   Calculia does not have, so every load cost two 404s) and the
   `apptonomia:locale` storage key of a sibling app — and, with discovery
   off the table, it offered no English at all. Same reason
   assets/js/sw-register.js is an external file.
   Loaded without `defer`, so it runs before the deferred
   assets/js/locale-picker.js, exactly like the inline block it replaces.

   `data-settings-href` on the <script> tag sets the "more settings"
   link, resolved against the page (the dev/ catalogue points at the
   settings page; the landing has no link, its footer carries it).
   ========================================================================== */
(function () {
  'use strict';
  var script = document.currentScript;
  var settingsHref = (script && script.getAttribute('data-settings-href')) || '';
  window.LocalePickerConfig = {
    storageKey: 'calculia:locale',
    /* Calculia keeps the landing strings next to the page (at the site
       root), not under assets/js/, so discovery is skipped: no HEAD
       probes, and requiredLocales names the two locales shipped. */
    path: null,
    requiredLocales: ['es', 'en'],
    defaultLocale: 'en',
    settingsHref: settingsHref
  };
})();
