/* ============================================================
   Calculia — Dos rectas
   Data in data.js. Shared modules in assets/js/.
   Questions are generated on the fly, one per round position.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'lines';
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
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Nothing that can be worked out is stored ----
     Which pair it is comes out of the drawing: the slopes of the two lines
     decide it, so the picture and the answer cannot disagree. */
  function slopeOf(line) {
    var dx = line[1][0] - line[0][0];
    var dy = line[1][1] - line[0][1];
    return dx === 0 ? null : dy / dx;
  }

  function pairKind(pair) {
    var sa = slopeOf(pair.a);
    var sb = slopeOf(pair.b);
    var close = function (x, y) { return Math.abs(x - y) < 0.01; };
    if (sa === null && sb === null) return 'parallel';
    if (sa === null) return close(sb, 0) ? 'perpendicular' : 'crossing';
    if (sb === null) return close(sa, 0) ? 'perpendicular' : 'crossing';
    if (close(sa, sb)) return 'parallel';
    return close(sa * sb, -1) ? 'perpendicular' : 'crossing';
  }

  /* Checked at start-up, so a pair that says the wrong kind fails loudly
     instead of teaching a lie. */
  DATA.linePairs.forEach(function (pair) {
    if (pairKind(pair) !== pair.kind) {
      throw new Error('lines: "' + pair.id + '" is ' + pairKind(pair) +
        ', not ' + pair.kind);
    }
  });
  ['parallel', 'perpendicular', 'crossing'].forEach(function (k) {
    if (!DATA.linePairs.some(function (p) { return p.kind === k; })) {
      throw new Error('lines: no pair of lines that is "' + k + '"');
    }
  });

  function linesSvg(pair) {
    var line = function (l, cls) {
      return '<line x1="' + l[0][0] + '" y1="' + l[0][1] + '" x2="' + l[1][0] +
        '" y2="' + l[1][1] + '" class="' + cls + '"/>';
    };
    /* The two lines differ by stroke pattern as well as colour, so they are
       still two lines without any colour at all (WCAG 1.4.1). */
    return '<svg viewBox="0 0 120 120" width="190" height="190" aria-hidden="true">' +
      '<rect x="0" y="0" width="120" height="120" class="line-box"/>' +
      line(pair.a, 'pair-line is-first') + line(pair.b, 'pair-line is-second') +
      '</svg>';
  }

  var GENERATORS = {
    /* Two lines: never touching, crossing, or crossing square. */
    linePair: function (nv) {
      var pair = App.utils.drawRound(nv.id, DATA.linePairs);
      var kind = pairKind(pair);
      return {
        prompt: App.i18n.t('gen.linePair'),
        hint: App.i18n.t('gen.socraticLines'),
        visual: '<div class="grid-stage">' + linesSvg(pair) + '</div>',
        visualAria: App.i18n.t('gen.linesAria'),
        legend: App.i18n.t('gen.linesHint'),
        options: App.utils.shuffle(['parallel', 'perpendicular', 'crossing']
          .map(function (k) {
            return {
              html: '<span class="answer-name">' + App.i18n.t('lines.' + k) + '</span>',
              aria: App.i18n.t('lines.' + k),
              correct: k === kind
            };
          })),
        inline: true
      };
    }
  };

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
    App.utils.drawRoundReset();
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
    visualEl.classList.toggle('hidden', !question.visual);
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
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    /* A picture option has no words of its own, so the explanation falls
       back to its aria text rather than saying nothing. */
    var said = plainText(correct.html).replace(/\s+/g, ' ').trim();
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      (said || correct.aria || '') + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question, and the generic
     line is only the fallback, for a question that forgot to bring its own. */
  function showHint() {
    explanationEl.textContent = (question && question.hint) || App.i18n.t('hint');
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
      var respuestaTrasPista = attempts > 1;
      showHint();
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(false); });
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
  }

  /* ---- Events ---- */

  $('#btnNext').addEventListener('click', next);

  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });
})();
