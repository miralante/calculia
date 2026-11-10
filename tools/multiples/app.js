/* ============================================================
   Calculia — Múltiplos
   Two stages, the flow of Divisibilidad: 1. explanation (slides: what a
   multiple is, with a drawing, then the multiplications of 5, 2 and 3 as
   plain text), 2. practice: a game, in place of the rounds of questions
   (config.ownTest). The stages and the screens are built by
   assets/js/activity-flow.js (mode 'options', skipReal); this file has the
   drawings and the game. The texts are in strings.<locale>.js and the slides
   and the numbers in data.js.
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

  /* ---- Practice: a game ---------------------------------------------------
     The user picks a number. Its multiples up to 10 are cards with the
     question («5 × 3 = ?»); a tap on a card shows its answer. When all ten
     are shown, the table is complete: one star and a celebration. The number
     buttons are shuffled each time they are shown (they are the options); the
     cards keep the order 1 to 10, which is what is taught. */
  var STEPS = 10;

  var PRACTICE_HTML = [
    '<section id="screenPractice" class="hidden stack">',
    '  <button type="button" class="btn btn-secondary" id="practiceReview" data-i18n="ui.review">← Repasar la explicación</button>',
    '  <div id="practicePick" class="stack">',
    '    <div class="row center-row"><p class="instruction" data-i18n="practice.pick">Elige un número.</p></div>',
    '    <div class="card centered stack"><div class="mul-picker" id="mulPicker"></div></div>',
    '  </div>',
    '  <div id="practiceTable" class="stack hidden">',
    '    <div class="row center-row"><p class="instruction" id="practiceTitle"></p></div>',
    '    <div class="progress-bar"><div class="progress-fill" id="practiceFill"></div><span class="progress-text" id="practiceText">0 / 10</span></div>',
    '    <div class="card centered stack"><div class="mul-grid" id="mulGrid"></div><p class="feedback" id="practiceDone" aria-live="polite"></p></div>',
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

  /* The table is complete: one star, and the closing words. */
  function complete(d) {
    var ctx = game.ctx;
    var text = fill(t('practice.done'), { d: d });
    ctx.progress.stars += 1;
    ctx.save();
    ctx.paintStars();
    $('#practiceDone').textContent = text;
    if (App.feedback && App.feedback.celebrate) App.feedback.celebrate(text);
  }

  /* One card of the table: the question, and the answer after the first tap. */
  function card(d, k) {
    var btn = document.createElement('button');
    var shown = false;
    btn.type = 'button';
    btn.className = 'btn btn-secondary mul-card';
    btn.textContent = fill(t('practice.card'), { d: d, k: k });
    btn.setAttribute('aria-label', fill(t('practice.cardAria'), { d: d, k: k }));
    btn.addEventListener('click', function () {
      if (shown) return;
      shown = true;
      btn.classList.add('shown');
      btn.textContent = fill(t('practice.shown'), { d: d, k: k, m: d * k });
      btn.removeAttribute('aria-label');
      game.shown += 1;
      paintCount(game.shown);
      if (game.shown === STEPS) complete(d);
    });
    return btn;
  }

  /* The table of d: its ten cards, all hidden. */
  function openTable(d) {
    var grid = $('#mulGrid');
    grid.innerHTML = '';
    game.shown = 0;
    $('#practiceTitle').textContent = fill(t('practice.title'), { d: d });
    $('#practiceDone').textContent = '';
    paintCount(0);
    for (var k = 1; k <= STEPS; k += 1) grid.appendChild(card(d, k));
    showPart('#practiceTable');
  }

  /* The number picker, with its buttons in a new random order each time it is shown. */
  function paintPicker() {
    var picker = $('#mulPicker');
    picker.innerHTML = '';
    App.utils.shuffle(DATA.numbers.slice()).forEach(function (d) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary mul-pick';
      btn.textContent = String(d);
      btn.setAttribute('aria-label', fill(t('practice.pickAria'), { d: d }));
      btn.addEventListener('click', function () { openTable(d); });
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
    toolId: 'multiples',
    intro: DATA.intro,
    real: [],
    skipReal: true,
    visualHtml: visualHtml,
    extraMarkup: PRACTICE_HTML,
    extraScreens: ['#screenPractice'],
    ownTest: startPractice
  });
})();
