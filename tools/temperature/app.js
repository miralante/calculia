/* ============================================================
   Calculia — Water Temperature (orders on a thermometer)

   A round is a short sequence of orders such as "go up 4 degrees"
   or "go down 3 degrees". Each order starts where the previous one
   ended, so the target is never a fixed number: it is computed from
   the current temperature and shown live. While the person moves the
   thermometer, the screen says how many degrees are missing or how
   far they overshot. When the target is reached, the result is
   highlighted as an equation (for example 2 − 4 = −2) with a note on
   what happened to the water, so the sign rules are seen, not just
   read.

   Data and levels in data.js. Shared modules in assets/js/.
   ============================================================ */
(function () {
  'use strict';

  /* Same storage key as before, so stars already earned are kept. */
  var TOOL_ID = 'temperature';
  var $ = App.utils.$;

  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var starsEl = $('#stars');
  var thermoUI = $('#thermoUI');
  var thermoCount = $('#thermoCount');
  var thermoOrder = $('#thermoOrder');
  var thermoCard = $('#thermoCard');
  var thermoNumber = $('#thermoNumber');
  var thermoState = $('#thermoState');
  var thermoStateLabel = $('#thermoStateLabel');
  var thermoTrack = $('#thermoTrack');
  var thermoZeroMark = $('#thermoZeroMark');
  var thermoNowMark = $('#thermoNowMark');
  var thermoTargetMark = $('#thermoTargetMark');
  var thermoHundredMark = $('#thermoHundredMark');
  var thermoTargetText = $('#thermoTargetText');
  var thermoLive = $('#thermoLive');
  var thermoControls = $('#thermoControls');
  var thermoResult = $('#thermoResult');
  var thermoResultTitle = $('#thermoResultTitle');
  var thermoResultEq = $('#thermoResultEq');
  var thermoResultNote = $('#thermoResultNote');
  var thermoNext = $('#thermoNext');
  var thermoReset = $('#thermoReset');
  var thermoExit = $('#thermoExit');
  var thermoHint = $('#thermoHint');

  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0 });

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  /* Round state. */
  var level = null;      /* { id, lo, hi, amin, amax, start } */
  var now = 0;           /* current temperature */
  var order = null;      /* { from, dir: 'up'|'down', amount, target } */
  var orderIndex = 0;    /* 1-based number of the order on screen */
  var roundCorrect = 0;  /* orders completed in this round */
  var resultShown = false;

  /* ============================================================
     Helpers
     ============================================================ */

  function show(screen) {
    [screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* Number with the typographic minus sign, so the screen shows
     "−4" and not "-4". */
  function fmt(n) {
    return (n < 0 ? '−' : '') + Math.abs(n);
  }

  function degrees(n) {
    return App.i18n.t(Math.abs(n) === 1 ? 'gen.degreeOne' : 'gen.degreeMany');
  }

  var randInt = App.utils.rint;

  /* Physical state for a temperature. Ice at 0 °C or below, steam at
     100 °C or above, liquid in between. */
  function stateFor(n) {
    if (n <= 0) return 'ice';
    if (n >= 100) return 'steam';
    return 'liquid';
  }

  /* Level chosen by how many rounds the person has completed. The
     last level repeats once they reach it. */
  function levelFromProgress() {
    var levels = DATA.levels;
    var idx = Math.min(progress.completedRounds || 0, levels.length - 1);
    return levels[idx];
  }

  /* Position of a temperature on the track, 0–100 %, over the whole
     thermometer (−50 °C to 250 °C). */
  function pct(n) {
    return ((n - DATA.minC) / (DATA.maxC - DATA.minC)) * 100;
  }

  /* ============================================================
     Orders
     ============================================================ */

  /* Build the next order from the current temperature. The direction
     is random unless one way has no room left; the size is random
     within the level's range and never leaves the level's range. */
  function makeOrder() {
    var canUp = now + level.amin <= level.hi;
    var canDown = now - level.amin >= level.lo;
    var dir;
    if (canUp && canDown) dir = Math.random() < 0.5 ? 'up' : 'down';
    else dir = canUp ? 'up' : 'down';

    var room = dir === 'up' ? level.hi - now : now - level.lo;
    var amount = randInt(level.amin, Math.min(level.amax, room));
    var target = dir === 'up' ? now + amount : now - amount;
    return { from: now, dir: dir, amount: amount, target: target };
  }

  function startRound(lv) {
    level = lv;
    now = lv.start;
    orderIndex = 0;
    roundCorrect = 0;
    show(screenGame);
    nextOrder();
  }

  function nextOrder() {
    orderIndex += 1;
    order = makeOrder();
    resultShown = false;
    thermoResult.classList.add('hidden');
    thermoControls.classList.remove('hidden');
    paintAll();
    thermoHint.textContent = App.i18n.t('gen.hint');
  }

  /* ============================================================
     Painting
     ============================================================ */

  function paintAll() {
    paintOrder();
    paintNow();
    paintTrack();
    paintLive();
    paintButtons();
  }

  /* The order itself, big and at the top: the instruction the person
     must carry out, with its arrow. */
  function paintOrder() {
    thermoCount.textContent = App.i18n.t('gen.orderCount')
      .replace('{i}', String(orderIndex))
      .replace('{total}', String(DATA.perRound));
    var key = order.dir === 'up' ? 'gen.orderUp' : 'gen.orderDown';
    thermoOrder.querySelector('.thermo-order-text').textContent = App.i18n.t(key)
      .replace('{n}', String(order.amount))
      .replace('{degrees}', degrees(order.amount));
    thermoOrder.querySelector('.thermo-order-arrow').textContent = order.dir === 'up' ? '↑' : '↓';
  }

  /* Number, state emoji, state label and card tint for the current
     temperature. */
  function paintNow() {
    thermoNumber.textContent = fmt(now) + ' °C';
    thermoNumber.setAttribute('aria-label',
      App.i18n.t('gen.tempReadoutAria').replace('{temp}', String(now)));

    var state = stateFor(now);
    var entry = DATA.states[state];
    thermoState.textContent = entry.emoji;
    thermoCard.classList.remove('state-ice', 'state-liquid', 'state-steam');
    thermoCard.classList.add('state-' + entry.color);
    thermoStateLabel.textContent = App.i18n.t('gen.state' + state.charAt(0).toUpperCase() + state.slice(1));
  }

  /* The number line: where the thermometer is now, where the target
     is, and where zero is. Moves with every press. */
  function paintTrack() {
    thermoNowMark.style.left = pct(now) + '%';
    thermoTargetMark.style.left = pct(order.target) + '%';
    /* The two reference points are always drawn, inside the track and
       never at its ends, which carry no numbers. */
    thermoZeroMark.style.left = pct(0) + '%';
    thermoHundredMark.style.left = pct(100) + '%';
    thermoTargetText.textContent = App.i18n.t('gen.targetText').replace('{target}', fmt(order.target));
  }

  /* The live line under the thermometer: how far the target is and
     which way to go. Overshooting is said plainly, not punished. */
  function paintLive() {
    if (resultShown) {
      thermoLive.textContent = '';
      return;
    }
    var need = order.target - now;          /* >0: still to climb, <0: still to fall */
    var n = Math.abs(need);
    /* Overshoot: the thermometer is past the target in the direction
       of the order, so the way back is the opposite one. */
    var over = (order.dir === 'up') !== (need > 0);
    var key = over
      ? (need > 0 ? 'gen.liveOverUp' : 'gen.liveOverDown')
      : (need > 0 ? 'gen.liveUp' : 'gen.liveDown');
    thermoLive.textContent = App.i18n.t(key)
      .replace('{n}', String(n))
      .replace('{degrees}', degrees(n));
  }

  /* A step button is disabled when it would leave the level's range.
     After the result is shown, controls are hidden instead. */
  function paintButtons() {
    App.utils.$$('#thermoControls .btn-thermo[data-step]').forEach(function (b) {
      var next = now + parseInt(b.getAttribute('data-step'), 10);
      b.disabled = next < DATA.minC || next > DATA.maxC;
    });
  }

  /* ============================================================
     Moving and reaching the target
     ============================================================ */

  function step(delta) {
    if (resultShown) return;
    var next = now + delta;
    if (next < DATA.minC || next > DATA.maxC) return;
    now = next;
    paintNow();
    paintTrack();
    paintLive();
    paintButtons();
    if (now === order.target) reached();
  }

  /* The target was reached: one star, the result highlighted as an
     equation, and a note on what the water did. */
  function reached() {
    resultShown = true;
    roundCorrect += 1;
    progress.stars += 1;
    save();
    paintStars();

    var from = order.from;
    var to = order.target;
    var op = order.dir === 'up' ? '+' : '−';

    thermoResultTitle.textContent = App.i18n.t('gen.resultTitle');
    thermoResultEq.textContent = App.i18n.t('gen.resultEq')
      .replace('{from}', fmt(from))
      .replace('{op}', op)
      .replace('{n}', String(order.amount))
      .replace('{to}', fmt(to));

    var crossed = (from > 0 && to < 0) || (from < 0 && to > 0);
    var crossKey = crossed
      ? (to < from ? 'gen.resultCrossDown' : 'gen.resultCrossUp')
      : 'gen.resultNoCross';
    var stateKey = 'gen.resultState' + (stateFor(to) === 'ice' ? 'Ice'
      : stateFor(to) === 'steam' ? 'Steam' : 'Liquid');
    thermoResultNote.textContent = App.i18n.t(crossKey) + ' ' + App.i18n.t(stateKey);

    thermoControls.classList.add('hidden');
    thermoResult.classList.remove('hidden');
    thermoLive.textContent = '';
    paintAll();
    thermoNext.textContent = App.i18n.t(orderIndex >= DATA.perRound
      ? 'gen.finishRound' : 'gen.nextOrder');
    thermoNext.focus();
  }

  function advance() {
    if (!resultShown) return;
    if (orderIndex >= DATA.perRound) endRound();
    else nextOrder();
  }

  function resetOrder() {
    if (resultShown) return;
    now = order.from;
    paintNow();
    paintTrack();
    paintLive();
    paintButtons();
  }

  /* ============================================================
     End of round
     ============================================================ */

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('gen.endSummary')
        .replace('{n}', String(roundCorrect))
        .replace('{stars}', String(progress.stars))
        .replace('{starsWord}', App.i18n.starsWord(progress.stars));
    }
    $('#contexto').textContent = '';
    $('#explanation').textContent = '';
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Leaving early keeps the stars already earned and ends the round. */
  function exitRound() {
    endRound();
  }

  /* ============================================================
     Wire-up (runs once at load)
     ============================================================ */

  App.utils.$$('#thermoControls .btn-thermo[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      step(parseInt(b.getAttribute('data-step'), 10));
    });
  });
  thermoReset.addEventListener('click', resetOrder);
  thermoNext.addEventListener('click', advance);
  thermoExit.addEventListener('click', exitRound);

  /* Keyboard: arrows or + / − move the thermometer. Enter on the
     result button is handled by the button itself. */
  document.addEventListener('keydown', function (ev) {
    if (screenGame.classList.contains('hidden') || resultShown) return;
    if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
    if (ev.key === 'ArrowUp' || ev.key === '+') step(1);
    else if (ev.key === 'ArrowDown' || ev.key === '-' || ev.key === '−') step(-1);
    else return;
    ev.preventDefault();
  });

  /* Static labels (the buttons keep their symbols in the HTML). */
  thermoReset.textContent = App.i18n.t('gen.btnReset');
  thermoExit.textContent = App.i18n.t('gen.btnExit');

  /* Start. */
  paintStars();
  startRound(levelFromProgress());
  App.utils.bindEndBackToStart();

})();
