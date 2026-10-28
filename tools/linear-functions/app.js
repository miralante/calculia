/* ============================================================
   Calculia — Funciones lineales y afines
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'linear-functions';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var screenMenu = $('#screenMenu');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var conceptVisual = $('#conceptVisual');
  var conceptTitle = $('#conceptTitle');
  var conceptText = $('#conceptText');
  var conceptPrev = $('#conceptPrev');
  var conceptNext = $('#conceptNext');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var realNote = $('#realNote');
  var realPrev = $('#realPrev');
  var realNext = $('#realNext');
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
  if (!progress.roundsByActivity || typeof progress.roundsByActivity !== 'object' ||
      Array.isArray(progress.roundsByActivity)) progress.roundsByActivity = {};

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var conceptIndex = 0;
  var realIndex = 0;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     inReinforce controls the mini-round flow; `fixed` lets render()
     replay a question the round already asked. */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  /* The mixed round is pre-built once at startRound(): one question
     per position, each taken from a random level of the other
     activities. paintQuestion reads it by index and never regenerates. */
  var mixedRoundQueue = null;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Helpers ---- */

  function range(from, to) {
    var out = [];
    for (var i = from; i <= to; i += 1) out.push(i);
    return out;
  }

  /* Wrong answers come from the places a person looks by mistake. Only
     numbers that are really different from the answer, and never twice,
     are kept. */
  function numberWrongs(correct, candidates, howMany) {
    var out = [];
    candidates.forEach(function (v) {
      if (out.length < howMany && v >= 0 && v !== correct && out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }

  /* The same for points: on the grid, not the answer, not repeated. */
  function pointWrongs(correct, candidates, maxY, howMany) {
    var out = [];
    candidates.forEach(function (p) {
      var onGrid = p[0] >= 0 && p[0] <= X_MAX && p[1] >= 0 && p[1] <= maxY;
      var isAnswer = p[0] === correct[0] && p[1] === correct[1];
      var repeated = out.some(function (q) { return q[0] === p[0] && q[1] === p[1]; });
      if (out.length < howMany && onGrid && !isAnswer && !repeated) out.push(p);
    });
    return out;
  }

  function numberOption(v, isCorrect) {
    return {
      html: '<span class="answer-name">' + v + '</span>',
      aria: String(v),
      correct: isCorrect
    };
  }

  /* Visible text of an option (its html may wrap spans). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  /* ---- The grid ----
     A point is a crossing of two lines, and the numbers along the edges
     say which one. Nothing here is a cell: a rule's line passes through
     the crossings, and the vertical line starts at zero. */
  var X_MAX = DATA.view.xMax;
  var Y_MAX = DATA.view.yMax;
  var PICK_MAX = DATA.view.pickYMax;
  var CELL = 28;
  var LEFT = 22;
  var TOP = 10;
  var RIGHT = 10;
  var BOTTOM = 22;

  function px(x) { return LEFT + x * CELL; }
  function py(y, maxY) { return TOP + (maxY - y) * CELL; }
  function valueAt(rule, x) { return rule.m * x + rule.n; }

  function pointsUpTo(maxY) {
    var out = [];
    for (var x = 0; x <= X_MAX; x += 1) {
      for (var y = 0; y <= maxY; y += 1) out.push([x, y]);
    }
    return out;
  }
  var ALL_POINTS = pointsUpTo(Y_MAX);
  var SMALL_POINTS = pointsUpTo(PICK_MAX);

  /* Checked at start-up: a rule whose line leaves the grid would draw
     a line that stops in mid-air and teach nothing. */
  DATA.rules.forEach(function (rule) {
    if (valueAt(rule, X_MAX) > Y_MAX || rule.n < 0 || rule.m < 0) {
      throw new Error('linear-functions: rule ' + rule.m + 'x+' + rule.n + ' leaves the grid');
    }
  });
  if (!DATA.rules.some(function (r) { return r.n === 0; })) {
    throw new Error('linear-functions: no linear rule (n = 0) to compare with');
  }
  if (!DATA.rules.some(function (r) { return r.n > 0; })) {
    throw new Error('linear-functions: no affine rule (n > 0)');
  }

  function gridSvg(maxY, body) {
    var w = LEFT + X_MAX * CELL + RIGHT;
    var h = TOP + maxY * CELL + BOTTOM;
    var lines = '';
    var numbers = '';
    var x;
    var y;
    for (x = 0; x <= X_MAX; x += 1) {
      lines += '<line class="fn-grid" x1="' + px(x) + '" y1="' + py(maxY, maxY) +
        '" x2="' + px(x) + '" y2="' + py(0, maxY) + '"/>';
      numbers += '<text class="fn-num fn-num-x" x="' + px(x) + '" y="' + (h - 6) + '">' + x + '</text>';
    }
    for (y = 0; y <= maxY; y += 1) {
      lines += '<line class="fn-grid" x1="' + px(0) + '" y1="' + py(y, maxY) +
        '" x2="' + px(X_MAX) + '" y2="' + py(y, maxY) + '"/>';
      numbers += '<text class="fn-num fn-num-y" x="' + (LEFT - 6) + '" y="' + (py(y, maxY) + 4) + '">' + y + '</text>';
    }
    /* The two axes are the thick lines: the one at x = 0 and the one at
       y = 0 are where a line is read from. */
    var axes = '<line class="fn-axis" x1="' + px(0) + '" y1="' + py(maxY, maxY) +
        '" x2="' + px(0) + '" y2="' + py(0, maxY) + '"/>' +
      '<line class="fn-axis" x1="' + px(0) + '" y1="' + py(0, maxY) +
        '" x2="' + px(X_MAX) + '" y2="' + py(0, maxY) + '"/>';
    return '<svg class="fn-svg" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' +
      lines + axes + body + numbers + '</svg>';
  }

  function dotSvg(x, y, maxY, cls) {
    var r = cls === 'fn-dot-here' ? 7 : 5;
    return '<circle class="' + cls + '" cx="' + px(x) + '" cy="' + py(y, maxY) + '" r="' + r + '"/>';
  }

  function letterSvg(p, letter) {
    return '<text class="fn-letter" x="' + (px(p[0]) + 9) + '" y="' + (py(p[1], Y_MAX) - 8) + '">' +
      letter + '</text>';
  }

  /* The line of a rule, from x = 0 to the last x of the grid. */
  function lineSvg(rule) {
    return '<line class="fn-line" x1="' + px(0) + '" y1="' + py(rule.n, Y_MAX) +
      '" x2="' + px(X_MAX) + '" y2="' + py(valueAt(rule, X_MAX), Y_MAX) + '"/>';
  }

  /* The points a rule makes, one per crossing: they are what the line
     is made of, so the line is seen to pass through them. */
  function pointsSvg(rule) {
    var out = '';
    for (var x = 0; x <= X_MAX; x += 1) out += dotSvg(x, valueAt(rule, x), Y_MAX, 'fn-dot');
    return out;
  }

  /* The steps of the line: one step to the right, then how far it climbs.
     This is the slope, the number that says how much it goes up. */
  function stepSvg(rule, x) {
    var y0 = valueAt(rule, x);
    var y1 = valueAt(rule, x + 1);
    return '<line class="fn-step-run" x1="' + px(x) + '" y1="' + py(y0, Y_MAX) +
        '" x2="' + px(x + 1) + '" y2="' + py(y0, Y_MAX) + '"/>' +
      '<line class="fn-step-rise" x1="' + px(x + 1) + '" y1="' + py(y0, Y_MAX) +
        '" x2="' + px(x + 1) + '" y2="' + py(y1, Y_MAX) + '"/>' +
      '<text class="fn-step-label" x="' + ((px(x) + px(x + 1)) / 2) + '" y="' + (py(y0, Y_MAX) + 14) +
        '" text-anchor="middle">+1</text>' +
      '<text class="fn-step-label" x="' + (px(x + 1) + 6) + '" y="' + ((py(y0, Y_MAX) + py(y1, Y_MAX)) / 2 + 4) +
        '">+' + (y1 - y0) + '</text>';
  }

  /* The guides that tie a point to the two axes, so its two numbers are
     seen as the two distances it is from them. */
  function guideSvg(x, y) {
    return '<line class="fn-guide" x1="' + px(0) + '" y1="' + py(y, Y_MAX) +
      '" x2="' + px(x) + '" y2="' + py(y, Y_MAX) + '"/>' +
      '<line class="fn-guide" x1="' + px(x) + '" y1="' + py(0, Y_MAX) +
      '" x2="' + px(x) + '" y2="' + py(y, Y_MAX) + '"/>';
  }

  /* The rule as a machine: a number goes in, the rule changes it, another
     number comes out. The two numbers are shown so the change is seen. */
  function machineSvg(rule, input) {
    var output = valueAt(rule, input);
    return '<svg class="fn-svg fn-machine" viewBox="0 0 320 112" aria-hidden="true">' +
      '<circle class="fn-machine-io" cx="40" cy="50" r="26"/>' +
      '<text class="fn-machine-num" x="40" y="57">' + input + '</text>' +
      '<line class="fn-arrow" x1="72" y1="50" x2="104" y2="50"/>' +
      '<rect class="fn-machine-box" x="104" y="26" width="112" height="48" rx="10"/>' +
      '<text class="fn-machine-rule" x="160" y="56">× ' + rule.m + ' + ' + rule.n + '</text>' +
      '<line class="fn-arrow" x1="216" y1="50" x2="248" y2="50"/>' +
      '<circle class="fn-machine-io" cx="280" cy="50" r="26"/>' +
      '<text class="fn-machine-num" x="280" y="57">' + output + '</text>' +
      '<text class="fn-machine-cap" x="40" y="104">' + App.i18n.t('gen.machineIn') + '</text>' +
      '<text class="fn-machine-cap" x="280" y="104">' + App.i18n.t('gen.machineOut') + '</text>' +
      '</svg>';
  }

  function coordText(x, y) { return '(' + x + ', ' + y + ')'; }

  function coordAria(x, y) {
    return App.i18n.t('gen.coordAria').replace('{x}', x).replace('{y}', y);
  }

  function coordOption(p, isCorrect) {
    return {
      html: '<span class="answer-name">' + coordText(p[0], p[1]) + '</span>',
      aria: coordAria(p[0], p[1]),
      correct: isCorrect
    };
  }

  /* ---- The four ideas, shown before any question ---- */
  var CONCEPTS = ['casilla', 'regla', 'pendiente', 'origen'];

  function conceptSvg(id) {
    if (id === 'casilla') {
      /* One point, and the two guides that name it: x along the bottom,
         y up the left side. */
      return gridSvg(Y_MAX, guideSvg(3, 2) + dotSvg(3, 2, Y_MAX, 'fn-dot-here'));
    }
    if (id === 'regla') {
      return machineSvg({ m: 2, n: 4 }, 1);
    }
    if (id === 'pendiente') {
      var climbing = { m: 2, n: 1 };
      return gridSvg(Y_MAX, lineSvg(climbing) + pointsSvg(climbing) + stepSvg(climbing, 1));
    }
    /* id === 'origen': a line that starts above zero, with its start
       marked. The line that passes through zero is the one practised in
       the questions, so this picture is the afín. */
    var starting = { m: 1, n: 2 };
    return gridSvg(Y_MAX, lineSvg(starting) + pointsSvg(starting) +
      dotSvg(0, starting.n, Y_MAX, 'fn-dot-here') +
      '<text class="fn-n" x="' + (px(0) + 12) + '" y="' + (py(starting.n, Y_MAX) + 18) + '">n</text>');
  }

  function paintConcept() {
    var id = CONCEPTS[conceptIndex];
    conceptVisual.innerHTML = conceptSvg(id);
    conceptTitle.textContent = App.i18n.t('concept.' + id + '.title');
    conceptText.textContent = App.i18n.t('concept.' + id + '.text');
    conceptPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    conceptNext.setAttribute('aria-label', App.i18n.t('galleryNext'));
  }

  function paintReal() {
    var item = DATA.real[realIndex];
    realObject.textContent = item.picto;
    realCaption.textContent = App.i18n.t('real.' + item.id + '.name');
    realNote.textContent = App.i18n.t('real.' + item.id + '.text');
    realPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    realNext.setAttribute('aria-label', App.i18n.t('galleryNext'));
  }

  /* ---- Question generators ----
     Every generator returns { prompt, visual, visualAria, legend,
     options, hint, explain }. The prompt is always the whole question in
     one sentence: this audience reads one idea at a time. */
  var GENERATORS = {
    /* Which point is this? Two numbers, the first along the bottom. The
       wrong answers are the two numbers said the other way round, and the
       squares next to the point: the mistakes this level is about. */
    readCoord: function (nv) {
      var p = App.utils.drawRound(nv.id, ALL_POINTS);
      var wrongs = pointWrongs(p, [
        [p[1], p[0]], [p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]
      ], Y_MAX, 3);
      return {
        prompt: App.i18n.t('gen.readCoord'),
        hint: App.i18n.t('gen.socraticCoord'),
        visual: '<div class="grid-stage">' + gridSvg(Y_MAX, dotSvg(p[0], p[1], Y_MAX, 'fn-dot-here')) + '</div>',
        visualAria: App.i18n.t('gen.gridAria'),
        legend: App.i18n.t('gen.coordHint'),
        options: App.utils.shuffle([coordOption(p, true)].concat(wrongs.map(function (q) {
          return coordOption(q, false);
        }))),
        inline: true
      };
    },

    /* The other way round: the point is named and the grid that holds it
       has to be found. Two small grids, one of them wrong. */
    pickCoord: function (nv) {
      var p = App.utils.drawRound(nv.id, SMALL_POINTS);
      var other = pointWrongs(p, [
        [p[1], p[0]], [p[0] + 1, p[1]], [p[0], p[1] + 1], [p[0] - 1, p[1]]
      ], PICK_MAX, 1)[0];
      return {
        prompt: App.i18n.t('gen.findPoint').replace('{where}', coordText(p[0], p[1])),
        hint: App.i18n.t('gen.socraticFindPoint'),
        legend: App.i18n.t('gen.coordHint'),
        options: App.utils.shuffle([
          { html: gridSvg(PICK_MAX, dotSvg(p[0], p[1], PICK_MAX, 'fn-dot-here')), aria: coordAria(p[0], p[1]), correct: true },
          { html: gridSvg(PICK_MAX, dotSvg(other[0], other[1], PICK_MAX, 'fn-dot-here')), aria: coordAria(other[0], other[1]), correct: false }
        ]),
        inline: true
      };
    },

    /* The regla as a table: x goes in, y comes out. Every row but one is
       given, so the rule is read from the pattern and then applied. The
       wrong answers include the one a person gives when they forget the n:
       the mistake of the afín, offered on purpose. */
    tableOut: function (nv) {
      var rules = DATA.rules.filter(function (r) { return nv.affine ? r.n > 0 : r.n === 0; });
      var rule = App.utils.drawRound(nv.id + 'rule', rules);
      var x = App.utils.drawRound(nv.id + 'x', range(1, X_MAX));
      var y = valueAt(rule, x);
      var wrongs = numberWrongs(y, [rule.m * x, y + rule.m, y - rule.m, y + 1, y - 1, rule.n], 3);
      var rows = '';
      for (var r = 0; r <= X_MAX; r += 1) {
        rows += '<tr><td>' + r + '</td><td>' + (r === x ? '?' : valueAt(rule, r)) + '</td></tr>';
      }
      var explainKey = nv.affine ? 'gen.explainAffine' : 'gen.explainLinear';
      return {
        prompt: App.i18n.t('gen.tablePrompt').replace('{x}', x),
        hint: App.i18n.t('gen.socraticTable'),
        visual: '<div class="grid-stage"><table class="fn-table"><thead><tr>' +
          '<th scope="col">x</th><th scope="col">y</th></tr></thead><tbody>' + rows +
          '</tbody></table></div>',
        visualAria: App.i18n.t('gen.tableAria').replace('{x}', x),
        legend: App.i18n.t('gen.tableHint'),
        options: App.utils.shuffle([numberOption(y, true)].concat(wrongs.map(function (v) {
          return numberOption(v, false);
        }))),
        inline: true,
        explain: App.i18n.t(explainKey)
          .replace(/\{m\}/g, rule.m).replace(/\{n\}/g, rule.n)
          .replace(/\{x\}/g, x).replace(/\{y\}/g, y)
      };
    },

    /* Several points at once: three of them are on the same line and one
       is not. That line is the rule, without a formula in sight. */
    offTheLine: function (nv) {
      var rule = App.utils.drawRound(nv.id, DATA.rules);
      var xs = App.utils.shuffle(range(0, X_MAX)).slice(0, 3);
      var inLine = xs.map(function (x) { return [x, valueAt(rule, x)]; });
      /* The odd point sits two above or below its own column, so it is
         off the line and still on the grid. */
      var offX = App.utils.drawRound(nv.id + 'x', range(0, X_MAX));
      var base = valueAt(rule, offX);
      var off = [offX, base + 2 <= Y_MAX ? base + 2 : base - 2];
      var letters = App.i18n.t('gen.dotLetters').split('');
      /* Where the odd one sits changes from question to question, so the
         answer is never always the last letter. */
      var slot = App.utils.drawRound(nv.id + 'slot', [0, 1, 2, 3]);
      var points = inLine.slice();
      points.splice(slot, 0, off);
      var body = points.map(function (p, i) {
        return dotSvg(p[0], p[1], Y_MAX, 'fn-dot') + letterSvg(p, letters[i]);
      }).join('');
      return {
        prompt: App.i18n.t('gen.offTheLine'),
        hint: App.i18n.t('gen.socraticOffLine'),
        visual: '<div class="grid-stage">' + gridSvg(Y_MAX, body) + '</div>',
        visualAria: App.i18n.t('gen.pointsAria').replace('{n}', points.length),
        legend: App.i18n.t('gen.lineUpHint'),
        options: App.utils.shuffle(points.map(function (p, i) {
          return {
            html: '<span class="answer-name">' + letters[i] + '</span>',
            aria: letters[i],
            correct: i === slot
          };
        })),
        inline: true,
        explain: App.i18n.t('gen.explainOffLine')
      };
    },

    /* Lineal or afín? The line is shown whole; the question is only whether
       it passes through zero. */
    kindOfLine: function (nv) {
      var rule = App.utils.drawRound(nv.id, DATA.rules);
      var kind = rule.n === 0 ? 'lineal' : 'afin';
      return {
        prompt: App.i18n.t('gen.kindPrompt'),
        hint: App.i18n.t('gen.socraticKind'),
        visual: '<div class="grid-stage">' + gridSvg(Y_MAX, lineSvg(rule) + pointsSvg(rule)) + '</div>',
        visualAria: App.i18n.t('gen.gridAria'),
        legend: App.i18n.t('gen.kindHint'),
        options: App.utils.shuffle(['lineal', 'afin'].map(function (k) {
          var label = App.i18n.t('kind.' + k);
          return {
            html: '<span class="answer-name">' + label + '</span>',
            aria: label,
            correct: k === kind
          };
        })),
        inline: true
      };
    },

    /* How much it climbs for each step to the right: the m. */
    slope: function (nv) {
      var rule = App.utils.drawRound(nv.id, DATA.rules);
      var wrongs = numberWrongs(rule.m, [rule.m + 1, rule.m - 1, rule.m + 2, 0, 3], 3);
      return {
        prompt: App.i18n.t('gen.slopePrompt'),
        hint: App.i18n.t('gen.socraticSlope'),
        visual: '<div class="grid-stage">' + gridSvg(Y_MAX, lineSvg(rule) + pointsSvg(rule) +
          stepSvg(rule, 0)) + '</div>',
        visualAria: App.i18n.t('gen.gridAria'),
        legend: App.i18n.t('gen.slopeHint'),
        options: App.utils.shuffle([numberOption(rule.m, true)].concat(wrongs.map(function (v) {
          return numberOption(v, false);
        }))),
        inline: true,
        explain: App.i18n.t('gen.explainSlope').replace('{m}', rule.m)
      };
    },

    /* Where the line starts: the number it meets on the left line, the n.
       The wrong answers are the m and the numbers next to n. */
    start: function (nv) {
      var rule = App.utils.drawRound(nv.id, DATA.rules);
      var wrongs = numberWrongs(rule.n, [
        rule.m, rule.n + 1, rule.n - 1, rule.n + 2, rule.m + 1, rule.n + 3, 3, 4
      ], 3);
      return {
        prompt: App.i18n.t('gen.startPrompt'),
        hint: App.i18n.t('gen.socraticStart'),
        visual: '<div class="grid-stage">' + gridSvg(Y_MAX, lineSvg(rule) + pointsSvg(rule) +
          dotSvg(0, rule.n, Y_MAX, 'fn-dot-here')) + '</div>',
        visualAria: App.i18n.t('gen.gridAria'),
        legend: App.i18n.t('gen.startHint'),
        options: App.utils.shuffle([numberOption(rule.n, true)].concat(wrongs.map(function (v) {
          return numberOption(v, false);
        }))),
        inline: true,
        explain: App.i18n.t('gen.explainStart').replace('{n}', rule.n)
      };
    }
  };

  function show(screen) {
    [screenIntro, screenReal, screenMenu, screenGame, screenEnd].forEach(function (p) {
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
  function levelFromProgress(activityId) {
    var levels = DATA.activities[activityId].levels;
    var completed = progress.roundsByActivity[activityId];
    if (typeof completed !== 'number' || completed < 0) completed = 0;
    return levels[Math.min(Math.floor(completed), levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress(id));
  }

  /* ---- Game ---- */

  /* A round whose questions come from one (activity, level) pair chosen
     at random for each round position. The 'test' activity is the only
     caller: every other round paints from its own generator. */
  function buildMixedRound() {
    var ids = Object.keys(DATA.activities).filter(function (k) { return k !== 'test'; });
    var out = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      var aid = ids[Math.floor(Math.random() * ids.length)];
      var act = DATA.activities[aid];
      var lvl = act.levels[Math.floor(Math.random() * act.levels.length)];
      out.push(GENERATORS[lvl.tipo](lvl, i));
    }
    return out;
  }

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    App.utils.drawRoundReset();
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    /* Mixed round: pre-built once so the order of questions stays
       stable across renders. */
    mixedRoundQueue = (nv.tipo === 'mixedTest') ? buildMixedRound() : null;
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
    paintQuestion(reinforceList[0]);
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level, or
     pulled from the pre-built mixed queue when this is the test round. */
  function paintQuestion(fixed) {
    if (fixed) {
      question = fixed;
    } else if (mixedRoundQueue) {
      question = mixedRoundQueue[index];
    } else {
      question = GENERATORS[level.tipo](level, index);
    }
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

  function render() { paintQuestion(null); }

  function showExplanation(isCorrect) {
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    /* The aria text says the answer in words; a picture option has no
       words of its own, so it is what the explanation falls back to. */
    var said = correct.aria || plainText(correct.html).replace(/\s+/g, ' ').trim();
    var text = (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      said + '.';
    if (question.explain) text += ' ' + question.explain;
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question, and the generic
     line is only the fallback, for a question that forgot to bring its own. */
  function showHint(op) {
    explanationEl.textContent = App.feedback.hintText(
      (question && question.hint) || App.i18n.t('hint'), op ? plainText(op.html) : '');
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
      showHint(op);
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
        paintQuestion(reinforceList[reinforceIndex]);
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
    progress.roundsByActivity[activity.id] =
      (progress.roundsByActivity[activity.id] || 0) + 1;
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

  function moveConcept(step) {
    conceptIndex = (conceptIndex + step + CONCEPTS.length) % CONCEPTS.length;
    paintConcept();
  }

  conceptPrev.addEventListener('click', function () { moveConcept(-1); });
  conceptNext.addEventListener('click', function () { moveConcept(1); });
  realPrev.addEventListener('click', function () {
    realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length;
    paintReal();
  });
  realNext.addEventListener('click', function () {
    realIndex = (realIndex + 1) % DATA.real.length;
    paintReal();
  });
  $('#introContinue').addEventListener('click', function () { show(screenReal); });
  $('#realContinue').addEventListener('click', function () { show(screenMenu); });

  paintConcept();
  paintReal();
  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });
})();
