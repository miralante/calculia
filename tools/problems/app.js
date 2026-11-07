/* ============================================================
   Calculia — Problemas
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'problems';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
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
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var activity = null;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var reinforcement = App.reinforce.session({ titleKey: 'reinforceTitle', introKey: 'reinforceIntro', show: paintQuestion });

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

  /* A subtraction that goes below zero would be a different topic (and
     this activity never asks for one), so a bad data row must be loud
     rather than silently produce a negative answer. */
  DATA.problems.forEach(function (p) {
    if (p.op === 'sub' && p.b >= p.a) {
      throw new Error('problems: "' + p.id + '" subtracts ' + p.b + ' from ' + p.a);
    }
  });

  /* Walks the two steps of a problem, returning what is on screen at the
     end: how many things there are in total and how many of them have
     gone. The result is total minus gone, so it can always be counted. */
  function walkSteps(p) {
    var total = p.a;
    var gone = 0;
    [p.b, p.c].forEach(function (value, i) {
      if (p.ops[i] === 'add') total += value;
      else gone += value;
    });
    return { total: total, gone: gone, left: total - gone };
  }

  DATA.twoStep.forEach(function (p) {
    /* A step that goes below zero would be a different topic, and the
       picture could not show it at all. */
    var running = p.a;
    [p.b, p.c].forEach(function (value, i) {
      running += p.ops[i] === 'add' ? value : -value;
      if (running < 0) {
        throw new Error('problems: "' + p.id + '" goes below zero at step ' + (i + 1));
      }
    });
  });

  /* ---- Utilities ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  function result(p) { return p.op === 'add' ? p.a + p.b : p.a - p.b; }

  function sentence(p) {
    return App.i18n.t('problem.' + p.id)
      .replace(/\{a\}/g, p.a)
      .replace(/\{b\}/g, p.b)
      .replace(/\{c\}/g, p.c);
  }

  /* Options from a list of candidates, keeping them distinct: two buttons
     with the same number would make one of them wrong for no reason the
     person could see. */
  function pickOptions(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.forEach(function (v) {
      if (v >= 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    var extra = correct + 1;
    while (list.length < 3) {
      if (!seen[extra]) { seen[extra] = true; list.push(extra); }
      extra += 1;
    }
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  function questionLine(p) { return App.i18n.t('ask.' + p.id); }

  /* ---- The picture ----
     Every problem can be counted on screen: adding shows the two groups
     side by side, taking away shows the whole group with the ones that
     leave crossed out. Nothing has to be held in the head. */
  function tokens(n, picto, gone) {
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<span class="token' + (gone ? ' is-gone' : '') + '">' + picto +
        (gone ? '<span class="cross" aria-hidden="true">✖</span>' : '') + '</span>';
    }
    return html;
  }

  function picture(p) {
    if (p.op === 'add') {
      return '<div class="problem-stage">' +
        '<span class="token-group">' + tokens(p.a, p.picto, false) + '</span>' +
        '<span class="op-sign" aria-hidden="true">+</span>' +
        '<span class="token-group">' + tokens(p.b, p.picto, false) + '</span>' +
        '</div>';
    }
    /* Taking away: the ones that go are still there, crossed out, so the
       "how many are left" can be seen and not only worked out. */
    return '<div class="problem-stage">' +
      '<span class="token-group">' +
      tokens(p.a - p.b, p.picto, false) + tokens(p.b, p.picto, true) +
      '</span></div>';
  }

  function pictureAria(p) {
    return App.i18n.t(p.op === 'add' ? 'gen.ariaAdd' : 'gen.ariaSub')
      .replace(/\{a\}/g, p.a)
      .replace(/\{b\}/g, p.b);
  }

  /* Three numbers around the right one: one less, the answer, one more.
     Being out by one is the mistake this activity actually produces. */
  function numberOptions(value) {
    var values = [value, value - 1, value + 1].filter(function (v) { return v >= 0; });
    var extra = value + 2;
    while (values.length < 3) { values.push(extra); extra += 1; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  var GENERATORS = {

    /* What do we have to do? No number is asked for, on purpose: deciding
       between joining and taking away is its own step. */
    chooseOp: function (nv) {
      var pool = DATA.problems.filter(function (p) { return p.cue === nv.cue; });
      var p = App.utils.drawRound(nv.id, pool);
      var label = function (op) {
        return '<span class="op-icon" aria-hidden="true">' + (op === 'add' ? '➕' : '➖') +
          '</span><span class="op-name">' + App.i18n.t('op.' + op) + '</span>';
      };
      return {
        prompt: sentence(p) + ' ' + App.i18n.t('gen.whatToDo'),
        visual: picture(p),
        visualAria: pictureAria(p),
        hint: App.i18n.t('gen.socraticChooseOp'),
        options: App.utils.shuffle([
          { html: label(p.op), aria: App.i18n.t('op.' + p.op), correct: true },
          { html: label(p.op === 'add' ? 'sub' : 'add'),
            aria: App.i18n.t('op.' + (p.op === 'add' ? 'sub' : 'add')), correct: false }
        ]),
        inline: true
      };
    },

    /* How many are there now? The level's `op` fixes the operation and
       `max` the size of the answer, so only one thing changes per step. */
    solve: function (nv) {
      var pool = DATA.problems.filter(function (p) {
        return (!nv.op || p.op === nv.op) && result(p) <= nv.max;
      });
      var p = App.utils.drawRound(nv.id + (nv.op || 'both'), pool);
      return {
        prompt: sentence(p) + ' ' + questionLine(p),
        visual: picture(p),
        visualAria: pictureAria(p),
        legend: App.i18n.t('gen.countHint'),
        hint: App.i18n.t(p.op === 'add' ? 'gen.socraticSolveAdd' : 'gen.socraticSolveSub'),
        options: numberOptions(result(p))
      };
    },

    /* Two things happen, one after the other. The picture shows how it
       ends up, so the count is still possible — what has to be held in
       mind is only that there were two steps, not one. */
    twoStep: function (nv) {
      var pool = DATA.twoStep.filter(function (p) {
        return (p.ops[0] !== p.ops[1]) === !!nv.mix;
      });
      var p = App.utils.drawRound(nv.id, pool);
      var end = walkSteps(p);
      /* Stopping after the first step is THE mistake this level is about,
         so that number has to be one of the buttons. */
      var afterFirst = p.ops[0] === 'add' ? p.a + p.b : p.a - p.b;
      return {
        prompt: sentence(p) + ' ' + questionLine(p),
        visual: '<div class="problem-stage"><span class="token-group">' +
          tokens(end.left, p.picto, false) + tokens(end.gone, p.picto, true) +
          '</span></div>',
        visualAria: App.i18n.t('gen.ariaTwoStep')
          .replace(/\{total\}/g, end.total).replace(/\{gone\}/g, end.gone),
        legend: App.i18n.t('gen.twoStepHint'),
        hint: App.i18n.t('gen.socraticTwoStep'),
        options: pickOptions(end.left, [afterFirst, end.left + 1, end.left - 1])
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress());
  }

  var activityMenu = App.activityMenu({ container: $('#activitiesMenu'), activities: DATA.activities, open: openActivity });

  /* ---- Game ---- */

  function startRound(nv) {
    round.level = nv;
    round.index = 0;
    round.roundCorrect = 0;
    App.utils.drawRoundReset();
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
    legendEl.textContent = round.question.legend || '';
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
    progressText.textContent = '';
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
      plainText(correct.html) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question —which is what
     to do with the picture in front of you— and not the same sentence for
     every question. The generic line is only the fallback, for a question
     that forgot to bring its own. */

  /* ---- Events ---- */

  $('#btnNext').addEventListener('click', next);



  activityMenu.paint();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
