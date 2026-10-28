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

  /* ---- 'groups' walkthrough screens ----
     La actividad 'Contar en grupos' (antes en Cantidades) tiene un
     recorrido propio: carrusel → ejemplos reales → recordatorio
     cromático → niveles → cuestionario → fin. Vive EN UN BLOQUE
     DISTINTO del flujo flat de anchors/restar/cabeza, así que
     declaramos sus pantallas por separado (prefijadas con g) para
     no tocar las del flujo flat. */
  var gIntroScreen = $('#screenGroupsIntro');
  var gFamousScreen = $('#screenGroupsFamous');
  var gReminderScreen = $('#screenGroupsReminder');
  var gLevelsScreen = $('#screenGroupsLevels');
  var gQuizScreen = $('#screenGroupsQuiz');
  var gEndScreen = $('#screenGroupsEnd');
  var gProgressFill = $('#groupsProgressFill');
  var gProgressText = $('#groupsProgressText');
  var gStep = $('#groupsStep');
  var gChainBanner = $('#groupsChainBanner');

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
        hint: App.i18n.t('gen.socraticAnchor'),
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
          hint: App.i18n.t('gen.socraticPlaceAdd'),
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
        hint: App.i18n.t('gen.socraticPlaceSub'),
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
        hint: App.i18n.t('gen.socraticCarry'),
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
        hint: App.i18n.t('gen.socraticBorrow'),
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
        hint: App.i18n.t('gen.socraticRestar'),
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
        hint: App.i18n.t('gen.socraticDoubles'),
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
        hint: App.i18n.t('gen.socraticSumLarge'),
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
        hint: App.i18n.t('gen.socraticSubtractLarge'),
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
        hint: App.i18n.t('gen.socraticMultiplyLarge'),
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
    /* 'Contar en grupos' tiene su propio recorrido (carrusel,
       famosos, recordatorio, niveles, cuestionario). Su entrada
       en DATA.activities lleva `walkthrough: true`; el resto va al
       flujo flat normal (cuestionario de tres opciones, fin de
       ronda, etc.). */
    if (activity.walkthrough) {
      groupsStart();
      return;
    }
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
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). The invitation is the one written for THIS
     question —what to do with what is on screen— and not the same
     sentence for every question. The generic line is only the
     fallback, for a question that forgot to bring its own. */
  function showHint(op) {
    explanationEl.textContent = App.feedback.hintText(
      (question && question.hint) || App.i18n.t('hint'), op ? plainText(op.html) : '');
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
      var respuestaTrasPista = attempts > 1;
      showHint(op);
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(op.correct); });
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

  }

  /* ---- Events ---- */

  $('#btnNext').addEventListener('click', next);

  /* ============================================================
     Práctica "Contar en grupos" — recorrido propio
     Antes vivía en Cantidades. Sigue la metodología de números
     romanos: las pantallas intro/famoso/recordatorio se montan
     una vez al abrir, y los pasos (Aprender / Usar / Todos)
     encadenan sus sub-niveles sin volver al menú. Las estrellas
     viven en su propio slot de almacenamiento (mental-math-groups)
     para no mezclarse con anchors/restar/cabeza.
     ============================================================ */

  /* Localised lookup used by the helper above. Wrapped in a function
     (instead of calling App.i18n.t directly) so data.js stays loadable
     before i18n registers the dictionary; it reads App.i18n.t at call
     time, which is always after register(). */
  function groupsT(key) {
    return (typeof App !== 'undefined' && App.i18n && App.i18n.t) ? App.i18n.t(key) : key;
  }

  /* The walkthrough code uses `randomInt` (the name it had in
     Cantidades). Mental-math calls the equivalent helper `randInt`
     above. Alias once so the rest of the block reads naturally. */
  function randomInt(min, max) { return randInt(min, max); }

  /* Persistent progress lives in its own slot. The stars kept by
     Cantidades for this practice still sit under the 'quantities'
     key of localStorage until a reset — that history is intentionally
     not migrated, since the new activity starts from zero. */
  var groupsProgress = GROUPS_PROGRESS.load();
  function groupsSave() { GROUPS_PROGRESS.save(groupsProgress); }
  function groupsPaintStars() {
    starsEl.textContent = '⭐ ' + ((progress.stars || 0) + groupsProgress.stars);
  }

  /* ---- Switcher for the four walkthrough screens + quiz + end. ----
     One place decides which screen is visible so the header star
     counter and the scroll position are consistent whichever way the
     person navigates. */
  var GROUPS_ALL_SCREENS = [
    gIntroScreen, gFamousScreen, gReminderScreen,
    gLevelsScreen, gQuizScreen, gEndScreen
  ];
  function groupsSwitchTo(screen) {
    GROUPS_ALL_SCREENS.forEach(function (s) {
      s.classList.toggle('hidden', s !== screen);
    });
    /* Paint here too: when this activity is reached from the
       activities menu the global `paintStars` runs first, but on
       navigation between groups screens the header would otherwise
       keep the count from anchors/restar/cabeza alone. */
    if (screen === gLevelsScreen) groupsPaintLevels();
    groupsPaintStars();
    window.scrollTo(0, 0);
  }

  /* ---- Walkthrough entry ---- */
  function groupsStart() {
    /* Reset the carousel/famous indices so each entry to the
       walkthrough starts at the first group and first example.
       The sub-level index lives separately, see startGroupsLevel. */
    carouselIdx = 0;
    famousIdx = 0;
    paintCarousel();
    paintFamous();
    paintGroupsRow();
    paintRuleExamples();
    groupsSwitchTo(gIntroScreen);
  }

  /* ---- Screen 1: intro carousel ---- */

  var carouselIdx = 0;

  /* The big display shows the group name, its colour, how many it
     holds and a worked example ("4 decenas = 40"). The example is
     generated, not written by hand, so the carousel and the quiz can
     never disagree about what a decena is. */
  function paintCarousel() {
    var id = GROUPS_DATA.carousel[carouselIdx];
    var g = groupById(id);
    var el = $('#carouselDisplay');
    el.innerHTML =
      '<span class="carousel-name ' + g.cls + '">' + groupsT('group.' + id + 'Name') + '</span>' +
      '<span class="carousel-value">' + groupsFormat(g.size) + '</span>';
    el.setAttribute('aria-label', groupsT('group.' + id + 'Name') + ': ' + groupsFormat(g.size));
    $('#carouselCaption').textContent = groupsT('group.' + id + 'Caption');
  }

  function carouselStep(delta) {
    carouselIdx = (carouselIdx + delta + GROUPS_DATA.carousel.length) % GROUPS_DATA.carousel.length;
    paintCarousel();
  }

  /* Localised number formatter used everywhere the groups walkthrough
     shows a count ("una decena", "12", "100"). The thousands separator
     rule from the typing practices (no separator below 10.000) still
     applies — group counts never reach four digits, so the locale
     separator is harmless here. */
  function groupsFormat(n) {
    var sep = App.i18n.locale() === 'en' ? ',' : '.';
    var s = String(Math.abs(Math.round(n)));
    var out = '';
    while (s.length > 3) {
      out = sep + s.slice(s.length - 3) + out;
      s = s.slice(0, s.length - 3);
    }
    out = s + out;
    return n < 0 ? '−' + out : out;
  }

  /* ---- Screen 2: real situations ---- */

  var famousIdx = 0;

  /* Each entry pairs a group with a real situation. The situation
     sentence lives in strings.<locale>.js and always ends with ":",
     so the coloured formula can be appended without the two halves
     fighting over the punctuation — same trick as
     roman-numerals' famous screen. */
  function paintFamous() {
    var item = GROUPS_DATA.famous[famousIdx];
    var g = groupById(item.group);
    var example = groupsT('famous.' + item.factKey);
    var exampleText = example !== 'famous.' + item.factKey ? example : '';
    $('#famousExample').innerHTML =
      '<span class="famoso-group ' + g.cls + '">' + groupsT('group.' + item.group + 'Name') + '</span>' +
      '<span class="famoso-value"><span class="famoso-equals">=</span>' +
      '<span class="famoso-number">' + groupsFormat(g.size) + '</span></span>';
    $('#famousExample').setAttribute('aria-label', groupsT('group.' + item.group + 'Name') + ': ' + groupsFormat(g.size));
    $('#famousText').textContent = exampleText;
  }

  function famousStep(delta) {
    famousIdx = (famousIdx + delta + GROUPS_DATA.famous.length) % GROUPS_DATA.famous.length;
    paintFamous();
  }

  /* ---- Screen 3: the reminder ---- */

  /* The colour table has one row per group, each showing the group's
     colour, its name and how many it holds. Below it, the two rules
     with worked examples — the same shape as the roman-numerals
     reminder, which teaches two rules with two examples each so the
     rule is seen with more than one number.

     Rule 1 (same in every group): count the groups, then multiply.
       "3 decenas = 3 × 10 = 30"
     Rule 2 (the one that surprises): a dozen is twelve, not ten.
       "2 docenas = 2 × 12 = 24"  vs  "2 decenas = 20" */
  var RULE_EXAMPLES = [
    { count: 3, group: 'ten' },
    { count: 4, group: 'hundred' },
    { count: 5, group: 'ten' }
  ];
  var DOZEN_EXAMPLES = [
    { count: 2, group: 'dozen' },
    { count: 3, group: 'halfDozen' },
    { count: 2, group: 'ten' }
  ];

  function paintGroupsRow() {
    var el = $('#groupsRow');
    el.innerHTML = '';
    GROUPS_DATA.carousel.forEach(function (id) {
      var g = groupById(id);
      var chip = document.createElement('div');
      chip.className = 'group-chip';
      chip.innerHTML =
        '<span class="group-chip-name ' + g.cls + '">' + groupsT('group.' + id + 'Name') + '</span>' +
        '<span class="group-chip-size">' + groupsFormat(g.size) + '</span>';
      el.appendChild(chip);
    });
  }

  /* The worked example: "3 decenas = 3 × 10 = 30". The count, the
     multiplier and the total each keep the group's colour so the eye
     can pair "decenas" with the number that multiplies and with the
     number that comes out. */
  function exampleFormula(example) {
    var g = groupById(example.group);
    var phrase = groupPhrase(example.count, example.group);
    var total = example.count * g.size;
    return '<span class="ex-phrase ' + g.cls + '">' + phrase.text + '</span>' +
      '<span class="ex-op"> = </span>' +
      '<span class="ex-count ' + g.cls + '">' + example.count + '</span>' +
      '<span class="ex-op"> × </span>' +
      '<span class="ex-size ' + g.cls + '">' + groupsFormat(g.size) + '</span>' +
      '<span class="ex-op"> = </span>' +
      '<span class="ex-total">' + groupsFormat(total) + '</span>';
  }

  function paintRuleExamples() {
    var box1 = $('#ruleMultiply');
    box1.innerHTML = RULE_EXAMPLES.map(function (ex) {
      return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
    }).join('');
    var box2 = $('#ruleDozen');
    box2.innerHTML = DOZEN_EXAMPLES.map(function (ex) {
      return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
    }).join('');
  }

  /* ---- Screen 4: the levels ---- */

  /* Difficulty rating shown on the level button. A group is rated by
     its hardest sub-level, so the number is written once in data.js
     and the group can never claim to be easier than the step it
     ends on. */
  function groupsLevelStars(level) {
    if (level.sublevels) {
      return level.sublevels.reduce(function (max, sn) {
        return Math.max(max, sn.stars || 1);
      }, 1);
    }
    return level.stars || 1;
  }

  function groupsPaintLevels() {
    var cont = $('#levelsGrid');
    cont.innerHTML = '';
    GROUPS_DATA.levels.forEach(function (level) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      var done = groupsLevelDone(level);
      btn.innerHTML =
        '<span class="picto" aria-hidden="true">' + (level.icon || groupsLevelIcon(level)) + '</span>' +
        '<span>' + groupsT('level.' + level.id + 'Name') + '</span>' +
        '<span class="detail-card">' + groupsT('level.' + level.id + 'Detail') + '</span>' +
        '<div class="practice-stars" aria-label="' + groupsT('starsCount').replace('{n}', groupsLevelStars(level)) + '">' +
        '⭐'.repeat(groupsLevelStars(level)) + '</div>' +
        (done ? '<div class="practice-done">' + groupsT('levelDone') + '</div>' : '');
      btn.addEventListener('click', function () { groupsStartLevel(level); });
      cont.appendChild(btn);
    });
  }

  /* Every sub-level of a group must be finished before the group
     counts as done — the group is a chain, not a single round. */
  function groupsLevelDone(level) {
    if (level.sublevels) {
      return level.sublevels.every(function (sn) {
        return groupsProgress.groupsCompleted[sn.id];
      });
    }
    return !!groupsProgress.groupsCompleted[level.id];
  }

  function groupsLevelIcon(level) {
    return { learn: '📚', apply: '🧩', test: '🎲' }[level.id] || '⭐';
  }

  /* ---- Quiz ---- */

  var currentGroup = null;
  var currentSubIdx = 0;
  var items = [];
  var gIdx = 0;
  var gCorrect = 0;
  var gResolved = false;
  var gAttempts = 0;
  /* Text of the "next step of the chain" banner, set by groupsFinish
     before it jumps to the next sub-level and cleared once painted.
     Kept in a variable instead of being written straight into the
     DOM because groupsStartLevel re-renders the quiz from scratch,
     which would otherwise wipe the banner it is meant to show. */
  var chainBanner = '';
  var currentLevel = null;

  /* A number that has a non-zero digit in one of the positions the
     level allows, plus other digits in the other allowed positions.
     Building the number this way (instead of drawing a random one and
     hoping the digit is non-zero) means the question never lands on
     a 0, which carries no information about the group. */
  function groupsNumberWithTargetDigit(positions) {
    var targetId = positions[randomInt(0, positions.length - 1)];
    var target = groupById(targetId);
    var digit = randomInt(1, 9);
    var n = digit * target.size;
    positions.forEach(function (id) {
      if (id === targetId) return;
      if (Math.random() < 0.6) n += randomInt(0, 9) * groupById(id).size;
    });
    return {
      n: n,
      targetId: targetId,
      digit: digit,
      /* The value of the digit at its position, e.g. 4 at hundreds
         = 400. This is what the question asks for. */
      value: digit * target.size
    };
  }

  /* One round entry. Each mode returns the same shape so buildRound
     can treat them uniformly. */
  function groupsEntryFor(level) {
    var mode = level.mode;
    if (mode === 'groupToNumber' || mode === 'dozenToNumber') {
      var pool = level.pools || ['unit', 'ten'];
      var groupId = pool[randomInt(0, pool.length - 1)];
      var count = randomInt(1, level.maxCount || 9);
      var g = groupById(groupId);
      return {
        mode: mode, groupId: groupId, count: count,
        n: count * g.size, size: g.size
      };
    }
    if (mode === 'numberToGroup' || mode === 'numberToDozen') {
      var pool2 = level.pools || ['unit', 'ten'];
      var groupId2 = pool2[randomInt(0, pool2.length - 1)];
      var count2 = randomInt(1, level.maxCount || 9);
      var g2 = groupById(groupId2);
      return {
        mode: mode, groupId: groupId2, count: count2,
        n: count2 * g2.size, size: g2.size
      };
    }
    /* digitValue */
    var positions = level.positions || ['ten', 'hundred'];
    var built = groupsNumberWithTargetDigit(positions);
    return {
      mode: 'digitValue', groupId: built.targetId,
      n: built.n, digit: built.digit, value: built.value,
      size: groupById(built.targetId).size
    };
  }

  /* Identity of a round entry, so two identical questions never land
     one after the other (see App.utils.spreadRepeats). */
  function groupsEntryKey(entry) {
    return entry.mode + '|' + entry.groupId + '|' + entry.count + '|' + entry.digit;
  }

  /* The flat list of base sub-levels (those with their own mode),
     excluding the groups and the 'test' level, which are wrappers. */
  function groupsBaseLevels() {
    var out = [];
    GROUPS_DATA.levels.forEach(function (level) {
      if (level.pool === 'group') {
        if (level.sublevels) out = out.concat(level.sublevels);
      } else if (level.pool !== 'random' && level.mode !== 'random') {
        out.push(level);
      }
    });
    return out;
  }

  function groupsItemsForGroupsLevel(level) {
    var total = GROUPS_DATA.perRoundGroups;
    if (level.pool === 'random' || level.mode === 'random') {
      var modes = groupsBaseLevels();
      var out = [];
      for (var i = 0; i < total; i++) {
        var entry, tries = 0;
        do {
          var base = modes[randomInt(0, modes.length - 1)];
          entry = groupsEntryFor(base);
          tries += 1;
        } while (out.length && tries < 10 &&
                 groupsEntryKey(entry) === groupsEntryKey(out[out.length - 1]));
        out.push(entry);
      }
      return out;
    }
    var pool = [];
    for (var k = 0; k < total; k++) {
      var candidate, ct = 0;
      do {
        candidate = groupsEntryFor(level);
        ct += 1;
      } while (pool.length && ct < 10 &&
               groupsEntryKey(candidate) === groupsEntryKey(pool[pool.length - 1]));
      pool.push(candidate);
    }
    return pool;
  }

  /* Starts a round. If 'level' is a group, starts with its first
     sub-level and remembers which one, so the chain continues
     automatically when the round ends (see groupsFinish).

     `inChain` separates "entered from the levels screen" from "next
     sub-level of a chain". Without it, the non-chain branch clears
     currentGroup and the chain breaks silently: groupsFinish() no
     longer finds the group and jumps to the end screen after the
     FIRST sub-level, so steps 2 and 3 are never played. */
  function groupsStartLevel(level, inChain) {
    if (level.pool === 'group') {
      currentGroup = level;
      currentSubIdx = 0;
      groupsStartLevel(level.sublevels[0], true);
      return;
    }
    if (!inChain) {
      currentGroup = null;
      currentSubIdx = 0;
    }
    currentLevel = level;
    items = groupsItemsForGroupsLevel(level);
    gIdx = 0;
    gCorrect = 0;
    groupsSwitchTo(gQuizScreen);
    groupsRender();
  }

  /* Real-life sentence for a round, when the entry's group has one.

     Only when the round asks for a SINGLE group. Every scene in
     GROUPS_DATA.scenes describes one group of that size — "there are
     ten fingers on both hands" is about one decena — so attaching it
     to "6 decenas" would state something false, and a false example is
     worse than no example. digitValue never gets one either: its
     prompt is an arbitrary number, not a group of things.

     groupsT() returns the key itself when missing, so a key with no
     translation simply yields no context line. */
  function groupsSceneFor(entry) {
    if (entry.mode === 'digitValue' || entry.count !== 1) return '';
    var scene = GROUPS_DATA.scenes.filter(function (s) { return s.group === entry.groupId; })[0];
    return scene ? groupsT('scene.' + scene.id) : '';
  }

  /* Builds the wrong options. They are never invented numbers: each
     comes from another group the activity teaches, or from the same
     group with a different count. So every option on screen is
     something the person has already met. */
  function groupsValueDistractors(entry, correct) {
    var pool = [];
    GROUPS_DATA.groups.forEach(function (g) {
      if (g.id === entry.groupId) return;
      /* Same count in another group: "3 decenas" and "3 centenas"
         are the classic confusion, so it must be one of the two. */
      pool.push(entry.count * g.size);
    });
    /* Same group, one more or one less group. */
    if (entry.count + 1 <= 12) pool.push((entry.count + 1) * entry.size);
    if (entry.count - 1 >= 1) pool.push((entry.count - 1) * entry.size);
    /* digitValue: the bare digit is the trap — the person reads the
       4 and forgets it stands for 400. */
    if (entry.mode === 'digitValue') {
      pool.push(entry.digit);
      pool.push(entry.digit * 10);
    }
    return groupsTakeTwo(pool, correct);
  }

  function groupsPhraseDistractors(entry, correctText) {
    var pool = [];
    GROUPS_DATA.groups.forEach(function (g) {
      if (g.id !== entry.groupId) pool.push(groupPhrase(entry.count, g.id).text);
    });
    pool.push(groupPhrase(entry.count + 1, entry.groupId).text);
    if (entry.count > 1) pool.push(groupPhrase(entry.count - 1, entry.groupId).text);
    return groupsTakeTwo(pool, correctText);
  }

  /* Two distinct wrong values that are not the correct one, in the
     original order, so the option set never repeats itself. */
  function groupsTakeTwo(pool, correct) {
    var out = [];
    pool.forEach(function (v) {
      if (out.length < 2 && v !== correct && out.indexOf(v) === -1) out.push(v);
    });
    /* Fallback when the pool was too small (only possible with a
       group of size 1). Fill from the other groups' sizes. */
    var extra = [6, 10, 12, 100, 1000];
    var k = 0;
    while (out.length < 2 && k < extra.length) {
      if (extra[k] !== correct && out.indexOf(extra[k]) === -1) out.push(extra[k]);
      k += 1;
    }
    return out;
  }

  function groupsBuildRound(entry) {
    var mode = entry.mode;
    var shown, question, correctValue, options, context = '';

    if (mode === 'groupToNumber' || mode === 'dozenToNumber') {
      shown = groupPhrase(entry.count, entry.groupId).text;
      question = groupsT('qHowMany');
      correctValue = entry.n;
      options = App.utils.shuffle([correctValue].concat(groupsValueDistractors(entry, correctValue)));
      context = groupsSceneFor(entry);
    } else if (mode === 'numberToGroup' || mode === 'numberToDozen') {
      shown = groupsFormat(entry.n);
      question = groupsT('qWhichGroup');
      correctValue = groupPhrase(entry.count, entry.groupId).text;
      options = App.utils.shuffle([correctValue].concat(groupsPhraseDistractors(entry, correctValue)));
      context = groupsSceneFor(entry);
    } else {
      /* digitValue: the prompt is the number with its digits in the
         colour of their group. aria-label carries the plain number so
         the screen reader does not read the spans separately. */
      shown = groupsColoredDigits(entry.n);
      question = groupsT('qDigitValue')
        .replace('{digit}', entry.digit)
        .replace('{plural}', groupsT('group.' + entry.groupId + 'Plural'));
      correctValue = entry.value;
      options = App.utils.shuffle([correctValue].concat(groupsValueDistractors(entry, correctValue)));
      context = groupsSceneFor(entry);
    }
    return {
      shown: shown, question: question, correctValue: correctValue,
      options: options, context: context, entry: entry
    };
  }

  /* Paint a number whose digit colours follow the group palette
     (units = mod-cuerpo, tens = mod-coordinacion, etc), used in the
     digitValue mode so the eye can pair the digit with its position
     even before reading the question. */
  var GROUPS_DIGIT_CLASSES = ['grp-unit', 'grp-ten', 'grp-hundred', 'grp-thousand'];
  function groupsColoredDigits(n) {
    var s = String(Math.abs(n));
    var sep = App.i18n.locale() === 'en' ? ',' : '.';
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var posAbs = (groups.length - 1 - g) * 3 + (groups[g].length - 1 - j);
        var cls = GROUPS_DIGIT_CLASSES[posAbs] || 'grp-dozen';
        body += '<span class="' + cls + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) html += '<span class="digit-sep">' + sep + '</span>';
      html += body;
    }
    return '<span class="num-color">' + html + '</span>';
  }

  function groupsPaintGroupsProgress() {
    gProgressFill.style.width = ((gIdx / items.length) * 100) + '%';
    gProgressText.textContent = (gIdx + 1) + ' / ' + items.length;
    /* The sub-levels are not named individually: they are numbered
       steps inside their group, so the header reads "Paso 2 de 4 ·
       Aplicar". Naming each sub-level separately would mean six
       near-identical labels in four languages for what is really one
       progression. */
    var groupId = currentLevel.group || currentLevel.id;
    var position = 1;
    var totalSteps = GROUPS_DATA.levels.filter(function (l) { return l.id === groupId; })[0];
    var flat = totalSteps && totalSteps.sublevels ? totalSteps.sublevels : [currentLevel];
    flat.forEach(function (sn, i) { if (sn.id === currentLevel.id) position = i + 1; });
    gStep.textContent = groupsT('stepLabel')
      .replace('{n}', position)
      .replace('{total}', flat.length)
      .replace('{name}', groupsT('level.' + groupId + 'Name'));
  }

  function groupsRender() {
    var roundData = groupsBuildRound(items[gIdx]);
    gResolved = false;
    gAttempts = 0;
    var shownEl = $('#groupsShown');
    shownEl.innerHTML = roundData.shown;
    shownEl.setAttribute('aria-label', groupsPlainShown(roundData));
    /* 72px está pensado para una cifra. Cuando el prompt es una frase
       ("4 decenas") no cabe en 320px, así que baja de tamaño; el
       layout se decide aquí, no con un poco de CSS suelta. */
    shownEl.classList.toggle('quiz-shown--phrase', roundData.entry.mode !== 'digitValue');
    $('#groupsContext').textContent = roundData.context;
    $('#groupsContext').classList.toggle('hidden', !roundData.context);
    $('#groupsQuestion').textContent = roundData.question;
    $('#groupsFeedback').textContent = '';
    $('#groupsFeedback').className = 'feedback';
    $('#groupsExplanationWrap').classList.add('hidden');
    $('#groupsExplanation').textContent = '';
    $('#groupsNext').classList.add('hidden');
    var banner = gChainBanner;
    if (chainBanner) {
      banner.textContent = chainBanner;
      banner.classList.remove('hidden');
      chainBanner = '';
    } else {
      banner.textContent = '';
      banner.classList.add('hidden');
    }

    var gridEl = $('#groupsOptions');
    gridEl.innerHTML = '';
    roundData.options.forEach(function (value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      /* Una frase ("4 decenas", "3 medias docenas") no cabe en una
         celda de tres columnas a 375px con el tamaño de titular: se
         salía del botón. Los dígitos sí caben, así que el tamaño sólo
         baja cuando la opción es texto. */
      btn.className = 'option-btn' + (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(String(value)) ? ' option-btn--word' : '');
      btn.textContent = value;
      btn.addEventListener('click', function () { groupsAnswer(btn, value, roundData); });
      gridEl.appendChild(btn);
    });

    groupsPaintGroupsProgress();
    groupsPaintStars();
  }

  /* The spoken/announced version of the prompt, without the coloured
     markup, so aria-label is readable. */
  function groupsPlainShown(roundData) {
    var entry = roundData.entry;
    if (entry.mode === 'digitValue') return groupsFormat(entry.n);
    return roundData.shown;
  }

  /* Socratic hint. It must not give the answer away (SPEC: the hint
     teaches the mechanic, it does not resolve the round), so it says
     which group to look at, never what it multiplies to. */
  function groupsPickHint(entry) {
    if (entry.mode === 'digitValue') {
      return groupsT('hintDigitValue');
    }
    if (entry.mode === 'numberToGroup' || entry.mode === 'numberToDozen') {
      return groupsT('hintWhichGroup');
    }
    if (entry.groupId === 'dozen' || entry.groupId === 'halfDozen') {
      return groupsT('hintDozen');
    }
    return groupsT('hintHowMany');
  }

  function groupsAnswer(btn, value, roundData) {
    if (gResolved) return;
    var isCorrect = value === roundData.correctValue;
    if (isCorrect) {
      gResolved = true;
      btn.classList.add('correct');
      App.utils.$$('#groupsOptions .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success($('#groupsFeedback'));
      groupsProgress.stars += 1;
      gCorrect += 1;
      groupsSave();
      groupsPaintStars();
      $('#groupsExplanation').textContent = groupsT('groupsCorrect');
      $('#groupsExplanationWrap').classList.remove('hidden');
      $('#groupsNext').classList.remove('hidden');
      $('#groupsNext').focus();
    } else {
      gAttempts += 1;
      if (gAttempts === 1) {
        $('#groupsExplanation').textContent = groupsT('groupsHintPrefix') +
          App.feedback.hintText(groupsPickHint(roundData.entry), btn.textContent);
      } else {
        $('#groupsExplanation').textContent = groupsT('groupsWrongPrefix') + roundData.correctValue;
      }
      $('#groupsExplanationWrap').classList.remove('hidden');
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage($('#groupsFeedback'));
      /* Socratic lock: block the rest of the options until the
         person confirms, so the hint is read before trying again. */
      App.feedback.lockUntilAck(App.utils.$$('#groupsOptions .option-btn'), $('#groupsExplanationWrap'));
    }
  }

  function groupsNext() {
    gIdx += 1;
    if (gIdx >= items.length) groupsFinish();
    else groupsRender();
  }

  function groupsFinish() {
    groupsProgress.groupsCompleted[currentLevel.id] = (groupsProgress.groupsCompleted[currentLevel.id] || 0) + 1;
    groupsSave();
    /* If the round belonged to a chained group, jump straight to the
       next sub-level without going back to the menu (regla 13: the
       chain keeps the progression visible). */
    if (currentGroup && currentSubIdx + 1 < currentGroup.sublevels.length) {
      currentSubIdx += 1;
      chainBanner = groupsT('chainNext')
        .replace('{name}', groupsT('level.' + currentGroup.sublevels[currentSubIdx].group + 'Name'));
      groupsStartLevel(currentGroup.sublevels[currentSubIdx], true);
      return;
    }
    $('#groupsFinalSummary').textContent = groupsT('groupsFinal')
      .replace('{n}', gCorrect)
      .replace('{total}', items.length)
      .replace('{stars}', groupsProgress.stars);
    groupsSwitchTo(gEndScreen);
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ---- Wire-up of the groups walkthrough ---- */
  $('#carouselDisplay').addEventListener('click', function () { carouselStep(1); });
  $('#carouselDisplay').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carouselStep(1);
    }
  });
  $('#carouselPrev').addEventListener('click', function () { carouselStep(-1); });
  $('#carouselNext').addEventListener('click', function () { carouselStep(1); });
  $('#introNext').addEventListener('click', function () { groupsSwitchTo(gFamousScreen); });

  $('#famousPrev2').addEventListener('click', function () { famousStep(-1); });
  $('#famousNext2').addEventListener('click', function () { famousStep(1); });
  $('#famousPrevBtn').addEventListener('click', function () { groupsSwitchTo(gIntroScreen); });
  $('#famousNextBtn').addEventListener('click', function () { groupsSwitchTo(gReminderScreen); });

  $('#reminderBack').addEventListener('click', function () { groupsSwitchTo(gFamousScreen); });
  $('#referenceNext').addEventListener('click', function () { groupsSwitchTo(gLevelsScreen); });

  $('#levelsBack').addEventListener('click', function () { groupsSwitchTo(gReminderScreen); });
  $('#levelsBackToMenu').addEventListener('click', function () { groupsSwitchTo(gIntroScreen); });
  /* Sub-implementación más natural: "Volver al menú" desde la
     cuadrícula de niveles debe devolver al menú de actividades
     (no al intro del recorrido) — esa es la única ruta en la que
     la persona dice "ya no quiero contar en grupos", y todo el
     recorrido se cierra. Las otras vueltas atrás son internas. */
  $('#levelsBackToMenu').addEventListener('click', function () { show(screenMenu); paintStars(); });

  $('#groupsBackLevels').addEventListener('click', function () { groupsSwitchTo(gLevelsScreen); });
  $('#groupsNext').addEventListener('click', groupsNext);
  $('#groupsReplay').addEventListener('click', function () { groupsStartLevel(currentLevel); });
  $('#groupsChooseLevel').addEventListener('click', function () { groupsSwitchTo(gLevelsScreen); });
  $('#groupsEndMenu').addEventListener('click', function () { show(screenMenu); paintStars(); });



  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
