/* ============================================================
   Calculia — Múltiplos
   Two stages: the explanation, then the game (config.pairedPractice), one
   after the other, never side by side. The game draws a number a from 1 to 9.
   The user taps the numbers 1 to 9 in order; each tap multiplies a by that
   number, shows the product as the multiple, and adds it to the list of the
   multiples found so far, kept in order. The stages and the screens are built
   by assets/js/activity-flow.js (mode 'options', skipReal); this file has the
   drawing of the explanation and the game. The texts are in strings.<locale>.js
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
  function rowHtml(each, k) {
    return '<div class="mul-row"><span class="mul-label">' + each + ' × ' + k + ' = </span>' +
      '<span class="mul-hit">' + (each * k) + '</span>' +
      '<span class="mul-tag">' + fill(t('ui.multipleTag'), { d: each }) + '</span></div>';
  }
  function timesHtml(each, count) {
    var html = '<div class="mul-ladder">';
    for (var k = 1; k <= count; k += 1) html += rowHtml(each, k);
    return html + '</div>';
  }
  /* The definition slide: one multiplication, the multiple marked. */
  function visualHtml(spec) {
    if (spec.kind === 'example') return '<div class="mul-ladder">' + rowHtml(spec.each, spec.k) + '</div>';
    return timesHtml(spec.each, spec.count);
  }

  /* ---- Practice: a game on the right of the explanation -----------------
     A number a is drawn from DATA.numbers (1 to 9). The buttons are the
     numbers 1 to 9, always in order. Each tap k shows a × k as the multiple,
     and the list of the multiples found so far grows in order. The first
     tap of each round gives one star. «Otro número de partida» draws a new a
     and clears the list. */
  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <div class="card centered stack mul-game">',
    '    <p class="mul-start" id="mulStart" aria-live="polite"></p>',
    '    <p class="mul-concept" id="mulConcept"></p>',
    '    <p class="mul-ask" id="mulAsk"></p>',
    '    <div class="mul-picker" id="mulPicker"></div>',
    '    <div class="mul-eq" id="mulEq" aria-live="polite"></div>',
    '    <p class="mul-why" id="mulWhy" aria-live="polite"></p>',
    '    <div class="mul-trail-wrap">',
    '      <p class="mul-trail-title" id="mulTrailTitle"></p>',
    '      <div class="mul-trail" id="mulTrail"></div>',
    '    </div>',
    '  </div>',
    '  <button type="button" class="btn btn-secondary" id="practiceOther" data-i18n="practice.other">Otro número de partida</button>',
    '</section>'
  ].join('\n');

  /* The context of the activity and the state of the round. Set on the first start. */
  var game = null;

  /* A number a from DATA.numbers, shuffled, different from the last one. */
  function drawStart(last) {
    var list = App.utils.shuffle(DATA.numbers.slice());
    var a = list[0];
    if (list.length > 1 && a === last) { a = list[1]; }
    return a;
  }

  /* The buttons 1 to 9, in order. The ones already tapped are pressed. */
  function paintPicker() {
    var picker = $('#mulPicker');
    picker.innerHTML = '';
    DATA.numbers.forEach(function (k) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary mul-pick';
      btn.textContent = '× ' + k;
      btn.setAttribute('aria-label', fill(t('practice.pickAria'), { a: game.a, b: k }));
      btn.setAttribute('aria-pressed', game.found[k] ? 'true' : 'false');
      btn.addEventListener('click', function () { answer(k); });
      picker.appendChild(btn);
    });
  }

  /* The multiples found so far, in order from the smallest. */
  function paintTrail() {
    var trail = $('#mulTrail');
    var keys = Object.keys(game.found).map(Number).sort(function (x, y) { return x - y; });
    trail.innerHTML = '';
    if (keys.length === 0) {
      $('#mulTrailTitle').textContent = '';
      return;
    }
    $('#mulTrailTitle').textContent = fill(t('practice.trail'), { a: game.a });
    keys.forEach(function (k) {
      var chip = document.createElement('span');
      chip.className = 'mul-chip';
      chip.textContent = String(game.a * k);
      trail.appendChild(chip);
    });
  }

  /* A new starting number: the list is cleared and the buttons are shown again. */
  function newRound() {
    game.a = drawStart(game.a);
    game.answered = false;
    game.found = {};
    $('#mulStart').textContent = String(game.a);
    $('#mulConcept').textContent = fill(t('practice.concept'), { a: game.a });
    $('#mulAsk').textContent = fill(t('practice.ask'), { a: game.a });
    $('#mulEq').innerHTML = '';
    $('#mulWhy').textContent = '';
    paintPicker();
    paintTrail();
  }

  /* The user tapped k: the product a × k is the multiple. It is shown in a box,
     said in one short sentence, and added to the list in order. */
  function answer(k) {
    var a = game.a;
    var m = a * k;
    game.found[k] = true;
    $('#mulEq').innerHTML = '<span class="mul-expr">' + a + ' × ' + k + ' = </span>' +
      '<span class="mul-hit">' + m + '</span>';
    $('#mulWhy').textContent = fill(t('practice.why'), { a: a, m: m });
    paintPicker();
    paintTrail();
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
      game = { ctx: ctx, a: null, answered: false, found: {} };
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
