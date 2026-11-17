/* ============================================================
   Calculia — Sube y baja (positives and negatives)

   Menu: the two games, the elevator and the water thermometer.
   Play: one board for both. A vertical scale shows the position
   (the marker) and the target (🎯); the player moves the marker with
   the step buttons or the arrow keys. The target is computed by the
   game, so nothing is added or subtracted: the player only goes up
   or down until the marker meets the 🎯.

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

  /* roundsKey of each game: 'completedRounds' is the water game's counter,
     kept under its old name so the level already reached is not lost. */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, elevatorRounds: 0, completedRounds: 0 });

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

  /* Position of a value on the scale, in % from the top (the maximum). */
  function scalePct(n) {
    var d = stage.data;
    return ((d.max - n) / (d.max - d.min)) * 100;
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
      roundsKey: 'elevatorRounds',
      valueText: fmtSigned,
      valueName: elevatorName,
      stateOf: null,
      note: elevatorNote
    },
    water: {
      data: DATA.water,
      prefix: 'water',
      roundsKey: 'completedRounds',
      valueText: function (n) { return fmtSigned(n) + ' °C'; },
      valueName: waterName,
      stateOf: waterStateFor,
      note: waterNote
    }
  };

  /* ============================================================
     Round state
     ============================================================ */

  var stageKey = null;    /* 'elevator' | 'water' while a game is open */
  var stage = null;       /* STAGES[stageKey] */
  var level = null;       /* the level being played */
  var levelIndex = 0;     /* 0-based index of that level */
  var now = 0;            /* current value */
  var order = null;       /* { from, dir: 'up'|'down', amount, target } */
  var orderIndex = 0;     /* 1-based number of the order on screen */
  var resultShown = false;
  var stepButtons = [];   /* { el, delta } */

  function q(role) {
    return screenPlay.querySelector('[data-role="' + role + '"]');
  }

  var els = {
    stage: q('stage'),
    level: q('level'),
    count: q('count'),
    orderText: q('order-text'),
    orderArrow: q('order-arrow'),
    board: q('board'),
    scale: q('scale'),
    value: q('value'),
    valueLabel: q('value-label'),
    target: q('target'),
    live: q('live'),
    result: q('result'),
    resultTitle: q('result-title'),
    resultValue: q('result-value'),
    resultNote: q('result-note'),
    next: q('next'),
    controls: q('controls'),
    steps: q('steps'),
    reset: q('reset'),
    exit: q('exit'),
    hint: q('hint')
  };

  function unit(prefix, n) {
    return t(prefix + (Math.abs(n) === 1 ? '.unitOne' : '.unitMany'));
  }

  /* ============================================================
     The scale: one vertical track from min to max, built per game
     ============================================================ */

  function buildScale(data) {
    els.scale.innerHTML = '';

    var labels = textEl('div', 'scale-labels', '');
    var track = textEl('div', 'scale-track', '');

    data.zones.forEach(function (z) {
      var zone = textEl('div', 'scale-zone ' + z.cls, '');
      zone.style.top = scalePct(z.to) + '%';
      zone.style.height = (scalePct(z.from) - scalePct(z.to)) + '%';
      track.appendChild(zone);
    });

    var ticks = data.ticks || rangeOf(data.min, data.max);
    ticks.forEach(function (n) {
      var key = data.keys.indexOf(n) !== -1;
      var line = textEl('div', 'scale-tick' + (key ? ' is-key' : ''), '');
      line.style.top = scalePct(n) + '%';
      track.appendChild(line);

      var label = textEl('span', 'scale-label' + (key ? ' is-key' : ''), fmtSigned(n));
      label.style.top = scalePct(n) + '%';
      labels.appendChild(label);
    });

    /* The position marker sits on the left edge, the target on the right edge. */
    els.markNow = textEl('span', 'scale-mark scale-mark-now', data.marker);
    els.markNow.setAttribute('aria-hidden', 'true');
    els.markTarget = textEl('span', 'scale-mark scale-mark-target', '🎯');
    els.markTarget.setAttribute('aria-hidden', 'true');
    track.appendChild(els.markNow);
    track.appendChild(els.markTarget);

    els.scale.appendChild(labels);
    els.scale.appendChild(track);
  }

  /* Every whole value from min to max, highest first. */
  function rangeOf(min, max) {
    var out = [];
    for (var n = max; n >= min; n -= 1) out.push(n);
    return out;
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

  /* A step button is disabled when it would leave the scale. */
  function paintButtons() {
    stepButtons.forEach(function (b) {
      var next = now + b.delta;
      b.el.disabled = next < stage.data.min || next > stage.data.max;
    });
  }

  /* ============================================================
     Orders
     ============================================================ */

  /* Builds the next order from the current value. The direction is random
     unless one way has no room left; the size is random within the level's
     range and never leaves it. */
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
    paintPosition();
    paintLive();
    paintButtons();
  }

  function paintOrder() {
    els.count.textContent = fill(t('game.orderCount'), { i: orderIndex, total: stage.data.perRound });
    els.orderText.textContent = fill(t(order.dir === 'up' ? 'game.orderUp' : 'game.orderDown'), {
      n: order.amount, unit: unit(stage.prefix, order.amount)
    });
    els.orderArrow.textContent = order.dir === 'up' ? '↑' : '↓';
  }

  /* The readout (value and what it means), the target, and both markers on the scale. */
  function paintPosition() {
    els.value.textContent = stage.valueText(now);
    els.valueLabel.textContent = stage.valueName(now);
    els.target.textContent = fill(t('game.targetText'), { target: stage.valueText(order.target) });

    els.board.classList.remove('state-ice', 'state-liquid', 'state-steam');
    if (stage.stateOf) els.board.classList.add('state-' + stage.stateOf(now));

    els.markNow.style.top = scalePct(now) + '%';
    els.markTarget.style.top = scalePct(order.target) + '%';
  }

  /* The live line says where to go, never how far (no counting needed).
     Going past the target is said plainly. */
  function paintLive() {
    if (resultShown) {
      els.live.textContent = '';
      return;
    }
    var need = order.target - now;          /* >0: still to go up, <0: still down */
    /* Overshoot: past the target, against the direction of the order's
       remaining trip (the order said up, the marker is above the target). */
    var over = (order.dir === 'up') !== (need > 0);
    var key = over
      ? (need > 0 ? 'game.liveOverUp' : 'game.liveOverDown')
      : (need > 0 ? 'game.liveUp' : 'game.liveDown');
    els.live.textContent = t(key);
  }

  /* ============================================================
     Moving and reaching the target
     ============================================================ */

  function step(delta) {
    if (resultShown || !order) return;
    var next = now + delta;
    if (next < stage.data.min || next > stage.data.max) return;
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

  /* A full round: it counts toward the next level, then the achievement screen. */
  function finishRound() {
    var key = stageKey;
    progress[stage.roundsKey] = (progress[stage.roundsKey] || 0) + 1;
    save();
    App.feedback.celebrate(t('core.roundComplete'), function () { openStage(key); }, App.feedback.starsGoal(progress.stars));
  }

  /* ============================================================
     Screens: menu and play
     ============================================================ */

  /* Level reached in a game: the number of finished rounds picks it, the last one repeats. */
  function levelOf(key) {
    var s = STAGES[key];
    var idx = Math.min(progress[s.roundsKey] || 0, s.data.levels.length - 1);
    return { index: idx, level: s.data.levels[idx], total: s.data.levels.length };
  }

  function paintMenu() {
    Array.prototype.forEach.call(screenMenu.querySelectorAll('[data-stage]'), function (card) {
      var info = levelOf(card.getAttribute('data-stage'));
      var prefix = STAGES[card.getAttribute('data-stage')].prefix;
      card.querySelector('[data-role="level"]').textContent = fill(t('game.levelLine'), {
        n: info.index + 1, total: info.total, level: t(prefix + '.level.' + info.level.id)
      });
    });
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
    var info = levelOf(key);
    level = info.level;
    levelIndex = info.index;
    now = level.start;
    orderIndex = 0;

    buildScale(stage.data);
    buildSteps(stage.data, stage.prefix);
    els.stage.textContent = t(stage.prefix + '.name');
    els.level.textContent = fill(t('game.levelLine'), {
      n: levelIndex + 1, total: stage.data.levels.length, level: t(stage.prefix + '.level.' + level.id)
    });
    els.reset.textContent = t('game.btnReset');
    els.exit.textContent = t('game.btnExit');
    els.hint.textContent = t('game.hint');

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
