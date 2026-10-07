/* ============================================================
   Calculia — Stories (reasoning: order in time)
   Data in data.js (DATA.levels). Shared modules in assets/js/.
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
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var level = null;
  var stories = [];
  var index = 0;
  var roundCorrect = 0;
  var nextExpected = 0;
  var slots = [];
  var attempts = 0;   /* Socratic counter per story (rule 12) */
  /* La pista de la historia que está en pantalla. Las historias vienen
     de data.js y no se construyen aquí, así que no hay un objeto
     pregunta al que añadirle un campo: se guarda solo la pista que le
     toca a esta pregunta. */
  var pistaActual = null;

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var idxN = Math.min(progress.completedRounds || 0, DATA.levels.length - 1);
    return DATA.levels[idxN];
  }

  function startRound(n) {
    level = n;
    stories = App.utils.shuffle(level.stories).slice(0, DATA.perRound);
    index = 0;
    roundCorrect = 0;
    screenStart.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  function paintProgress() {
    progressFill.style.width = ((index / DATA.perRound) * 100) + '%';
    progressText.textContent = '';
  }

  /* One question shape in this activity: order the panels of a story in
     time. The levels only add a panel, so one good hint covers all of
     them and it says what to do with THIS story —find the panel that
     can come first and go on from there— without naming it. */
  function pistaPara() {
    return App.i18n.t('pistaOrden');
  }

  function render() {
    var story = stories[index];
    pistaActual = pistaPara();
    nextExpected = 0;
    attempts = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    feedbackEl.className = 'feedback';
    btnNext.classList.add('hidden');
    storyTitleEl.textContent = App.i18n.t('historia.' + story.id);

    paintSlots();

    availableEl.innerHTML = '';
    App.utils.shuffle(story.panels.map(function (picto, order) {
      return { picto: picto, order: order };
    })).forEach(function (v) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn vineta';
      btn.textContent = v.picto;
      btn.setAttribute('aria-label', App.i18n.t('vinetaAria'));
      btn.addEventListener('click', function () { tap(v.order, btn); });
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

  function tap(order, btn) {
    var story = stories[index];
    if (order === nextExpected) {
      slots[order] = story.panels[order];
      paintSlots();
      btn.disabled = true;
      btn.classList.add('colocada');
      App.feedback.success(feedbackEl);
      nextExpected += 1;
      if (nextExpected >= story.panels.length) {
        endStory();
      }
    } else {
      attempts += 1;
      var respuestaTrasPista = attempts > 1;
      showHint();
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.disabled = true;
      btn.classList.add('encourage');
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('.vineta', availableEl), explanationWrap, function () { if (respuestaTrasPista) showExplanation(); });
    }
  }

  /* Socratic method (rule 12). First mistake → hint (no answer);
     second mistake → explanation with the correct beginning.
     The invitation is the one written for THIS story —what to do with
     the panels in front of you— and not the same sentence for every
     story. The generic line is only the fallback, for a question that
     forgot to bring its own. */
  function showHint() {
    explanationEl.textContent = pistaActual || App.i18n.t('pista');
    explanationWrap.classList.remove('hidden');
  }

  function showExplanation() {
    explanationEl.textContent = App.i18n.t('explanation');
    explanationWrap.classList.remove('hidden');
  }

  function endStory() {
    progress.stars += 1;
    roundCorrect += 1;
    save();
    paintStars();
    btnNext.classList.remove('hidden');
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
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('finalTitulo'));
  }

  /* Events */
  btnNext.addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () {
    screenEnd.classList.add('hidden');
    screenStart.classList.remove('hidden');
  });

  paintStars();
})();

