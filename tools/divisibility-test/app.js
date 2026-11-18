/* ============================================================
   Calculia — Divisibilidad
   Two stages, one after the other, never side by side: 1. the explanation
   (slides: the text on the left, and on the right a frame the child looks at:
   balls put in groups, a calculator's result with or without decimals, the
   digits added), 2. the practice (the games of the rules: the teacher's number
   and the child's divisor). There is no test and no real-life stage.
   The stages and the screens are built by assets/js/activity-flow.js (mode
   'options', skipReal, pairedPractice); this file has the drawings and the
   games. Texts are in strings.<locale>.js, the slides and the games in data.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;
  function t(key) { return App.i18n.t(key); }

  function digitSum(n) {
    return String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
  }

  /* ---- Frames: the practice beside each explanation. Text and dots only, no pictures. ---- */

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

  /* `count` balls in a row. Each ball is a dot; the text beside the group says what it is. */
  function ballRowHtml(count, extraClass) {
    var html = '<span class="ball-row' + (extraClass ? ' ' + extraClass : '') + '">';
    for (var i = 0; i < count; i += 1) html += '<span class="ball-dot" aria-hidden="true"></span>';
    return html + '</span>';
  }

  /* n balls put in groups of d, drawn. Each full group is a box with its tick; the balls left
     over sit outside, in a dashed box with the number left. The two cases read apart by their
     shape and their words, not by colour alone. */
  function ballsFrameHtml(f) {
    var n = f.n;
    var d = f.d;
    var q = Math.floor(n / d);
    var r = n % d;
    var groups = '';
    for (var g = 0; g < q; g += 1) {
      groups += '<span class="ball-group is-full">' + ballRowHtml(d, '') +
        '<span class="ball-group-tag">' + t('ui.groupFull') + '</span></span>';
    }
    var rest = r
      ? '<span class="ball-group is-rest">' + ballRowHtml(r, 'is-rest') +
        '<span class="ball-group-tag">' + fill(t('ui.ballsLeft'), { r: r }) + '</span></span>'
      : '';
    return '<div class="ops-div ball-frame">' +
      '<p class="ops-story">' + fill(t('ui.ballsInstruction'), { n: n, d: d }) + '</p>' +
      '<div class="ball-groups">' + groups + rest + '</div>' +
      '<div class="div-ladder">' + divisionLineHtml(n, d) + '</div>' +
      '</div>';
  }

  /* One division as a calculator shows it: the expression, the screen with the result, and a tag.
     A whole result has no decimals and the division is exact; otherwise the screen shows decimals. */
  function calcLineHtml(n, d) {
    var exact = n % d === 0;
    var shown = exact ? String(n / d) : (n / d).toFixed(6).replace(/\.?0+$/, '');
    shown = shown.replace('.', t('ui.decimalSep'));
    var tag = exact
      ? '<span class="div-tag div-exact-tag">' + t('ui.calcNoDecimals') + '</span>'
      : '<span class="div-tag div-rest-tag">' + t('ui.calcHasDecimals') + '</span>';
    return '<div class="calc-line">' +
      '<span class="calc-expr">' + fill(t('ui.calcSum'), { n: n, d: d }) + '</span>' +
      '<span class="calc-screen">' + shown + '</span>' + tag + '</div>';
  }
  function calcFrameHtml(f) {
    return '<div class="ops-div calc-frame">' +
      f.pairs.map(function (p) { return calcLineHtml(p[0], p[1]); }).join('') + '</div>';
  }

  /* ---- Games: the teacher and the child, one game for each rule ---------- */

  /* The teacher game of one rule (the game `f`: its divisor `d` and its `numbers`). The teacher (the app)
     has chosen a number, and shows it; the child chooses a divisor (2, 3, 5 or 10). Then the teacher
     checks the rule for that divisor on the number (the last digit, or the sum of the digits for 3) and
     gives the division. «Yo elijo otro número» lets the teacher choose another number from the list. The
     game is redrawn from its own data attributes. */
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

  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    if (!target) return;
    var teacherChoice = target.closest('[data-teacher-d]');
    if (teacherChoice) { teacherPick(teacherChoice); return; }
    var teacherNextBtn = target.closest('[data-teacher-next]');
    if (teacherNextBtn) { teacherNext(teacherNextBtn); return; }
  });

  /* ---- Practice: the four games, one under the other, one for each rule ---- */
  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <div class="stack" id="practiceGames"></div>',
    '</section>'
  ].join('\n');

  /* The practice starts with the games of the four rules. Each game's numbers come in a new random
     order, so the teacher's first number, and the next ones, change every time. */
  function startPractice(ctx) {
    $('#practiceGames').innerHTML = DATA.games.map(function (g) {
      var shuffled = App.utils.shuffle(g.numbers.slice());
      return '<article class="card stack">' + teacherFrameHtml({ d: g.d, numbers: shuffled }) + '</article>';
    }).join('');
    ctx.show('#screenPractice');
  }

  /* The frame beside an explanation slide (activity-flow puts it under the explanation, full width). */
  function gameHtml(slide) {
    var f = slide && slide.frame;
    if (!f) return '';
    if (f.kind === 'balls') return ballsFrameHtml(f);
    if (f.kind === 'calc') return calcFrameHtml(f);
    if (f.kind === 'sum') return sumFrameHtml(f);
    return '';
  }

  App.activityFlow.setup({
    toolId: 'divisibility-test',
    pairedPractice: true,
    intro: DATA.intro,
    real: [],
    skipReal: true,
    gameHtml: gameHtml,
    extraMarkup: PRACTICE_HTML,
    extraScreens: ['#screenPractice'],
    ownTest: startPractice
  });
})();
