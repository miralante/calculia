/* ============================================================
   Calculia — Divisibilidad
   Two stages, the flow of Operaciones: 1. explanation (slides with a
   drawing: when a number divides exactly and when it does not, the rules
   for 2, 5, 10 and 3, then the whole part and the decimal part of a
   division that does not come out exact), 2. test (one question at a
   time). There is no real-life stage: the test is the practice. The stages
   and the screens are built by assets/js/activity-flow.js (mode 'options',
   skipReal); a question of a rule has several steps (`steps`), scored once.
   Texts are in strings.<locale>.js, the slides and the test settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;
  var rint = App.utils.rint;
  var pick = App.utils.pick;
  function t(key) { return App.i18n.t(key); }

  var DOT = '🔴';
  function digitSum(n) {
    return String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
  }
  /* The digits after the decimal separator of r ÷ d, three at most: 1 ÷ 2 gives 5,
     1 ÷ 3 gives 333… (the dots mean the digits go on). r is never 0 here. */
  function digitsOf(r, d) {
    var out = '';
    var rest = r;
    for (var i = 0; i < 3 && rest; i += 1) {
      rest *= 10;
      out += Math.floor(rest / d);
      rest %= d;
    }
    return rest ? out + '…' : out;
  }
  /* What a calculator shows for n ÷ d, with the locale's separator: 7 ÷ 3 gives 2,333… */
  function valueText(n, d) {
    var r = n % d;
    return r ? Math.floor(n / d) + t('ui.decimalSep') + digitsOf(r, d) : String(n / d);
  }
  /* The decimal part on its own: what is left over, as a part of one pack. 1 ÷ 3 gives 0,333… */
  function decimalPart(r, d) { return '0' + t('ui.decimalSep') + digitsOf(r, d); }
  /* A number that does not divide exactly by d, with at least two full packs. */
  function notExact(d) {
    var n;
    do { n = rint(2 * d + 1, 49); } while (n % d === 0);
    return n;
  }

  /* ---- Drawing ----------------------------------------------------------
     `total` items shared in rows of `size`: each full row is a framed group,
     and what is left over sits apart, so «sobra» reads at a glance. */
  function items(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + DOT + '</span>';
    return html;
  }
  function divisionText(total, size) {
    var text = fill(t('ui.division'), { T: total, d: size, q: Math.floor(total / size) });
    if (total % size) text += ', ' + fill(t('ui.remainder'), { r: total % size });
    return text;
  }
  function packHtml(total, size) {
    var full = Math.floor(total / size);
    var rest = total % size;
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(size, 'ops-item') + '</div></div>';
    if (rest) html += '<div class="ops-row ops-left-row">' + items(rest, 'ops-item ops-left') + '</div>';
    html += '</div>';
    return html + '<p class="ops-expr">' + divisionText(total, size) + '</p>';
  }
  /* The same packs as packHtml, but the leftover fills only part of a pack: the empty
     places are dashed, so the decimal part reads as a part of one pack. The caption is
     the calculator's answer, with its comma. */
  function missing(count) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="ops-missing" aria-hidden="true"></span>';
    return html;
  }
  function decimalHtml(total, size) {
    var full = Math.floor(total / size);
    var rest = total % size;
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(size, 'ops-item') + '</div></div>';
    if (rest) html += '<div class="ops-group-box ops-part-box"><div class="ops-row">' + items(rest, 'ops-item') + missing(size - rest) + '</div></div>';
    html += '</div>';
    return html + '<p class="ops-expr">' + fill(t('ui.calc'), { T: total, d: size, v: valueText(total, size) }) + '</p>';
  }
  function visualHtml(spec) {
    return spec.calc ? decimalHtml(spec.total, spec.size) : packHtml(spec.total, spec.size);
  }

  /* ---- Test: the questions ------------------------------------------------ */
  /* Answers as text: the right one and up to two others, all different, in a shuffled order. */
  function textOptions(correct, wrongs) {
    var values = [correct];
    wrongs.forEach(function (v) {
      if (values.length < 3 && values.indexOf(v) === -1) values.push(v);
    });
    return App.utils.shuffle(values).map(function (v) {
      return { html: v, aria: v, correct: v === correct };
    });
  }

  /* Numbers as answers: the right one and up to two others, all different and not
     below zero, in a shuffled order. */
  function numericTextOptions(correct, wrongs) {
    return textOptions(String(correct), wrongs.filter(function (v) { return v >= 0; }).map(String));
  }

  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.utils.shuffle([
      { html: t('ui.yes'), aria: t('ui.yes'), correct: yes },
      { html: t('ui.no'), aria: t('ui.no'), correct: !yes }
    ]);
  }

  /* Which number divides exactly: the right one is a multiple of `d`; the others are not. */
  function makePick() {
    var d = pick(DATA.divisors);
    var n = d * rint(6, Math.floor(99 / d));
    return {
      prompt: fill(t('q.pick.prompt'), { d: d }),
      hint: fill(t('q.pick.hint'), { d: d }),
      options: numericTextOptions(n, [n + 1, n - 1, n + d - 1]),
      explanation: fill(t('q.pick.explain'), { n: n, d: d })
    };
  }

  /* Does this number divide exactly? The answer is yes or no, by dividing. */
  function makeYesNo() {
    var d = pick(DATA.divisors);
    var yes = Math.random() < 0.5;
    var n = d * rint(6, Math.floor(99 / d));
    if (!yes) n += rint(1, d - 1);
    var values = { n: n, d: d, q: Math.floor(n / d), r: n % d };
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: t('q.yesno.hint'),
      options: yesNoOptions(yes),
      explanation: fill(t(yes ? 'q.yesno.yes' : 'q.yesno.no'), values)
    };
  }

  /* One step of a rule: a question with numbers as answers. */
  function numberStep(prompt, hint, correct, wrongs, explanation) {
    return { prompt: prompt, hint: hint, options: numericTextOptions(correct, wrongs), explanation: explanation };
  }
  /* One step of a rule: a yes-or-no question. */
  function yesNoStep(prompt, hint, yes, yesExplanation, noExplanation) {
    return { prompt: prompt, hint: hint, options: yesNoOptions(yes), explanation: yes ? yesExplanation : noExplanation };
  }

  /* The rules, one step at a time. The person works out the last digit
     (or the sum of the digits for 3), decides about that, and only then
     answers the question. Every step is a choice, so the question is
     answered at the last step, and the steps are practised, not skipped. */
  function makeRule(d) {
    var yes = Math.random() < 0.5;
    var n;
    do { n = rint(10, 98); } while ((n % d === 0) !== yes);
    var a = Math.floor(n / 10);
    var b = n % 10;
    var steps = [];
    if (d === 3) {
      var s = digitSum(n);
      var sumValues = { n: n, a: a, b: b, s: s, q3: Math.floor(s / 3), r: s % 3 };
      steps.push(numberStep(fill(t('q.rule.sumPrompt'), sumValues), t('q.rule.sumHint'), s,
        [s + 1, s + 2, s - 1], fill(t('q.rule.sumExplain'), sumValues)));
      steps.push(yesNoStep(fill(t('q.rule.div3Prompt'), sumValues), t('q.rule.div3Hint'), s % 3 === 0,
        fill(t('q.rule.div3Yes'), sumValues), fill(t('q.rule.div3No'), sumValues)));
    } else {
      var c = b;
      var values = { n: n, d: d, c: c };
      steps.push(numberStep(fill(t('q.rule.lastPrompt'), values), t('q.rule.lastHint'), c,
        [(c + 1) % 10, (c + 3) % 10, (c + 5) % 10], fill(t('q.rule.lastExplain'), values)));
      var digitOk = d === 2 ? c % 2 === 0 : (d === 5 ? c === 0 || c === 5 : c === 0);
      steps.push(yesNoStep(fill(t('q.rule.check.' + d + '.prompt'), values), t('q.rule.check.' + d + '.hint'), digitOk,
        fill(t('q.rule.check.' + d + '.yes'), values), fill(t('q.rule.check.' + d + '.no'), values)));
    }
    var finalValues = { n: n, d: d };
    steps.push(yesNoStep(fill(t('q.rule.finalPrompt'), finalValues), t('q.rule.finalHint'), yes,
      fill(t('q.rule.finalYes'), finalValues), fill(t('q.rule.finalNo'), finalValues)));
    return steps;
  }

  /* The whole part: how many full packs come out when the calculator shows a decimal.
     The wrong answers are the usual slips: one pack more, or the number of items. */
  function makeInteger() {
    var d = pick(DATA.divisors);
    var n = notExact(d);
    var q = Math.floor(n / d);
    var values = { n: n, d: d, q: q, v: valueText(n, d) };
    return {
      prompt: fill(t('q.integer.prompt'), values),
      hint: t('q.integer.hint'),
      options: numericTextOptions(q, [q + 1, n]),
      explanation: fill(t('q.integer.explain'), values)
    };
  }

  /* The decimal part: what is left over, as a part of one pack. The wrong answers are the
     leftover count (one ball, not one part of a pack) and the whole part. */
  function makeDecimal() {
    var d = pick(DATA.divisors);
    var n = notExact(d);
    var r = n % d;
    var values = { n: n, d: d, q: Math.floor(n / d), r: r, v: valueText(n, d), dec: decimalPart(r, d) };
    return {
      prompt: fill(t('q.decimal.prompt'), values),
      hint: t('q.decimal.hint'),
      options: textOptions(values.dec, [String(r), String(values.q)]),
      explanation: fill(t('q.decimal.explain'), values)
    };
  }

  /* A question is a list of steps: one step for most types, three for a rule. */
  function makeQuestion(type) {
    if (type.indexOf('rule') === 0) return { steps: makeRule(+type.slice(4)) };
    if (type === 'pick') return { steps: [makePick()] };
    if (type === 'yesno') return { steps: [makeYesNo()] };
    if (type === 'integer') return { steps: [makeInteger()] };
    return { steps: [makeDecimal()] };
  }

  App.activityFlow.setup({
    toolId: 'divisibility-test',
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
