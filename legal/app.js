/* ============================================================
   Calculia — Legal page (data protection).
   Wires the language selector buttons.
   ============================================================ */
(function () {
  'use strict';

  function paintLanguageSelector() {
    var active = App.i18n.locale();
    document.getElementById('btnIdiomaEs').setAttribute('aria-pressed', String(active === 'es'));
    document.getElementById('btnIdiomaEn').setAttribute('aria-pressed', String(active === 'en'));
  }

  document.getElementById('btnIdiomaEs').addEventListener('click', function () { App.i18n.setLocale('es'); });
  document.getElementById('btnIdiomaEn').addEventListener('click', function () { App.i18n.setLocale('en'); });
  paintLanguageSelector();
})();
