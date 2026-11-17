/* ============================================================
   Calculia — Sube y baja (positives and negatives)

   Menu: the two games, the elevator and the water thermometer.
   Play: one line of numbers for both. The marker shows where the player
   is; an arrow shows the target. The target is computed by the game, so
   nothing is added or subtracted: the player only goes up or down until
   the marker meets the arrow. There are no levels.

   A round is six orders. Each order starts where the previous one
   ended. Reaching the target gives one star and shows the value.
   Going past the target is said plainly, never punished.

   Data in data.js. Texts in strings.<locale>.js. Shared modules in
   assets/js/.
   ============================================================ */
(function () {
  'use strict';

  /* The storage key is the folder name, so the stars already earned are kept. */
  var TOOL_ID = 'temperature';
  var $ = App.utils.$;
  var randInt = App.utils.rint;

  var screenMenu = $('#screenMenu');
  var screenPlay = $('#screenPlay');
  var starsEl = $('#stars');

  var progress = App.storage.progressWith(TOOL_ID, { stars: 0 });

  var showScreen = App.screenSwitch([screenMenu, screenPlay]);

  /* "← Volver" in the header: inside a game it goes back to the menu; in the
     menu it goes to the hub (assets/js/suite-chrome.js). */
  App.backStep = function () {
    if (screenPlay.classList.contains('hidden')) return false;
    showMenu();
    return true;
  };

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

  /* Signed number, the same in both games: "+3", "−2", "0".
     The typographic minus keeps it visible and easy to tell from a dash. */
  function fmtSigned(n) {
    if (n > 0) return '+' + n;
    if (n < 0) return '−' + Math.abs(n);
    return '0';
  }

  function cap(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
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

  /* The line on screen for the current game, and whether it runs left to
     right (the water thermometer) or bottom to top (the elevator). */
  var range = null;
  var horizontal = false;

  /* Position of a value along the line, in %: from the top (the maximum)
     for a vertical line, from the left (the minimum) for a horizontal one. */
  function pct(n) {
    var p = ((n - range.min) / (range.max - range.min)) * 100;
    return horizontal ? p : 100 - p;
  }

  function placeAt(el, n) {
    if (horizontal) el.style.left = pct(n) + '%';
    else el.style.top = pct(n) + '%';
  }

  /* A band between two values, such as a zone. */
  function placeSpan(el, a, b) {
    var p1 = pct(a);
    var p2 = pct(b);
    var start = Math.min(p1, p2);
    var size = Math.abs(p2 - p1);
    if (horizontal) {
      el.style.left = start + '%';
      el.style.width = size + '%';
    } else {
      el.style.top = start + '%';
      el.style.height = size + '%';
    }
  }

  /* ============================================================
     What a value means in each game
     ============================================================ */

  /* Floor name: "planta baja", "sótano 2", "planta 3". */
  function elevatorName(n) {
    if (n === 0) return t('elev.groundLabel');
    return fill(t(n < 0 ? 'elev.basementLabel' : 'elev.floorLabel'), { n: Math.abs(n) });
  }

  /* Water state at 1 atm: ice at or below freezing, steam at or above boiling. */
  function waterStateFor(n) {
    if (n <= DATA.water.freeze) return 'ice';
    if (n >= DATA.water.boil) return 'steam';
    return 'liquid';
  }

  function waterName(n) {
    return t('water.state' + cap(waterStateFor(n)));
  }

  /* Whether the value passes 0 between two positions. */
  function crossesZero(from, to) {
    return (from > 0 && to < 0) || (from < 0 && to > 0);
  }

  /* The note under the result: what happened, in words. */
  function elevatorNote(from, to) {
    var where = t(to === 0 ? 'elev.resultGround' : to < 0 ? 'elev.resultBasement' : 'elev.resultUpper');
    if (!crossesZero(from, to)) return where;
    return t(to < from ? 'elev.resultCrossDown' : 'elev.resultCrossUp') + ' ' + where;
  }

  function waterNote(from, to) {
    var cross = crossesZero(from, to)
      ? t(to < from ? 'water.resultCrossDown' : 'water.resultCrossUp')
      : t('water.resultNoCross');
    return cross + ' ' + t('water.resultState' + cap(waterStateFor(to)));
  }

  /* The two games. The board, the buttons and the rules are the same;
     only these entries differ. */
  var STAGES = {
    elevator: {
      data: DATA.elevator,
      prefix: 'elev',
      valueText: fmtSigned,
      valueName: elevatorName,
      valueIcon: function () { return ''; },
      markerOf: function () { return DATA.elevator.marker; },
      stateOf: null,
      note: elevatorNote
    },
    water: {
      data: DATA.water,
      prefix: 'water',
      valueText: function (n) { return fmtSigned(n) + ' °C'; },
      valueName: waterName,
      /* The state's icon: 🧊 ice, 💧 water, ♨️ steam. */
      valueIcon: function (n) { return DATA.water.states[waterStateFor(n)]; },
      markerOf: function (n) { return DATA.water.states[waterStateFor(n)]; },
      stateOf: waterStateFor,
      note: waterNote
    }
  };

  /* ============================================================
     Round state
     ============================================================ */

  var stageKey = null;    /* 'elevator' | 'water' while a game is open */
  var stage = null;       /* STAGES[stageKey] */
  var now = 0;            /* current value */
  var order = null;       /* { from, dir: 'up'|'down', amount, target } */
  var orderIndex = 0;     /* 1-based number of the order on screen */
  var resultShown = false;
  var stepButtons = [];   /* { el, delta } */

  function q(role) {
    return screenPlay.querySelector('[data-role="' + role + '"]');
  }

  /* The shared progress bar is moved to the top of the page by
     assets/js/suite-chrome.js. Its fill is captured here, before that move,
     so the game keeps updating it from its new place. */
  var els = {
    stage: q('stage'),
    progressFill: q('progress-fill'),
    orderText: q('order-text'),
    orderArrow: q('order-arrow'),
    board: q('board'),
    scale: q('scale'),
    value: q('value'),
    valueLabel: q('value-label'),
    live: q('live'),
    result: q('result'),
    resultTitle: q('result-title'),
    resultValue: q('result-value'),
    resultNote: q('result-note'),
    next: q('next'),
    controls: q('controls'),
    steps: q('steps'),
    reset: q('reset'),
    exit: q('exit')
  };

  function unit(prefix, n) {
    return t(prefix + (Math.abs(n) === 1 ? '.unitOne' : '.unitMany'));
  }

  /* Every whole value from min to max, highest first. */
  function wholeValues(min, max) {
    var out = [];
    for (var n = max; n >= min; n -= 1) out.push(n);
    return out;
  }

  /* ============================================================
     The line: one track from min to max, built per game
     ============================================================ */

  function buildScale() {
    els.scale.innerHTML = '';
    els.scale.classList.toggle('is-horizontal', horizontal);

    var labels = textEl('div', 'scale-labels', '');
    var track = textEl('div', 'scale-track', '');
    var data = stage.data;

    data.zones.forEach(function (z) {
      var zone = textEl('div', 'scale-zone ' + z.cls, '');
      placeSpan(zone, z.from, z.to);
      track.appendChild(zone);
    });

    (data.ticks || wholeValues(data.min, data.max)).forEach(function (n) {
      var key = data.keys.indexOf(n) !== -1;
      var line = textEl('div', 'scale-tick' + (key ? ' is-key' : ''), '');
      placeAt(line, n);
      track.appendChild(line);

      var label = textEl('span', 'scale-label' + (key ? ' is-key' : ''), fmtSigned(n));
      placeAt(label, n);
      labels.appendChild(label);
    });

    /* The position: the game's own icon, on the line. The target: an arrow
       that points at it from outside the track (◀ from the right in the
       elevator, ▼ from above in the thermometer). */
    els.markNow = textEl('span', 'scale-mark', '');
    els.markNow.setAttribute('aria-hidden', 'true');
    els.arrow = textEl('span', 'scale-arrow', horizontal ? '▼' : '◀');
    els.arrow.setAttribute('role', 'img');
    track.appendChild(els.markNow);
    track.appendChild(els.arrow);

    /* Vertical: the labels sit beside the track. Horizontal: under it. */
    if (horizontal) {
      els.scale.appendChild(track);
      els.scale.appendChild(labels);
    } else {
      els.scale.appendChild(labels);
      els.scale.appendChild(track);
    }
  }

  /* ============================================================
     The step buttons: built from the game's steps
     ============================================================ */

  function buildSteps(data, prefix) {
    els.steps.innerHTML = '';
    stepButtons = data.steps.map(function (delta) {
      var amount = Math.abs(delta);
      var btn = textEl('button', 'step-btn', fmtSigned(delta));
      btn.type = 'button';
      btn.setAttribute('aria-label', fill(t(delta < 0 ? 'game.stepDown' : 'game.stepUp'), {
        n: amount, unit: unit(prefix, amount)
      }));
      btn.addEventListener('click', function () { step(delta); });
      els.steps.appendChild(btn);
      return { el: btn, delta: delta };
    });
  }

  /* A step button is disabled when it would leave the line. */
  function paintButtons() {
    stepButtons.forEach(function (b) {
      var next = now + b.delta;
      b.el.disabled = next < range.min || next > range.max;
    });
  }

  /* ============================================================
     Orders
     ============================================================ */

  /* Builds the next order from the current value. The direction is random
     unless one way has no room left; the size is random within the game's
     sizes and never leaves the line. */
  function makeOrder() {
    var sizes = stage.data.orders;
    var canUp = now + sizes.amin <= range.max;
    var canDown = now - sizes.amin >= range.min;
    var dir;
    if (canUp && canDown) dir = Math.random() < 0.5 ? 'up' : 'down';
    else dir = canUp ? 'up' : 'down';

    var room = dir === 'up' ? range.max - now : now - range.min;
    var amount = randInt(sizes.amin, Math.min(sizes.amax, room));
    var target = dir === 'up' ? now + amount : now - amount;
    return { from: now, dir: dir, amount: amount, target: target };
  }

  function nextOrder() {
    orderIndex += 1;
    order = makeOrder();
    resultShown = false;
    els.result.classList.add('hidden');
    els.controls.classList.remove('hidden');
    paintAll();
  }

  /* ============================================================
     Painting
     ============================================================ */

  function paintAll() {
    paintOrder();
    paintProgress();
    paintPosition();
    paintLive();
    paintButtons();
  }

  /* The shared progress bar: the share of the round already done. The order
     on screen counts as done once its target is reached. */
  function paintProgress() {
    var done = orderIndex - 1 + (resultShown ? 1 : 0);
    els.progressFill.style.width = (done / stage.data.perRound * 100) + '%';
  }

  function paintOrder() {
    els.orderText.textContent = fill(t(order.dir === 'up' ? 'game.orderUp' : 'game.orderDown'), {
      n: order.amount, unit: unit(stage.prefix, order.amount)
    });
    els.orderArrow.textContent = order.dir === 'up' ? '↑' : '↓';
  }

  /* The readout (value and what it means), the target arrow, and the marker. */
  function paintPosition() {
    els.value.textContent = stage.valueText(now);
    var icon = stage.valueIcon(now);
    els.valueLabel.textContent = (icon ? icon + ' ' : '') + stage.valueName(now);

    els.board.classList.remove('state-ice', 'state-liquid', 'state-steam');
    if (stage.stateOf) els.board.classList.add('state-' + stage.stateOf(now));

    els.markNow.textContent = stage.markerOf(now);
    placeAt(els.markNow, now);
    placeAt(els.arrow, order.target);
    els.arrow.setAttribute('aria-label', fill(t('game.targetText'), {
      target: stage.valueText(order.target)
    }));
  }

  /* The live line is silent while the player is on the right way; the order
     already says where to go. It speaks only when the player goes past the
     target, and says so plainly. */
  function paintLive() {
    if (resultShown) {
      els.live.textContent = '';
      return;
    }
    var need = order.target - now;          /* >0: still to go up, <0: still down */
    /* Overshoot: past the target, against the direction of the order's
       remaining trip (the order said up, the marker is above the target). */
    var over = (order.dir === 'up') !== (need > 0);
    if (!over) {
      els.live.textContent = '';
      return;
    }
    els.live.textContent = t(need > 0 ? 'game.liveOverUp' : 'game.liveOverDown');
  }

  /* ============================================================
     Moving and reaching the target
     ============================================================ */

  function step(delta) {
    if (resultShown || !order) return;
    var next = now + delta;
    if (next < range.min || next > range.max) return;
    now = next;
    if (now === order.target) {
      reached();
      return;
    }
    paintPosition();
    paintLive();
    paintButtons();
  }

  /* Target reached: one star, the value and what happened to it. */
  function reached() {
    resultShown = true;
    progress.stars += 1;
    save();
    paintStars();

    els.resultTitle.textContent = t('game.resultTitle');
    els.resultValue.textContent = stage.valueText(order.target);
    els.resultNote.textContent = stage.note(order.from, order.target);
    els.next.textContent = t(orderIndex >= stage.data.perRound ? 'game.finishRound' : 'game.nextOrder');

    els.controls.classList.add('hidden');
    els.result.classList.remove('hidden');
    paintProgress();
    paintPosition();
    els.live.textContent = '';
    els.next.focus();
  }

  function advance() {
    if (!resultShown) return;
    if (orderIndex >= stage.data.perRound) finishRound();
    else nextOrder();
  }

  /* Puts the marker back where this order started, to try it again. */
  function resetOrder() {
    if (resultShown || !order) return;
    now = order.from;
    paintPosition();
    paintLive();
    paintButtons();
  }

  /* A full round: then the achievement screen. */
  function finishRound() {
    App.feedback.celebrate(t('core.roundComplete'), function () { window.location.reload(); }, App.feedback.starsGoal(progress.stars));
  }

  /* ============================================================
     Screens: menu and play
     ============================================================ */

  function paintMenu() {
    paintStars();
  }

  function showMenu() {
    stageKey = null;
    stage = null;
    paintMenu();
    showScreen(screenMenu);
  }

  function openStage(key) {
    stageKey = key;
    stage = STAGES[key];
    now = stage.data.start;
    orderIndex = 0;

    horizontal = !!stage.data.horizontal;
    range = { min: stage.data.min, max: stage.data.max };
    els.board.classList.toggle('is-horizontal', horizontal);
    buildScale();
    buildSteps(stage.data, stage.prefix);
    els.stage.textContent = t(stage.prefix + '.name');
    els.reset.textContent = t('game.btnReset');
    els.exit.textContent = t('game.btnExit');

    showScreen(screenPlay);
    nextOrder();
  }

  /* ============================================================
     Wire-up (runs once)
     ============================================================ */

  Array.prototype.forEach.call(screenMenu.querySelectorAll('[data-stage]'), function (card) {
    card.addEventListener('click', function () { openStage(card.getAttribute('data-stage')); });
  });
  els.reset.addEventListener('click', resetOrder);
  els.next.addEventListener('click', advance);
  /* Leaving early keeps the stars and does not count as a round. */
  els.exit.addEventListener('click', showMenu);

  /* Keyboard: arrows or + / − move the marker one step. */
  document.addEventListener('keydown', function (ev) {
    if (screenPlay.classList.contains('hidden') || resultShown) return;
    if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
    if (ev.key === 'ArrowUp' || ev.key === '+') step(1);
    else if (ev.key === 'ArrowDown' || ev.key === '-' || ev.key === '−') step(-1);
    else return;
    ev.preventDefault();
  });

  paintStars();
  showMenu();

})();
