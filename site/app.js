/* ============================================================
   Calculia — Landing page.
   Language selector, total stars, and the greeting audio button.
   ============================================================ */
(function () {
  'use strict';

  /* The selector reads App.i18n.SUPPORTED at runtime: adding a new
     language means adding one <button id="btnIdioma<Xx>" data-locale="<code>">
     in index.html (doc/I18N.md §5, step 2). */
  var LOCALE_BUTTONS = { es: 'btnIdiomaEs', en: 'btnIdiomaEn' };

  function paintLanguageSelector() {
    var active = App.i18n.locale();
    App.i18n.SUPPORTED.forEach(function (loc) {
      var id = LOCALE_BUTTONS[loc];
      var btn = id && document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', String(active === loc));
    });
  }

  document.getElementById('totalStars').textContent =
    '⭐ ' + App.storage.totalStars();
  document.getElementById('totalStars').title = App.i18n.t('yourStars');

  document.getElementById('btnSaludo').addEventListener('click', function () {
    App.tts.speak(App.i18n.t('saludo'));
  });

  App.i18n.SUPPORTED.forEach(function (loc) {
    var id = LOCALE_BUTTONS[loc];
    var btn = id && document.getElementById(id);
    if (btn) btn.addEventListener('click', function () { App.i18n.setLocale(loc); });
  });
  paintLanguageSelector();
  // Re-apply translations now that strings.<locale>.js have registered their
  // keys (App.i18n.apply() in i18n.js ran before they were loaded).
  App.i18n.apply();
})();
