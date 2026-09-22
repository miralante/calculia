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
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var pools = {};
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

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

  /* Takes elements from a list without repeating within the round. */
  function draw(key, list) {
    var p = pools[key];
    if (!p || p.i >= p.orden.length) {
      var fresh = App.utils.shuffle(list);
      /* When the bag is refilled, its first item must not be the one just
         handed out: two identical questions in a row read as a "Siguiente"
         button that does nothing. */
      if (p && fresh.length > 1 && fresh[0] === p.last) {
        var swap = fresh[1];
        fresh[1] = fresh[0];
        fresh[0] = swap;
      }
      p = pools[key] = { orden: fresh, i: 0, last: p ? p.last : null };
    }
    p.last = p.orden[p.i];
    return p.orden[p.i++];
  }

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
      var p = draw(nv.id, pool);
      var label = function (op) {
        return '<span class="op-icon" aria-hidden="true">' + (op === 'add' ? '➕' : '➖') +
          '</span><span class="op-name">' + App.i18n.t('op.' + op) + '</span>';
      };
      return {
        prompt: sentence(p) + ' ' + App.i18n.t('gen.whatToDo'),
        visual: picture(p),
        visualAria: pictureAria(p),
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
      var p = draw(nv.id + (nv.op || 'both'), pool);
      return {
        prompt: sentence(p) + ' ' + questionLine(p),
        visual: picture(p),
        visualAria: pictureAria(p),
        legend: App.i18n.t('gen.countHint'),
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
      var p = draw(nv.id, pool);
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
  function paintMenu() {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    Object.keys(DATA.activities).forEach(function (id) {
      var act = DATA.activities[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
        '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
        '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
      btn.addEventListener('click', function () { openActivity(id); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress() {
    var levels = activity.levels;
    return levels[Math.min(progress.completedRounds || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress());
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    pools = {};
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceIndex = 0;
    inReinforce = true;
    attempts = 0;
    App.reinforce.banner.set(
      App.i18n.t('reinforceTitle') + ' — ' +
      App.i18n.t('reinforceIntro').replace('{n}', reinforceList.length)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level. */
  function paintQuestion(fixed) {
    question = fixed || GENERATORS[level.tipo](level, index);
    answered = false;
    attempts = 0;

    promptEl.textContent = question.prompt;
    visualEl.innerHTML = question.visual || '';
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.textContent = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!question.inline);
    question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = (inReinforce
      ? ((reinforceIndex + 1) / reinforceList.length)
      : (index / DATA.perRound)) * 100 + '%';
    progressText.textContent = '';
    paintStars();
  }

  function showReinforceQuestion(p) { paintQuestion(p); }

  function render() { paintQuestion(null); }

  /* Visible text of an option (its html may wrap spans). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      plainText(correct.html) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it. */
  function showHint() {
    explanationEl.textContent = App.i18n.t('hint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (answered) return;
    if (op.correct) {
      showExplanation(true);
      answered = true;
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      App.reinforce.add(level.id + ':' + index, question);
      if (attempts === 1) showHint();
      else showExplanation(false);
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function next() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceList.length) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
      } else {
        showReinforceQuestion(reinforceList[reinforceIndex]);
      }
      return;
    }
    index += 1;
    if (index >= DATA.perRound) {
      /* consume() returns [] when nothing was failed; otherwise it fires
         the callback that mounts the mini-round, which ends the round
         itself, so endRound must not also run here. */
      if (App.reinforce.consume().length === 0) endRound();
    } else {
      render();
    }
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));

    var idxN = activity.levels.indexOf(level);
    var nextLevel = (roundCorrect === DATA.perRound && idxN !== -1 && idxN + 1 < activity.levels.length)
      ? activity.levels[idxN + 1] : null;
    var btnHarder = $('#btnHarder');
    if (nextLevel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{name}', App.i18n.t('level.' + nextLevel.id));
      btnHarder.classList.remove('hidden');
      btnHarder.onclick = function () { startRound(nextLevel); };
    } else {
      btnHarder.classList.add('hidden');
    }
  }

  /* ---- Events ---- */

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  paintMenu();
  paintStars();
})();
