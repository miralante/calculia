/* ============================================================
   Calculia — Múltiplos
   Two stages, the flow of Divisibilidad: 1. explanation (slides with a
   drawing: what a multiple is, the first multiples of 2, 3, 4 and 5, and
   when a number is not a multiple), 2. test (one question at a time).
   There is no real-life stage: the test is the practice. The stages and the
   screens are built by assets/js/activity-flow.js (mode 'options', skipReal);
   this file has the drawings and the questions. The texts are in
   strings.<locale>.js and the slides and the test settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var fill = App.utils.fill;
  var rint = App.utils.rint;
  var pick = App.utils.pick;
  var numericOptions = App.utils.numericOptions;
  function t(key) { return App.i18n.t(key); }

  /* ---- Drawing ----------------------------------------------------------
     Every drawing is made of small dots. A row of dots is a group; the
     product of its groups is written under it («3 × 4 = 12»). */
  var DOT = '🔴';
  function items(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + DOT + '</span>';
    return html;
  }
  function productText(count, each) {
    return fill(t('ui.product'), { k: count, d: each, m: count * each });
  }
  /* `count` equal groups of `each` dots, one above the other, and their product. */
  function groupsHtml(count, each) {
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < count; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(each, 'ops-item') + '</div></div>';
    return html + '</div><p class="ops-expr">' + productText(count, each) + '</p>';
  }
  /* The first multiples of `each`: one row per step, each with its product beside it. */
  function ladderHtml(each, count) {
    var html = '<div class="mul-ladder">';
    for (var k = 1; k <= count; k += 1) {
      html += '<div class="mul-row"><div class="ops-group-box"><div class="ops-row">' + items(each, 'ops-item') + '</div></div>' +
        '<span class="mul-label">' + productText(k, each) + '</span></div>';
    }
    return html + '</div>';
  }
  /* `total` dots in rows of `size`: full rows are groups; what is left over sits apart. */
  function packHtml(total, size) {
    var full = Math.floor(total / size);
    var rest = total % size;
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(size, 'ops-item') + '</div></div>';
    if (rest) html += '<div class="ops-row ops-left-row">' + items(rest, 'ops-item ops-left') + '</div>';
    html += '</div>';
    var text = fill(t('ui.division'), { T: total, d: size, q: full });
    if (rest) text += ', ' + fill(t('ui.remainder'), { r: rest });
    return html + '<p class="ops-expr">' + text + '</p>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'groups') return groupsHtml(spec.count, spec.each);
    if (spec.kind === 'ladder') return ladderHtml(spec.each, spec.count);
    return packHtml(spec.total, spec.size);
  }

  /* ---- Test: the questions ------------------------------------------------ */
  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.utils.shuffle([
      { html: t('ui.yes'), aria: t('ui.yes'), correct: yes },
      { html: t('ui.no'), aria: t('ui.no'), correct: !yes }
    ]);
  }

  /* Which number is a multiple of d: the right one is d × k; the others are not. */
  function makePick() {
    var d = pick(DATA.numbers);
    var k = rint(2, 9);
    var n = d * k;
    return {
      prompt: fill(t('q.pick.prompt'), { d: d }),
      hint: fill(t('q.pick.hint'), { d: d }),
      options: numericOptions(n, [n + 1, n - 1, n + d + 1]),
      explanation: fill(t('q.pick.explain'), { n: n, d: d, k: k })
    };
  }

  /* Which multiple is number k of d: the right one is d × k; the wrong ones are the neighbours. */
  function makeFirst() {
    var d = pick(DATA.numbers);
    var k = rint(2, 9);
    var n = d * k;
    return {
      prompt: fill(t('q.first.prompt'), { d: d, k: k }),
      hint: fill(t('q.first.hint'), { d: d, k: k }),
      options: numericOptions(n, [n + d, n - d, n + 1]),
      explanation: fill(t('q.first.explain'), { n: n, d: d, k: k })
    };
  }

  /* Is this number a multiple? If not, it lies between two multiples of d. */
  function makeYesNo() {
    var d = pick(DATA.numbers);
    var yes = Math.random() < 0.5;
    var k = rint(2, 9);
    var n = yes ? d * k : d * k + rint(1, d - 1);
    var below = d * Math.floor(n / d);
    var values = { n: n, d: d, k: k, a: below, b: below + d };
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: fill(t('q.yesno.hint'), values),
      options: yesNoOptions(yes),
      explanation: fill(t(yes ? 'q.yesno.yes' : 'q.yesno.no'), values)
    };
  }

  /* Three multiples are shown; the next one is the last plus d. */
  function makeNext() {
    var d = pick(DATA.numbers);
    var k = rint(1, 5);
    var a = d * k;
    var b = d * (k + 1);
    var c = d * (k + 2);
    var next = d * (k + 3);
    var values = { a: a, b: b, c: c, d: d, n: next };
    return {
      prompt: fill(t('q.next.prompt'), values),
      hint: t('q.next.hint'),
      options: numericOptions(next, [next + 1, next - 1, c + 1]),
      explanation: fill(t('q.next.explain'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'pick') return makePick();
    if (type === 'first') return makeFirst();
    if (type === 'yesno') return makeYesNo();
    return makeNext();
  }

  App.activityFlow.setup({
    toolId: 'multiples',
    intro: DATA.intro,
    real: [],
    skipReal: true,
    visualHtml: visualHtml,
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
      return App.utils.shuffle(list);
    },
    makeQuestion: makeQuestion
  });
})();
