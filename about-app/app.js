/* ============================================================
   Calculia — About the app (about-app/)
   Linked from the shared footer (utils.js injectFooter), first
   link, where "Settings" would go. Shows the achievements the
   person has unlocked. The catalog, the unlock rules and the
   badge renderer live in ../assets/js/achievements.js.
   ============================================================ */
(function () {
  'use strict';

  function paintLanguageSelector() {
    var active = App.i18n.locale();
    App.utils.$$('.btn-lang').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.locale === active));
      btn.addEventListener('click', function () { App.i18n.setLocale(btn.dataset.locale); });
    });
  }

  function renderAchievements() {
    App.achievements.render(document.getElementById('achievementsGrid'));
    var done = App.achievements.unlocked();
    var count = App.achievements.list.filter(function (a) { return !!done[a.id]; }).length;
    document.getElementById('achievementsCount').textContent = App.i18n.t('achievementsCount')
      .replace('{n}', String(count))
      .replace('{total}', String(App.achievements.list.length));
  }

  paintLanguageSelector();
  /* strings.<locale>.js registered their keys after i18n.js ran. */
  App.i18n.apply();
  renderAchievements();
})();
