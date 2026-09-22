/* ============================================================
   Calculia — Measures
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'measures';
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
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var resolved = false;
  var attempts = 0;
  var question = null;
  var pools = {};
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. inReinforce controls the mini-round flow. */
  var fixedQuestion = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilidades ---- */

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

  /* ---- The ladder of units ----
     Nothing that can be worked out is stored: how many steps apart two
     units are, and what that multiplies by, both come out of their
     position in the list, and the drawing is built from the same list. */
  function unitName(symbol) { return App.i18n.t('unit.' + symbol); }
  /* Spanish needs the plural where the question talks about several, and
     the form is a language matter, so it comes from strings.<locale>.js
     and is never built here. */
  function unitPlural(symbol) { return App.i18n.t('unitPlural.' + symbol); }
  function stepsBetween(ladder, from, to) {
    return ladder.units.indexOf(to) - ladder.units.indexOf(from);
  }
  function factorFor(steps) { return Math.pow(10, steps); }

  /* ---- Data invariants, loud at start-up ---- */
  DATA.ladders.forEach(function (l) {
    if (l.units.length !== DATA.ladders[0].units.length) {
      throw new Error('measures: ladder "' + l.id + '" has a different number of steps');
    }
    var seen = {};
    l.units.forEach(function (u) {
      if (seen[u]) throw new Error('measures: ladder "' + l.id + '" repeats "' + u + '"');
      seen[u] = true;
    });
  });
  if (DATA.maxSteps < 1 || DATA.maxSteps >= DATA.ladders[0].units.length) {
    throw new Error('measures: maxSteps does not fit the ladder');
  }

  /* The ladder drawn as steps, with the ten between each pair of rungs
     written out: that way "how many steps" and "times what" are both
     counted off the picture instead of recalled. */
  function ladderHtml(ladder, from, to) {
    var html = '<div class="ladder">';
    ladder.units.forEach(function (u, i) {
      var mark = (u === from || u === to);
      if (i > 0) {
        html += '<span class="rung-gap" aria-hidden="true">' +
          App.i18n.t('gen.timesTen') + '</span>';
      }
      html += '<span class="rung' + (mark ? ' is-marked' : '') +
        '" style="margin-left:' + (i * 7) + 'px">' +
        (mark ? '<span class="rung-mark" aria-hidden="true">👉</span>' : '') +
        '<span class="rung-symbol">' + u + '</span>' +
        '<span class="rung-name">' + unitName(u) + '</span></span>';
    });
    return html + '</div>';
  }

  /* Two rungs of the same ladder, the second below the first and no more
     than maxSteps away, so the steps between them can be counted. */
  function twoRungs(key, ladder, maxSteps) {
    var pairs = [];
    ladder.units.forEach(function (u, i) {
      for (var d = 1; d <= maxSteps; d++) {
        if (i + d < ladder.units.length) pairs.push([u, ladder.units[i + d]]);
      }
    });
    return draw(key, pairs);
  }

  /* Three distinct numbers, the answer first. `suffix` writes the unit
     next to each one when the question asks for a quantity. */
  function threeNumbers(correct, candidates, suffix) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct * 10, correct + 10]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      var text = v + (suffix ? ' ' + suffix : '');
      return { html: text, aria: text, correct: v === correct };
    });
  }

  var GENERATORS = {

    /* How far apart two units are, counted on the ladder. */
    stepsApart: function (nv) {
      var ladder = draw(nv.id, DATA.ladders);
      var pair = twoRungs(nv.id + ladder.id, ladder, DATA.maxSteps);
      var steps = stepsBetween(ladder, pair[0], pair[1]);
      return {
        prompt: App.i18n.t('gen.stepsApart')
          .replace(/\{big\}/g, unitName(pair[0]))
          .replace(/\{small\}/g, unitName(pair[1])),
        visual: ladderHtml(ladder, pair[0], pair[1]),
        visualAria: App.i18n.t('gen.ladderAria')
          .replace(/\{big\}/g, unitName(pair[0]))
          .replace(/\{small\}/g, unitName(pair[1])),
        legend: App.i18n.t('gen.stepsHint'),
        /* Counting the rungs instead of the gaps between them gives one
           too many, which is the mistake a ladder actually produces. */
        options: threeNumbers(steps, [steps + 1, steps - 1])
      };
    },

    /* And what those steps multiply by: one ten for each step. */
    stepFactor: function (nv) {
      var ladder = draw(nv.id, DATA.ladders);
      var pair = twoRungs(nv.id + ladder.id, ladder, DATA.maxSteps);
      var steps = stepsBetween(ladder, pair[0], pair[1]);
      var answer = factorFor(steps);
      return {
        prompt: App.i18n.t('gen.stepFactor')
          .replace(/\{small\}/g, unitPlural(pair[1]))
          .replace(/\{big\}/g, unitName(pair[0])),
        visual: ladderHtml(ladder, pair[0], pair[1]),
        visualAria: App.i18n.t('gen.ladderAria')
          .replace(/\{big\}/g, unitName(pair[0]))
          .replace(/\{small\}/g, unitName(pair[1])),
        legend: App.i18n.t('gen.factorHint'),
        /* Multiplying by ten times the number of steps, instead of by ten
           once per step, is the real confusion here. */
        options: threeNumbers(answer, [10 * steps, factorFor(steps + 1)],
          unitPlural(pair[1]))
      };
    },

    /* The same factor put to work on a quantity. */
    ladderConvert: function (nv) {
      var ladder = draw(nv.id, DATA.ladders);
      /* Two steps at most here: with three the answer runs into the
         thousands and the ladder stops being what is being read. */
      var pair = twoRungs(nv.id + ladder.id, ladder, 2);
      var steps = stepsBetween(ladder, pair[0], pair[1]);
      var n = draw(nv.id + 'many', DATA.ladderAmounts);
      var answer = n * factorFor(steps);
      return {
        prompt: App.i18n.t('gen.ladderConvert')
          .replace(/\{n\}/g, n)
          .replace(/\{big\}/g, unitPlural(pair[0]))
          .replace(/\{small\}/g, unitPlural(pair[1])),
        visual: ladderHtml(ladder, pair[0], pair[1]),
        visualAria: App.i18n.t('gen.ladderAria')
          .replace(/\{big\}/g, unitName(pair[0]))
          .replace(/\{small\}/g, unitName(pair[1])),
        legend: App.i18n.t('gen.convertHint'),
        /* One step too many or too few is what actually goes wrong. */
        options: threeNumbers(answer,
          [n * factorFor(steps + 1), n * factorFor(steps - 1)], unitPlural(pair[1]))
      };
    },

    medidas: function (nv) {
      var group = DATA.measures[App.i18n.locale()][nv.lista];
      var item = draw('med_' + nv.lista, group.items);
      var ej = item.ej ? '<p class="hint">' + item.ej + '</p>' : '';
      return {
        prompt: item.question,
        visual: '<div class="measure-picto" aria-hidden="true">' + group.picto + '</div>' +
          '<p class="measure-text">' + item.q + '</p>' + ej,
        options: App.utils.shuffle([{ html: item.r, correct: true }].concat(
          item.falsas.map(function (f) { return { html: f, correct: false }; })
        ))
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
    /* Registers the callback that runs when the normal round ends with
       pending failures; it mounts the mini-round with just those. */
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
    legendEl.innerHTML = question.legend || '';
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
