/* ============================================================
   Calculia — Subtract and Mental Math
   Data and levels live in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. Signs use orange.
   Questions are generated on the fly from the level type.
   ============================================================ */
(function () {
  'use strict';

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
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var activity = null;
  var level = null;
  var idx = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  /* Reinforce: when the normal round ends and some items were
     failed, a mini-round is mounted using only those. reinforceIdx/
     reinforceList are filled from onRefuerzo; inReinforce prevents
     the mini-round from chaining with another mini-round
     indefinitely. The reinforce banner is created dynamically
     from here so the shared HTML is not touched. */
  var reinforceList = [];
  var reinforceIndex = 0;
  var inReinforce = false;
  var reinforceBanner = null;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilities ---- */

  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* ---- Color-coded digits by place value ---- */

  var POS_CLASS = ['digit-u', 'digit-d', 'digit-c'];

  /* Thousands separator ('.' is / ',' in). Not only styling: switching
     the separator between locales is mandatory (see I18N.md §2). */
  function thousandsSeparator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function legendPos() {
    return '<span class="digit-u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="digit-c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  /* html for the digits of n, grouped in 3s with a thousands separator.
     highlight: absolute place (0=units, 1=tens, 2=hundreds, 3=thousands…)
     that gets underlined. */
  function digits(n, highlight) {
    var s = String(n);
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var pos = groups[g].length - 1 - j;
        var posAbs = (groups.length - 1 - g) * 3 + pos;
        var cls = POS_CLASS[pos];
        if (highlight === posAbs) cls += ' highlight';
        body += '<span class="' + cls + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) html += '<span class="digit-sep">' + thousandsSeparator() + '</span>';
      html += body;
    }
    return html;
  }

  function paintNumber(n, opts) {
    opts = opts || {};
    return '<span class="num-color">' + digits(n, opts.highlight) + '</span>';
  }

  function paintSign(s) { return '<span class="sign">' + s + '</span>'; }

  /* ---- Numeric options (3, unique, shuffled) ---- */

  function buildOptions(correct, distractors, format) {
    var values = [correct];
    for (var i = 0; i < distractors.length && values.length < 3; i++) {
      var d = distractors[i];
      if (d > 0 && values.indexOf(d) === -1) values.push(d);
    }
    var extra = correct + 2;
    while (values.length < 3) {
      if (values.indexOf(extra) === -1) values.push(extra);
      extra += 3;
    }
    return App.utils.shuffle(values).map(function (v) {
      return { html: format ? format(v) : String(v), correct: v === correct };
    });
  }

  function repeat(html, times) {
    var s = '';
    for (var i = 0; i < times; i++) s += html;
    return s;
  }

  function dotsGroup(n, cls) {
    return '<span class="dot-group">' + repeat('<span class="dot ' + cls + '"></span>', n) + '</span>';
  }

  /* Dots to subtract: the last "remove" ones get an X. */
  function dotsGroupSubtract(total, remove) {
    var s = '';
    for (var i = 0; i < total; i++) {
      var cls = i >= (total - remove) ? 'dot removed' : 'dot';
      s += '<span class="' + cls + '"></span>';
    }
    return '<span class="dot-group">' + s + '</span>';
  }

  /* ---- Base-ten pictures ----
     A ten is one bar of ten dots, a unit is a loose dot, so "one bar and
     four dots" can be read as 14 without counting one by one. */
  function unitDots(n, cls) {
    return repeat('<span class="dot ' + (cls || '') + '"></span>', n);
  }

  /* n as bars plus loose dots. `remove` marks that many of the rightmost
     pieces as taken away — a whole bar when the amount is a ten. */
  function baseTen(n, remove) {
    var bars = Math.floor(n / 10);
    var units = n % 10;
    var removedBars = 0, removedUnits = 0;
    if (remove) {
      if (remove % 10 === 0) removedBars = remove / 10;
      else removedUnits = remove;
    }
    var html = '';
    for (var b = 0; b < bars; b++) {
      var barCls = (b >= bars - removedBars) ? 'removed' : '';
      html += '<span class="ten-bar">' + unitDots(10, barCls) + '</span>';
    }
    if (units) {
      var u = '';
      for (var i = 0; i < units; i++) {
        u += '<span class="dot ' + (i >= units - removedUnits ? 'removed' : '') + '"></span>';
      }
      html += '<span class="unit-group">' + u + '</span>';
    }
    return html;
  }

  /* The amount being added, drawn in the second colour so it reads as
     "what arrives" rather than part of what was already there. */
  function addedPieces(step) {
    if (step === 10) return '<span class="ten-bar">' + unitDots(10, 'pb') + '</span>';
    return '<span class="unit-group">' + unitDots(step, 'pb') + '</span>';
  }

  /* Start value chosen so the step never needs a carry or a borrow: the
     units digit is left with room to grow, or with enough to take away. */
  function anchorStart(nv) {
    var step = nv.step;
    var adding = nv.op === 'add';
    var tens = randInt(0, Math.floor(nv.max / 10));
    var units;
    if (step === 10) {
      units = randInt(0, 9);
      if (!adding && tens === 0) tens = 1;
    } else if (adding) {
      units = randInt(0, 9 - step);
    } else {
      units = randInt(step, 9);
    }
    var a = tens * 10 + units;
    return a === 0 ? step : a;
  }

  /* Same picture as baseTen, but for a subtraction that needs a borrow:
     one whole bar is broken into ten loose dots so there are enough
     units to take `remove` away (remove > n % 10). The broken group is
     drawn with the same dashed style as `unit-group` so it visually
     reads as "not a solid ten anymore". */
  function baseTenBorrow(n, remove) {
    var bars = Math.floor(n / 10) - 1;
    var brokenUnits = (n % 10) + 10;
    var html = '';
    for (var b = 0; b < bars; b++) {
      html += '<span class="ten-bar">' + unitDots(10, '') + '</span>';
    }
    var u = '';
    for (var i = 0; i < brokenUnits; i++) {
      u += '<span class="dot ' + (i >= brokenUnits - remove ? 'removed' : '') + '"></span>';
    }
    html += '<span class="unit-group">' + u + '</span>';
    return html;
  }

  /* Two-digit start with enough room in the units for `b` to push past
     ten: tens stays below 9 so the carried result never spills into a
     third digit. */
  function carryStart() {
    var tens = randInt(1, 8);
    var units = randInt(5, 9);
    var b = randInt(Math.max(1, 10 - units), 9);
    return { a: tens * 10 + units, b: b };
  }

  /* Two-digit start whose units are too small for `b`, forcing a
     borrow: at least one whole ten stays intact after breaking one. */
  function borrowStart() {
    var tens = randInt(2, 8);
    var units = randInt(0, 4);
    var b = randInt(units + 1, 9);
    return { a: tens * 10 + units, b: b };
  }

  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correcta, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  var GENERATORS = {

    /* +1 / -1, +10 / -10, +5 / -5 on a base-ten picture. */
    anchor: function (nv) {
      var step = nv.step;
      var adding = nv.op === 'add';
      var a = anchorStart(nv);
      var correct = adding ? a + step : a - step;
      var hintKey = step === 1 ? 'anchorHintOne' : (step === 5 ? 'anchorHintFive' : 'anchorHintTen');
      return {
        prompt: App.i18n.t(adding ? 'gen.anchorAddPrompt' : 'gen.anchorSubtractPrompt')
          .replace('{a}', a).replace('{step}', step),
        visual: '<div class="expression">' + paintNumber(a) +
          paintSign(adding ? '+' : '−') + paintNumber(step) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' +
            baseTen(a, adding ? 0 : step) +
            (adding ? paintSign('+') + addedPieces(step) : '') +
          '</div>' +
          '<p class="hint">' + App.i18n.t('gen.' + hintKey) + '</p>',
        options: buildOptions(correct,
          /* Near misses that a real mistake would produce: moving by one
             instead of by the anchor, or by the anchor twice. */
          [adding ? a + 1 : a - 1, adding ? correct + step : correct - step, a],
          function (v) { return paintNumber(v); })
      };
    },

    /* Loose units joined to whole tens (30 + 4), or taken off again
       (47 - 7). Nothing crosses a ten, so the tens bar never changes. */
    placeValue: function (nv) {
      var adding = nv.op === 'add';
      var tens = randInt(1, 6);
      var units = randInt(1, 9);
      var whole = tens * 10;
      if (adding) {
        var sum = whole + units;
        return {
          prompt: App.i18n.t('gen.placeValueAddPrompt').replace('{a}', whole).replace('{b}', units),
          visual: '<div class="expression">' + paintNumber(whole) + paintSign('+') +
            paintNumber(units) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
            '<div class="dot-array" aria-hidden="true">' + baseTen(whole) +
            paintSign('+') + '<span class="unit-group">' + unitDots(units, 'pb') + '</span></div>' +
            '<p class="hint">' + App.i18n.t('gen.placeValueAddHint') + '</p>',
          legend: legendPos(),
          /* tens + units is the classic slip: adding the digits instead
             of joining tens and units. */
          options: buildOptions(sum, [tens + units, sum + 1, whole],
            function (v) { return paintNumber(v); })
        };
      }
      var start = whole + units;
      return {
        prompt: App.i18n.t('gen.placeValueSubtractPrompt').replace('{a}', start).replace('{b}', units),
        visual: '<div class="expression">' + paintNumber(start) + paintSign('−') +
          paintNumber(units) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + baseTen(start, units) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.placeValueSubtractHint') + '</p>',
        legend: legendPos(),
        options: buildOptions(whole, [start, whole - units, whole + units],
          function (v) { return paintNumber(v); })
      };
    },

    /* Addition that crosses a ten: ten loose units regroup into a new
       bar. The only new idea versus placeValue is the crossing itself —
       the picture still shows bars + loose dots, nothing new to read. */
    carry: function () {
      var start = carryStart();
      var a = start.a, b = start.b;
      var correct = a + b;
      var unitsA = a % 10;
      /* Classic slip: write (unitsA + b) % 10 in the units place but
         forget to carry the extra ten into the tens place. */
      var forgotCarry = Math.floor(a / 10) * 10 + (unitsA + b) % 10;
      return {
        prompt: App.i18n.t('gen.carryAddPrompt').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('+') +
          paintNumber(b) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + baseTen(a) +
          paintSign('+') + '<span class="unit-group">' + unitDots(b, 'pb') + '</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.carryAddHint') + '</p>',
        options: buildOptions(correct, [forgotCarry, correct + 10, a],
          function (v) { return paintNumber(v); })
      };
    },

    /* Subtraction that needs a borrow: one bar breaks into ten loose
       dots so there is enough to take away. Same picture family as
       placeValue's removal, just with the broken bar shown up front. */
    borrow: function () {
      var start = borrowStart();
      var a = start.a, b = start.b;
      var correct = a - b;
      var unitsA = a % 10;
      /* Classic slip: subtract the smaller digit from the larger one
         regardless of order, leaving the tens untouched. */
      var flipped = Math.floor(a / 10) * 10 + Math.abs(unitsA - b);
      return {
        prompt: App.i18n.t('gen.borrowSubtractPrompt').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('−') +
          paintNumber(b) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + baseTenBorrow(a, b) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.borrowSubtractHint').replace('{b}', b) + '</p>',
        options: buildOptions(correct, [flipped, correct - 10, a],
          function (v) { return paintNumber(v); })
      };
    },

    restar: function (nv) {
      var a = randInt(nv.a[0], nv.a[1]);
      var b = randInt(1, Math.min(nv.maxB, a));
      var correct = a - b;
      return {
        prompt: App.i18n.t('gen.restarEnunciado').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('−') + paintNumber(b) +
          paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + dotsGroupSubtract(a, b) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.restarPista').replace('{b}', b) + '</p>',
        options: buildOptions(correct, [correct - 1, correct + 1, a],
          function (v) { return paintNumber(v); })
      };
    },

    doubles: function () {
      var a = randInt(2, 12);
      return {
        prompt: App.i18n.t('gen.doblesEnunciado').replace(/\{a\}/g, a),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('+') + paintNumber(a) +
          paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + dotsGroup(a, 'pa') +
          paintSign('+') + dotsGroup(a, 'pb') + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.doblesPista') + '</p>',
        options: buildOptions(2 * a, [2 * a - 1, 2 * a + 2, 2 * a + 1],
          function (v) { return paintNumber(v); })
      };
    },

    sumLarge: function (nv) {
      var n, highlight, hint;
      if (nv.suma === 10) {
        n = randInt(1, 8) * 10 + randInt(1, 9);
        if (Math.random() < 0.4) n += randInt(1, 4) * 100;
        highlight = 1;
        hint = App.i18n.t('gen.hintDecenas');
      } else if (nv.suma === 100) {
        n = randInt(1, 8) * 100 + randInt(0, 99);
        highlight = 2;
        hint = App.i18n.t('gen.hintCentenas');
      } else {
        n = randInt(1, 8) * 1000 + randInt(0, 999);
        highlight = 3;
        hint = App.i18n.t('gen.hintMiles');
      }
      var correct = n + nv.suma;
      return {
        prompt: App.i18n.t('gen.sumaGrandeEnunciado').replace('{n}', n).replace('{suma}', nv.suma),
        visual: '<div class="expression">' + paintNumber(n, { highlight: highlight }) +
          paintSign('+') + paintNumber(nv.suma) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + hint + '</p>',
        legend: legendPos(),
        options: buildOptions(correct,
          App.utils.shuffle([n + 1, n + nv.suma * 2, correct + nv.suma / 10]),
          function (v) { return paintNumber(v); })
      };
    },

    subtractLarge: function (nv) {
      var n, highlight, hint;
      if (nv.resta === 10) {
        n = randInt(1, 8) * 10 + randInt(1, 9);
        if (Math.random() < 0.4) n += randInt(1, 4) * 100;
        highlight = 1;
        hint = App.i18n.t('gen.hintDecenas');
      } else if (nv.resta === 100) {
        n = randInt(1, 8) * 100 + randInt(0, 99);
        highlight = 2;
        hint = App.i18n.t('gen.hintCentenas');
      } else {
        n = randInt(1, 8) * 1000 + randInt(0, 999);
        highlight = 3;
        hint = App.i18n.t('gen.hintMiles');
      }
      var correct = n - nv.resta;
      return {
        prompt: App.i18n.t('gen.restaGrandeEnunciado').replace('{n}', n).replace('{resta}', nv.resta),
        visual: '<div class="expression">' + paintNumber(n, { highlight: highlight }) +
          paintSign('−') + paintNumber(nv.resta) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + hint + '</p>',
        legend: legendPos(),
        options: buildOptions(correct,
          App.utils.shuffle([n - 1, correct - nv.resta, n + nv.resta]),
          function (v) { return paintNumber(v); })
      };
    },

    multiplyLarge: function (nv) {
      var n = randInt(2, 99);
      var correct = n * nv.factor;
      var zeros = App.i18n.t(nv.factor === 10 ? 'gen.cerosUno' : 'gen.cerosDos');
      var distractors = nv.factor === 10 ?
        [n, n * 100, correct + 1] :
        [n, n * 10, correct + 10];
      return {
        prompt: App.i18n.t('gen.multiplicaGrandeEnunciado').replace('{n}', n).replace('{factor}', nv.factor),
        visual: '<div class="expression">' + paintNumber(n) + paintSign('×') + paintNumber(nv.factor) +
          paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.multiplicaGrandePista').replace('{ceros}', zeros).replace('{n}', n) + '</p>',
        options: buildOptions(correct, App.utils.shuffle(distractors),
          function (v) { return paintNumber(v); })
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

  /* ---- Levels for an activity ---- */
  /* (openActivity now auto via levelFromProgress) */

  /* ---- Game ---- */
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

  function startRound(nv) {
    level = nv;
    idx = 0;
    roundCorrect = 0;
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    /* Reinforce: registers the callback that runs when the
       normal round ends with pending failures. The callback
       launches the mini-round with the failed questions. */
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  /* Launches the reinforce mini-round with the failed questions.
     Each activity decides how to render the mini-round: here
     we reuse render with the fixed question (instead of
     regenerating it randomly). Stars already earned are not
     taken away; the normal round progress is recorded and
     only reset when the mini-round ends. */
  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceIndex = 0;
    inReinforce = true;
    attempts = 0;
    App.reinforce.banner.set(
      App.i18n.t('refuerzoTitulo') + ' — ' +
      App.i18n.t('refuerzoIntro').replace('{n}', reinforceList.length)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  /* Helper: renders a fixed question (from the reinforce queue)
     using the same visual flow as render() but without
     regenerating it with Math.random. The progress bar uses
     reinforceIndex+1 / length to show how much is left. */
  function showReinforceQuestion(p) {
    question = p;
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
    progressFill.style.width = (((reinforceIndex + 1) / reinforceList.length) * 100) + '%';
    progressText.textContent = '';
    paintStars();
  }

  function render() {
    answered = false;
    attempts = 0;
    question = GENERATORS[level.tipo](level, idx);

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

    progressFill.style.width = ((idx / DATA.perRound) * 100) + '%';
    progressText.textContent = '';
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). */
  function showHint() {
    explanationEl.textContent = App.i18n.t('hint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (answered) return;
    if (op.correct) {
      showExplanation(op.correct);
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
      /* Reinforce: registers the failure the first time (retries
         on the same item are not duplicated, see deduplication in
         feedback.js). In mini-round it is also registered, in case
         the same item is failed again within the reinforce. */
      App.reinforce.add(level.id + ':' + idx, question);
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation(op.correct);
      }
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function next() {
    /* Reinforce: if we are in a mini-round, advance to the next
       reinforce item or close the mini-round and go to the
       endScreen. Stars were already added when each item was
       answered; roundCorrect is not incremented here (it is the
       counter for the normal round). */
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
    idx += 1;
    if (idx >= DATA.perRound) {
      /* consume() returns [] if there are no failures and fires the
         callback (which mounts the mini-round) if there are. If
         consume() fired the callback, we must not end the normal
         round — the callback already handles it. */
      var consumeResult = App.reinforce.consume();
      if (consumeResult.length === 0) endRound();
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
