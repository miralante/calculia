/* ============================================================
   Calculia — Divisibilidad
   Two stages, the flow of Operaciones: 1. explanation (slides: the text on
   the left, and on the right a frame the child works with: a division written
   out with whether it comes out exact, the teacher's number with the child's
   divisor, the digits added), 2. test (one question at a time). There are no
   pictures and no real-life stage: the test is the practice.
   The stages and the screens are built by assets/js/activity-flow.js (mode
   'options', skipReal); a question of a rule has several steps (`steps`),
   scored once. Texts are in strings.<locale>.js, the slides and the test
   settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;
  var rint = App.utils.rint;
  var pick = App.utils.pick;
  function t(key) { return App.i18n.t(key); }

  function digitSum(n) {
    return String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
  }

  /* ---- Frames: the practice beside each explanation. Text only, no pictures. ---- */

  /* One division n ÷ d as a line: the expression, and a tag that says whether it comes out exact. */
  function divisionLineHtml(n, d) {
    var q = Math.floor(n / d);
    var r = n % d;
    var expr = r
      ? fill(t('ui.lineRest'), { n: n, d: d, q: q, r: r })
      : fill(t('ui.lineExact'), { n: n, d: d, q: q });
    var tag = r
      ? '<span class="div-tag div-rest-tag">' + fill(t('ui.restTag'), { r: r }) + '</span>'
      : '<span class="div-tag div-exact-tag">' + t('ui.exactTag') + '</span>';
    return '<div class="div-row"><span class="div-label">' + expr + '</span>' + tag + '</div>';
  }
  /* The divisions of the pairs in the frame, one per line. */
  function divideFrameHtml(f) {
    return '<div class="ops-div">' +
      '<div class="div-ladder">' + f.pairs.map(function (p) { return divisionLineHtml(p[0], p[1]); }).join('') + '</div>' +
      '</div>';
  }

  /* The digits frame: the digits of n written with their sum, then the sum divided by 3. */
  function sumFrameHtml(f) {
    var digits = String(f.n).split('');
    var s = digitSum(f.n);
    return '<div class="ops-div">' +
      '<p class="ops-story">' + fill(t('ui.digitsInstruction'), { n: f.n }) + '</p>' +
      '<div class="div-ladder">' +
        '<div class="div-row"><span class="div-label">' + fill(t('ui.digitsResult'), { parts: digits.join(' + '), s: s }) + '</span></div>' +
        divisionLineHtml(s, 3) +
      '</div>' +
      '</div>';
  }

  /* The teacher frame, a game for one rule. The teacher (the app) has chosen a number, and
     shows it; the child chooses a divisor (2, 3, 5 or 10). Then the teacher checks the rule
     for that divisor on the number (the last digit, or the sum of the digits for 3) and gives
     the division. «Otro número» lets the teacher choose another number from the list. The
     frame is redrawn from its own data attributes. */
  function teacherBody(numbers, idx, rule, pick) {
    var n = numbers[idx];
    var html = '<p class="div-rule-card">' + t('ui.ruleCard' + rule) + '</p>';
    html += '<p class="ops-story">' + fill(t('ui.teacherStart'), { n: n }) + '</p>';
    html += '<div class="ops-div-choices">' + DATA.divisors.map(function (v) {
      return '<button type="button" class="btn btn-secondary ops-div-choice" data-teacher-d="' + v + '" aria-pressed="' +
        (v === pick) + '">' + fill(t('ui.divChoice'), { d: v }) + '</button>';
    }).join('') + '</div>';
    if (pick) html += teacherResult(n, pick);
    html += '<div class="ops-div-actions"><button type="button" class="btn btn-secondary" data-teacher-next>' +
      t('ui.teacherNext') + '</button></div>';
    return html;
  }
  /* The teacher's answer for the number n and the divisor d: the rule, then the division. */
  function teacherResult(n, d) {
    var q = Math.floor(n / d);
    var r = n % d;
    var rule;
    if (d === 3) {
      var s = digitSum(n);
      var sumValues = { n: n, a: Math.floor(n / 10), b: n % 10, s: s, q3: Math.floor(s / 3), r: s % 3 };
      rule = fill(t('q.rule.sumExplain'), sumValues) + ' ' + fill(t(s % 3 ? 'q.rule.div3No' : 'q.rule.div3Yes'), sumValues);
    } else {
      var c = n % 10;
      var ok = d === 2 ? c % 2 === 0 : (d === 5 ? c === 0 || c === 5 : c === 0);
      rule = fill(t('q.rule.check.' + d + (ok ? '.yes' : '.no')), { c: c });
    }
    return '<p class="ops-story">' + rule + '</p>' +
      '<p class="ops-expr ops-div-result">' + fill(t(r ? 'q.yesno.no' : 'q.yesno.yes'), { n: n, d: d, q: q, r: r }) + '</p>';
  }
  function teacherFrameHtml(f) {
    return '<div class="ops-div div-teacher" data-numbers="' + f.numbers.join(',') + '" data-idx="0" data-rule="' + f.d + '">' +
      teacherBody(f.numbers, 0, f.d, 0) + '</div>';
  }
  function teacherPick(button) {
    var w = button.closest('.div-teacher');
    var numbers = w.getAttribute('data-numbers').split(',').map(Number);
    w.innerHTML = teacherBody(numbers, Number(w.getAttribute('data-idx')), Number(w.getAttribute('data-rule')),
      Number(button.getAttribute('data-teacher-d')));
  }
  function teacherNext(button) {
    var w = button.closest('.div-teacher');
    var numbers = w.getAttribute('data-numbers').split(',').map(Number);
    var idx = (Number(w.getAttribute('data-idx')) + 1) % numbers.length;
    w.setAttribute('data-idx', String(idx));
    w.innerHTML = teacherBody(numbers, idx, Number(w.getAttribute('data-rule')), 0);
  }

  /* The game of a dynamic explanation slide (activity-flow puts it under the explanation, full width). */
  function gameHtml(slide) {
    var f = slide && slide.frame;
    if (!f) return '';
    if (f.kind === 'divide') return divideFrameHtml(f);
    if (f.kind === 'teacher') return teacherFrameHtml(f);
    if (f.kind === 'sum') return sumFrameHtml(f);
    return '';
  }

  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    if (!target) return;
    var teacherChoice = target.closest('[data-teacher-d]');
    if (teacherChoice) { teacherPick(teacherChoice); return; }
    var teacherNextBtn = target.closest('[data-teacher-next]');
    if (teacherNextBtn) { teacherNext(teacherNextBtn); return; }
  });

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
    return App.answerOptions.yesNo(yes, { yes: t('ui.yes'), no: t('ui.no') });
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

  /* A question is a list of steps: one step for most types, several for a rule. */
  function makeQuestion(type) {
    if (type.indexOf('rule') === 0) return { steps: makeRule(+type.slice(4)) };
    if (type === 'pick') return { steps: [makePick()] };
    return { steps: [makeYesNo()] };
  }

  App.activityFlow.setup({
    toolId: 'divisibility-test',
    pairedTest: true,
    intro: DATA.intro,
    real: [],
    skipReal: true,
    gameHtml: gameHtml,
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
      return App.utils.shuffle(list);
    },
    makeQuestion: makeQuestion
  });
})();
