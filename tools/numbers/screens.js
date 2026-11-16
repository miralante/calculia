/* ============================================================
   Calculia — Numbers: the screens around the test.
   The exposition and the real-life screens of an activity: the screens that come before the test.
   This file owns them and their buttons. The page gives it what it needs in the host object: the
   screens, show(), the current activity, and the start of the round of this activity.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  /* host: { show(screen), current(), startCurrentRound(), screens: { menu, expo, real } } */
  App.numbersScreens = function (host) {
    var show = host.show;
    var screenMenu = host.screens.menu;
    var screenExpo = host.screens.expo;
    var screenReal = host.screens.real;

    function paintExpo(id) {
      var block = App.i18n.t('expo.' + id);
      if (!block) { show(screenMenu); return; }
      $('#expoTitleEl').textContent = block.title || '';
      $('#expoIntroEl').textContent = block.intro || '';
      var bulletsEl = $('#expoBulletsEl');
      bulletsEl.innerHTML = '';
      (block.bullets || []).forEach(function (b) {
        var li = document.createElement('li');
        li.textContent = b;
        bulletsEl.appendChild(li);
      });
      var noteEl = $('#expoNoteEl');
      if (block.note) {
        noteEl.textContent = '💡 ' + block.note;
        noteEl.classList.remove('hidden');
      } else {
        noteEl.textContent = '';
        noteEl.classList.add('hidden');
      }
      screenExpo.setAttribute('aria-label',
        (block.title || '') + ' — ' + (App.i18n.t('activity.' + id + '.name') || ''));
    }

    function paintReal(id) {
      var block = App.i18n.t('real.' + id);
      if (!block) { show(screenMenu); return; }
      $('#realTitleEl').textContent = block.title || '';
      var listEl = $('#realListEl');
      listEl.innerHTML = '';
      (block.items || []).forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'real-list-item';
        var icon = document.createElement('span');
        icon.className = 'real-list-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = item.icon || '';
        var para = document.createElement('p');
        para.textContent = item.text || '';
        row.appendChild(icon);
        row.appendChild(para);
        listEl.appendChild(row);
      });
      screenReal.setAttribute('aria-label',
        (block.title || '') + ' — ' + (App.i18n.t('activity.' + id + '.name') || ''));
    }

    function startExpoScreen(id) {
      paintExpo(id);
      show(screenExpo);
    }

    function startRealScreen(id) {
      paintReal(id);
      show(screenReal);
    }

    /* ---- Exposition + real-life buttons (hasExpoReal activities) ---- */
    $('#expoNext').addEventListener('click', function () {
      if (!host.current()) return;
      startRealScreen(host.current().id);
    });
    $('#realBack').addEventListener('click', function () {
      if (!host.current()) return;
      startExpoScreen(host.current().id);
    });
    $('#realNext').addEventListener('click', function () {
      if (!host.current()) return;
      host.startCurrentRound();
    });

    return { startExpoScreen: startExpoScreen, startRealScreen: startRealScreen };
  };
})();
