/* ============================================================
   Calculia — Máximo común divisor
   Three stages, the flow of Operaciones: 1. explanation (slides with a
   drawing: the biggest number of equal groups, the divisors of two numbers,
   the common ones), 2. real life (one example at a time: bags, tiles,
   boxes), 3. test (one question at a time). The stages and the screens are
   built by assets/js/activity-flow.js; this file has the numbers, the
   drawings and the questions. The texts are in strings.<locale>.js and the
   slides in data.js.
   ============================================================ */
(function () {
  'use strict';

  var fill = App.activityFlow.fill;
  var pick = App.utils.pick;
  var items = App.activityFlow.items;
  function t(key) { return App.i18n.t(key); }

  /* ---- Numbers ----------------------------------------------------------- */
  function divisorsOf(n) {
    var list = [];
    for (var d = 1; d <= n; d += 1) if (n % d === 0) list.push(d);
    return list;
  }
  var gcd = App.commonFactors.gcd;

  /* ---- Drawing ----------------------------------------------------------
     Every drawing shows the numbers as small icons, so the sharing can be
     counted. A caption under it says what was counted. */
  /* `g` baskets, each with its share of the two kinds of item. */
  function basketsHtml(a, b, g, iconA, iconB) {
    var html = '<div class="cm-baskets">';
    for (var k = 0; k < g; k += 1) {
      html += '<div class="ops-group-box"><div class="ops-row">' +
        items(a / g, iconA, 'ops-item') + items(b / g, iconB, 'ops-item') + '</div></div>';
    }
    return html + '</div><p class="ops-expr">' +
      fill(t('ui.share'), { g: g, x: a / g, y: b / g }) + '</p>';
  }
  /* A floor of a × b, covered with squares of g × g: a/g squares wide, b/g high. */
  function tilesHtml(a, b, g) {
    var html = '<div class="cm-tiles">';
    for (var r = 0; r < b / g; r += 1) {
      html += '<div class="ops-row">' + items(a / g, '', 'cm-tile') + '</div>';
    }
    return html + '</div><p class="ops-expr">' + fill(t('ui.tiles'), { a: a, b: b, g: g }) + '</p>';
  }
  /* One row of numbers, the ones that are in both lists marked, the greatest of them filled in. */
  var chipRow = App.commonFactors.chipRow;
  /* The divisors of a and of b; the common ones marked, the greatest common one filled. */
  function divisorsHtml(a, b) {
    var la = divisorsOf(a);
    var lb = divisorsOf(b);
    var common = la.filter(function (v) { return lb.indexOf(v) !== -1; });
    var best = gcd(a, b);
    return '<div class="cm-lists">' +
      chipRow(fill(t('ui.divisorsOf'), { n: a }), la, common, best) +
      chipRow(fill(t('ui.divisorsOf'), { n: b }), lb, common, best) +
      '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'baskets') return basketsHtml(spec.a, spec.b, spec.g, spec.iconA, spec.iconB);
    if (spec.kind === 'tiles') return tilesHtml(spec.a, spec.b, spec.g);
    return divisorsHtml(spec.a, spec.b);
  }

  /* ---- Test: the questions ------------------------------------------------ */
  /* Numbers as answers: the right one and up to two others, all different and not
     below zero, in a shuffled order. */
  var numericOptions = App.utils.numericOptions;

  /* Two numbers from the pairs: the answer is their greatest common divisor. */
  function pair() {
    var g = pick(DATA.gcds);
    var p = pick(DATA.factorPairs);
    return { a: g * p[0], b: g * p[1], g: g };
  }
  function explanation(p) {
    return fill(t('q.gcd.explain'), {
      a: p.a, b: p.b, g: p.g,
      la: divisorsOf(p.a).join(', '), lb: divisorsOf(p.b).join(', ')
    });
  }

  /* The greatest common divisor, asked as a number. The wrong answers are other
     common divisors that are too small, and numbers that are too big. */
  function makeGcd() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.gcd.prompt'), values),
      hint: fill(t('q.gcd.hint'), values),
      options: numericOptions(p.g, [p.g * 2, p.g + 1, p.g - 1]),
      explanation: explanation(p)
    };
  }

  /* The same question as a story: how many equal baskets, with nothing left over. */
  function makeStory() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.story.prompt'), values),
      hint: t('q.story.hint'),
      options: numericOptions(p.g, [p.g * 2, p.g + 1, p.g - 1]),
      explanation: explanation(p)
    };
  }

  /* Which number divides both: the right one is the greatest common divisor; the
     others are numbers that do not divide both. */
  function makeCommon() {
    var p = pair();
    var values = { a: p.a, b: p.b, g: p.g };
    var wrongs = [p.a + 1, p.b + 1, p.a + p.b, p.g + 1].filter(function (x) {
      return !(p.a % x === 0 && p.b % x === 0);
    });
    return {
      prompt: fill(t('q.common.prompt'), values),
      hint: fill(t('q.common.hint'), values),
      options: numericOptions(p.g, wrongs),
      explanation: fill(t('q.common.explain'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'gcd') return makeGcd();
    if (type === 'story') return makeStory();
    return makeCommon();
  }

  App.activityFlow.setup({
    toolId: 'common-divisor',
    intro: DATA.intro,
    real: DATA.real,
    visualHtml: visualHtml,
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
      return App.utils.shuffle(list);
    },
    makeQuestion: makeQuestion
  });
})();
