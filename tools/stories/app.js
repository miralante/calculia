/* ============================================================
   Calculia — Stories (reasoning: order in time)
   Data in data.js (DATA.niveles). Shared modules in assets/js/.
   Mechanic: tap the captions in the correct order. A tap out of
   order does not penalize: it just encourages trying again.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'stories';
  var $ = App.utils.$;

  var screenStart = $('#screenStart');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var storyTitleEl = $('#storyTitle');
  var sequenceEl = $('#sequence');
  var availableEl = $('#available');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state */
  var level = null;
  var stories = [];
  var index = 0;
  var roundCorrect = 0;
  var nextExpected = 0;
  var slots = [];
  var attempts = 0;   /* Socratic counter per story (rule 12) */

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  function paintLevels() {
    var cont = $('#levels');
    cont.innerHTML = '';
    DATA.niveles.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      var levelDescription = App.i18n.t('nivelDescripcion').replace('{n}', n.historias[0].vinetas.length);
      btn.innerHTML = levelDescription;
      btn.addEventListener('click', function () { startRound(n); });
      cont.appendChild(btn);
    });
  }

  function startRound(n) {
    level = n;
    stories = App.utils.shuffle(level.historias).slice(0, DATA.perRound);
    index = 0;
    roundCorrect = 0;
    screenStart.classList.add('oculto');
    screenEnd.classList.add('oculto');
    screenGame.classList.remove('oculto');
    render();
  }

  function paintProgress() {
    progressFill.style.width = ((index / DATA.perRound) * 100) + '%';
    progressText.textContent = index + ' / ' + DATA.perRound;
  }

  function render() {
    var story = stories[index];
    nextExpected = 0;
    attempts = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('oculto');
    explanationEl.textContent = '';
    feedbackEl.className = 'feedback';
    btnNext.classList.add('oculto');
    storyTitleEl.textContent = App.i18n.t('historia.' + story.id);

    paintSlots();

    availableEl.innerHTML = '';
    App.utils.shuffle(story.vinetas.map(function (picto, orden) {
      return { picto: picto, orden: orden };
    })).forEach(function (v) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn vineta';
      btn.textContent = v.picto;
      btn.setAttribute('aria-label', App.i18n.t('vinetaAria'));
      btn.addEventListener('click', function () { tap(v.orden, btn); });
      availableEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function paintSlots() {
    sequenceEl.innerHTML = '';
    slots.forEach(function (picto) {
      var div = document.createElement('div');
      div.className = 'slot' + (picto ? ' lleno' : '');
      div.textContent = picto || '';
      sequenceEl.appendChild(div);
    });
  }

  function tap(orden, btn) {
    var story = stories[index];
    if (orden === nextExpected) {
      slots[orden] = story.vinetas[orden];
      paintSlots();
      btn.disabled = true;
      btn.classList.add('colocada');
      App.feedback.success(feedbackEl);
      nextExpected += 1;
      if (nextExpected >= story.vinetas.length) {
        endStory();
      }
    } else {
      attempts += 1;
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation();
      }
      btn.disabled = true;
      btn.classList.add('animo');
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('.vineta', availableEl), explanationWrap);
    }
  }

  /* Socratic method (rule 12). First mistake → hint (no answer);
     second mistake → explanation with the correct beginning. */
  function showHint() {
    explanationEl.textContent = App.i18n.t('pista');
    explanationWrap.classList.remove('oculto');
  }

  function showExplanation() {
    explanationEl.textContent = App.i18n.t('explicacion');
    explanationWrap.classList.remove('oculto');
  }

  function endStory() {
    progress.stars += 1;
    roundCorrect += 1;
    save();
    paintStars();
    btnNext.classList.remove('oculto');
    btnNext.focus();
  }

  function next() {
    index += 1;
    if (index >= DATA.perRound) {
      endRound();
    } else {
      render();
    }
  }

  function endRound() {
    save();
    screenGame.classList.add('oculto');
    screenEnd.classList.remove('oculto');
    $('#endSummary').textContent = App.i18n.t('resumenFinal')
      .replace('{n}', roundCorrect)
      .replace('{estrellas}', progress.stars);
$('#transfer').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('finalTitulo'));
  }

  /* Events */
  btnNext.addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () {
    screenEnd.classList.add('oculto');
    paintLevels();
    screenStart.classList.remove('oculto');
  });

  paintLevels();
  paintStars();
})();

