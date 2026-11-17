/* ============================================================
   Calculia — the exposition and real-life screens around a sub-activity's test.
   Shared by every activity that sets hasExpoReal: the exposition (its slides) and the real-life screen, both painted from strings keyed by the activity id (expo.<id>, real.<id>).
   This file owns them and their buttons. The page gives it what it needs in the host object: the
   screens, show(), the current activity, and the start of the round of this activity.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  /* host: { show(screen), current(), startCurrentRound(), screens: { menu, expo, real } } */
  App.expoScreens = function (host) {
    var show = host.show;
    var screenMenu = host.screens.menu;
    var screenExpo = host.screens.expo;
    var screenReal = host.screens.real;

    /* Slide the exposition is on. A block is one slide, or has a `slides`
       array of blocks with the same shape (one idea per slide). */
    var expoIndex = 0;

    function expoSlidesOf(id) {
      var block = App.i18n.t('expo.' + id);
      if (!block) return null;
      return block.slides || [block];
    }

    function paintExpo(id, index) {
      var slides = expoSlidesOf(id);
      if (!slides) { show(screenMenu); return; }
      expoIndex = Math.max(0, Math.min(index || 0, slides.length - 1));
      var block = slides[expoIndex];
      var lastSlide = expoIndex === slides.length - 1;
      $('#expoNext').textContent = App.i18n.t(lastSlide ? 'expoNext' : 'expoSlideNext');
      $('#expoBack').classList.toggle('hidden', expoIndex === 0);
      var progressEl = $('#expoProgressEl');
      progressEl.textContent = App.i18n.t('expoProgress')
        .replace('{n}', expoIndex + 1)
        .replace('{total}', slides.length);
      progressEl.classList.toggle('hidden', slides.length < 2);
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

    /* index: the slide to open on (default the first; Infinity = the last). */
    function startExpoScreen(id, index) {
      paintExpo(id, index);
      show(screenExpo);
    }

    function startRealScreen(id) {
      paintReal(id);
      show(screenReal);
    }

    /* ---- Exposition + real-life buttons (hasExpoReal activities) ---- */
    $('#expoNext').addEventListener('click', function () {
      if (!host.current()) return;
      var id = host.current().id;
      var slides = expoSlidesOf(id) || [];
      if (expoIndex < slides.length - 1) paintExpo(id, expoIndex + 1);
      else startRealScreen(id);
    });
    $('#expoBack').addEventListener('click', function () {
      if (!host.current() || expoIndex === 0) return;
      paintExpo(host.current().id, expoIndex - 1);
    });
    $('#realBack').addEventListener('click', function () {
      if (!host.current()) return;
      startExpoScreen(host.current().id, Infinity);
    });
    $('#realNext').addEventListener('click', function () {
      if (!host.current()) return;
      host.startCurrentRound();
    });

    return { startExpoScreen: startExpoScreen, startRealScreen: startRealScreen };
  };
})();
