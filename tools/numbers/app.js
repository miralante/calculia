/* ============================================================
   Calculia — Numbers (read, order and place numbers)
   Data and levels in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. The decimal separator, cents and
   signs use orange. Large numbers carry group labels (thousands,
   millions⬦ up to billions).
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var M = App.numbersModel;
  var pickRandomInt = M.pickRandomInt, POS_CLASS = M.POS_CLASS, thousandsSeparator = M.thousandsSeparator, legendPos = M.legendPos, digits = M.digits;
  var paintNumber = M.paintNumber, paintSign = M.paintSign, buildOptions = M.buildOptions, repeat = M.repeat, numberAsBlocks = M.numberAsBlocks, GENERATORS = M.GENERATORS;
  var counterSay = M.counterSay, DIGIT_NAMES_ES = M.DIGIT_NAMES_ES, DIGIT_NAMES_EN = M.DIGIT_NAMES_EN, numberNameEs = M.numberNameEs, numberNameEn = M.numberNameEn, SMALL_ES = M.SMALL_ES;
  var TENS_ES = M.TENS_ES, HUNDREDS_ES = M.HUNDREDS_ES, SMALL_EN = M.SMALL_EN, TENS_EN = M.TENS_EN, under100Es = M.under100Es, under1000Es = M.under1000Es;
  var numberToWordsEs = M.numberToWordsEs, under100En = M.under100En, under1000En = M.under1000En, numberToWordsEn = M.numberToWordsEn, numberToWords = M.numberToWords;

  var TOOL_ID = 'numbers';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  /* Generic exposition + real-life screens, reused by the sub-activities
     that flag DATA.<act>.hasExpoReal = true. Content painted from strings
     keyed by the current sub-activity id. */
  var screenExpo = $('#expoScreen');
  var screenReal = $('#realScreen');
  var promptEl = $('#prompt');
  var visualEl = $('#visual');
  var legendEl = $('#legend');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  var progressBar = $('#progressBar');
  var quizCard = $('#quizCard');
  /* Free-exploration counter level (see data.js: 'counter'). These
     refs are populated for every level; render() hides the whole
     #counterUI block when the level isn't a counter. */
  var counterUI = $('#counterUI');
  /* Interactive "leer números" level (see data.js: 'lecturaInput').
     The flow is: a "Generate" button reveals a number in words;
     the user types the numeric form; "Comprobar" validates, "Ver
     resultado" fills the input with the correct answer (so the
     user can study it or correct from there). Same round shape as
     the other quiz levels: 6 questions, +1 star per correct
     "Comprobar" answer. */
  var lecturaUI = $('#lecturaUI');
  var lecturaWords = $('#lecturaWords');
  var lecturaInput = $('#lecturaInput');
  var lecturaGenerate = $('#lecturaGenerate');
  var lecturaCheck = $('#lecturaCheck');
  var lecturaReveal = $('#lecturaReveal');
  var lecturaNext = $('#lecturaNext');
  var lecturaHint = $('#lecturaHint');
  /* Interactive "escribir números" level (see data.js: 'escribirInput').
     Sibling of #lecturaUI with the same shape: a "Generar" button,
     a wide input, "Comprobar" / "Ver resultado" / "Siguiente". The
     difference is that "Generar" plays the number aloud via Web
     Speech (no visual representation), and a "🔊 Reproducir" button
     replays the audio so the user can hear it again before
     answering. */
  var escribirUI = $('#escribirUI');
  var escribirNumber = $('#escribirNumber');
  var escribirInput = $('#escribirInput');
  var escribirGenerate = $('#escribirGenerate');
  var escribirReplay = $('#escribirReplay');
  var escribirCheck = $('#escribirCheck');
  var escribirReveal = $('#escribirReveal');
  var escribirNext = $('#escribirNext');
  var escribirHint = $('#escribirHint');
  /* Persistent progress */
  /* completedRounds counts every round of the tool (lifetime, achievements).
     roundsByActivity counts them per sub-activity, which is what picks the
     level: each sub-activity starts at its own first level. */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0, roundsByActivity: {} });
  /* The stars of the removed 'positivos y negativos' sub-activity used to
     live under their own storage key ('posneg'). Move them once into this
     tool's progress so the star total is kept, then drop the old key. */
  var legacySignedProgress = App.storage.get('posneg');
  if (!progress.signedLegacyMigrated &&
      (typeof legacySignedProgress.stars === 'number' ||
       typeof legacySignedProgress.completedRounds === 'number')) {
    var migratedProgress = Object.assign({}, progress);
    migratedProgress.stars += legacySignedProgress.stars || 0;
    migratedProgress.signedLegacyMigrated = true;
    if (App.storage.set(TOOL_ID, migratedProgress)) {
      progress = migratedProgress;
      App.storage.remove('posneg');
    }
  }

  /* Reinforce: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. reinforcement.active() controls the mini-round flow. */
  var fixedQuestion = null;
  var reinforcement = App.reinforce.session({
    titleKey: 'refuerzoTitulo',
    introKey: 'refuerzoIntro',
    show: function (p) { showReinforceQuestion(p); paintReinforceProgress(); }
  });
  /* Round state */
  var activity = null;
  var answered = false;
  var glue = App.activityGlue({
    again: function () { startRound(levelFromProgress()); },
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  /* The round state and the shared answer, hint and next step (assets/js/classic-quiz.js). */
  var round = { level: null, index: 0, roundCorrect: 0, answered: false, attempts: 0, question: null };
  var quiz = App.classicQuiz({
    round: round, progress: progress, reinforcement: reinforcement,
    save: function () { save(); }, paintStars: function () { paintStars(); },
    feedback: feedbackEl, explanation: explanationEl, explanationWrap: explanationWrap, btnNext: btnNext,
    perRound: DATA.perRound,
    showExplanation: function (isCorrect) { showExplanation(isCorrect); },
    render: function () { render(); },
    endRound: function () { endRound(); }
  });
  var answer = quiz.answer, showHint = quiz.showHint, next = quiz.next;

  /* ---- Utilidades ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* ---- Color-coded digits by place value ---- */

  /* Thousands separator ('.' is / ',' in) and decimal (',' is / '.' in).
     Not only styling: switching the separator between locales is
     mandatory so the paintNumber reads correctly (see I18N.md §2). */
  /* html for the digits of n. highlight: place (0=units, 1=tens⬦)
     that gets underlined. labels: group labels (thousands, millions⬦). */
  /* ---- Numeric options (3, unique, shuffled) ---- */

  /* n drawn with this tool's own place-value blocks (hundred squares, ten
     bars, single units), so two quantities can be compared by looking
     before they are compared as digits. */
  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correct, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenExpo, screenReal].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  /* ---- Levels of an activity (now automatic via levelFromProgress) ---- */

  /* ---- Game ---- */
  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress() {
    var levels = activity.levels;
    var done = progress.roundsByActivity[activity.id] || 0;
    return levels[Math.min(done, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    /* The heading next to the back link names the sub-activity we are in
       (the sub-activity's own name from strings.<locale>.js), not the tool. */
    var heading = document.querySelector('[data-suite-activity] h1');
    if (heading) {
      heading.setAttribute('data-i18n', 'activity.' + id + '.name');
      heading.textContent = App.i18n.t('activity.' + id + '.name');
    }
    if (activity.hasExpoReal) {
      startExpoScreen(id);
      return;
    }
    startRound(levelFromProgress());
  }

  var activityMenu = App.activityMenu({ container: $('#activitiesMenu'), activities: DATA.activities, open: openActivity });

  /* ---- Exposition + real-life screens for hasExpoReal activities ---- */

  function startRound(nv) {
    round.level = nv;
    round.index = 0;
    round.roundCorrect = 0;
    App.utils.drawRoundReset();
    fixedQuestion = null;
    reinforcement.begin();
    show(screenGame);
    render();
  }

  function showReinforceQuestion(p) {
    fixedQuestion = p;
    render();
  }

  function paintReinforceProgress() {
    App.reinforce.paintBar(progressFill, reinforcement);
    progressText.textContent = '';
  }

  function render() {
    round.answered = false;
    round.attempts = 0;
    round.question = fixedQuestion || GENERATORS[round.level.tipo](round.level, round.index);
    fixedQuestion = null;

    /* The 'counter' level isn't a quiz: it returns a marker, not a
       question, and render() hands off to renderCounter() which
       hides everything else and shows the free-exploration UI. */
    if (round.question.tipo === 'counter') {
      renderCounter(round.question);
      return;
    }

    /* The interactive "leer números" level: also a quiz, but with
       a typed input + "Comprobar" / "Ver resultado" instead of
       multiple-choice options. Hands off to renderLecturaInput
       which owns its own UI. */
    if (round.question.tipo === 'lecturaInput') {
      typing.renderLecturaInput(round.question);
      return;
    }

    /* The interactive "escribir números" level: same shape as
       lecturaInput (typed input + "Comprobar" / "Ver resultado")
       but the number is played as AUDIO when "Generar" is
       clicked, with no visual representation. Hands off to
       renderEscribirInput. */
    if (round.question.tipo === 'escribirInput') {
      typing.renderEscribirInput(round.question);
      return;
    }

    /* Quiz mode: show the standard parts, hide the counter UI. */
    progressBar.classList.remove('hidden');
    quizCard.classList.remove('hidden');
    optionsEl.classList.remove('hidden');
    counterUI.classList.add('hidden');
    lecturaUI.classList.add('hidden');
    escribirUI.classList.add('hidden');

    promptEl.textContent = round.question.prompt;
    visualEl.innerHTML = round.question.visual || '';
    if (round.question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', round.question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.innerHTML = round.question.legend || '';
    legendEl.classList.toggle('hidden', !round.question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!round.question.inline);
    round.question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = ((round.index / DATA.perRound) * 100) + '%';
    progressText.textContent = '';
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
  var plainText = App.utils.plainText;


  function showExplanation(isCorrect) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = round.question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). The invitation is the one written for THIS
     question —which is what to do with the figure in front of you— and
     not the same sentence for every question. The generic line is only
     the fallback, for a question that forgot to bring its own. */
  function endRound() {
    progress.roundsByActivity[activity.id] = (progress.roundsByActivity[activity.id] || 0) + 1;
    glue.endRound();
  }

  /* The typed-answer modes (reading and writing numbers) are built by typing.js. */
  var typing = App.numbersTyping({
    current: function () { return { level: round.level, index: round.index, question: round.question }; },
    roundCorrect: function () { round.roundCorrect += 1; },
    wrong: function () { round.attempts += 1; return round.attempts; },
    next: next,
    save: save,
    paintStars: paintStars,
    progress: progress
  });

  /* The counter (free-exploration level) lives in counter.js; the page gives it what it needs. */
  var freeLevels = App.numbersCounter({
    progress: progress,
    save: save,
    paintStars: paintStars,
    endRound: endRound,
    show: show,
    screenMenu: screenMenu,
    level: function () { return round.level; },
    el: { feedbackEl: feedbackEl, progressBar: progressBar, quizCard: quizCard, optionsEl: optionsEl,
      btnNext: btnNext, progressFill: progressFill, progressText: progressText, counterUI: counterUI }
  });
  var renderCounter = freeLevels.renderCounter;


  /* ---- Events ---- */

  /* "← Volver" in the header. In the two typed levels (leerNumeros,
     escribirNumeros) it goes back to the previous level of the activity
     instead of leaving for the Números menu. Progress steps back with it,
     so finishing the level it returns to brings the person forward again.
     Everywhere else the link keeps its href (assets/js/suite-chrome.js). */
  var TYPED_TIPOS = { lecturaInput: true, escribirInput: true };
  App.backStep = function () {
    if (screenGame.classList.contains('hidden') || !round.level || !TYPED_TIPOS[round.level.tipo]) return false;
    var levels = activity.levels;
    var idx = levels.indexOf(round.level);
    if (idx <= 0) return false;
    progress.roundsByActivity[activity.id] = idx - 1;
    save();
    startRound(levels[idx - 1]);
    return true;
  };
  $('#btnNext').addEventListener('click', next);
  /* btnRepeat was removed during the 25-activity batch cleanup (memory
     entry on 2026-10-13); the screenEnd section no longer has the
     button, so its handler is gone too. If a future batch re-adds the
     button, wire this up again with the hasExpoReal branch restored. */
  var elBtnRepeat = $('#btnRepeat');
  if (elBtnRepeat) elBtnRepeat.addEventListener('click', function () {
    if (activity.hasExpoReal) startExpoScreen(activity.id);
    else startRound(levelFromProgress());
  });

  /* The exposition and the real-life screens are shared (assets/js/expo-screens.js). */
  var expositions = App.expoScreens({
    show: show,
    current: function () { return activity; },
    startCurrentRound: function () { startRound(levelFromProgress()); },
    screens: { menu: screenMenu, expo: screenExpo, real: screenReal }
  });
  var startExpoScreen = expositions.startExpoScreen, startRealScreen = expositions.startRealScreen;


  $('#noteExtra').innerHTML = App.i18n.t('notaTablas')
    .replace('{link}', '<a href="../math-tables/">' + App.i18n.t('notaTablasLink') + '</a>');

  activityMenu.paint();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */

  /* Opened from the Números hub with ?sub=<id> (tools/numbers-group/data.js):
     go straight to that sub-activity, skipping the menu. Without a valid
     id the menu is shown as before. */
  var initialSub = new URLSearchParams(window.location.search).get('sub');
  /* Cuentas rápidas (placevalue) now lives in tools/operations/ as one of its
     sub-activities. Old links to ?sub=placevalue are sent there. */
  var MOVED_SUB = { placevalue: '../operations/?sub=placevalue' };
  if (initialSub && MOVED_SUB[initialSub]) {
    window.location.replace(MOVED_SUB[initialSub]);
    return;
  }
  /* "← Volver" goes to the group the sub-activity was opened from: comparar is listed
     under "Ordenar números" (tools/order-numbers/data.js), the others under "Números"
     (tools/numbers-group/data.js), which is the static href of the page. */
  var SUB_GROUP_HUB = { comparar: '../order-numbers/' };
  if (initialSub && SUB_GROUP_HUB[initialSub]) {
    var groupBack = document.querySelector('.back-link');
    if (groupBack) groupBack.setAttribute('href', SUB_GROUP_HUB[initialSub]);
  }
  if (initialSub && DATA.activities[initialSub]) openActivity(initialSub);

})();
