/* ============================================================
   Calculia — Positives and negatives (two games of orders)

   Game 1, the elevator: floors from the basement (negative) up to
   the floors above ground (positive). It is played first.
   Game 2, water temperature: the same mechanic on a thermometer,
   with ice below 0 °C and steam at 100 °C. It is offered when the
   elevator round ends.

   Both games are one engine, createOrderGame(config). A round is a
   short sequence of orders such as "go up 4" or "go down 3". Each
   order starts where the previous one ended, so the target is never
   fixed: it is computed from the current value and shown live. When
   the target is reached, the result is highlighted as an equation
   (for example −2 + 3 = +1) with a note on what happened, so the
   sign rules are seen, not just read.

   Data in data.js. Texts in strings.<locale>.js. Shared modules in
   assets/js/.
   ============================================================ */
(function () {
  'use strict';

  /* Same storage key as before, so stars already earned are kept. */
  var TOOL_ID = 'temperature';
  var $ = App.utils.$;
  var randInt = App.utils.rint;

  var screenElevator = $('#screenElevator');
  var screenWater = $('#screenWater');
  var starsEl = $('#stars');
  var liftShaft = $('#liftShaft');
  var liftNumber = $('#liftNumber');
  var liftLabel = $('#liftLabel');
  var thermoCard = $('#thermoCard');
  var thermoNumber = $('#thermoNumber');
  var thermoState = $('#thermoState');
  var thermoStateLabel = $('#thermoStateLabel');
  var thermoZeroMark = $('#thermoZeroMark');
  var thermoHundredMark = $('#thermoHundredMark');
  var thermoNowMark = $('#thermoNowMark');
  var thermoTargetMark = $('#thermoTargetMark');

  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0, elevatorRounds: 0 });

  var showScreen = App.screenSwitch([screenElevator, screenWater]);

  /* "← Volver" in the header: the water game is the second step of the chain (see
     elevatorGame.nextGame), so from it the link goes back to the elevator, the step
     before it. The elevator is the first step: its link goes to the hub
     (assets/js/suite-chrome.js). */
  App.backStep = function () {
    if (screenWater.classList.contains('hidden')) return false;
    elevatorGame.start();
    return true;
  };

  /* The game whose round ended last: its next game is offered there. */

  /* ============================================================
     Helpers
     ============================================================ */

  function t(key) {
    return App.i18n.t(key);
  }

  /* Replaces every {name} in the text with its value. */
  function fill(text, values) {
    Object.keys(values).forEach(function (name) {
      text = text.split('{' + name + '}').join(String(values[name]));
    });
    return text;
  }

  /* Typographic minus, so the screen shows "−4" and not "-4". */
  function fmtMinus(n) {
    return (n < 0 ? '−' : '') + Math.abs(n);
  }

  /* Signed number: "+3" above zero, "−2" below, "0" at zero. */
  function fmtSigned(n) {
    return n > 0 ? '+' + n : fmtMinus(n);
  }

  function textEl(tag, className, text) {
    var el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    return el;
  }

  function save() {
    App.storage.set(TOOL_ID, progress);
  }

  function paintStars() {
    starsEl.textContent = '⭐ ' + progress.stars;
  }

  /* ============================================================
     The order engine, shared by both games
     ============================================================ */

  /* cfg:
       root        the game's <section>
       data        its DATA entry (perRound, min, max, levels)
       prefix      i18n prefix of its own keys (unitOne, unitMany, hint…)
       roundsKey   progress counter that picks the level
       fmt(n)      how a value is written in the equation
       label(n)    how a value is named in words (target line)
       paintNow(n) paints the current value on the game's visual
       paintTrack(now, target) moves the game's markers
       resultNote(from, to)    the note under the equation
       onEnd(correct)          called when the round ends
  */
  function createOrderGame(cfg) {
    var root = cfg.root;
    var data = cfg.data;
    var prefix = cfg.prefix;

    function q(role) {
      return root.querySelector('[data-role="' + role + '"]');
    }

    function unit(n) {
      return t(prefix + (Math.abs(n) === 1 ? '.unitOne' : '.unitMany'));
    }

    var els = {
      count: q('count'),
      orderText: q('order-text'),
      orderArrow: q('order-arrow'),
      live: q('live'),
      targetText: q('target-text'),
      result: q('result'),
      resultTitle: q('result-title'),
      resultEq: q('result-eq'),
      resultNote: q('result-note'),
      next: q('next'),
      controls: q('controls'),
      hint: q('hint'),
      reset: q('reset'),
      exit: q('exit')
    };
    var stepButtons = root.querySelectorAll('[data-step]');

    /* Round state. */
    var level = null;      /* { id, lo, hi, amin, amax, start } */
    var now = 0;           /* current value */
    var order = null;      /* { from, dir: 'up'|'down', amount, target } */
    var orderIndex = 0;    /* 1-based number of the order on screen */
    var roundCorrect = 0;  /* orders completed in this round */
    var resultShown = false;

    /* Build the next order from the current value. The direction is
       random unless one way has no room left; the size is random within
       the level's range and never leaves the level's range. */
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

    function start() {
      var rounds = progress[cfg.roundsKey] || 0;
      level = data.levels[Math.min(rounds, data.levels.length - 1)];
      now = level.start;
      orderIndex = 0;
      roundCorrect = 0;
      showScreen(root);
      nextOrder();
    }

    function nextOrder() {
      orderIndex += 1;
      order = makeOrder();
      resultShown = false;
      els.result.classList.add('hidden');
      els.controls.classList.remove('hidden');
      paintAll();
      els.hint.textContent = t(prefix + '.hint');
    }

    /* ---- Painting ---- */

    function paintAll() {
      paintOrder();
      cfg.paintNow(now);
      paintTrack();
      paintLive();
      paintButtons();
    }

    /* The order itself: "Orden 2 de 6", then "Sube 4 grados" with its arrow. */
    function paintOrder() {
      els.count.textContent = fill(t('game.orderCount'), { i: orderIndex, total: data.perRound });
      els.orderText.textContent = fill(
        t(order.dir === 'up' ? 'game.orderUp' : 'game.orderDown'),
        { n: order.amount, unit: unit(order.amount) }
      );
      els.orderArrow.textContent = order.dir === 'up' ? '↑' : '↓';
    }

    function paintTrack() {
      cfg.paintTrack(now, order.target);
      els.targetText.textContent = fill(t('game.targetText'), { target: cfg.label(order.target) });
    }

    /* The live line: how far the target is and which way to go.
       Overshooting is said plainly, not punished. */
    function paintLive() {
      if (resultShown) {
        els.live.textContent = '';
        return;
      }
      var need = order.target - now;          /* >0: still to go up, <0: still down */
      var n = Math.abs(need);
      /* Overshoot: past the target in the direction of the order. */
      var over = (order.dir === 'up') !== (need > 0);
      var key = over
        ? (need > 0 ? 'game.liveOverUp' : 'game.liveOverDown')
        : (need > 0 ? 'game.liveUp' : 'game.liveDown');
      els.live.textContent = fill(t(key), { n: n, unit: unit(n) });
    }

    /* A step button is disabled when it would leave the game's range. */
    function paintButtons() {
      Array.prototype.forEach.call(stepButtons, function (b) {
        var next = now + parseInt(b.getAttribute('data-step'), 10);
        b.disabled = next < data.min || next > data.max;
      });
    }

    /* ---- Moving and reaching the target ---- */

    function step(delta) {
      if (resultShown) return;
      var next = now + delta;
      if (next < data.min || next > data.max) return;
      now = next;
      cfg.paintNow(now);
      paintTrack();
      paintLive();
      paintButtons();
      if (now === order.target) reached();
    }

    /* The target was reached: one star, the result as an equation. */
    function reached() {
      resultShown = true;
      roundCorrect += 1;
      progress.stars += 1;
      save();
      paintStars();

      var from = order.from;
      var to = order.target;
      var op = order.dir === 'up' ? '+' : '−';

      els.resultTitle.textContent = t('game.resultTitle');
      els.resultEq.textContent = fill(t('game.resultEq'), {
        from: cfg.fmt(from), op: op, n: order.amount, to: cfg.fmt(to)
      });
      els.resultNote.textContent = cfg.resultNote(from, to);

      els.controls.classList.add('hidden');
      els.result.classList.remove('hidden');
      els.live.textContent = '';
      paintAll();
      els.next.textContent = t(orderIndex >= data.perRound ? 'game.finishRound' : 'game.nextOrder');
      els.next.focus();
    }

    function advance() {
      if (!resultShown) return;
      if (orderIndex >= data.perRound) endRound();
      else nextOrder();
    }

    function resetOrder() {
      if (resultShown) return;
      now = order.from;
      cfg.paintNow(now);
      paintTrack();
      paintLive();
      paintButtons();
    }

    /* Leaving early keeps the stars already earned and ends the round. */
    function endRound() {
      progress[cfg.roundsKey] = (progress[cfg.roundsKey] || 0) + 1;
      save();
      cfg.onEnd(roundCorrect);
    }

    /* ---- Wire-up (runs once) ---- */

    Array.prototype.forEach.call(stepButtons, function (b) {
      b.addEventListener('click', function () {
        step(parseInt(b.getAttribute('data-step'), 10));
      });
    });
    els.reset.addEventListener('click', resetOrder);
    els.next.addEventListener('click', advance);
    els.exit.addEventListener('click', endRound);

    /* Keyboard: arrows or + / − move the marker. */
    document.addEventListener('keydown', function (ev) {
      if (root.classList.contains('hidden') || resultShown) return;
      if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
      if (ev.key === 'ArrowUp' || ev.key === '+') step(1);
      else if (ev.key === 'ArrowDown' || ev.key === '-' || ev.key === '−') step(-1);
      else return;
      ev.preventDefault();
    });

    els.reset.textContent = t('game.btnReset');
    els.exit.textContent = t('game.btnExit');

    return { start: start };
  }

  /* ============================================================
     Game 1: the elevator
     ============================================================ */

  /* How a floor is named in words: "planta baja", "sótano 2", "planta 3". */
  function elevatorLabel(n) {
    if (n === 0) return t('elev.groundLabel');
    return fill(t(n < 0 ? 'elev.basementLabel' : 'elev.floorLabel'), { n: Math.abs(n) });
  }

  /* One row per floor, top to bottom, built once. */
  var floorRows = [];

  function buildShaft() {
    for (var f = DATA.elevator.max; f >= DATA.elevator.min; f -= 1) {
      var row = document.createElement('div');
      row.className = 'lift-floor' + (f === 0 ? ' is-ground' : f < 0 ? ' is-basement' : '');
      row.appendChild(textEl('span', 'lift-floor-num', fmtSigned(f)));
      row.appendChild(textEl('span', 'lift-floor-name', elevatorLabel(f)));
      var mark = textEl('span', 'lift-floor-mark', '');
      mark.setAttribute('aria-hidden', 'true');
      row.appendChild(mark);
      liftShaft.appendChild(row);
      floorRows.push({ floor: f, row: row, mark: mark });
    }
  }

  function elevatorPaintNow(n) {
    liftNumber.textContent = fmtSigned(n);
    liftNumber.setAttribute('aria-label', fill(t('elev.readoutAria'), { floor: elevatorLabel(n) }));
    liftLabel.textContent = elevatorLabel(n);
  }

  /* The cabin (🛗) and the target (🎯) move between the floor rows. */
  function elevatorPaintTrack(now, target) {
    floorRows.forEach(function (r) {
      var isNow = r.floor === now;
      var isTarget = r.floor === target;
      r.row.classList.toggle('is-now', isNow);
      r.row.classList.toggle('is-target', isTarget);
      r.mark.textContent = (isNow ? '🛗' : '') + (isTarget ? '🎯' : '');
    });
  }

  /* Where the cabin ends, and whether it passed the ground floor. */
  function elevatorResultNote(from, to) {
    var crossed = (from > 0 && to < 0) || (from < 0 && to > 0);
    var where = t(to === 0 ? 'elev.resultGround' : to < 0 ? 'elev.resultBasement' : 'elev.resultUpper');
    if (!crossed) return where;
    return t(to < from ? 'elev.resultCrossDown' : 'elev.resultCrossUp') + ' ' + where;
  }

  /* ============================================================
     Game 2: water temperature
     ============================================================ */

  /* Physical state for a temperature. Ice at 0 °C or below, steam at
     100 °C or above, liquid in between. */
  function waterStateFor(n) {
    if (n <= 0) return 'ice';
    if (n >= 100) return 'steam';
    return 'liquid';
  }

  /* Position of a temperature on the track, 0–100 %, over the whole
     thermometer. */
  function waterPct(n) {
    return ((n - DATA.water.min) / (DATA.water.max - DATA.water.min)) * 100;
  }

  function waterLabel(n) {
    return fmtMinus(n) + ' °C';
  }

  function waterPaintNow(n) {
    thermoNumber.textContent = waterLabel(n);
    thermoNumber.setAttribute('aria-label', fill(t('water.readoutAria'), { temp: n }));

    var state = waterStateFor(n);
    var entry = DATA.water.states[state];
    thermoState.textContent = entry.emoji;
    thermoCard.classList.remove('state-ice', 'state-liquid', 'state-steam');
    thermoCard.classList.add('state-' + entry.color);
    thermoStateLabel.textContent = t('water.state' + state.charAt(0).toUpperCase() + state.slice(1));
  }

  /* The number line: the current temperature and the target. Zero and
     100 are drawn as reference points inside the track. */
  function waterPaintTrack(now, target) {
    thermoNowMark.style.left = waterPct(now) + '%';
    thermoTargetMark.style.left = waterPct(target) + '%';
    thermoZeroMark.style.left = waterPct(0) + '%';
    thermoHundredMark.style.left = waterPct(100) + '%';
  }

  /* Which way the water crossed 0 °C, and what state it ends in. */
  function waterResultNote(from, to) {
    var crossed = (from > 0 && to < 0) || (from < 0 && to > 0);
    var crossKey = crossed
      ? (to < from ? 'water.resultCrossDown' : 'water.resultCrossUp')
      : 'water.resultNoCross';
    var stateKey = 'water.resultState' + (waterStateFor(to) === 'ice' ? 'Ice'
      : waterStateFor(to) === 'steam' ? 'Steam' : 'Liquid');
    return t(crossKey) + ' ' + t(stateKey);
  }

  /* ============================================================
     The two games and the end of a round
     ============================================================ */

  var elevatorGame = createOrderGame({
    root: screenElevator,
    data: DATA.elevator,
    prefix: 'elev',
    roundsKey: 'elevatorRounds',
    fmt: fmtSigned,
    label: elevatorLabel,
    paintNow: elevatorPaintNow,
    paintTrack: elevatorPaintTrack,
    resultNote: elevatorResultNote,
    onEnd: function (correct) { showRoundEnd(elevatorGame, correct); }
  });

  var waterGame = createOrderGame({
    root: screenWater,
    data: DATA.water,
    prefix: 'water',
    roundsKey: 'completedRounds',
    fmt: fmtMinus,
    label: waterLabel,
    paintNow: waterPaintNow,
    paintTrack: waterPaintTrack,
    resultNote: waterResultNote,
    onEnd: function (correct) { showRoundEnd(waterGame, correct); }
  });

  /* The elevator leads to the water game; the water game is the last. */
  elevatorGame.nextGame = waterGame;
  elevatorGame.nextLabel = 'elev.toWater';

  /* End of a round: the summary, and the next game when there is one. */
  function showRoundEnd(game) {
    /* "A por más" goes on to the next game of the chain, or plays this one again. */
    var next = game.nextGame || game;
    App.feedback.celebrate(t('core.roundComplete'), function () { next.start(); }, App.feedback.starsGoal(progress.stars));
  }

  /* ============================================================
     Start: the elevator first.
     ============================================================ */

  buildShaft();
  paintStars();
  elevatorGame.start();

})();
