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
  var randInt = M.randInt, pickRandomInt = M.pickRandomInt, POS_CLASS = M.POS_CLASS, thousandsSeparator = M.thousandsSeparator, legendPos = M.legendPos, digits = M.digits;
  var paintNumber = M.paintNumber, paintSign = M.paintSign, buildOptions = M.buildOptions, repeat = M.repeat, numberAsBlocks = M.numberAsBlocks, GENERATORS = M.GENERATORS;
  var counterSay = M.counterSay, DIGIT_NAMES_ES = M.DIGIT_NAMES_ES, DIGIT_NAMES_EN = M.DIGIT_NAMES_EN, numberNameEs = M.numberNameEs, numberNameEn = M.numberNameEn, SMALL_ES = M.SMALL_ES;
  var TENS_ES = M.TENS_ES, HUNDREDS_ES = M.HUNDREDS_ES, SMALL_EN = M.SMALL_EN, TENS_EN = M.TENS_EN, under100Es = M.under100Es, under1000Es = M.under1000Es;
  var numberToWordsEs = M.numberToWordsEs, under100En = M.under100En, under1000En = M.under1000En, numberToWordsEn = M.numberToWordsEn, numberToWords = M.numberToWords;

  var TOOL_ID = 'numbers';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var signedIntroScreen = $('#signedIntroScreen');
  var signedRealScreen = $('#signedRealScreen');
  var signedTempScreen = $('#signedTempScreen');
  /* Generic exposition + real-life screens, reused by the 5 sub-activities
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
  /* Free-exploration elevator level (see data.js: 'ascensorLibre' /
     'ascensorMeta'). Same mechanic as the water-temperature tool:
     ——10/——1/+1/+10 buttons, the visual reacts on every step. */
  var elevatorUI = $('#elevatorUI');
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
  /* Random exploration suggestion. Painted by paintElevatorSuggestion
     on every render (entry, reset, "play again"). Same pattern as
     the temperature tool's #thermoSuggestion. */
  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  if (typeof progress.signedRounds !== 'number') progress.signedRounds = 0;
  var legacySignedProgress = App.storage.get('posneg');
  if (!progress.signedLegacyMigrated &&
      (typeof legacySignedProgress.stars === 'number' ||
       typeof legacySignedProgress.completedRounds === 'number')) {
    var migratedProgress = Object.assign({}, progress);
    migratedProgress.stars += legacySignedProgress.stars || 0;
    migratedProgress.signedRounds = Math.max(
      migratedProgress.signedRounds,
      legacySignedProgress.completedRounds || 0
    );
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

  /* Pick a random integer in [min, max] inclusive, avoiding
     `avoid`. Used by paintElevatorSuggestion to pick a starting
     floor that is not where the elevator already is. Up to 8
     attempts so a near-full range still finds a different value. */
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
    [screenMenu, screenGame, screenEnd, signedIntroScreen, signedRealScreen, signedTempScreen,
     screenExpo, screenReal].forEach(function (p) {
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
    var completed = activity.id === 'positivos-y-negativos'
      ? progress.signedRounds
      : progress.completedRounds;
    return levels[Math.min(completed || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    if (id === 'positivos-y-negativos') {
      startSignedIntro();
      return;
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
    progressFill.style.width = (((reinforcement.position() + 1) / reinforcement.total()) * 100) + '%';
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

    /* The 'elevator' missions ('ascensorLibre', 'ascensorMeta') are
       also not a quiz: the generator returns a marker, and
       render() hands off to renderElevator() which hides the quiz
       parts and shows the free-exploration UI. */
    if (round.question.tipo === 'elevator') {
      renderElevator(round.question);
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
    elevatorUI.classList.add('hidden');
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
    if (activity.id === 'positivos-y-negativos') {
      progress.signedRounds += 1;
    } else {
      progress.completedRounds = (progress.completedRounds || 0) + 1;
    }
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (round.level.tipo === 'counter') {
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', round.roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    } else if (activity.id === 'positivos-y-negativos') {
      summaryEl.textContent = App.i18n.t('signed.endSummary')
        .replace('{stars}', progress.stars);
    } else if (round.level.tipo === 'ascensorLibre' || round.level.tipo === 'ascensorMeta') {
      /* Free-exploration elevator: no question count, only a star
         tally. Different from the counter summary to keep each
         tool's closing line distinct. */
      summaryEl.textContent = '';
    } else {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', round.roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
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

  /* ============================================================

     Free-exploration elevator (no quiz)
     Sibling of the water-temperature tool: ——10/——1/+1/+10 buttons,
     the visual reacts on every step. The big number reads with a
     sign; the shaft shows the elevator emoji on the current floor,
     with the ground floor (0) always highlighted as the boundary
     between positive and negative. Same storage shape as the
     counter — progress.stars increments on exit.
     ============================================================ */

  /* Per-mission state. Held in closures so re-entering the level
     (Exit —  Play again) starts fresh. */
  /* Set to the celebration key once a 'meta' mission lands on the
     target, so we don't replay the same celebration on every
     subsequent step. Reset on exit/re-enter. */
  /* Show the goal line. For 'libre' missions the goal is empty
     (no target, just explore). For 'meta' missions the goal reads
     the target floor with its sign. */
  /* Pick a random floor in [elevatorMin, elevatorMax] inclusive,
     avoiding the level's starting floor and 0. Same helper used
     by the temperature tool; kept local because both tools share
     the exact same mechanic. Avoids 0 because 0 is the ground
     floor — saying "go to floor 0" while the elevator is already
     there adds noise rather than direction. */
  /* Paint the suggestion line. For 'ascensorMeta' the goal line
     already names the target floor, so showing ANOTHER random
     floor would conflict — hide the suggestion. For 'ascensorLibre'
     the goal line is empty, so the suggestion adds a concrete
     starting floor to the open-ended mission. */
  /* Main render: number, state label, accessibility text, button
     enable/disable, live shaft. Called on every value change. */
  /* Render the shaft. Same shape as the old quiz-style
     shaftHTML(min, max, markers) but with a single marker — the
     elevator emoji on the current floor — and the ground floor
     always tinted with the project reasoning colour. Floors are
     listed top-to-bottom (max first) so floor +10 sits at the top
     and floor ——10 at the bottom, matching the building
     convention. */
  /* For 'meta' missions, when the user lands on the target floor
     (within DATA.elevador.tolerancia), show the celebration once.
     'libre' missions have no target, so no celebration fires. */
  /* Three paint variants for the displayed number, chosen from the
     current toggle state:
       - showSep              —  digit groups with . separator + label
       - !showSep && colorGroups —  digit groups with a coloured background
                                   per 3-digit chunk (no separator glyph)
       - !showSep && !colorGroups —  one continuous digit string */
  /* Elevator step handler: clamps the new value within the mission
     range and redraws. Same pattern as counterAddStep — the
     button enable/disable state is recomputed inside paintElevator
     so the next click will reflect the updated bounds. */
  /* Reads the current floor aloud with the matching above/on/
     below-ground line. Same wording as the state label so the
     audio and the visible label stay in sync. */
  /* The counter and the elevator (free-exploration levels) live in counter.js; the page gives them what they need. */
  var freeLevels = App.numbersCounter({
    progress: progress,
    save: save,
    paintStars: paintStars,
    endRound: endRound,
    show: show,
    screenMenu: screenMenu,
    level: function () { return round.level; },
    el: { feedbackEl: feedbackEl, progressBar: progressBar, quizCard: quizCard, optionsEl: optionsEl,
      btnNext: btnNext, progressFill: progressFill, progressText: progressText, counterUI: counterUI, elevatorUI: elevatorUI }
  });
  var renderCounter = freeLevels.renderCounter, renderElevator = freeLevels.renderElevator;


  /* ---- Events ---- */

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  /* btnRepeat was removed during the 25-activity batch cleanup (memory
     entry on 2026-10-13); the screenEnd section no longer has the
     button, so its handler is gone too. If a future batch re-adds the
     button, wire this up again with the hasExpoReal/positivos-y-negativos
     branches restored. */
  var elBtnRepeat = $('#btnRepeat');
  if (elBtnRepeat) elBtnRepeat.addEventListener('click', function () {
    if (activity.id === 'positivos-y-negativos') startSignedIntro();
    else if (activity.hasExpoReal) startExpoScreen(activity.id);
    else startRound(levelFromProgress());
  });

  /* The exposition, the real-life screens and the signed-temperature mission live in screens.js. */
  var expositions = App.numbersScreens({
    show: show,
    paintStars: paintStars,
    current: function () { return activity; },
    startCurrentRound: function () { startRound(levelFromProgress()); },
    startPositivosNegativos: startPositivosNegativos,
    screens: { menu: screenMenu, expo: screenExpo, real: screenReal, signedIntro: signedIntroScreen,
      signedReal: signedRealScreen, signedTemp: signedTempScreen }
  });
  var startSignedIntro = expositions.startSignedIntro, startExpoScreen = expositions.startExpoScreen, startRealScreen = expositions.startRealScreen;

  /* After the last signed-temperature mission the activity is positivos y negativos: its round starts here. */
  function startPositivosNegativos() {
    activity = DATA.activities['positivos-y-negativos'];
    activity.id = 'positivos-y-negativos';
    startRound(levelFromProgress());
  }


  $('#noteExtra').innerHTML = App.i18n.t('notaTablas')
    .replace('{link}', '<a href="../math-tables/">' + App.i18n.t('notaTablasLink') + '</a>');

  activityMenu.paint();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
