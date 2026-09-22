/* ============================================================
   Calculia — Formas parecidas
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'similar';
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

  /* ---- Nothing that can be worked out is stored ----
     Whether two rectangles are the same shape, how many little squares
     sit on each side of a triangle, and which ramp climbs faster are all
     computed here by cross-multiplying, so no rounding is involved and
     the picture and the answer come from the same numbers. */
  function sameShape(a, b) { return a.w * b.h === b.w * a.h; }
  function steeperThan(a, b) { return a.rise * b.run > b.rise * a.run; }
  function sameSlopeAs(a, b) { return a.rise * b.run === b.rise * a.run; }

  /* ---- Data invariants, loud at start-up ---- */
  DATA.rects.forEach(function (r) {
    if (r.w < 1 || r.h < 1) {
      throw new Error('similar: a rectangle of ' + r.w + 'x' + r.h + ' cannot be drawn');
    }
  });
  DATA.rects.forEach(function (r, i) {
    /* Every rectangle needs a partner of the same shape and a different
       size, or half the questions could not be built. */
    var hasTwin = DATA.rects.some(function (o, j) {
      return i !== j && sameShape(r, o) && (o.w !== r.w || o.h !== r.h);
    });
    if (!hasTwin) {
      throw new Error('similar: ' + r.w + 'x' + r.h + ' has no bigger twin of the same shape');
    }
  });
  DATA.ramps.forEach(function (r) {
    if (r.run < 1 || r.rise < 1) {
      throw new Error('similar: a ramp of ' + r.run + ' by ' + r.rise + ' cannot be drawn');
    }
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

  function yesNoOptions(isYes) {
    return App.utils.shuffle([true, false].map(function (v) {
      return {
        html: '<span class="answer-name">' + App.i18n.t(v ? 'answer.yes' : 'answer.no') + '</span>',
        aria: App.i18n.t(v ? 'answer.yes' : 'answer.no'),
        correct: v === isYes
      };
    }));
  }

  /* Three distinct numbers around the right one. */
  function threeOf(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct - 1, correct + 2]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  /* ---- The pictures ----
     Everything is drawn square by square, so "the same shape" is something
     you can check by counting rather than by measuring. */
  var CELL = 16;

  function rectSvg(r, small) {
    var w = r.w * CELL;
    var h = r.h * CELL;
    var body = '';
    for (var y = 0; y < r.h; y++) {
      for (var x = 0; x < r.w; x++) {
        body += '<rect x="' + (x * CELL) + '" y="' + (y * CELL) + '" width="' + CELL +
          '" height="' + CELL + '" class="shape-cell"/>';
      }
    }
    var scale = small ? 0.75 : 1;
    return '<svg viewBox="-2 -2 ' + (w + 4) + ' ' + (h + 4) + '" width="' +
      Math.round((w + 4) * scale) + '" height="' + Math.round((h + 4) * scale) +
      '" class="shape-svg" aria-hidden="true">' + body + '</svg>';
  }

  /* A right triangle with a square drawn on each of its sides. The two
     small squares hold exactly as many little squares as the big one, and
     both can be counted: that is the whole idea. */
  function trianglePic(a, b) {
    var big = a * a + b * b;
    return '<div class="tri-stage">' +
      '<span class="tri-part"><span class="tri-label">' + a + ' × ' + a + '</span>' +
      squareOf(a) + '</span>' +
      '<span class="tri-plus" aria-hidden="true">+</span>' +
      '<span class="tri-part"><span class="tri-label">' + b + ' × ' + b + '</span>' +
      squareOf(b) + '</span>' +
      '<span class="tri-plus" aria-hidden="true">=</span>' +
      '<span class="tri-part"><span class="tri-label">?</span>' +
      '<span class="tri-unknown" data-total="' + big + '">?</span></span>' +
      '</div>';
  }

  function squareOf(side) {
    var html = '<span class="sq-grid">';
    for (var r = 0; r < side; r++) {
      html += '<span class="sq-row">';
      for (var c = 0; c < side; c++) html += '<span class="sq-cell"></span>';
      html += '</span>';
    }
    return html + '</span>';
  }

  /* A ramp drawn as a right triangle: how far it goes along and how far
     it climbs, both marked in squares so they can be counted. */
  function rampSvg(r, label) {
    var w = r.run * CELL;
    var h = r.rise * CELL;
    return '<span class="ramp-one">' +
      '<svg viewBox="-2 -2 ' + (w + 4) + ' ' + (h + 4) + '" width="' + (w + 4) +
      '" height="' + (h + 4) + '" class="ramp-svg" aria-hidden="true">' +
      '<polygon points="0,' + h + ' ' + w + ',' + h + ' ' + w + ',0" class="ramp-shape"/>' +
      '</svg>' +
      '<span class="ramp-key">' + App.i18n.t('gen.rampKey')
        .replace(/\{run\}/g, r.run).replace(/\{rise\}/g, r.rise) + '</span>' +
      '<span class="ramp-name">' + label + '</span></span>';
  }

  var GENERATORS = {

    /* Are these two the same shape? Same shape means one is the other
       made bigger, with nothing squashed. */
    sameShape: function (nv) {
      var a = draw(nv.id, DATA.rects);
      /* Half the questions are a real pair and half are not, so the answer
         cannot be guessed from how the level feels. */
      var wantYes = draw(nv.id + 'yes', [true, false]);
      var pool = DATA.rects.filter(function (o) {
        var isSame = sameShape(a, o);
        var sameSize = o.w === a.w && o.h === a.h;
        return wantYes ? (isSame && !sameSize) : !isSame;
      });
      var b = App.utils.shuffle(pool)[0];
      return {
        prompt: App.i18n.t('gen.sameShape'),
        visual: '<div class="shape-pair">' + rectSvg(a, false) + rectSvg(b, false) + '</div>',
        visualAria: App.i18n.t('gen.pairAria')
          .replace(/\{aw\}/g, a.w).replace(/\{ah\}/g, a.h)
          .replace(/\{bw\}/g, b.w).replace(/\{bh\}/g, b.h),
        legend: App.i18n.t('gen.shapeHint'),
        options: yesNoOptions(sameShape(a, b))
      };
    },

    /* The other way round: which of the three is the same shape, bigger. */
    pickSameShape: function (nv) {
      var a = draw(nv.id, DATA.rects);
      var good = App.utils.shuffle(DATA.rects.filter(function (o) {
        return sameShape(a, o) && (o.w !== a.w || o.h !== a.h);
      }))[0];
      var bad = App.utils.shuffle(DATA.rects.filter(function (o) {
        return !sameShape(a, o);
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.pickSameShape'),
        visual: '<div class="shape-pair">' + rectSvg(a, false) + '</div>',
        visualAria: App.i18n.t('gen.oneAria').replace(/\{w\}/g, a.w).replace(/\{h\}/g, a.h),
        legend: App.i18n.t('gen.shapeHint'),
        options: App.utils.shuffle([good].concat(bad).map(function (o) {
          return {
            html: rectSvg(o, true),
            aria: App.i18n.t('gen.oneAria').replace(/\{w\}/g, o.w).replace(/\{h\}/g, o.h),
            correct: o === good
          };
        })),
        inline: true
      };
    },

    /* The square on the long side holds as many little squares as the
       other two put together. Counted, not proved. */
    squaresOnSides: function (nv) {
      var t = draw(nv.id, DATA.legs);
      var total = t.a * t.a + t.b * t.b;
      return {
        prompt: App.i18n.t('gen.squaresOnSides'),
        visual: trianglePic(t.a, t.b),
        visualAria: App.i18n.t('gen.triAria')
          .replace(/\{a\}/g, t.a * t.a).replace(/\{b\}/g, t.b * t.b),
        legend: App.i18n.t('gen.triHint'),
        /* Adding the sides instead of their squares is the mistake this
           actually produces. */
        options: threeOf(total, [t.a + t.b, t.a * t.b])
      };
    },

    /* Which ramp climbs faster. */
    steeper: function (nv) {
      var a = draw(nv.id, DATA.ramps);
      var b = App.utils.shuffle(DATA.ramps.filter(function (o) {
        return !sameSlopeAs(a, o);
      }))[0];
      var first = App.i18n.t('gen.rampA');
      var second = App.i18n.t('gen.rampB');
      return {
        prompt: App.i18n.t('gen.whichSteeper'),
        visual: '<div class="ramp-stage">' + rampSvg(a, first) + rampSvg(b, second) + '</div>',
        visualAria: App.i18n.t('gen.rampsAria'),
        legend: App.i18n.t('gen.rampHint'),
        options: App.utils.shuffle([
          { html: '<span class="answer-name">' + first + '</span>', aria: first,
            correct: steeperThan(a, b) },
          { html: '<span class="answer-name">' + second + '</span>', aria: second,
            correct: !steeperThan(a, b) }
        ]),
        inline: true
      };
    },

    /* And two ramps of different size can still climb the same: that is
       what "the same slope" means, and it is where trigonometry starts. */
    sameSlope: function (nv) {
      var a = draw(nv.id, DATA.ramps);
      var wantYes = draw(nv.id + 'yes', [true, false]);
      var pool = DATA.ramps.filter(function (o) {
        var same = sameSlopeAs(a, o);
        var identical = o.run === a.run && o.rise === a.rise;
        return wantYes ? (same && !identical) : !same;
      });
      /* If no partner of the kind wanted exists, fall back to any other
         ramp: the answer still comes from comparing them, never from a
         flag. */
      var b = App.utils.shuffle(pool.length ? pool : DATA.ramps.filter(function (o) {
        return o !== a;
      }))[0];
      return {
        prompt: App.i18n.t('gen.sameSlope'),
        visual: '<div class="ramp-stage">' +
          rampSvg(a, App.i18n.t('gen.rampA')) + rampSvg(b, App.i18n.t('gen.rampB')) + '</div>',
        visualAria: App.i18n.t('gen.rampsAria'),
        legend: App.i18n.t('gen.slopeHint'),
        options: yesNoOptions(sameSlopeAs(a, b))
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
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var said = plainText(correct.html).replace(/\s+/g, ' ').trim();
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      (said || correct.aria || '') + '.';
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
