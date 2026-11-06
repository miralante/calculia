/* ============================================================
   Calculia — Primo o compuesto
   Two stages, the flow of Múltiplos: 1. explanation (slides with a
   drawing: dots in rows that show a prime (one row only) and a composite
   (rows that make a rectangle), the numbers 1 to 20 with the primes marked,
   and why 1 is neither), 2. test (one question at a time). There is no
   real-life stage: the test is the practice. The stages and the screens are
   built by assets/js/activity-flow.js (mode 'options', skipReal); this file
   has the numbers, the drawings and the questions.
   Texts are in strings.<locale>.js, the slides and the test settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var fill = App.utils.fill;
  var rint = App.utils.rint;
  var pick = App.utils.pick;
  var numericOptions = App.utils.numericOptions;
  function t(key) { return App.i18n.t(key); }
  var shuffled = App.utils.shuffle;

  /* ---- Numbers -----------------------------------------------------------
     The divisors of n, from 1 to n, in order. A prime has exactly two:
     1 and itself. 1 has only one. */
  function divisorsOf(n) {
    var list = [];
    for (var i = 1; i <= n; i += 1) if (n % i === 0) list.push(i);
    return list;
  }
  function isPrime(n) { return n > 1 && divisorsOf(n).length === 2; }
  /* The smallest divisor of n above 1, and the number it is multiplied by. */
  function firstFactor(n) { return divisorsOf(n)[1]; }

  /* ---- Drawing ----------------------------------------------------------
     Dots in rows: a row is one line of the array. The product is written
     under it, so the rows and columns can be counted. */
  var DOT = '🔴';
  function items(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + DOT + '</span>';
    return html;
  }
  function arrayHtml(rows, cols) {
    var html = '<div class="ops-group-stack">';
    for (var r = 0; r < rows; r += 1) html += '<div class="ops-row">' + items(cols, 'ops-item') + '</div>';
    return html + '</div>';
  }
  function productText(rows, cols) {
    return fill(t('ui.product'), { k: rows, d: cols, m: rows * cols });
  }
  /* The numbers 1 … max: primes have a thick border, 1 a dashed one. */
  function sieveHtml(max) {
    var html = '<div class="pc-numbers">';
    for (var n = 1; n <= max; n += 1) {
      var cls = 'pc-num';
      if (n === 1) cls += ' pc-one';
      else if (isPrime(n)) cls += ' pc-prime';
      html += '<span class="' + cls + '">' + n + '</span>';
    }
    return html + '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'array') return arrayHtml(spec.rows, spec.cols) + '<p class="ops-expr">' + productText(spec.rows, spec.cols) + '</p>';
    if (spec.kind === 'arrays') {
      var html = '<div class="ops-compare">';
      spec.list.forEach(function (pair) {
        html += '<div class="ops-compare-side">' + arrayHtml(pair[0], pair[1]) + '<p class="ops-expr">' + productText(pair[0], pair[1]) + '</p></div>';
      });
      return html + '</div>';
    }
    return sieveHtml(spec.max);
  }

  /* ---- Test: the questions ------------------------------------------------ */
  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.utils.shuffle([
      { html: t('ui.yes'), aria: t('ui.yes'), correct: yes },
      { html: t('ui.no'), aria: t('ui.no'), correct: !yes }
    ]);
  }

  /* Is it prime? One number from the primes or from the composites; now and then the 1. */
  function makeYesNo() {
    var yes = Math.random() < 0.5;
    var n = yes ? pick(DATA.primes) : pick(DATA.composites);
    if (!yes && Math.random() < 0.2) n = 1;
    var values = { n: n, a: firstFactor(n), b: n / firstFactor(n) };
    var type = n === 1 ? 'one' : (yes ? 'prime' : 'composite');
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: fill(t('q.yesno.hint'), values),
      options: yesNoOptions(yes),
      explanation: fill(t('q.yesno.' + type), values)
    };
  }

  /* The prime among three numbers: the other two are composites. */
  function makePick() {
    var p = pick(DATA.primes);
    var others = shuffled(DATA.composites).slice(0, 2);
    return {
      prompt: t('q.pick.prompt'),
      hint: t('q.pick.hint'),
      options: numericOptions(p, others),
      explanation: fill(t('q.pick.explain'), { p: p })
    };
  }

  /* How many numbers divide it exactly: 2 for a prime, more for a composite. */
  function makeDivisors() {
    var n = pick(DATA.primes.concat(DATA.composites));
    var list = divisorsOf(n);
    var count = list.length;
    var values = { n: n, list: list.join(', '), count: count };
    return {
      prompt: fill(t('q.divisors.prompt'), values),
      hint: fill(t('q.divisors.hint'), values),
      options: numericOptions(count, [count + 1, count - 1, count + 2]),
      explanation: fill(t(isPrime(n) ? 'q.divisors.prime' : 'q.divisors.composite'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'yesno') return makeYesNo();
    if (type === 'pick') return makePick();
    return makeDivisors();
  }

  App.activityFlow.setup({
    toolId: 'prime-composite',
    intro: DATA.intro,
    real: [],
    skipReal: true,
    visualHtml: visualHtml,
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
      return shuffled(list);
    },
    makeQuestion: makeQuestion
  });
})();
