/* ============================================================
   Calculia — Múltiplos
   Two stages: the explanation, then the game (config.pairedPractice), one
   after the other, never side by side. The game draws a starting number
   from 1 to 9; the user picks another number from 1 to 9; the product
   is shown, with the reason it is a multiple. The stages and the screens
   are built by assets/js/activity-flow.js (mode 'options', skipReal); this
   file has the drawings and the game. The texts are in strings.<locale>.js
   and the slides and the numbers in data.js.
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
  /* The multiplications of `each` by 1 to `count`, one per line, as text: «5 × 1 = 5», «5 × 2 = 10»… No pictures. */
  function timesHtml(each, count) {
    var html = '<div class="mul-ladder">';
    for (var k = 1; k <= count; k += 1) {
      html += '<div class="mul-row"><span class="mul-label">' + fill(t('ui.times'), { d: each, k: k, m: each * k }) + '</span></div>';
    }
    return html + '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'groups') return groupsHtml(spec.count, spec.each);
    return timesHtml(spec.each, spec.count);
  }

  /* ---- Practice: a game, on the left of the explanation -------------------
     A starting number is drawn at random from DATA.numbers (1 to 9). The user
     picks another number from the same list; the product is shown, with the
     reason it is a multiple. The first answer for each starting number gives
     one star. «Otro número de partida» draws a new starting number. */
  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <div class="card centered stack mul-game">',
    '    <p class="instruction" data-i18n="practice.start">Número de partida</p>',
    '    <p class="mul-start" id="mulStart" aria-live="polite"></p>',
    '    <p class="instruction" data-i18n="practice.pick">Elige otro número del 1 al 9.</p>',
    '    <div class="mul-picker" id="mulPicker"></div>',
    '    <p class="mul-result" id="mulResult" aria-live="polite"></p>',
    '    <p class="mul-why" id="mulWhy" aria-live="polite"></p>',
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
    var picker = $('#mulPicker');
    picker.innerHTML = '';
    App.utils.shuffle(DATA.numbers.slice()).forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary mul-pick';
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
    $('#mulStart').textContent = String(game.a);
    $('#mulResult').textContent = '';
    $('#mulWhy').textContent = '';
    paintPicker();
  }

  /* The user picked b: the product, and why it is a multiple of both numbers. */
  function answer(b) {
    var a = game.a;
    var m = a * b;
    $('#mulResult').textContent = fill(t('practice.result'), { a: a, b: b, m: m });
    $('#mulWhy').textContent = fill(t('practice.why'), { a: a, b: b, m: m });
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
    toolId: 'multiples',
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
