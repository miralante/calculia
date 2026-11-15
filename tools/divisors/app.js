/* ============================================================
   Calculia — Divisores
   Two stages side by side: the game on the left and the explanation on
   the right (config.pairedPractice). The game draws a starting number from
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

  /* ---- Drawing ----------------------------------------------------------
     Every drawing is made of small dots. A row of dots is a group; the
     product of its groups is written under it («3 × 4 = 12»). */
  var DOT = '🔴';
  function items(count, cls) { return App.answerOptions.dotRow(count, cls, DOT); }
  function productText(count, each) {
    return fill(t('ui.product'), { k: count, d: each, m: count * each });
  }
  /* `count` equal groups of `each` dots, one above the other, and their product. */
  function groupsHtml(count, each) {
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < count; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(each, 'ops-item') + '</div></div>';
    return html + '</div><p class="ops-expr">' + productText(count, each) + '</p>';
  }
  /* n ÷ k, with the quotient; «sobra» with what is left over when the division is not exact. */
  function divisionText(n, k) {
    var q = Math.floor(n / k);
    var r = n % k;
    if (r === 0) return fill(t('ui.divide'), { n: n, k: k, q: q });
    return fill(t('ui.divideRest'), { n: n, k: k, q: q, r: r });
  }
  /* The divisions of n by 1 to `count`, one per line, as text: «12 ÷ 1 = 12», «12 ÷ 5 = 2, sobra 2»… No pictures. */
  function divideHtml(n, count) {
    var html = '<div class="div-ladder">';
    for (var k = 1; k <= count; k += 1) {
      html += '<div class="div-row"><span class="div-label">' + divisionText(n, k) + '</span></div>';
    }
    return html + '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'groups') return groupsHtml(spec.count, spec.each);
    return divideHtml(spec.each, spec.count);
  }

  /* ---- Practice: a game, on the left of the explanation -------------------
     A starting number is drawn at random from DATA.numbers (1 to 9). The user
     picks another number from the same list; the product is shown, and why
     both numbers divide it exactly. The first answer for each starting number
     gives one star. «Otro número de partida» draws a new starting number. */
  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <div class="card centered stack div-game">',
    '    <p class="instruction" data-i18n="practice.start">Número de partida</p>',
    '    <p class="div-start" id="divStart" aria-live="polite"></p>',
    '    <p class="instruction" data-i18n="practice.pick">Elige otro número del 1 al 9.</p>',
    '    <div class="div-picker" id="divPicker"></div>',
    '    <p class="div-result" id="divResult" aria-live="polite"></p>',
    '    <p class="div-why" id="divWhy" aria-live="polite"></p>',
    '  </div>',
    '  <button type="button" class="btn btn-secondary" id="practiceOther" data-i18n="practice.other">Otro número de partida</button>',
    '</section>'
  ].join('\n');

  /* The context of the activity and the starting number of the round. Set on the first start. */
  var game = null;

  /* A starting number from DATA.numbers, different from the last one. */
  function drawStart(last) {
    var list = DATA.numbers;
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
    $('#divResult').textContent = '';
    $('#divWhy').textContent = '';
    paintPicker();
  }

  /* The user picked b: the product, and why both numbers divide it exactly. */
  function answer(b) {
    var a = game.a;
    var m = a * b;
    $('#divResult').textContent = fill(t('practice.result'), { a: a, b: b, m: m });
    $('#divWhy').textContent = fill(t('practice.why'), { a: a, b: b, m: m });
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
    ownTest: startPractice
  });
})();
