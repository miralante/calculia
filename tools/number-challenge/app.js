/* ============================================================
   Calculia — Number challenge.
   A game on a ladder of ten steps. Each right answer at the first
   try climbs one step and gives a star. A wrong answer shows a hint
   and the same question stays open: there are no lives and no clock.
   The question cards and their checks are shared with the practice
   activities in assets/js/number-sort.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'number-challenge';
  var $ = App.utils.$;
  var STEPS = DATA.steps;

  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRuns !== 'number') progress.completedRuns = 0;

  var screenMenu = $('#screenMenu');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var ladderEl = $('#ladder');
  var streakEl = $('#streak');
  var questionEl = $('#question');
  var nextBtn = $('#btnNext');
  var starsEl = $('#stars');

  var step = 0;
  var streak = 0;
  var firstTries = 0;
  var missed = false;
  var solved = false;
  var question = null;
  var card = null;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  function show(screen) {
    [screenMenu, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* The ladder: one rung per step. Rungs already climbed are marked,
     the current one is highlighted. */
  function buildLadder() {
    ladderEl.innerHTML = '';
    STEPS.forEach(function (s, i) {
      var rung = document.createElement('span');
      rung.className = 'rung';
      rung.textContent = String(i + 1);
      ladderEl.appendChild(rung);
    });
  }

  function paintLadder() {
    var rungs = ladderEl.querySelectorAll('.rung');
    rungs.forEach(function (rung, i) {
      rung.classList.toggle('passed', i < step);
      rung.classList.toggle('current', i === step);
    });
  }

  function paintStreak() {
    streakEl.textContent = App.i18n.t('game.streak').replace('{n}', String(streak));
  }

  function start() {
    step = 0;
    streak = 0;
    firstTries = 0;
    buildLadder();
    show(screenGame);
    askStep();
  }

  /* One question for the current step. The type is drawn from the step's
     list, so the same step does not always ask the same thing. */
  function askStep() {
    var spec = STEPS[step];
    var type = App.utils.shuffle(spec.types)[0];
    question = App.numberSort.makeQuestion(spec.pool, type);
    missed = false;
    solved = false;
    card = App.numberSort.questionCard(question, step);
    card.querySelectorAll('.option-btn').forEach(function (btn, j) {
      btn.addEventListener('click', function () { pick(j); });
    });
    questionEl.innerHTML = '';
    questionEl.appendChild(card);
    nextBtn.classList.add('hidden');
    paintLadder();
    paintStreak();
  }

  function pick(j) {
    if (solved) return;
    var right = App.numberSort.paintAnswer(card, question, j);
    if (!right) {
      missed = true;
      return;
    }
    /* Right: the step is done. Only a first-try answer scores a star and
       keeps the streak going; a miss earlier on the step does not stop
       the climb, it just does not count. */
    solved = true;
    if (!missed) {
      firstTries += 1;
      progress.stars += 1;
      streak += 1;
      save();
      paintStars();
    } else {
      streak = 0;
    }
    card.querySelectorAll('.option-btn').forEach(function (b) { b.disabled = true; });
    paintStreak();
    if (step === STEPS.length - 1) {
      finish();
      return;
    }
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
  }

  function nextStep() {
    step += 1;
    askStep();
  }

  function finish() {
    progress.completedRuns = (progress.completedRuns || 0) + 1;
    save();
    $('#endSummary').textContent = App.i18n.t('game.summaryText')
      .replace('{n}', String(firstTries))
      .replace('{total}', String(STEPS.length));
    show(screenEnd);
    $('#endBackToStart').focus();
  }

  /* Events */
  $('#btnStart').addEventListener('click', start);
  nextBtn.addEventListener('click', nextStep);
  $('#endBackToStart').addEventListener('click', function () { location.href = '../../'; });

  paintStars();
  show(screenMenu);
})();
