/* ============================================================
   Calculia — Subtract and Mental Math
   Data and levels live in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. Signs use orange.
   Questions are generated on the fly from the level type.
   ============================================================ */
(function () {
  'use strict';

  var M = App.mentalMathModel;
  var POS_CLASS = M.POS_CLASS, thousandsSeparator = M.thousandsSeparator, legendPos = M.legendPos, digits = M.digits;
  var paintNumber = M.paintNumber, paintSign = M.paintSign, buildOptions = M.buildOptions, repeat = M.repeat, dotsGroup = M.dotsGroup, dotsGroupSubtract = M.dotsGroupSubtract;
  var unitDots = M.unitDots, baseTen = M.baseTen, addedPieces = M.addedPieces, anchorStart = M.anchorStart, baseTenBorrow = M.baseTenBorrow, carryStart = M.carryStart;
  var borrowStart = M.borrowStart, GENERATORS = M.GENERATORS, groupsT = M.groupsT, groupsFormat = M.groupsFormat, RULE_EXAMPLES = M.RULE_EXAMPLES;
  var DOZEN_EXAMPLES = M.DOZEN_EXAMPLES, groupsLevelStars = M.groupsLevelStars, groupsLevelIcon = M.groupsLevelIcon, groupsEntryKey = M.groupsEntryKey, groupsTakeTwo = M.groupsTakeTwo, GROUPS_DIGIT_CLASSES = M.GROUPS_DIGIT_CLASSES;
  var groupsColoredDigits = M.groupsColoredDigits, groupsPlainShown = M.groupsPlainShown, groupsPickHint = M.groupsPickHint;

  var TOOL_ID = 'mental-math';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
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

  /* Persistent progress */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0 });

  /* Round state */
  var activity = null;
  /* Reinforce: when the normal round ends and some items were
     failed, a mini-round is mounted using only those. The session in
     App.reinforce keeps the items and the position, and stops a
     mini-round from chaining with another one. The reinforce banner
     is created dynamically so the shared HTML is not touched. */
  var reinforcement = App.reinforce.session({
    titleKey: 'refuerzoTitulo',
    introKey: 'refuerzoIntro',
    show: showReinforceQuestion
  });
  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    activity: function () { return activity; },
    roundCorrect: function () { return round.roundCorrect; },
    screenEnd: function () { return screenEnd; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars, levelFromProgress = glue.levelFromProgress, endRound = glue.endRound;

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

  /* ---- Utilities ---- */

  /* ---- Color-coded digits by place value ---- */

  /* Thousands separator ('.' is / ',' in). Not only styling: switching
     the separator between locales is mandatory (see I18N.md §2). */
  /* html for the digits of n, grouped in 3s with a thousands separator.
     highlight: absolute place (0=units, 1=tens, 2=hundreds, 3=thousands…)
     that gets underlined. */
  /* ---- Numeric options (3, unique, shuffled) ---- */

  /* ---- Base-ten pictures ----
     A ten is one bar of ten dots, a unit is a loose dot, so "one bar and
     four dots" can be read as 14 without counting one by one. */
  /* n as bars plus loose dots. `remove` marks that many of the rightmost
     pieces as taken away — a whole bar when the amount is a ten. */
  /* The amount being added, drawn in the second colour so it reads as
     "what arrives" rather than part of what was already there. */
  /* Start value chosen so the step never needs a carry or a borrow: the
     units digit is left with room to grow, or with enough to take away. */
  /* Same picture as baseTen, but for a subtraction that needs a borrow:
     one whole bar is broken into ten loose dots so there are enough
     units to take `remove` away (remove > n % 10). The broken group is
     drawn with the same dashed style as `unit-group` so it visually
     reads as "not a solid ten anymore". */
  /* Two-digit start with enough room in the units for `b` to push past
     ten: tens stays below 9 so the carried result never spills into a
     third digit. */
  /* Two-digit start whose units are too small for `b`, forcing a
     borrow: at least one whole ten stays intact after breaking one. */
  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correcta, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  /* ---- Levels for an activity ---- */
  /* (openActivity now auto via levelFromProgress) */

  /* ---- Game ---- */
  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    /* 'Contar en grupos' tiene su propio recorrido (carrusel,
       famosos, recordatorio, niveles, cuestionario). Su entrada
       en DATA.activities lleva `walkthrough: true`; el resto va al
       flujo flat normal (cuestionario de tres opciones, fin de
       ronda, etc.). */
    if (activity.walkthrough) {
      groupsStart();
      return;
    }
    startRound(levelFromProgress());
  }

  var activityMenu = App.activityMenu({ container: $('#activitiesMenu'), activities: DATA.activities, open: openActivity });

  function startRound(nv) {
    round.level = nv;
    round.index = 0;
    round.roundCorrect = 0;
    /* Reinforce: registers the callback that runs when the
       normal round ends with pending failures. The callback
       launches the mini-round with the failed questions. */
    reinforcement.begin();
    show(screenGame);
    render();
  }

  /* Launches the reinforce mini-round with the failed questions.
     Each activity decides how to render the mini-round: here
     we reuse render with the fixed question (instead of
     regenerating it randomly). Stars already earned are not
     taken away; the normal round progress is recorded and
     only reset when the mini-round ends. */
  /* Helper: renders a fixed question (from the reinforce queue)
     using the same visual flow as render() but without
     regenerating it with Math.random. The progress bar uses
     position()+1 / total() to show how much is left. */
  function showReinforceQuestion(p) {
    round.question = p;
    round.answered = false;
    round.attempts = 0;
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
    progressFill.style.width = (((reinforcement.position() + 1) / reinforcement.total()) * 100) + '%';
    progressText.textContent = '';
    paintStars();
  }

  function render() {
    round.answered = false;
    round.attempts = 0;
    round.question = GENERATORS[round.level.tipo](round.level, round.index);

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
     question —what to do with what is on screen— and not the same
     sentence for every question. The generic line is only the
     fallback, for a question that forgot to bring its own. */

  /* ---- Events ---- */

  $('#btnNext').addEventListener('click', next);

  /* The "Contar en grupos" walkthrough (its own screens, levels and quiz) is
     built by groups.js from the progress and the shared helpers. */
  var groups = App.mentalMathGroups({ progress: progress, show: show, paintStars: paintStars });
  var groupsStart = groups.start;

  activityMenu.paint();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();
