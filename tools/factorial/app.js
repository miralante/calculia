/* ============================================================
   Calculia — Números factoriales
   Socratic anatomy (SPEC §3.6 and §3.8): 1. what it is for and the rule
   (explanation slides with a drawing), 2. real life, 3. practice where
   the first miss shows a hint, not the answer, 4. a closing with the
   round summary, what was practised and a transfer sentence.
   The stages, the practice and the closing are built by
   assets/js/activity-flow.js; this file has the numbers, the drawings and the
   questions. The rule can be reopened during the round without losing the
   question. n! is the product 1 × 2 × … × n. It comes before divisibility
   because n! is divided exactly by every number from 1 to n: the last slide
   says so. Texts are in strings.<locale>.js, the structure in data.js.
   ============================================================ */
(function () {
  'use strict';

  var fill = App.activityFlow.fill;
  var rint = App.activityFlow.rint;
  function t(key) { return App.i18n.t(key); }

  /* ---- Factorials ---------------------------------------------------------
     n! = n × (n−1) × … × 1. `factors(n, low)` lists the numbers from n down to `low`. */
  function factorial(n) {
    var value = 1;
    for (var k = 2; k <= n; k += 1) value *= k;
    return value;
  }
  function factors(n, low) {
    var list = [];
    for (var k = n; k >= low; k -= 1) list.push(k);
    return list;
  }
  /* The product written out, for example 4 × 3 × 2 × 1. */
  function chainText(n) { return factors(n, 1).join(' × '); }

  /* ---- Drawings -------------------------------------------------------------- */
  /* n, n−1 … 1 as chips with a × between them, then = and the result. */
  function chainHtml(n) {
    var html = '';
    factors(n, 1).forEach(function (k, i) {
      if (i) html += '<span class="fac-sign" aria-hidden="true">×</span>';
      html += '<span class="fac-chip">' + k + '</span>';
    });
    return '<div class="fac-line">' + html +
      '<span class="fac-sign" aria-hidden="true">=</span>' +
      '<span class="fac-chip fac-result">' + factorial(n) + '</span></div>';
  }
  /* The first few factorials, one card each: the value grows fast. */
  function growthHtml(max) {
    var html = '<div class="fac-growth">';
    for (var n = 1; n <= max; n += 1) {
      html += '<div class="fac-card"><span class="fac-name">' + n + '!</span><span class="fac-value">' + factorial(n) + '</span></div>';
    }
    return html + '</div>';
  }
  /* n! as a big number, and below it each small number that divides it with nothing left over. */
  function chipsHtml(n) {
    var value = factorial(n);
    var html = '<p class="fac-big">' + n + '! = ' + value + '</p><div class="fac-chips">';
    for (var k = 1; k <= n; k += 1) {
      html += '<span class="fac-chip">' + value + ' ÷ ' + k + ' = ' + (value / k) + '</span>';
    }
    return html + '</div><p class="fac-note">' + t('ui.noRest') + '</p>';
  }
  /* n places in a row, one box each. `counts` writes over each box how many choices that place has (n, n−1 … 1). `result` writes the product under them. */
  function slotsHtml(n, counts, result) {
    var html = '<div class="fac-slots">';
    for (var i = 0; i < n; i += 1) {
      html += '<div class="fac-slot">' + (counts ? '<span class="fac-slot-count">' + (n - i) + '</span>' : '') +
        '<span class="fac-box"></span></div>';
    }
    html += '</div>';
    if (result) html += '<p class="fac-expr">' + chainText(n) + ' = ' + factorial(n) + '</p>';
    return html;
  }
  function drawingHtml(spec) {
    if (spec.kind === 'chain') return chainHtml(spec.n);
    if (spec.kind === 'growth') return growthHtml(spec.max);
    if (spec.kind === 'chips') return chipsHtml(spec.n);
    if (spec.kind === 'slots') return slotsHtml(spec.n, spec.counts, spec.result);
    return '';
  }

  /* ---- Practice questions ------------------------------------------------ */
  /* Numbers as answers: the right one and up to two others, all different and not below zero, in a shuffled order. */
  var numericOptions = App.utils.numericOptions;

  function textOptions(correctText, wrongTexts) {
    var texts = [correctText];
    wrongTexts.forEach(function (s) { if (texts.indexOf(s) === -1 && texts.length < 3) texts.push(s); });
    return App.utils.shuffle(texts).map(function (s) {
      return { html: s, aria: s, correct: s === correctText };
    });
  }

  function makeQuestion(type) {
    var key = 'q.' + type + '.';
    if (type === 'value') {
      var n = rint(2, 5), value = factorial(n);
      return {
        prompt: fill(t(key + 'prompt'), { n: n }),
        visual: '<p class="fac-expr">' + chainText(n) + ' = ?</p>',
        hint: t(key + 'hint'),
        /* The wrong answers are the usual mix-ups: adding instead of multiplying, or leaving out the n. */
        options: numericOptions(value, [n * (n + 1) / 2, factorial(n - 1), n * n]),
        explanation: fill(t(key + 'explain'), { chain: chainText(n), T: value })
      };
    }
    if (type === 'meaning') {
      var m = rint(3, 5);
      var correct = chainText(m);
      return {
        prompt: fill(t(key + 'prompt'), { n: m }),
        visual: '',
        hint: t(key + 'hint'),
        options: textOptions(correct, [factors(m, 1).join(' + '), factors(m, 2).join(' × ')]),
        explanation: fill(t(key + 'explain'), { n: m, chain: correct, T: factorial(m) })
      };
    }
    if (type === 'slots') {
      var s = rint(3, 5), total = factorial(s);
      return {
        prompt: fill(t(key + 'prompt'), { n: s }),
        visual: slotsHtml(s, false, false),
        hint: fill(t(key + 'hint'), { n: s }),
        options: numericOptions(total, [factorial(s - 1), s * s, s * (s - 1)]),
        explanation: fill(t(key + 'explain'), { chain: chainText(s), T: total })
      };
    }
    /* divides: the answer divides n! with nothing left over. The wrong ones are numbers just above n that do not. */
    var d = rint(3, 5), whole = factorial(d), fits = rint(2, d);
    var misses = [];
    for (var c = d + 1; misses.length < 2 && c <= d + 8; c += 1) if (whole % c) misses.push(c);
    return {
      prompt: fill(t(key + 'prompt'), { n: d }),
      visual: '<p class="fac-expr">' + d + '! = ' + whole + '</p>',
      hint: fill(t(key + 'hint'), { T: whole }),
      options: numericOptions(fits, misses),
      explanation: fill(t(key + 'explain'), { T: whole, k: fits, g: whole / fits })
    };
  }

  App.activityFlow.setup({
    toolId: 'factorial',
    socratic: true,
    review: 'rule',
    intro: DATA.intro,
    real: DATA.real,
    visualHtml: drawingHtml,
    introHeading: function () { return t('instruction'); },
    introCard: function () { return { title: t('contextTitle'), text: t('context') }; },
    endNotes: [{ key: 'recap', cls: 'recap' }, { key: 'transfer', cls: 'transfer' }],
    endEmoji: { text: '❗', cls: 'big-emoji' },
    /* Each question draws its type at random, so a round does not repeat the same mix of problems. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.types[rint(0, DATA.types.length - 1)]);
      return list;
    },
    makeQuestion: makeQuestion
  });
})();
