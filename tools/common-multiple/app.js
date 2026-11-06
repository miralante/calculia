/* ============================================================
   Calculia — Mínimo común múltiplo
   Three stages, the flow of Operaciones: 1. explanation (slides with a
   drawing: the multiples of two numbers, the first one they share, the same
   total in packs), 2. real life (one example at a time: buses, eggs, lights),
   3. test (one question at a time). The stages and the screens are built by
   assets/js/activity-flow.js; this file has the numbers, the drawings and the
   questions. The texts are in strings.<locale>.js and the slides in data.js.
   ============================================================ */
(function () {
  'use strict';

  var fill = App.activityFlow.fill;
  var pick = App.activityFlow.pick;
  var items = App.activityFlow.items;
  function t(key) { return App.i18n.t(key); }

  /* ---- Numbers ----------------------------------------------------------- */
  var gcd = App.commonFactors.gcd;
  /* The least common multiple: the first number that is a multiple of both. */
  function lcm(a, b) { return a * b / gcd(a, b); }
  /* The multiples of n, from n up to `limit`, in order. */
  function multiplesOf(n, limit) {
    var list = [];
    for (var m = n; m <= limit; m += n) list.push(m);
    return list;
  }

  /* ---- Drawing ----------------------------------------------------------
     Numbers as chips and objects as small icons. A caption under each
     drawing says what was counted. */
  /* One row of numbers: the ones in both lists marked, the first common one filled. */
  var chipRow = App.commonFactors.chipRow;
  /* The multiples of a and of b, up to their least common multiple. */
  function listsHtml(a, b) {
    var best = lcm(a, b);
    var la = multiplesOf(a, best);
    var lb = multiplesOf(b, best);
    var common = la.filter(function (v) { return lb.indexOf(v) !== -1; });
    return '<div class="cm-lists">' +
      chipRow(fill(t('ui.multiplesOf'), { n: a }), la, common, best) +
      chipRow(fill(t('ui.multiplesOf'), { n: b }), lb, common, best) +
      '</div>';
  }
  /* The same total in packs of a and in packs of b, side by side. */
  function packsHtml(a, b, icon) {
    var total = lcm(a, b);
    var html = '<div class="ops-compare">';
    [a, b].forEach(function (size) {
      var count = total / size;
      var boxes = '<div class="cm-baskets">';
      for (var k = 0; k < count; k += 1) {
        boxes += '<div class="ops-group-box"><div class="ops-row cm-pack">' + items(size, icon, 'ops-item') + '</div></div>';
      }
      html += '<div class="ops-compare-side">' + boxes + '</div>' +
        '<p class="ops-expr">' + fill(t('ui.packs'), { c: count, s: size, m: total }) + '</p>';
    });
    return html + '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'packs') return packsHtml(spec.a, spec.b, spec.icon);
    return listsHtml(spec.a, spec.b);
  }

  /* ---- Test: the questions ------------------------------------------------ */
  /* Numbers as answers: the right one and up to two others, all different and not
     below zero, in a shuffled order. */
  var numericOptions = App.utils.numericOptions;

  function pair() {
    var p = pick(DATA.pairs);
    return { a: p[0], b: p[1], m: lcm(p[0], p[1]) };
  }
  function explanation(p) {
    return fill(t('q.lcm.explain'), {
      a: p.a, b: p.b, m: p.m,
      la: multiplesOf(p.a, p.m).join(', '), lb: multiplesOf(p.b, p.m).join(', ')
    });
  }

  /* The least common multiple, asked as a number. The wrong answers are common
     multiples that are not the first one (the product, twice the answer), and
     numbers that are not multiples of both. */
  function makeLcm() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.lcm.prompt'), values),
      hint: fill(t('q.lcm.hint'), values),
      options: numericOptions(p.m, [p.a * p.b, p.m + 1, p.m * 2]),
      explanation: explanation(p)
    };
  }

  /* The same question as a story: the smallest number of items that fills packs of both sizes. */
  function makeStory() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.story.prompt'), values),
      hint: fill(t('q.story.hint'), values),
      options: numericOptions(p.m, [p.a * p.b, p.m + 1, p.m * 2]),
      explanation: explanation(p)
    };
  }

  /* Which number is a multiple of both: the right one is the least common
     multiple; the others are numbers that are not multiples of both. */
  function makeCommon() {
    var p = pair();
    var values = { a: p.a, b: p.b, m: p.m };
    var wrongs = [p.m + p.a, p.m + p.b, p.m + 1].filter(function (x) {
      return !(x % p.a === 0 && x % p.b === 0);
    });
    return {
      prompt: fill(t('q.common.prompt'), values),
      hint: fill(t('q.common.hint'), values),
      options: numericOptions(p.m, wrongs),
      explanation: fill(t('q.common.explain'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'lcm') return makeLcm();
    if (type === 'story') return makeStory();
    return makeCommon();
  }

  App.activityFlow.setup({
    toolId: 'common-multiple',
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
