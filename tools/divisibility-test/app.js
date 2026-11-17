/* ============================================================
   Calculia — Divisibilidad
   Two stages, the flow of Operaciones: 1. explanation (slides: the text on
   the left, and on the right a frame the child works with: share balls in
   groups, tap the numbers that divide exactly, add the digits), 2. test (one
   question at a time). There is no real-life stage: the test is the practice.
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

  var DOT = '🔴';
  function digitSum(n) {
    return String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
  }

  /* ---- Frames: the practice beside each explanation ----------------------- */
  function items(count, cls) { return App.answerOptions.dotRow(count, cls, DOT); }

  /* The groups frame, drawn from its state: `groups` groups of `d` balls are made, and the
     balls left over wait below. The buttons sit above the drawing, so they do not move as
     the groups grow. Once every full group is made, the leftover is shown and the result. */
  function groupsBody(n, d, groups, opts) {
    var q = Math.floor(n / d);
    var r = n % d;
    var done = groups >= q;
    var html = '<p class="ops-story">' + fill(t('ui.divInstruction'), { T: n, d: d }) + '</p>';
    if (opts.choices) {
      html += '<div class="ops-div-choices">' + DATA.divisors.map(function (v) {
        return '<button type="button" class="btn btn-secondary ops-div-choice" data-divisor="' + v + '" aria-pressed="' +
          (v === d) + '">' + fill(t('ui.divChoice'), { d: v }) + '</button>';
      }).join('') + '</div>';
    }
    html += '<div class="ops-div-actions">' +
      '<button type="button" class="btn btn-secondary" data-div="step" style="visibility:' + (done ? 'hidden' : 'visible') + '">' +
      fill(t('ui.divOne'), { d: d }) + '</button>' +
      '<button type="button" class="btn btn-secondary" data-div="reset" style="visibility:' + (groups ? 'visible' : 'hidden') + '">' +
      t('ui.divReset') + '</button>' +
      '</div>';
    html += '<div class="ops-div-groups">';
    for (var g = 0; g < groups; g += 1) html += '<div class="ops-div-box">' + items(d, 'ops-item') + '</div>';
    html += '</div>';
    var left = n - groups * d;
    html += '<div class="ops-div-pool">' + items(left, done ? 'ops-item ops-div-left' : 'ops-item') + '</div>';
    if (done && r === 0) {
      html += '<p class="ops-expr ops-div-result">' + fill(t('ui.divWhole'), { T: n, d: d, q: q }) + '</p>';
    } else if (done) {
      html += '<p class="ops-expr ops-div-result">' + fill(t('ui.divRest'), { T: n, d: d, q: q, r: r }) + '</p>';
    }
    return html;
  }
  function groupsFrameHtml(f) {
    return '<div class="ops-div" data-n="' + f.n + '" data-d="' + f.d + '" data-choices="1">' +
      groupsBody(f.n, f.d, 0, { choices: true }) + '</div>';
  }

  /* One ball of the balls frame: its number, in the colour of its group. */
  function ballHtml(v, color) {
    return '<span class="div-ball" style="background-color:' + color + '">' + v + '</span>';
  }

  /* The balls frame, the same support as Pares e impares: the balls in groups of d,
     one colour per full group, and the balls left over in their own colour. */
  function ballsBody(n, d) {
    var q = Math.floor(n / d);
    var r = n % d;
    var num = 0;
    var html = '<p class="ops-story">' + fill(t('ui.divInstruction'), { T: n, d: d }) + '</p>';
    html += '<div class="div-balls" role="img" aria-label="' +
      fill(t(r ? 'ui.ballsAriaRest' : 'ui.ballsAriaWhole'), { T: n, d: d, q: q, r: r }) + '">';
    for (var g = 0; g < q; g += 1) {
      var color = DATA.groupColors[g % DATA.groupColors.length];
      html += '<div class="div-ball-group">';
      for (var i = 0; i < d; i += 1) { num += 1; html += ballHtml(num, color); }
      html += '</div>';
    }
    if (r) {
      html += '<div class="div-ball-group div-ball-left">';
      for (var j = 0; j < r; j += 1) { num += 1; html += ballHtml(num, DATA.leftoverColor); }
      html += '</div>';
    }
    html += '</div>';
    html += '<p class="ops-expr ops-div-result">' + fill(t(r ? 'ui.divRest' : 'ui.divWhole'), { T: n, d: d, q: q, r: r }) + '</p>';
    return html;
  }
  function ballsFrameHtml(f) {
    return '<div class="ops-div">' + ballsBody(f.n, f.d) + '</div>';
  }

  /* The tap frame, a game for one rule: the rule is written above the numbers, and the
     numbers are buttons. A tap shows the division for that number; find all the ones that
     divide exactly and the game is won. For 3, the digits and their sum are shown too. */
  function tapFrameHtml(f) {
    var total = f.numbers.filter(function (v) { return v % f.d === 0; }).length;
    var chips = f.numbers.map(function (v) {
      return '<button type="button" class="btn btn-secondary ops-div-chip" data-tap="' + v + '" data-d="' + f.d + '">' + v + '</button>';
    }).join('');
    return '<div class="ops-div ops-tap" data-total="' + total + '">' +
      '<p class="div-rule-card">' + t('ui.ruleCard' + f.d) + '</p>' +
      '<p class="ops-story">' + fill(t('ui.tapInstruction'), { d: f.d }) + '</p>' +
      '<div class="ops-div-chips">' + chips + '</div>' +
      '<p class="ops-expr ops-div-result" hidden></p>' +
      '<p class="ops-expr ops-div-done" hidden>' + fill(t('ui.tapDone'), { d: f.d }) + '</p>' +
      '</div>';
  }

  /* The digits frame: the digits of n, their sum on a button, then the sum shared in groups of 3. */
  function digitsFrameHtml(f) {
    var digits = String(f.n).split('');
    var s = digitSum(f.n);
    var cards = digits.map(function (c) { return '<span class="ops-digit">' + c + '</span>'; }).join('');
    return '<div class="ops-digits">' +
      '<p class="ops-story">' + fill(t('ui.digitsInstruction'), { n: f.n }) + '</p>' +
      '<div class="ops-div-chips">' + cards + '</div>' +
      '<div class="ops-div-actions" data-digits-actions>' +
      '<button type="button" class="btn btn-secondary" data-digits="sum">' + t('ui.digitsSum') + '</button>' +
      '</div>' +
      '<p class="ops-expr ops-div-result" hidden>' + fill(t('ui.digitsResult'), { parts: digits.join(' + '), s: s }) + '</p>' +
      '<div class="ops-digits-group" hidden>' +
      '<p class="ops-story">' + fill(t('ui.digitsAsk'), { s: s }) + '</p>' +
      '<div class="ops-div" data-n="' + s + '" data-d="3" data-choices="0">' +
      groupsBody(s, 3, 0, { choices: false }) + '</div>' +
      '</div>' +
      '</div>';
  }

  /* The game of a dynamic explanation slide (activity-flow puts it under the explanation, full width). */
  function gameHtml(slide) {
    var f = slide && slide.frame;
    if (!f) return '';
    if (f.kind === 'balls') return ballsFrameHtml(f);
    if (f.kind === 'tap') return tapFrameHtml(f);
    if (f.kind === 'digits') return digitsFrameHtml(f);
    return groupsFrameHtml(f);
  }

  /* The frames' buttons. A group or a choice redraws the frame from its own data attributes. */
  function frameOpts(w) {
    return { choices: w.getAttribute('data-choices') === '1' };
  }
  function tapChip(chip) {
    if (chip.disabled) return;
    var n = Number(chip.getAttribute('data-tap'));
    var d = Number(chip.getAttribute('data-d'));
    var q = Math.floor(n / d);
    var r = n % d;
    chip.disabled = true;
    chip.classList.add(r ? 'is-no' : 'is-yes');
    chip.textContent = n + (r ? ' ✕' : ' ✓');
    var box = chip.closest('.ops-tap');
    var out = box.querySelector('.ops-div-result');
    var text = fill(t(r ? 'ui.tapNo' : 'ui.tapYes'), { n: n, d: d, q: q, r: r });
    if (d === 3) text += ' ' + fill(t('ui.digitsResult'), { parts: String(n).split('').join(' + '), s: digitSum(n) });
    out.textContent = text;
    out.hidden = false;
    /* The game is won when every number that divides exactly has been found. */
    if (box.querySelectorAll('.is-yes').length === Number(box.getAttribute('data-total'))) {
      box.querySelector('.ops-div-done').hidden = false;
    }
  }
  function groupsStep(button) {
    var w = button.closest('.ops-div');
    var n = Number(w.getAttribute('data-n'));
    var d = Number(w.getAttribute('data-d'));
    var groups = w.querySelectorAll('.ops-div-box').length;
    if (button.getAttribute('data-div') === 'reset') {
      w.innerHTML = groupsBody(n, d, 0, frameOpts(w));
    } else if (groups < Math.floor(n / d)) {
      w.innerHTML = groupsBody(n, d, groups + 1, frameOpts(w));
    }
  }

  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    if (!target) return;
    var chip = target.closest('[data-tap]');
    if (chip) { tapChip(chip); return; }
    var choice = target.closest('[data-divisor]');
    if (choice) {
      var cw = choice.closest('.ops-div');
      var cn = Number(cw.getAttribute('data-n'));
      var cd = Number(choice.getAttribute('data-divisor'));
      cw.setAttribute('data-d', String(cd));
      cw.innerHTML = groupsBody(cn, cd, 0, frameOpts(cw));
      return;
    }
    var sum = target.closest('[data-digits]');
    if (sum) {
      var dbox = sum.closest('.ops-digits');
      dbox.querySelector('[data-digits-actions]').hidden = true;
      dbox.querySelector('.ops-div-result').hidden = false;
      dbox.querySelector('.ops-digits-group').hidden = false;
      return;
    }
    var step = target.closest('[data-div]');
    if (step) groupsStep(step);
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
