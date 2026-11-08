/* ============================================================
   Calculia — Ordering numbers: shared generators.

   The order-* activities (positives, negatives, decimals, fractions) share
   their questions and drawings here: the question kinds (KINDS), how a
   question is made (makeQuestion, makeRound) and how a number is drawn
   (visualHtml, columnHtml). The three stages and the test sheet are the
   shared engine's (assets/js/activity-flow.js), set up by setup(config).

   Each activity brings its data (levels, slides, examples) in data.js
   and its texts in strings.<locale>.js. Numbers are whole units of a
   scale (hundredths for decimals), so every comparison is exact and
   never depends on floating-point rounding.

   Exposes window.App.numberSort.
   ============================================================ */
(function () {
  'use strict';


  var rint = App.utils.rint;
  function pow10(k) { return Math.pow(10, k); }
  function t(key) { return App.i18n.t(key); }
  var fill = App.utils.fill;

  /* ---- Kinds of value -------------------------------------------------
     Each kind draws a whole number of units. `scale` says how many units
     make one; `decimals` how many digits are written. A level picks one
     kind, so the same level always looks the same on screen. The order of
     the kinds is the graduation: from the simplest to any number. */
  /* 120 is the least common multiple of the fraction denominators (2 to 12
     that divide it), so a fraction in 120ths is always a whole number. */
  var FRACTION_UNIT = 120;

  var KINDS = {
    /* Whole numbers */
    single: { scale: 1, decimals: 0, draw: function () { return rint(1, 9); } },
    round: { scale: 1, decimals: 0, draw: function () {
      return rint(1, 9) * pow10(rint(1, 3));                    /* 10 … 9000 */
    } },
    lessRound: { scale: 1, decimals: 0, draw: function () {
      var m;
      do { m = rint(11, 99); } while (m % 10 === 0);            /* two significant digits */
      return m * pow10(rint(1, 2));                             /* 110 … 9900 */
    } },
    any: { scale: 1, decimals: 0, draw: function () { return rint(1, 9999); } },
    /* Decimals, in hundredths: 50 is 0,5 */
    halves: { scale: 100, decimals: 1, draw: function () { return rint(1, 19) * 50; } },
    tenths: { scale: 100, decimals: 1, draw: function () { return rint(1, 99) * 10; } },
    roundHundredths: { scale: 100, decimals: 2, draw: function () {
      var k;
      do { k = rint(1, 999); } while (k % 10 !== 5);            /* 0,05 · 0,25 · 1,75 */
      return k;
    } },
    hundredths: { scale: 100, decimals: 2, draw: function () {
      var k;
      do { k = rint(1, 999); } while (k % 10 === 0);            /* any two digits */
      return k;
    } },
    /* Proper fractions, stored in 120ths of a whole: 1/2 is 60, 1/4 is 30,
       1/3 is 40. The denominators used divide 120, so every comparison is
       exact. The fraction is written on screen in its simplest form. */
    fracHalvesQuarters: { scale: FRACTION_UNIT, decimals: 0, format: fractionText,
      draw: function () { return drawFraction([2, 4]); } },
    fracThirdsSixths: { scale: FRACTION_UNIT, decimals: 0, format: fractionText,
      draw: function () { return drawFraction([3, 6]); } },
    fracEighthsTenths: { scale: FRACTION_UNIT, decimals: 0, format: fractionText,
      draw: function () { return drawFraction([5, 8, 10]); } },
    fracAny: { scale: FRACTION_UNIT, decimals: 0, format: fractionText,
      draw: function () { return drawFraction([2, 3, 4, 5, 6, 8, 10, 12]); } }
  };

  /* ---- Fractions ------------------------------------------------------ */
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function drawFraction(denominators) {
    var d = denominators[rint(0, denominators.length - 1)];
    return rint(1, d - 1) * (FRACTION_UNIT / d);
  }
  function fractionText(units) {
    var g = gcd(units, FRACTION_UNIT);
    return (units / g) + '/' + (FRACTION_UNIT / g);
  }

  /* ---- Formatting -----------------------------------------------------
     Project rule: below 10.000 there is no thousands separator; from
     10.000 up there is. Negatives get a real minus sign. */
  function isEnglish() { return App.i18n.locale() === 'en'; }

  function groupThousands(whole) {
    var s = whole;
    var parts = [];
    while (s.length > 3) {
      parts.unshift(s.slice(s.length - 3));
      s = s.slice(0, s.length - 3);
    }
    parts.unshift(s);
    return parts.join(isEnglish() ? ',' : '.');
  }

  function fmtPlain(x, decimals) {
    var abs = Math.abs(x).toFixed(decimals);
    var parts = abs.split('.');
    var whole = Number(parts[0]) >= 10000 ? groupThousands(parts[0]) : parts[0];
    var text = parts[1] ? whole + (isEnglish() ? '.' : ',') + parts[1] : whole;
    return (x < 0 && Number(abs) !== 0 ? '−' : '') + text;
  }

  /* Formats a stored value (units) of the given kind. */
  function show(units, kind) {
    var k = KINDS[kind];
    if (k.format) return k.format(units);
    return fmtPlain(units / k.scale, k.decimals);
  }

  /* ---- Drawing values ------------------------------------------------- */
  /* pool = { kind, sign }. sign 1 = positive, -1 = negative, 0 = mixed. */
  function drawDistinct(pool, count) {
    var out = [];
    var guard = 0;
    while (out.length < count) {
      guard += 1;
      if (guard > 5000) throw new Error('number-sort: pool "' + pool.kind + '" is too small for ' + count + ' values');
      var sign = pool.sign === 0 ? (Math.random() < 0.5 ? -1 : 1) : pool.sign;
      var v = sign * KINDS[pool.kind].draw();
      if (out.indexOf(v) === -1) out.push(v);
    }
    return out;
  }

  function ascending(list) { return list.slice().sort(function (a, b) { return a - b; }); }
  function sameList(a, b) {
    return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
  }
  function allNegative(values) { return values.every(function (v) { return v < 0; }); }

  /* ---- Question kinds -------------------------------------------------
     Every question has: prompt, optional visual, options (the first
     correct one is found by `correct`), a socratic hint that never gives
     the answer, and the explanation shown after a right answer. */
  function optionsFrom(values, kind, answer) {
    return App.utils.shuffle(values.map(function (v) {
      return { html: show(v, kind), aria: show(v, kind), correct: v === answer };
    }));
  }

  function makeExtreme(pool, type) {
    var values = drawDistinct(pool, 4);
    var sorted = ascending(values);
    var answer = type === 'smallest' ? sorted[0] : sorted[sorted.length - 1];
    var neg = allNegative(values);
    var suffix = neg ? 'Neg' : '';
    return {
      type: type,
      prompt: t(type === 'smallest' ? 'q.promptSmallest' : 'q.promptLargest'),
      visual: null,
      inline: true,
      options: optionsFrom(values, pool.kind, answer),
      hint: t('q.hint' + (type === 'smallest' ? 'Smallest' : 'Largest') + suffix),
      explanation: fill(t('q.explain' + (type === 'smallest' ? 'Smallest' : 'Largest') + suffix),
        { v: show(answer, pool.kind) })
    };
  }

  function makeOrder(pool) {
    var values = drawDistinct(pool, 3);
    var sorted = ascending(values);
    var rows = [{ list: sorted, correct: true }];
    var guard = 0;
    while (rows.length < 3 && guard < 200) {
      guard += 1;
      var candidate = App.utils.shuffle(values);
      var seen = rows.some(function (r) { return sameList(r.list, candidate); });
      if (!seen) rows.push({ list: candidate, correct: false });
    }
    var rowText = function (list) { return list.map(function (v) { return show(v, pool.kind); }).join(' · '); };
    var neg = allNegative(values);
    return {
      type: 'order',
      prompt: t('q.promptOrder'),
      visual: null,
      options: App.utils.shuffle(rows).map(function (r) {
        return { html: rowText(r.list), aria: rowText(r.list), correct: r.correct };
      }),
      hint: t(neg ? 'q.hintOrderNeg' : 'q.hintOrder'),
      explanation: fill(t('q.explainOrder'), { list: rowText(sorted) })
    };
  }

  function makeBetween(pool) {
    /* Six values in order. The one in the middle of three is the answer;
       its two neighbours are the limits. The other three sit outside the
       limits, so exactly one option fits. */
    var six = ascending(drawDistinct(pool, 6));
    var i = rint(1, 4);
    var a = six[i - 1];
    var answer = six[i];
    var b = six[i + 1];
    var outside = six.filter(function (v, k) { return k < i - 1 || k > i + 1; });
    var options = [answer].concat(outside);
    var values = { a: show(a, pool.kind), b: show(b, pool.kind) };
    return {
      type: 'between',
      prompt: fill(t('q.promptBetween'), values),
      visual: null,
      options: App.utils.shuffle(options.map(function (v) {
        return { html: show(v, pool.kind), aria: show(v, pool.kind), correct: v === answer };
      })),
      hint: fill(t('q.hintBetween'), values),
      explanation: fill(t('q.explainBetween'), {
        v: show(answer, pool.kind), a: values.a, b: values.b
      })
    };
  }

  function makeMissing(pool) {
    for (var attempt = 0; attempt < 200; attempt += 1) {
      var four = ascending(drawDistinct(pool, 4));
      var gap = rint(1, 2);
      var answer = four[gap];
      var left = four[gap - 1];
      var right = four[gap + 1];
      var shown = four.filter(function (v, k) { return k !== gap; });
      /* Distractors: values outside the gap, so only the answer fits. */
      var extra = [];
      var guard = 0;
      while (extra.length < 3 && guard < 300) {
        guard += 1;
        var cand = drawDistinct(pool, 1)[0];
        if (cand > left && cand < right) continue;
        if (shown.indexOf(cand) !== -1 || extra.indexOf(cand) !== -1) continue;
        extra.push(cand);
      }
      if (extra.length < 3) continue;
      var cells = four.map(function (v, k) {
        return k === gap
          ? '<span class="ns-chip ns-gap">?</span>'
          : '<span class="ns-chip">' + show(v, pool.kind) + '</span>';
      });
      var row = cells.join('<span class="ns-sep" aria-hidden="true">·</span>');
      var rowLabel = four.map(function (v, k) { return k === gap ? '?' : show(v, pool.kind); }).join(', ');
      return {
        type: 'missing',
        prompt: t('q.promptMissing'),
        visual: '<div class="ns-row">' + row + '</div>',
        visualAria: fill(t('q.rowAria'), { row: rowLabel }),
        options: optionsFrom([answer].concat(extra), pool.kind, answer),
        hint: t('q.hintMissing'),
        explanation: fill(t('q.explainMissing'), {
          v: show(answer, pool.kind), list: ascending(four).map(function (v) { return show(v, pool.kind); }).join(' · ')
        })
      };
    }
    throw new Error('number-sort: no missing-number question for pool "' + pool.kind + '"');
  }

  /* Two numbers and the sign between them: <, > or =. One question in five
     has two equal numbers, so "=" is a real answer and not a decoy. The
     two numbers are drawn at the level's size, so the sign is always about
     the numbers on screen, never about their order on the page. */
  var SIGN_HTML = { less: '&lt;', eq: '=', greater: '&gt;' };
  function makeCompare(pool) {
    var pair = drawDistinct(pool, 2);
    var a = pair[0];
    var b = rint(1, 5) === 1 ? a : pair[1];
    var rel = a === b ? 'eq' : (a < b ? 'less' : 'greater');
    var words = { less: t('q.relLess'), eq: t('q.relEqual'), greater: t('q.relGreater') };
    var values = { a: show(a, pool.kind), b: show(b, pool.kind), rel: words[rel] };
    return {
      type: 'compare',
      prompt: t('q.promptCompare'),
      visual: '<div class="ns-row"><span class="ns-chip">' + values.a + '</span>' +
        '<span class="ns-sep" aria-hidden="true">?</span>' +
        '<span class="ns-chip">' + values.b + '</span></div>',
      visualAria: fill(t('q.compareAria'), values),
      inline: true,
      options: App.utils.shuffle(['less', 'eq', 'greater'].map(function (r) {
        return {
          html: '<span class="compare-sign">' + SIGN_HTML[r] + '</span>',
          aria: words[r],
          correct: r === rel
        };
      })),
      hint: t('q.hintCompare'),
      explanation: fill(t('q.explainCompare'), values)
    };
  }

  var TYPES = ['smallest', 'largest', 'order', 'between', 'missing', 'compare'];

  /* One question of the given type from a pool. */
  function makeQuestion(pool, type) {
    if (type === 'smallest' || type === 'largest') return makeExtreme(pool, type);
    if (type === 'order') return makeOrder(pool);
    if (type === 'between') return makeBetween(pool);
    if (type === 'compare') return makeCompare(pool);
    return makeMissing(pool);
  }

  /* A round: `count` questions cycling through the level's types. The
     caller shuffles the order, so the types are never grouped. */
  function makeRound(level, count) {
    var types = level.types || TYPES;
    var pools = level.pools || [level.pool];
    /* Each question draws from one of the level's sizes, spread evenly and in a
       random order, so one round mixes small and large numbers. */
    var sizes = [];
    for (var k = 0; k < count; k += 1) sizes.push(k % pools.length);
    sizes = App.utils.shuffle(sizes);
    var out = [];
    for (var i = 0; i < count; i += 1) {
      out.push(makeQuestion(pools[sizes[i]], types[i % types.length]));
    }
    return out;
  }

  /* ---- Visuals for the concept slides --------------------------------- */
  function lineSvg(spec) {
    var W = 320;
    var H = 96;
    var x0 = 24;
    var x1 = W - 24;
    var y = 60;
    var span = spec.to - spec.from;
    var x = function (v) { return x0 + (v - spec.from) / span * (x1 - x0); };
    var parts = ['<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" class="ns-axis"/>'];
    for (var v = spec.from; v <= spec.to + 1e-9; v += spec.step) {
      parts.push('<line x1="' + x(v) + '" y1="' + (y - 6) + '" x2="' + x(v) + '" y2="' + (y + 6) + '" class="ns-tick"/>');
      parts.push('<text x="' + x(v) + '" y="' + (y + 24) + '" class="ns-tick-label" text-anchor="middle">' + fmtPlain(v, spec.dec) + '</text>');
    }
    (spec.marks || []).forEach(function (m) {
      parts.push('<circle cx="' + x(m) + '" cy="' + y + '" r="6" class="ns-mark"/>');
      parts.push('<text x="' + x(m) + '" y="' + (y - 14) + '" class="ns-mark-label" text-anchor="middle">' + fmtPlain(m, spec.dec) + '</text>');
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ns-line" aria-hidden="true">' + parts.join('') + '</svg>';
  }

  function chipsHtml(spec) {
    return '<div class="ns-row">' + spec.values.map(function (v, k) {
      var text = spec.labels ? spec.labels[k] : fmtPlain(v, spec.dec);
      var chip = '<span class="ns-chip">' + text + '</span>';
      return k === 0 ? chip : '<span class="ns-sep" aria-hidden="true">&lt;</span>' + chip;
    }).join('') + '</div>';
  }

  /* A vertical column of values (for example floors of a building), with one
     of them marked. Listed top to bottom, as the values are given. */
  /* A building drawn as a column of floors, each with its number. `ground`
     is the floor at street level: the ground line is drawn under it. Floors
     below zero are shaded as underground, and `mark` highlights one floor. */
  function columnHtml(spec) {
    return '<div class="ns-building">' + spec.values.map(function (v) {
      var mark = v === spec.mark ? ' ns-column-mark' : '';
      var under = v < 0 ? ' ns-underground' : '';
      var floor = '<div class="ns-floor' + under + '"><span class="ns-chip' + mark + '">' + fmtPlain(v, 0) + '</span></div>';
      return floor + (v === spec.ground ? '<div class="ns-ground" aria-hidden="true"></div>' : '');
    }).join('') + '</div>';
  }

  function visualHtml(spec) {
    if (!spec) return '';
    return spec.kind === 'line' ? lineSvg(spec) : chipsHtml(spec);
  }

  /* ---- Setup: the three stages of one activity ------------------------ */
  /* config = {
       toolId, perRound, levels: [{ id, name, detail, pool, types }],
       concepts: [{ title, text, visual }], examples: [{ emoji, caption }],
       buildRound(level) -> questions (the activity shuffles them)
     } */

  /* ---- The activity: the three stages and the test come from the shared
     engine (assets/js/activity-flow.js). This file only says what is specific to
     numbers: the levels, the concept slides, the examples and the questions. ----
     config = {
       toolId, legacyToolId (optional), perRound,
       levels: [{ id, name, detail, pool, types }],
       concepts: [{ title, text, visual }], examples: [{ emoji | column, caption }],
       buildRound(level) -> questions of the round, already shuffled
     }
     The test is one question per slide. The level rises with the rounds done. */
  function setup(config) {
    App.activityFlow.setup({
      toolId: config.toolId,
      test: 'options',
      intro: config.concepts.map(function (concept) { return { visual: concept }; }),
      real: config.examples.map(function (example) { return { visual: example }; }),
      introHeading: function () { return t('instructionIntro'); },
      introCopy: function (i) {
        var concept = config.concepts[i];
        return { title: t(concept.title), text: t(concept.text) };
      },
      realText: function (i) { return t(config.examples[i].caption); },
      visualHtml: function (concept) { return visualHtml(concept.visual); },
      realVisualHtml: function (example) {
        var inner = example.column ? columnHtml(example.column) : example.emoji;
        return '<div class="real-object" aria-hidden="true">' + inner + '</div>';
      },
      /* One entry with the levels: the engine counts the rounds of the activity and finds the level. */
      activities: [{
        id: config.toolId,
        picto: '',
        name: function () { return ''; },
        detail: function () { return ''; },
        levels: config.levels
      }],
      buildRound: function (def, level) { return config.buildRound(level); },
      makeQuestion: function (question) { return question; },
      levelName: function (level) { return t(level.name); },
      transferKey: 'transfer',
      /* The stars of the older slug of this activity carry over, and its rounds
         per level become the rounds of the activity, which is how the level is found. */
      prepareProgress: function (progress) {
        if (config.legacyToolId && progress.stars === 0 && progress.completedRounds === 0) {
          var legacy = App.storage.get(config.legacyToolId);
          if (typeof legacy.stars === 'number') {
            Object.keys(legacy).forEach(function (key) { progress[key] = legacy[key]; });
          }
        }
        if (progress.roundsByActivity[config.toolId] === undefined && progress.roundsByLevel) {
          var n = 0;
          while (n < config.levels.length && (progress.roundsByLevel[config.levels[n].id] || 0) >= 1) n += 1;
          progress.roundsByActivity[config.toolId] = n;
        }
      }
    });
  }

  window.App.numberSort = {
    KINDS: KINDS,
    makeQuestion: makeQuestion,
    makeRound: makeRound,
    visualHtml: visualHtml,
    columnHtml: columnHtml,
    setup: setup
  };
})();
