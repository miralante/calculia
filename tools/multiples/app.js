/* ============================================================
   Calculia — Múltiplos
   Two stages: the explanation, then the game (config.pairedPractice), one
   after the other, never side by side. The game draws a starting number
   from 1 to 9; the user picks another number from 1 to 9; the product
   is shown, marked in the list of multiples, with the reason it is a
   multiple. The stages and the screens are built by assets/js/activity-flow.js
   (mode 'options', skipReal); this file has the lines of multiples and the game. The texts are in strings.<locale>.js
   and the slides and the numbers in data.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;
  function t(key) { return App.i18n.t(key); }

  /* ---- Drawing: no pictures. The concept is written, and the multiple is marked.
     Each line is a multiplication «5 × 2 = 10»; the product, which is the multiple,
     is highlighted and tagged «múltiplo de 5». */
  function timesHtml(each, count) {
    var html = '<div class="mul-ladder">';
    for (var k = 1; k <= count; k += 1) {
      html += '<div class="mul-row"><span class="mul-label">' + each + ' × ' + k + ' = </span>' +
        '<span class="mul-hit">' + (each * k) + '</span>' +
        '<span class="mul-tag">' + fill(t('ui.multipleTag'), { d: each }) + '</span></div>';
    }
    return html + '</div>';
  }
  function visualHtml(spec) {
    return timesHtml(spec.each, spec.count);
  }

  /* The partner's multiples of a: a × 1 to a × 9, in a row. The one the user made, a × b, is marked. */
  function multiplesHtml(a, b) {
    var html = '<p class="mul-partner">' + fill(t('practice.partner'), { a: a, b: b }) + '</p>';
    html += '<p class="mul-list-title">' + fill(t('practice.listTitle'), { a: a }) + '</p><div class="mul-chips">';
    for (var k = 1; k <= 9; k += 1) {
      html += '<span class="mul-chip' + (k === b ? ' mul-hit' : '') + '">' + (a * k) + '</span>';
    }
    return html + '</div>';
  }

  /* ---- Practice: a game, on the left of the explanation -------------------
     A starting number is drawn at random from DATA.numbers (1 to 9). The user
     picks another number from the same list; the product is shown, with the
     reason it is a multiple. The first answer for each starting number gives
     one star. «Otro número de partida» draws a new starting number. */
  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <div class="card centered stack mul-game">',
    '    <p class="instruction" data-i18n="practice.start">Yo elijo este número</p>',
    '    <p class="mul-start" id="mulStart" aria-live="polite"></p>',
    '    <p class="instruction" data-i18n="practice.pick">Ahora elige tú otro número del 1 al 9.</p>',
    '    <div class="mul-picker" id="mulPicker"></div>',
    '    <div class="mul-draw" id="mulDraw" aria-live="polite"></div>',
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
    $('#mulDraw').innerHTML = '';
    $('#mulResult').textContent = '';
    $('#mulWhy').textContent = '';
    paintPicker();
  }

  /* The user picked b. The partner (the app) makes the multiple a × b: the list of its
     multiples with a × b marked, the product, and why it is a multiple of both numbers. */
  function answer(b) {
    var a = game.a;
    var m = a * b;
    $('#mulDraw').innerHTML = multiplesHtml(a, b);
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
