/* ============================================================
   Calculia — Divisores
   Two stages, the flow of Múltiplos: 1. explanation (slides: what a divisor
   is, with a drawing, then divisions as text), 2. practice: a game, in place
   of the rounds of questions (config.ownTest). The stages and the screens are
   built by assets/js/activity-flow.js (mode 'options', skipReal); this file
   has the drawing and the game. The texts are in strings.<locale>.js and the
   slides and the numbers in data.js.
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

  /* ---- Practice: a game ---------------------------------------------------
     The user picks a number. Its divisions by 1 to 10 are cards with the
     question («12 ÷ 5 = ?»); a tap on a card shows the division, exact or with
     what is left over. When all ten are shown, the list of the divisors up to
     10 is given: one star and a celebration. The number buttons are shuffled
     each time they are shown (they are the options); the cards keep the order
     1 to 10, which is what is taught. */
  var STEPS = 10;

  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <button type="button" class="btn btn-secondary" id="practiceReview" data-i18n="ui.review">← Repasar la explicación</button>',
    '  <div id="practicePick" class="stack">',
    '    <div class="row center-row"><p class="instruction" data-i18n="practice.pick">Elige un número.</p></div>',
    '    <div class="card centered stack"><div class="div-picker" id="divPicker"></div></div>',
    '  </div>',
    '  <div id="practiceTable" class="stack hidden">',
    '    <div class="row center-row"><p class="instruction" id="practiceTitle"></p></div>',
    '    <div class="progress-bar"><div class="progress-fill" id="practiceFill"></div><span class="progress-text" id="practiceText">0 / 10</span></div>',
    '    <div class="card centered stack"><div class="div-grid" id="divGrid"></div><p class="feedback" id="practiceDone" aria-live="polite"></p></div>',
    '    <button type="button" class="btn btn-secondary" id="practiceOther" data-i18n="practice.other">Otro número</button>',
    '  </div>',
    '</section>'
  ].join('\n');

  /* The context of the activity and the cards shown so far. Set on the first start. */
  var game = null;

  function showPart(id) {
    $('#practicePick').classList.toggle('hidden', id !== '#practicePick');
    $('#practiceTable').classList.toggle('hidden', id !== '#practiceTable');
  }

  function paintCount(n) {
    $('#practiceText').textContent = n + ' / ' + STEPS;
    $('#practiceFill').style.width = (n / STEPS * 100) + '%';
  }

  /* The numbers from 1 to 10 that divide n exactly. */
  function divisorsUpTo10(n) {
    var list = [];
    for (var k = 1; k <= STEPS; k += 1) if (n % k === 0) list.push(k);
    return list;
  }

  /* The table is complete: one star, and the list of the divisors. */
  function complete(n) {
    var ctx = game.ctx;
    var text = fill(t('practice.done'), { n: n, list: divisorsUpTo10(n).join(', ') });
    ctx.progress.stars += 1;
    ctx.save();
    ctx.paintStars();
    $('#practiceDone').textContent = text;
    if (App.feedback && App.feedback.celebrate) App.feedback.celebrate(text);
  }

  /* One card of the table: the question, and the division after the first tap. */
  function card(n, k) {
    var btn = document.createElement('button');
    var shown = false;
    btn.type = 'button';
    btn.className = 'btn btn-secondary div-card';
    btn.textContent = fill(t('practice.card'), { n: n, k: k });
    btn.setAttribute('aria-label', fill(t('practice.cardAria'), { n: n, k: k }));
    btn.addEventListener('click', function () {
      if (shown) return;
      shown = true;
      btn.classList.add('shown');
      btn.textContent = divisionText(n, k);
      btn.removeAttribute('aria-label');
      game.shown += 1;
      paintCount(game.shown);
      if (game.shown === STEPS) complete(n);
    });
    return btn;
  }

  /* The table of n: its ten cards, all hidden. */
  function openTable(n) {
    var grid = $('#divGrid');
    grid.innerHTML = '';
    game.shown = 0;
    $('#practiceTitle').textContent = fill(t('practice.title'), { n: n });
    $('#practiceDone').textContent = '';
    paintCount(0);
    for (var k = 1; k <= STEPS; k += 1) grid.appendChild(card(n, k));
    showPart('#practiceTable');
  }

  /* The number picker, with its buttons in a new random order each time it is shown. */
  function paintPicker() {
    var picker = $('#divPicker');
    picker.innerHTML = '';
    App.utils.shuffle(DATA.numbers.slice()).forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary div-pick';
      btn.textContent = String(n);
      btn.setAttribute('aria-label', fill(t('practice.pickAria'), { n: n }));
      btn.addEventListener('click', function () { openTable(n); });
      picker.appendChild(btn);
    });
    showPart('#practicePick');
  }

  /* The practice starts at the number picker. The fixed buttons are wired once, the first time. */
  function startPractice(ctx) {
    if (!game) {
      game = { ctx: ctx, shown: 0 };
      $('#practiceOther').addEventListener('click', paintPicker);
      $('#practiceReview').addEventListener('click', function () {
        ctx.state.intro = 0;
        ctx.paintIntro();
        ctx.show('#screenIntro');
      });
    }
    paintPicker();
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
    ownTest: startPractice
  });
})();
