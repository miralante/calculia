/* ============================================================
   Calculia — Settings (hidden route)
   View/reset what's saved in localStorage. Two actions:
   - "Reset the person's data": deletes the language preference only
     (none of Calculia's 12 activities store a name or other personal
     field). Progress in every activity is kept.
   - "Reset the whole app": deletes everything under
     'calculia:*' (equivalent to opening the app for the first time).
   Two-step confirmation: one tap asks to confirm, the second deletes.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  function renderState() {
    var ids = App.storage.listaToolIds();
    var stars = App.storage.estrellasTotales();
    var languageName = App.i18n.t(App.i18n.locale() === 'en' ? 'languageNameEn' : 'languageNameEs');
    var list = $('#listaEstado');
    list.innerHTML = '';

    var items = [
      App.i18n.t('currentLanguage').replace('{lang}', languageName),
      App.i18n.t('activitiesWithProgress').replace('{n}', ids.length),
      App.i18n.t('totalStars').replace('{n}', stars)
    ];
    items.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
  }

  /* Caregiver mode: read-only progress per activity. Each progress
     cell already exists in the HTML with data-tool="<slug>"; this
     only fills in the text. */
  function renderActivityProgress() {
    App.utils.$$('#progreso-actividades [data-tool]').forEach(function (cell) {
      var data = App.storage.get(cell.dataset.tool);
      var stars = typeof data.estrellas === 'number' ? data.estrellas : 0;
      cell.textContent = stars > 0 ? '⭐ ' + stars : App.i18n.t('notStarted');
    });
  }

  /* Two-step confirmation on the same button. */
  function confirmTwice(btn, normalKey, confirmKey, onConfirm) {
    var confirming = false;
    var timeoutId = null;
    btn.textContent = App.i18n.t(normalKey);
    btn.addEventListener('click', function () {
      if (!confirming) {
        confirming = true;
        btn.textContent = App.i18n.t(confirmKey);
        timeoutId = setTimeout(function () {
          confirming = false;
          btn.textContent = App.i18n.t(normalKey);
        }, 5000);
        return;
      }
      clearTimeout(timeoutId);
      confirming = false;
      btn.textContent = App.i18n.t(normalKey);
      onConfirm();
    });
  }

  function resetPerson() {
    var f = $('#feedbackPersona');
    f.textContent = App.i18n.t('feedbackResetPersonDone');
    f.className = 'feedback acierto';
    renderState();
    renderActivityProgress();
    /* Deleting the language preference comes last: renderState() above
       still needs the locale currently loaded on this page to resolve
       text correctly (the new detected/default locale only takes
       effect on the next page load). */
    App.storage.remove('locale');
  }

  function resetApp() {
    App.storage.listaToolIds().forEach(function (id) {
      App.storage.remove(id);
    });
    var f = $('#feedbackApp');
    f.textContent = App.i18n.t('feedbackResetAppDone');
    f.className = 'feedback acierto';
    renderState();
    renderActivityProgress();
    App.storage.remove('locale');
  }

  confirmTwice($('#btnResetPersona'), 'btnResetPerson', 'confirmResetPerson', resetPerson);
  confirmTwice($('#btnResetApp'), 'btnResetApp', 'confirmResetApp', resetApp);

  renderState();
  renderActivityProgress();
})();
