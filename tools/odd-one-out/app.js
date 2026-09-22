/* ============================================================
   Calculia — What doesn't fit? (reasoning: thematic coherence)
   Data in data.js (DATA.levels). Shared modules in assets/js/.
   Mechanic: 3 pictos, 2 from the same group and 1 intruder. Tap the
   intruder. Round of 8 groups.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'odd-one-out';
  var $ = App.utils.$;

  var screenStart = $('#screenStart');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var groupEl = $('#group');
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
  var groups = [];
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var resolved = false;
  /* Reinforce: see core in assets/js/feedback.js (App.reinforce).
     currentGroup allows reusing render() with an external group
     (the reinforcement one); if null, render() takes groups[idx]. */
  var currentGroup = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  function bank() { return DATA[App.i18n.locale()] || DATA.es; }

  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var idxN = Math.min(progress.completedRounds || 0, bank().levels.length - 1);
    return bank().levels[idxN];
  }

  function startRound(n) {
    level = n;
    groups = App.utils.shuffle(level.groups).slice(0, bank().perRound);
    index = 0;
    roundCorrect = 0;
    inReinforce = false;
    currentGroup = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (failures) { startReinforce(failures); });
    screenStart.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  function startReinforce(failures) {
    reinforceList = failures.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      App.i18n.t('refuerzoTitulo') + ' — ' +
      App.i18n.t('refuerzoIntro').replace('{n}', reinforceTotal)
    );
    currentGroup = reinforceList[0];
    paintReinforceProgress();
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforceIndex + 1) / reinforceTotal) * 100) + '%';
    progressText.textContent = '';
  }

  function paintProgress() {
    var perRound = bank().perRound;
    progressFill.style.width = ((index / perRound) * 100) + '%';
    progressText.textContent = '';
  }

  function render() {
    var group = currentGroup || groups[index];
    currentGroup = null;
    resolved = false;
    attempts = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');
    groupEl.innerHTML = '';

    var pictos = App.utils.shuffle(
      group.common.map(function (p) { return { picto: p, isIntruder: false }; })
        .concat([{ picto: group.oddOne, isIntruder: true }])
    );

    pictos.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn picto-grande';
      btn.textContent = p.picto;
      btn.setAttribute('aria-label', App.i18n.t('dibujoAria'));
      btn.addEventListener('click', function () { answer(btn, p.isIntruder, group); });
      groupEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(isCorrect, group) {
    var text = isCorrect
      ? App.i18n.t('explicacionCorrecta')
      : App.i18n.t('explicacionIncorrectaA') + group.oddOne;
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look again. Only on the second
     mistake is the odd one out explained (showExplanation). */
  function showHint() {
    explanationEl.textContent = App.i18n.t('pista');
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, group) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(isCorrect, group);
      resolved = true;
      btn.classList.add('correct');
      App.utils.$$('#group .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) App.reinforce.add(level.id + ':' + index, group);
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation(isCorrect, group);
      }
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#group .option-btn'), explanationWrap);
    }
  }

  function next() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
        return;
      }
      currentGroup = reinforceList[reinforceIndex];
      paintReinforceProgress();
      render();
      return;
    }
    index += 1;
    if (index >= bank().perRound) {
      var consume = App.reinforce.consume();
      if (consume.length === 0) endRound();
      return;
    }
    render();
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
    $('#explanation').textContent = '';
    App.feedback.celebrate(App.i18n.t('rondaCompletadaTitulo'));
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

