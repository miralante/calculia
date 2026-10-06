/* ==========================================================================
   Calculia — Locale picker configuration.
   Must be an external file, not an inline <script>: the CSP in `_headers`
   is `script-src 'self'` with no `unsafe-inline`, so an inline block is
   blocked and window.LocalePickerConfig stays undefined. The component then
   falls back to ITS OWN defaults — `js/strings` (a folder Calculia does not
   have, so every load cost two 404s) and the `apptonomia:locale` storage
   key of a sibling app — and, with discovery off the table, it offered no
   English at all. Same reason assets/js/sw-register.js is an external file.
   Load it BEFORE assets/js/locale-picker.js, and without `defer`, so it
   runs first.

   Same file for the landing and for the dev/ catalogue: it no longer reads
   a `data-settings-href` attribute off its own <script> tag. That attribute
   only existed to point the drawer's "more settings" link at ../config/,
   and the link is gone — the header gear now holds nothing but theme, text
   size and high contrast, because Calculia already links its own settings
   page from its own navigation and two doors to one room is exactly the
   duplicated configuration this drawer is meant to avoid.
   ========================================================================== */
window.LocalePickerConfig = {
  /* El selector de idioma va DENTRO del cajón del ⚙️, como primera
     fila, y el ⚙️ se queda solo en la cabecera. Antes vivía al lado
     del ⚙️ en la fila de controles y eran dos sitios donde cambiar
     preferencias. Coste: un clic más para llegar al idioma. */
  languageInDrawer: true,
  storageKey: 'calculia:locale',
  /* Calculia keeps the landing strings next to the page (at the site
     root), not under assets/js/, so discovery is skipped: no HEAD probes,
     and requiredLocales names the two locales shipped. */
  path: null,
  requiredLocales: ['es', 'en'],
  defaultLocale: 'en'
};
