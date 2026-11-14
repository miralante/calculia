/* ============================================================
   Calculia — Ordering numbers: the practice (the test).

   The four order activities (positives, negatives, fractions, decimals)
   do not show fixed lists to choose from. The system draws the numbers of
   each round at random, from the pools of the level (see number-sort.js),
   and the person puts them in order:

     1. the numbers are tiles in a tray, in a random order;
     2. the person taps a tile and then a slot (1 to 4, from the smallest to
        the largest). A tapped slot can be moved or taken back to the tray;
     3. «Comprobar» marks each slot: ✓ the ones that are right (they lock
        in place), ✗ the ones that are not (they move again);
     4. when all are right the round is a star, the explanation is shown and
        «Otra ronda» draws new numbers.

   Nothing is subtracted: wrong slots are only moved again. The level rises
   with the rounds completed (levelOf in activity-flow.js), like in the rest
   of the suite.

   The engine (assets/js/activity-flow-options.js) runs this practice as
   config.ownTest, in place of the rounds of questions. number-sort.js
   wires it up; this file has the markup, the round and the rules.

   Exposes window.App.numberSortGame = { MARKUP, start }.
   ============================================================ */
(function () {
  'use strict';

  var NS = App.numberSort;
  var $ = App.utils.$;
  var fill = App.utils.fill;
  var rint = App.utils.rint;
  function t(key) { return App.i18n.t(key); }

  /* How many numbers one round puts in order (fewer when the level has fewer values). */
  var COUNT = 4;

  /* ---- Texts (both locales; the activities keep their own rule hints) ---- */
  App.i18n.register({
    order: {
      prompt: 'Pon los números de menor a mayor. Arrástralos a su hueco.',
      least: '← El menor',
      most: 'El mayor →',
      check: 'Comprobar',
      next: 'Otra ronda con otros números →',
      help: 'Arrastra un número a un hueco. También puedes tocar un número y luego el hueco.',
      picked: 'Ahora toca el hueco donde va.',
      pickedSlot: 'Toca otro hueco para cambiarlo de sitio, o la bandeja para quitarlo.',
      emptySlot: 'Primero toca un número de la bandeja.',
      wrong: 'Hay {n} números en un hueco que no les toca. Los marcados con ✗ tienen que cambiar de sitio.',
      done: '¡Muy bien! Los {total} números están en orden.',
      slotEmpty: 'Hueco {n} de {total}, vacío',
      slotFilled: 'Hueco {n} de {total}, con {v}',
      slotRight: ', bien colocado',
      slotWrong: ', mal colocado',
      tileAria: 'Número {v}'
    }
  }, 'es');

  App.i18n.register({
    order: {
      prompt: 'Put the numbers from smallest to largest. Drag each one to its slot.',
      least: '← The smallest',
      most: 'The largest →',
      check: 'Check',
      next: 'Another round with other numbers →',
      help: 'Drag a number to a slot. You can also tap a number, then the slot.',
      picked: 'Now tap the slot where it goes.',
      pickedSlot: 'Tap another slot to move it, or the tray to take it out.',
      emptySlot: 'First tap a number in the tray.',
      wrong: '{n} numbers are in a slot that is not theirs. The ones marked ✗ must change place.',
      done: 'Well done! All {total} numbers are in order.',
      slotEmpty: 'Slot {n} of {total}, empty',
      slotFilled: 'Slot {n} of {total}, with {v}',
      slotRight: ', in the right place',
      slotWrong: ', in the wrong place',
      tileAria: 'Number {v}'
    }
  }, 'en');

  /* ---- Markup, built by the engine into the test stage ---- */
  var MARKUP = [
    '<section id="screenOrder" class="hidden stack">',
    '  <button type="button" class="btn btn-secondary" id="orderReview" data-i18n="ui.review">← Repasar la explicación</button>',
    '  <p class="difficulty hidden" id="orderLevel"></p>',
    '  <div class="row center-row"><p class="instruction" id="orderPrompt" data-i18n="order.prompt"></p></div>',
    '  <article class="card centered stack order-card">',
    '    <div class="order-ends" aria-hidden="true"><span data-i18n="order.least"></span><span data-i18n="order.most"></span></div>',
    '    <div class="order-slots" id="orderSlots"></div>',
    '    <p class="legend" id="orderHelp" aria-live="polite"></p>',
    '    <div class="order-tray" id="orderTray"></div>',
    '  </article>',
    '  <p class="feedback" id="orderFeedback" aria-live="polite"></p>',
    '  <button type="button" class="btn" id="orderCheck" data-i18n="order.check" disabled>Comprobar</button>',
    '  <button type="button" class="btn btn-secondary hidden" id="orderNext" data-i18n="order.next">Otra ronda →</button>',
    '</section>'
  ].join('\n');

  /* The practice of the activity: the round, the slots and the tray. Set on the first start. */
  var st = null;

  /* ---- The round ------------------------------------------------------- */

  /* Up to COUNT different numbers, each drawn from one of the level's pools, so a
     round mixes small and large numbers (as makeRound does for the test). A small
     level (the first fractions have only three values) gives a shorter round, never
     fewer than two, so it can still be put in order. */
  function drawItems(level) {
    var pools = level.pools || [level.pool];
    var items = [];
    for (var tries = 0; tries < 400 && items.length < COUNT; tries += 1) {
      var pool = pools[rint(0, pools.length - 1)];
      var v = NS.drawDistinct(pool, 1)[0];
      if (items.some(function (it) { return it.v === v; })) continue;
      items.push({ v: v, text: NS.show(v, pool.kind) });
    }
    if (items.length < 2) throw new Error('number-sort-game: the level has too few numbers to order');
    return items;
  }

  function byValue(a, b) { return a.v - b.v; }

  function sameOrder(a, b) {
    return a.every(function (item, i) { return item === b[i]; });
  }

  function newRound() {
    var level = App.activityFlow.levelOf(st.ctx, st.ctx.current);
    var sorted = drawItems(level).sort(byValue);
    var tiles = App.utils.shuffle(sorted.slice());
    /* A round never starts already in order: the tiles would give the answer. */
    if (sameOrder(tiles, sorted)) tiles.reverse();
    st.level = level;
    st.count = sorted.length;
    st.sorted = sorted;
    st.items = tiles;
    st.slots = sorted.map(function () { return -1; });
    st.locked = sorted.map(function () { return false; });
    st.wrong = [];
    st.sel = null;
    st.done = false;
    say('');
    paint();
  }

  /* ---- Actions --------------------------------------------------------- */

  function say(message) { $('#orderFeedback').textContent = message; }

  /* Taking a slot: a tile of the tray goes into it (the tile it held goes back
     to the tray), or a tile of another slot moves or swaps there. */
  function pickSlot(s) {
    if (st.done || st.locked[s]) return;
    var sel = st.sel;
    if (!sel) {
      if (st.slots[s] === -1) { say(t('order.emptySlot')); return; }
      st.sel = { where: 'slot', s: s };
    } else if (sel.where === 'tray') {
      st.slots[s] = sel.i;
      st.wrong = st.wrong.filter(function (x) { return x !== s; });
      st.sel = null;
    } else if (sel.s === s) {
      st.sel = null;
    } else {
      var held = st.slots[s];
      st.slots[s] = st.slots[sel.s];
      st.slots[sel.s] = held;
      st.wrong = st.wrong.filter(function (x) { return x !== s && x !== sel.s; });
      st.sel = null;
    }
    say('');
    paint();
  }

  /* Taking a tile of the tray: it is chosen to go in a slot. If a slot tile was
     chosen before, that tile goes back to the tray. */
  function pickTile(i) {
    if (st.done) return;
    var sel = st.sel;
    if (sel && sel.where === 'slot') {
      st.slots[sel.s] = -1;
      st.wrong = st.wrong.filter(function (x) { return x !== sel.s; });
      st.sel = null;
    } else if (sel && sel.where === 'tray' && sel.i === i) {
      st.sel = null;
    } else {
      st.sel = { where: 'tray', i: i };
    }
    say('');
    paint();
  }

  /* ---- Drag and drop ----------------------------------------------------
     A press on a tile of the tray, or on a filled slot that is not locked,
     starts a drag. The tile follows the pointer; where it is let go decides:
     a slot takes it (the tile it held goes back to the tray), the tray takes
     a tile back out of its slot. Moving less than a few pixels is a tap, which
     the click handlers below handle as before, so tapping keeps working. */
  var DRAG_START = 6;
  var suppressClick = false;

  function startDrag(e, from) {
    if (st.done) return;
    var host = e.currentTarget, pointerId = e.pointerId;
    var startX = e.clientX, startY = e.clientY, dragging = false, ghost = null;
    suppressClick = false;

    function move(ev) {
      if (!dragging) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_START) return;
        dragging = true;
        /* The pointer is captured only once a drag really starts: a captured pointer
           would send the click of a tap to the container instead of the tile. */
        try { host.setPointerCapture(pointerId); } catch (err) { /* not every browser needs it */ }
        st.sel = null;
        ghost = makeGhost(from);
        document.body.appendChild(ghost);
      }
      ev.preventDefault();
      ghost.style.left = ev.clientX + 'px';
      ghost.style.top = ev.clientY + 'px';
      markDropTarget(dropAt(ev));
    }

    function end(ev) {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', end);
      host.removeEventListener('pointercancel', end);
      if (!dragging) return;
      suppressClick = true;
      ghost.remove();
      var to = dropAt(ev);
      markDropTarget(null);
      drop(from, to);
    }

    host.addEventListener('pointermove', move);
    host.addEventListener('pointerup', end);
    host.addEventListener('pointercancel', end);
  }

  /* The little tile that follows the pointer while it is dragged. */
  function makeGhost(from) {
    var item = from.where === 'tray' ? st.items[from.i] : st.items[st.slots[from.s]];
    var ghost = el('div', 'order-ghost', item.text);
    ghost.setAttribute('aria-hidden', 'true');
    return ghost;
  }

  /* What is under the pointer: a slot, the tray, or nothing. */
  function dropAt(ev) {
    var under = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!under || !under.closest) return null;
    var slot = under.closest('[data-slot]');
    if (slot) return { where: 'slot', s: Number(slot.getAttribute('data-slot')) };
    if (under.closest('#orderTray')) return { where: 'tray' };
    return null;
  }

  var dropShown = null;
  function markDropTarget(to) {
    var next = to && to.where === 'slot' ? document.querySelector('[data-slot="' + to.s + '"]') : null;
    if (dropShown && dropShown !== next) dropShown.classList.remove('is-drop');
    if (next) next.classList.add('is-drop');
    dropShown = next;
  }

  function drop(from, to) {
    if (!to) return;
    if (to.where === 'slot') {
      var s = to.s;
      if (st.locked[s]) return;
      if (from.where === 'tray') {
        st.slots[s] = from.i;
      } else {
        if (from.s === s || st.locked[from.s]) return;
        var held = st.slots[s];
        st.slots[s] = st.slots[from.s];
        st.slots[from.s] = held;
      }
      st.wrong = st.wrong.filter(function (x) { return x !== s && x !== from.s; });
    } else if (from.where === 'slot' && !st.locked[from.s]) {
      st.slots[from.s] = -1;
      st.wrong = st.wrong.filter(function (x) { return x !== from.s; });
    } else {
      return;
    }
    st.sel = null;
    say('');
    paint();
  }

  /* «Comprobar»: the right slots lock in place, the others are marked ✗. */
  function check() {
    if (st.done || st.slots.indexOf(-1) !== -1) return;
    st.sel = null;
    var wrong = [];
    st.sorted.forEach(function (item, s) {
      if (st.items[st.slots[s]] === item) st.locked[s] = true;
      else wrong.push(s);
    });
    st.wrong = wrong;
    if (wrong.length === 0) finish();
    else say(fill(t('order.wrong'), { n: wrong.length }));
    paint();
  }

  /* A round in order: a star, the explanation with the list, and the next round. */
  function finish() {
    var ctx = st.ctx;
    var progress = ctx.progress;
    var list = st.sorted.map(function (item) { return item.text; }).join(' · ');
    st.done = true;
    progress.stars += 1;
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    progress.roundsByActivity[ctx.current.id] = (progress.roundsByActivity[ctx.current.id] || 0) + 1;
    ctx.save();
    ctx.paintStars();
    var text = fill(t('order.done'), { total: st.count }) + ' ' + fill(t('q.explainOrder'), { list: list });
    say(text);
    if (App.feedback && App.feedback.celebrate) App.feedback.celebrate(text);
  }

  /* ---- Painting -------------------------------------------------------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function paintSlots() {
    var box = $('#orderSlots');
    box.innerHTML = '';
    st.slots.forEach(function (idx, s) {
      var item = idx === -1 ? null : st.items[idx];
      var locked = st.locked[s];
      var bad = st.wrong.indexOf(s) !== -1;
      var sel = st.sel && st.sel.where === 'slot' && st.sel.s === s;
      var target = st.sel && !locked && !sel;
      var cls = 'btn btn-secondary order-slot';
      if (sel) cls += ' is-selected';
      if (target) cls += ' is-target';
      if (locked) cls += ' is-right';
      if (bad) cls += ' is-wrong';
      var btn = el('button', cls);
      btn.type = 'button';
      btn.setAttribute('data-slot', String(s));
      btn.setAttribute('aria-disabled', locked || st.done ? 'true' : 'false');
      var label = item
        ? fill(t('order.slotFilled'), { n: s + 1, total: st.count, v: item.text }) + t(locked ? 'order.slotRight' : (bad ? 'order.slotWrong' : ''))
        : fill(t('order.slotEmpty'), { n: s + 1, total: st.count });
      btn.setAttribute('aria-label', label);
      btn.appendChild(el('span', 'order-slot-no', String(s + 1)));
      btn.appendChild(item ? el('span', 'order-slot-val', item.text) : el('span', 'order-slot-empty', '·'));
      if (locked) btn.appendChild(el('span', 'order-mark', '✓'));
      else if (bad) btn.appendChild(el('span', 'order-mark', '✗'));
      box.appendChild(btn);
    });
  }

  function paintTray() {
    var tray = $('#orderTray');
    tray.innerHTML = '';
    st.items.forEach(function (item, i) {
      if (st.slots.indexOf(i) !== -1) return;
      var picked = st.sel && st.sel.where === 'tray' && st.sel.i === i;
      var btn = el('button', 'btn btn-secondary order-tile' + (picked ? ' is-selected' : ''), item.text);
      btn.type = 'button';
      btn.setAttribute('data-tile', String(i));
      btn.setAttribute('aria-label', fill(t('order.tileAria'), { v: item.text }));
      btn.setAttribute('aria-pressed', picked ? 'true' : 'false');
      btn.disabled = st.done;
      tray.appendChild(btn);
    });
  }

  function helpText() {
    if (st.sel && st.sel.where === 'tray') return t('order.picked');
    if (st.sel && st.sel.where === 'slot') return t('order.pickedSlot');
    return t('order.help');
  }

  function paint() {
    var config = st.ctx.config;
    var badge = $('#orderLevel');
    badge.textContent = config.levelName ? config.levelName(st.level) : '';
    badge.classList.toggle('hidden', !badge.textContent);
    paintSlots();
    paintTray();
    $('#orderHelp').textContent = st.done ? '' : helpText();
    $('#orderCheck').disabled = st.done || st.slots.indexOf(-1) !== -1;
    $('#orderNext').classList.toggle('hidden', !st.done);
  }

  /* ---- Events (wired once, on the first start) ----------------------- */

  function bind() {
    $('#orderSlots').addEventListener('pointerdown', function (e) {
      var slot = e.target.closest ? e.target.closest('[data-slot]') : null;
      if (!slot) return;
      var s = Number(slot.getAttribute('data-slot'));
      if (st.slots[s] !== -1 && !st.locked[s]) startDrag(e, { where: 'slot', s: s });
    });
    $('#orderTray').addEventListener('pointerdown', function (e) {
      var tile = e.target.closest ? e.target.closest('[data-tile]') : null;
      if (tile) startDrag(e, { where: 'tray', i: Number(tile.getAttribute('data-tile')) });
    });
    $('#orderSlots').addEventListener('click', function (e) {
      if (suppressClick) { suppressClick = false; return; }
      var btn = e.target.closest ? e.target.closest('[data-slot]') : null;
      if (btn) pickSlot(Number(btn.getAttribute('data-slot')));
    });
    $('#orderTray').addEventListener('click', function (e) {
      if (suppressClick) { suppressClick = false; return; }
      var btn = e.target.closest ? e.target.closest('[data-tile]') : null;
      if (btn) pickTile(Number(btn.getAttribute('data-tile')));
    });
    $('#orderCheck').addEventListener('click', check);
    $('#orderNext').addEventListener('click', newRound);
    $('#orderReview').addEventListener('click', function () {
      st.ctx.state.intro = 0;
      st.ctx.paintIntro();
      st.ctx.show('#screenIntro');
    });
  }

  /* The engine calls this as the practice of the activity (config.ownTest). */
  function start(ctx) {
    if (!st) {
      st = { ctx: ctx };
      bind();
    }
    st.ctx = ctx;
    newRound();
    ctx.show('#screenOrder');
  }

  window.App.numberSortGame = {
    MARKUP: MARKUP,
    start: start
  };
})();
