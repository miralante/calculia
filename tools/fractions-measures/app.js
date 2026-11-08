/* ============================================================
   Calculia — Fractions
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var M = App.fractionsMeasuresModel;
  var resolved = M.resolved, fixedQuestion = M.fixedQuestion, leyendaFrac = M.leyendaFrac, svgFraccion = M.svgFraccion, htmlFraccion = M.htmlFraccion;
  var fracOption = M.fracOption, fracAria = M.fracAria, sameAmount = M.sameAmount, decimalSeparator = M.decimalSeparator, decimalText = M.decimalText, threeOf = M.threeOf;
  var tenthOptions = M.tenthOptions, pickWrong = M.pickWrong, GENERATORS = M.GENERATORS, INTRO = M.INTRO, comaT = M.comaT, comaSeparator = M.comaSeparator;
  var COMA_WORDS = M.COMA_WORDS, comaSpeakWhole = M.comaSpeakWhole, comaRandomInt = M.comaRandomInt, genComma = M.genComma, COMA_DRAG_PX = M.COMA_DRAG_PX;

  var TOOL_ID = 'fractions-measures';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var screenComma = $('#screenComma');
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
  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var introVisual = $('#introVisual');
  var introCaption = $('#introCaption');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var introIdx = 0;
  var realIdx = 0;

  /* Persistent progress */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0 });
  /* Rounds per activity. Fractions and decimals share this saved object,
     so the old single counter carried a fractions round over to decimals. */
  if (!progress.rounds) progress.rounds = { fracciones: progress.completedRounds };

  /* Round state */
  var activity = null;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. reinforcement.active() tells the mini-round flow apart. */
  var reinforcement = App.reinforce.session({ titleKey: 'reinforceTitle', introKey: 'reinforceIntro', show: paintQuestion });
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

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* ---- Fracciones (SVG) ---- */

  /* An answer option showing the pie and the notation together, so the
     amount can be judged by looking and not only by reading digits. */
  /* Two fractions are the same amount when a/b == c/d, compared by
     cross-multiplying so no rounding is involved. */
  /* Spanish writes 0,5 and English 0.5. Same per-tool convention as
     thousandsSeparator() in tools/numbers and DECIMAL_SEP in
     assets/js/dinero.js (see doc/es/i18n.md §4). */
  /* A fraction written as a decimal, with the fewest places that make it
     exact: tenths and halves need one place, quarters two, eighths three.
     It never rounds: a fraction with no exact decimal is a bad question. */
  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correcta, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  /* Three distinct number options: the right one first, then the given
     confusions, and finally neighbours to pad if any of them collided with
     the answer. Two buttons showing the same number would make one of them
     wrong for no reason the person could see. */
  /* ---- Data invariants, loud at start-up ----
     A fraction that did not come out in whole tenths could not be drawn
     next to a decimal and added to it, and two amounts that were equal
     would leave "which is more" with no answer. */
  Object.keys(DATA.activities).forEach(function (actId) {
    DATA.activities[actId].levels.forEach(function (nv) {
      if (nv.tipo !== 'mixedOp' && nv.tipo !== 'fracOrDecimal') return;
      nv.casos.forEach(function (item) {
        var frac = item[0];
        var tenths = item[1];
        if ((frac[0] * 10) % frac[1] !== 0) {
          throw new Error('fractions: ' + nv.id + ' has ' + frac.join('/') +
            ', which is not a whole number of tenths');
        }
        var fracTenths = (frac[0] * 10) / frac[1];
        if (tenths < 1 || tenths > 10 || fracTenths < 1 || fracTenths > 10) {
          throw new Error('fractions: ' + nv.id + ' goes outside one whole pie');
        }
        if (nv.tipo === 'fracOrDecimal') {
          if (fracTenths === tenths) {
            throw new Error('fractions: ' + nv.id + ' compares two equal amounts');
          }
          return;
        }
        var result = nv.op === 'add' ? fracTenths + tenths : fracTenths - tenths;
        if (result < 1 || result > 10) {
          throw new Error('fractions: ' + nv.id + ' gives ' + result +
            ' tenths, which is outside one pie');
        }
      });
    });
  });

  /* The comparison levels shuffle each pair before showing it, so the
     order stored is not part of the question: two pairs holding the same
     two fractions would be the same question twice, and drawing them one
     after the other reads as a "Next" button that did nothing. Equal
     fractions would leave the question with no greater one at all. */
  Object.keys(DATA.activities).forEach(function (actId) {
    DATA.activities[actId].levels.forEach(function (nv) {
      if (nv.tipo !== 'comparaFrac') return;
      var seen = {};
      nv.pares.forEach(function (par) {
        if (par[0][0] * par[1][1] === par[1][0] * par[0][1]) {
          throw new Error('fractions: ' + nv.id + ' compares two equal fractions');
        }
        var key = [par[0], par[1]].map(function (f) { return f.join('/'); })
          .sort().join(' ');
        if (seen[key]) {
          throw new Error('fractions: ' + nv.id + ' repeats the pair ' + key);
        }
        seen[key] = true;
      });
    });
  });

  /* Three distinct answers in tenths, all inside one pie. The given
     confusions come first; the padding after them only runs when one of
     them collapsed onto the answer or fell outside the pie, which is what
     used to leave a question with two buttons instead of three. */
  /* Up to two wrong fractions, each one a real confusion: both parts above
     zero, inside one pie, different from each other and from the answer.
     The candidates come in priority order, so the padding only runs when
     the first ones do not fit this pair. */
  /* ============================================================
     Screens and flow
     ============================================================ */

  var show = App.screenSwitch([screenMenu, screenIntro, screenReal, screenGame, screenComma, screenEnd]);

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  /* The level rises one step per completed round of THIS activity, capped
     at the last one, so a person who comes back continues where they were. */
  function roundsDone(id) {
    return progress.rounds[id] || 0;
  }

  function levelFromProgress() {
    var levels = activity.levels;
    return levels[Math.min(roundsDone(activity.id), levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    if (activity.game === 'comma') { comma.start(); return; }
    if (activity.intro) { openIntro(); return; }
    startRound(levelFromProgress());
  }

  var activityMenu = App.activityMenu({ container: $('#activitiesMenu'), activities: DATA.activities, open: openActivity });

  /* ---- Intro: what a fraction is, then the same idea in real life ----
     Both are carousels the person can go back through before the first
     round. Each slide is a picture and one short sentence; the sentence
     is what gets read aloud, so the picture never has to carry it alone. */
  /* The texts of the intro and the real-life screens depend on the
     activity, so they are written here rather than through data-i18n. */
  function introText(key) {
    return App.i18n.t('intro.' + activity.id + '.' + key);
  }

  function realText(key) {
    return App.i18n.t('real.' + activity.id + '.' + key);
  }

  function paintIntro() {
    var slide = INTRO[activity.id].slides[introIdx];
    introVisual.innerHTML = slide.visual();
    introCaption.textContent = introText(slide.key);
  }

  function introStep(delta) {
    var count = INTRO[activity.id].slides.length;
    introIdx = (introIdx + delta + count) % count;
    paintIntro();
  }

  function openIntro() {
    $('#introInstruction').textContent = introText('instruction');
    $('#introTitle').textContent = introText('title');
    $('#introText').textContent = introText('text');
    $('#introReal').textContent = introText('toReal');
    $('#introPrev').setAttribute('aria-label', introText('prev'));
    $('#introNext').setAttribute('aria-label', introText('next'));
    introIdx = 0;
    paintIntro();
    show(screenIntro);
  }

  function paintReal() {
    var slide = INTRO[activity.id].real[realIdx];
    realObject.textContent = slide.picto;
    realCaption.textContent = realText(slide.key);
  }

  function realStep(delta) {
    var count = INTRO[activity.id].real.length;
    realIdx = (realIdx + delta + count) % count;
    paintReal();
  }

  function openReal() {
    $('#realTitle').textContent = realText('title');
    $('#realContinue').textContent = realText('continue');
    $('#realPrev').setAttribute('aria-label', realText('prev'));
    $('#realNext').setAttribute('aria-label', realText('next'));
    realIdx = 0;
    paintReal();
    show(screenReal);
  }

  /* ---- Game ---- */

  function startRound(nv) {
    round.level = nv;
    round.index = 0;
    round.roundCorrect = 0;
    App.utils.drawRoundReset();
    /* Registers the callback that runs when the normal round ends with
       pending failures; it mounts the mini-round with just those. */
    reinforcement.begin();
    show(screenGame);
    render();
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level. */
  function paintQuestion(fixed) {
    round.question = fixed || GENERATORS[round.level.tipo](round.level, round.index);
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

    progressFill.style.width = (reinforcement.active()
      ? ((reinforcement.position() + 1) / reinforcement.total())
      : (round.index / DATA.perRound)) * 100 + '%';
    progressText.textContent = reinforcement.active()
      ? (reinforcement.position() + 1) + ' / ' + reinforcement.total()
      : (round.index + 1) + ' / ' + DATA.perRound;
    paintStars();
  }

  function render() { paintQuestion(null); }

  /* Visible text of an option (its html may wrap spans). */
  var plainText = App.utils.plainText;


  function showExplanation(isCorrect) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = round.question.options.filter(function (o) { return o.correct; })[0];
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      /* Fraction options draw a pie, so their visible text would read
         "12" for 1/2; their aria label says "1 de 2 partes" instead. */
      (correct.aria || plainText(correct.html)) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question —which is what
     to do with the figure in front of you— and not the same sentence for
     every question. The generic line is only the fallback, for a question
     that forgot to bring its own. */
  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    progress.rounds[activity.id] = roundsDone(activity.id) + 1;
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', round.roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));

  }

  /* The comma exercise lives in comma.js; the page gives it what it needs. */
  var comma = App.fractionsMeasuresComma({
    progress: progress,
    save: save,
    paintStars: paintStars,
    steps: function () { return activity.steps; },
    countCorrect: function () { round.roundCorrect += 1; },
    resetCorrect: function () { round.roundCorrect = 0; },
    endRound: endRound,
    showComma: function () { show(screenComma); },
    showMenu: function () { show(screenMenu); }
  });


  $('#btnNext').addEventListener('click', next);

  $('#introPrev').addEventListener('click', function () { introStep(-1); });
  $('#introNext').addEventListener('click', function () { introStep(1); });
  $('#introReal').addEventListener('click', openReal);
  $('#realPrev').addEventListener('click', function () { realStep(-1); });
  $('#realNext').addEventListener('click', function () { realStep(1); });
  $('#realContinue').addEventListener('click', function () { startRound(levelFromProgress()); });



  activityMenu.paint();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();
