/* ============================================================
   Calculia — Landing page.
   Language selector, total stars, and the greeting audio button.
   ============================================================ */
(function () {
  'use strict';

  /* The language is not switched from this file: it lives in the shared
     header dropdown (assets/js/locale-picker.js), which calls
     App.i18n.setLocale() on this page. The pair of #btnIdiomaEs /
     #btnIdiomaEn buttons is gone, so there is no selector left to paint
     or to wire here. */

  document.getElementById('totalStars').textContent =
    '⭐ ' + App.storage.totalStars();
  document.getElementById('totalStars').title = App.i18n.t('yourStars');

  // Re-apply translations now that strings.<locale>.js have registered their
  // keys (App.i18n.apply() in i18n.js ran before they were loaded).
  App.i18n.apply();
})();
