/* ============================================================
   Calculia — Divisores
   Two stages: the explanation, then the game (config.pairedPractice), one
   after the other, never side by side. The game draws a starting number from
   1 to 9; the user picks another number from 1 to 9; the product is shown,
   and why both numbers are divisors of it. The stages and the screens are
   built by assets/js/activity-flow.js (mode 'options', skipReal); this file
   has the drawing and the game. The texts are in strings.<locale>.js and
   the slides and the numbers in data.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;
  function t(key) { return App.i18n.t(key); }

  /* ---- Drawing: no pictures. The point is whether the division is whole («entera») or not.
     Each line is a division n ÷ k. If nothing is left over, the line is marked «división
     entera»; if something is left over, it is marked with the remainder. */
  /* n ÷ k, with the quotient and, when it is not exact, what is left over. */
  function divisionText(n, k) {
    var q = Math.floor(n / k);
    var r = n % k;
    if (r === 0) return fill(t('ui.divide'), { n: n, k: k, q: q });
    return fill(t('ui.divideRest'), { n: n, k: k, q: q, r: r });
  }
  /* One division as a line: the expression, and the tag that says whether it is whole. */
  function divisionLineHtml(n, k, chosen) {
    var r = n % k;
    var tag = r === 0
      ? '<span class="div-tag div-exact-tag">' + t('ui.exactTag') + '</span>'
      : '<span class="div-tag div-rest-tag">' + fill(t('ui.restTag'), { r: r }) + '</span>';
    return '<div class="div-row' + (chosen ? ' div-chosen' : '') + '"><span class="div-label">' + divisionText(n, k) + '</span>' + tag + '</div>';
  }
  /* The divisions of n by 1 to `count`, one per line, as text. */
  function divideHtml(n, count) {
    var html = '<div class="div-ladder">';
    for (var k = 1; k <= count; k += 1) html += divisionLineHtml(n, k, false);
    return html + '</div>';
  }
  function visualHtml(spec) {
    return divideHtml(spec.each, spec.count);
  }

  /* ---- Practice: a game, on the right of the explanation -------------------
     A starting number is drawn at random from DATA.numbers (1 to 9). The user
     picks another number from the same list; the product is shown, and why
     both numbers divide it exactly. The first answer for each starting number
     gives one star. «Otro número de partida» draws a new starting number. */
  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <div class="card centered stack div-game">',
    '    <p class="instruction" data-i18n="practice.start">Yo elijo este número</p>',
    '    <p class="div-start" id="divStart" aria-live="polite"></p>',
    '    <p class="instruction" data-i18n="practice.pick">Ahora elige tú un número del 1 al 9. Es el divisor.</p>',
    '    <div class="div-picker" id="divPicker"></div>',
    '    <div class="div-draw" id="divDraw" aria-live="polite"></div>',
    '    <p class="div-result" id="divResult" aria-live="polite"></p>',
    '    <p class="div-why" id="divWhy" aria-live="polite"></p>',
    '  </div>',
    '  <button type="button" class="btn btn-secondary" id="practiceOther" data-i18n="practice.other">Otro número de partida</button>',
    '</section>'
  ].join('\n');

  /* The context of the activity and the starting number of the round. Set on the first start. */
  var game = null;

  /* The partner's number from DATA.starts, different from the last one. */
  function drawStart(last) {
    var list = DATA.starts;
    var a;
    do { a = list[Math.floor(Math.random() * list.length)]; } while (list.length > 1 && a === last);
    return a;
  }

  /* The number picker: the numbers from 1 to 9, as buttons, in a new random order each time it is shown. */
  function paintPicker() {
    var picker = $('#divPicker');
    picker.innerHTML = '';
    App.utils.shuffle(DATA.numbers.slice()).forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary div-pick';
      btn.textContent = String(b);
      btn.setAttribute('aria-label', fill(t('practice.pickAria'), { a: game.a, b: b }));
      btn.addEventListener('click', function () { answer(b); });
      picker.appendChild(btn);
    });
  }

  /* A new starting number: the result is cleared and the picker is shown again. */
  function newRound() {
    game.a = drawStart(game.a);
    game.answered = false;
    $('#divStart').textContent = String(game.a);
    $('#divDraw').innerHTML = '';
    $('#divResult').textContent = '';
    $('#divWhy').textContent = '';
    paintPicker();
  }

  /* The partner's divisions of a, from 1 to 9, one per line: the one the user chose (b) is marked. */
  function divisionsHtml(a, b) {
    var html = '<p class="div-partner">' + fill(t('practice.partner'), { a: a, b: b }) + '</p>';
    html += '<p class="div-list-title">' + fill(t('practice.listTitle'), { a: a }) + '</p><div class="div-ladder">';
    for (var k = 1; k <= 9; k += 1) html += divisionLineHtml(a, k, k === b);
    return html + '</div>';
  }

  /* The user picked b: the partner divides a by b, and says whether the division is whole. */
  function answer(b) {
    var a = game.a;
    var q = Math.floor(a / b);
    var r = a % b;
    $('#divDraw').innerHTML = divisionsHtml(a, b);
    $('#divResult').textContent = divisionText(a, b);
    $('#divWhy').textContent = r
      ? fill(t('practice.whyNo'), { a: a, b: b, r: r })
      : fill(t('practice.why'), { a: a, b: b, q: q });
    if (!game.answered) {
      game.answered = true;
      game.ctx.progress.stars += 1;
      game.ctx.save();
      game.ctx.paintStars();
    }
  }

  /* The practice starts with a new starting number. The fixed button is wired once, the first time. */
  function startPractice(ctx) {
    if (!game) {
      game = { ctx: ctx, a: null, answered: false };
      $('#practiceOther').addEventListener('click', newRound);
    }
    newRound();
    ctx.show('#screenPractice');
  }

  App.activityFlow.setup({
    toolId: 'divisors',
    intro: DATA.intro,
    real: [],
    skipReal: true,
    visualHtml: visualHtml,
    extraMarkup: PRACTICE_HTML,
    extraScreens: ['#screenPractice'],
    pairedPractice: true,
    practiceFromStart: true,
    ownTest: startPractice
  });
})();
