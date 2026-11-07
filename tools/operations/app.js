/* ============================================================
   Calculia — Cuentas grandes
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'operations';
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
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0 });

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

  /* ---- Data invariants ----
     Nothing that can be worked out is stored, so the only thing that can
     go wrong is a data row that makes the question unanswerable. Those
     must be loud here, not silent on screen. */
  DATA.pairs.forEach(function (p) {
    if (p.a === p.b) {
      throw new Error('operations: pair ' + p.a + 'x' + p.b + ' is the same both ways round');
    }
  });
  DATA.splits.forEach(function (s) {
    if (s.cut >= s.b || s.cut < 1) {
      throw new Error('operations: split ' + s.a + 'x' + s.b + ' cuts outside the number');
    }
  });
  DATA.twoDigit.forEach(function (m) {
    if (m.a < 10 || m.a > 99) {
      throw new Error('operations: ' + m.a + ' is not a two-digit number');
    }
  });
  DATA.shares.forEach(function (s) {
    if (s.total % s.groups !== 0) {
      throw new Error('operations: ' + s.total + ' does not share evenly into ' + s.groups);
    }
  });
  DATA.groups.forEach(function (g) {
    if (g.total % g.size !== 0) {
      throw new Error('operations: ' + g.total + ' does not split into groups of ' + g.size);
    }
  });
  DATA.orders.forEach(function (o) {
    /* If both readings gave the same number, the brackets would teach
       nothing at all. */
    if (o.a + o.b * o.c === (o.a + o.b) * o.c) {
      throw new Error('operations: ' + o.a + '+' + o.b + 'x' + o.c + ' reads the same either way');
    }
  });

  /* ---- Utilities ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  function numberOptions(value, step) {
    var d = step || 1;
    var values = [value, value - d, value + d].filter(function (v) { return v > 0; });
    var extra = value + 2 * d;
    while (values.length < 3) { values.push(extra); extra += d; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  /* Options built from a list of numbers, keeping them distinct: two
     buttons with the same number would make one of them wrong for no
     reason the person could see. */
  function pickOptions(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
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

  /* ---- The pictures ----
     Every multiplication is a rectangle of dots, so it can be counted,
     and every split is the same rectangle cut in two. Nothing needs a
     remembered rule. */
  function dotGrid(rows, cols, tone) {
    var html = '<span class="dot-grid' + (tone ? ' tone-' + tone : '') + '">';
    for (var r = 0; r < rows; r++) {
      html += '<span class="dot-row">';
      for (var c = 0; c < cols; c++) html += '<span class="dot"></span>';
      html += '</span>';
    }
    return html + '</span>';
  }

  function block(rows, cols, caption, tone) {
    return '<span class="calc-block">' + dotGrid(rows, cols, tone) +
      '<span class="block-caption">' + caption + '</span></span>';
  }

  function times(a, b) { return a + ' × ' + b; }

  /* Groups of things, for the two ways of dividing. */
  function groupsHtml(count, per, tone) {
    var html = '<span class="group-row">';
    for (var g = 0; g < count; g++) {
      html += '<span class="group' + (tone ? ' tone-' + tone : '') + '">';
      for (var i = 0; i < per; i++) html += '<span class="dot"></span>';
      html += '</span>';
    }
    return html + '</span>';
  }

  function expression(o, parens) {
    return parens
      ? '( ' + o.a + ' + ' + o.b + ' ) × ' + o.c
      : o.a + ' + ' + o.b + ' × ' + o.c;
  }

  var GENERATORS = {

    /* Adding and taking away when negatives are in play, done by walking
       the number line. Where you start is pinned, where you land is the
       answer, and every stop in between can be counted: there is no sign
       rule to learn. */
    walkLine: function (nv) {
      var w = App.utils.drawRound(nv.id, DATA.walks.filter(function (x) {
        var end = nv.dir === 'up' ? x.from + x.step : x.from - x.step;
        return end >= DATA.lineMin && end <= DATA.lineMax;
      }));
      var answer = nv.dir === 'up' ? w.from + w.step : w.from - w.step;
      var html = '<div class="line-stage"><span class="num-line">';
      for (var v = DATA.lineMin; v <= DATA.lineMax; v++) {
        var isStart = v === w.from;
        html += '<span class="line-stop' + (isStart ? ' is-start' : '') +
          (v === 0 ? ' is-zero' : '') + '">' +
          (isStart ? '<span class="line-you" aria-hidden="true">📍</span>' : '') +
          '<span class="stop-num">' + v + '</span></span>';
      }
      return {
        prompt: App.i18n.t(nv.dir === 'up' ? 'gen.walkUp' : 'gen.walkDown')
          .replace(/\{from\}/g, w.from).replace(/\{step\}/g, w.step),
        visual: html + '</span></div>',
        visualAria: App.i18n.t('gen.lineAria')
          .replace(/\{from\}/g, w.from).replace(/\{step\}/g, w.step),
        legend: App.i18n.t('gen.walkHint'),
        hint: App.i18n.t('gen.socraticWalk'),
        /* Forgetting the sign and answering as if you had started at zero
           is the mistake this actually produces. */
        options: pickOptions(answer, [w.step, w.from, answer + 1])
      };
    },


    /* Turning it round gives the same. The two rectangles hold the same
       dots, one standing up and one lying down. */
    commute: function (nv) {
      var p = App.utils.drawRound(nv.id, DATA.pairs);
      var total = p.a * p.b;
      return {
        prompt: App.i18n.t('gen.commute')
          .replace(/\{first\}/g, times(p.a, p.b))
          .replace(/\{total\}/g, total)
          .replace(/\{second\}/g, times(p.b, p.a)),
        visual: '<div class="calc-stage">' +
          block(p.a, p.b, times(p.a, p.b) + ' = ' + total, 1) +
          '<span class="calc-sign" aria-hidden="true">=</span>' +
          block(p.b, p.a, times(p.b, p.a) + ' = ?', 2) +
          '</div>',
        visualAria: App.i18n.t('gen.commuteAria')
          .replace(/\{a\}/g, p.a).replace(/\{b\}/g, p.b),
        legend: App.i18n.t('gen.commuteHint'),
        hint: App.i18n.t('gen.socraticCommute'),
        /* The two real mistakes: adding instead of multiplying, and
           counting one row too many. */
        options: pickOptions(total, [p.a + p.b, total + p.a, total - p.a])
      };
    },

    /* Cutting a hard multiplication into two easy ones. */
    split: function (nv) {
      var s = App.utils.drawRound(nv.id, DATA.splits);
      var rest = s.b - s.cut;
      var left = s.a * s.cut;
      var right = s.a * rest;
      return {
        prompt: App.i18n.t('gen.howMuch').replace(/\{op\}/g, times(s.a, s.b)),
        visual: '<div class="calc-stage">' +
          block(s.a, s.cut, times(s.a, s.cut) + ' = ' + left, 1) +
          '<span class="calc-sign" aria-hidden="true">+</span>' +
          block(s.a, rest, times(s.a, rest) + ' = ' + right, 2) +
          '</div>',
        visualAria: App.i18n.t('gen.splitAria')
          .replace(/\{a\}/g, s.a).replace(/\{b\}/g, s.b)
          .replace(/\{cut\}/g, s.cut).replace(/\{rest\}/g, rest),
        legend: App.i18n.t('gen.splitHint')
          .replace(/\{left\}/g, left).replace(/\{right\}/g, right),
        hint: App.i18n.t('gen.socraticSplit'),
        options: pickOptions(left + right, [left + right - s.a, left + right + s.a, left])
      };
    },

    /* The same cut, now used on a two-digit number: the tens on one side
       and the units on the other. */
    splitTens: function (nv) {
      var m = App.utils.drawRound(nv.id, DATA.twoDigit);
      var tens = Math.floor(m.a / 10) * 10;
      var units = m.a - tens;
      var left = tens * m.b;
      var right = units * m.b;
      return {
        prompt: App.i18n.t('gen.howMuch').replace(/\{op\}/g, times(m.a, m.b)),
        visual: '<div class="calc-stage">' +
          block(m.b, tens, times(tens, m.b) + ' = ' + left, 1) +
          '<span class="calc-sign" aria-hidden="true">+</span>' +
          block(m.b, units, times(units, m.b) + ' = ' + right, 2) +
          '</div>',
        visualAria: App.i18n.t('gen.splitTensAria')
          .replace(/\{a\}/g, m.a).replace(/\{tens\}/g, tens).replace(/\{units\}/g, units),
        legend: App.i18n.t('gen.splitHint')
          .replace(/\{left\}/g, left).replace(/\{right\}/g, right),
        hint: App.i18n.t('gen.socraticSplitTens'),
        options: pickOptions(left + right, [left + right - m.b, left + right + m.b, left])
      };
    },

    /* Dividing as sharing out: how many does each one get. */
    share: function (nv) {
      var s = App.utils.drawRound(nv.id, DATA.shares);
      var each = s.total / s.groups;
      return {
        prompt: App.i18n.t('gen.share')
          .replace(/\{total\}/g, s.total).replace(/\{groups\}/g, s.groups),
        visual: '<div class="calc-stage">' + groupsHtml(s.groups, each, 1) + '</div>',
        visualAria: App.i18n.t('gen.shareAria')
          .replace(/\{groups\}/g, s.groups).replace(/\{each\}/g, each),
        legend: App.i18n.t('gen.shareHint'),
        hint: App.i18n.t('gen.socraticShare'),
        options: numberOptions(each)
      };
    },

    /* Dividing as making groups: how many groups come out. This is the
       one that lets the divisor have two digits without drawing a dozen
       piles at once. */
    groups: function (nv) {
      var g = App.utils.drawRound(nv.id, DATA.groups);
      var count = g.total / g.size;
      return {
        prompt: App.i18n.t('gen.groups')
          .replace(/\{total\}/g, g.total).replace(/\{size\}/g, g.size),
        visual: '<div class="calc-stage stage-stack">' + groupsHtml(count, g.size, 2) + '</div>',
        visualAria: App.i18n.t('gen.groupsAria')
          .replace(/\{count\}/g, count).replace(/\{size\}/g, g.size),
        legend: App.i18n.t('gen.groupsHint'),
        hint: App.i18n.t('gen.socraticGroups'),
        options: numberOptions(count)
      };
    },

    /* Which part is done first. No result is asked for: deciding the
       order is its own step. */
    whatFirst: function (nv) {
      var o = App.utils.drawRound(nv.id, DATA.orders);
      var parens = App.utils.drawRound(nv.id + 'p', [true, false]);
      var mul = o.b + ' × ' + o.c;
      var add = o.a + ' + ' + o.b;
      return {
        prompt: App.i18n.t('gen.whatFirst'),
        visual: '<div class="calc-stage"><span class="expression">' +
          expression(o, parens) + '</span></div>',
        visualAria: expression(o, parens),
        legend: App.i18n.t(parens ? 'gen.parensHint' : 'gen.timesFirstHint'),
        hint: App.i18n.t('gen.socraticWhatFirst'),
        options: App.utils.shuffle([
          { html: '<span class="part">' + mul + '</span>', aria: mul, correct: !parens },
          { html: '<span class="part">' + add + '</span>', aria: add, correct: parens }
        ]),
        inline: true
      };
    },

    /* And now the number. The other reading is offered as the wrong
       answer, because it is exactly the mistake this teaches about. */
    orderResult: function (nv) {
      var o = App.utils.drawRound(nv.id, DATA.orders);
      var parens = App.utils.drawRound(nv.id + 'p', [true, false]);
      var right = parens ? (o.a + o.b) * o.c : o.a + o.b * o.c;
      var other = parens ? o.a + o.b * o.c : (o.a + o.b) * o.c;
      return {
        prompt: App.i18n.t('gen.howMuch').replace(/\{op\}/g, expression(o, parens)),
        visual: '<div class="calc-stage"><span class="expression">' +
          expression(o, parens) + '</span></div>',
        visualAria: expression(o, parens),
        legend: App.i18n.t(parens ? 'gen.parensHint' : 'gen.timesFirstHint'),
        hint: App.i18n.t('gen.socraticOrderResult'),
        options: pickOptions(right, [other, right + 1, right - 1])
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
    visualEl.classList.toggle('hidden', !round.question.visual);
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
    var said = plainText(correct.html).replace(/\s+/g, ' ').trim();
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      (said || correct.aria || '') + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question —which is what
     to do with the figure in front of you— and not the same sentence for
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
  App.utils.bindEndBackToStart();

})();
