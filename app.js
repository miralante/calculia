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

  var totalEl = document.getElementById('totalStars');
  var total = App.storage.totalStars();
  totalEl.textContent = '⭐ ' + total;
  totalEl.title = App.i18n.t('yourStars');
  // Achievements (every 10) and the next goal (ends in 5): one engine for the suite.
  window.MiralanteStars.goal(totalEl, total, {
    reached: App.i18n.t('starsReached'),
    goal: App.i18n.t('starsGoal')
  });

  // Re-apply translations now that strings.<locale>.js have registered their
  // keys (App.i18n.apply() in i18n.js ran before they were loaded).
  App.i18n.apply();
})();
