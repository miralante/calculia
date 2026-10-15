/* ============================================================
   Calculia — Ordering numbers.

   A round of items (see data.js). Each item is a set of distinct
   numbers and a row of gaps; the person drags every number into a
   gap so that the row reads from the smallest to the biggest.

   A number dropped in a wrong gap stays there marked in red (a
   circle and a ✗, not only the colour) with a Socratic hint about
   its neighbours. A number in its right gap locks in place. When the
   row is full and right, the 🔊 button reads the order aloud.

   Keyboard: tap, or press Enter, a number to pick it up, then tap,
   or press Enter, a gap to put it there. Pointer drag works too; a
   plain tap is never mistaken for a drag.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'order-numbers';
  var $ = App.utils.$;

  /* Persistent state */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function t(key) { return App.i18n.t(key); }

  /* ----------- Elements ----------- */
  var menuScreen = $('#screenMenu');
  var taskScreen = $('#screenTask');
  var finishScreen = $('#screenFinish');
  var ALL_SCREENS = [menuScreen, taskScreen, finishScreen];

  /* ----------- Round state ----------- */
  var round = [];
  var index = 0;
  var item = null;             /* current item: { sorted, values, prompt, detail, audio } */
  var slots = [];              /* per gap: the number placed there, or null */
  var selected = null;         /* number picked up with a tap, or null */
  var selectedFrom = null;     /* gap it was picked from, or null (tray) */
  var attempts = 0;            /* wrong placements in the current item */
  var waiting = true;          /* false once the item is solved */
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedItem lets paint() show a failed item again. */
  var fixedItem = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function paintStars() { $('#stars').textContent = '⭐ ' + progress.stars; }

  /* ----------- Number formatting ----------- */

  /* Project rule: below 10.000 NO separator is used; from 10.000 up
     it is. The same rule as the points game in Quantities. */
  function separator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function format(n) {
    var s = String(Math.abs(n));
    var sep = separator();
    var parts = [];
    while (s.length > 3) {
      parts.unshift(s.slice(s.length - 3));
      s = s.slice(0, s.length - 3);
    }
    parts.unshift(s);
    return parts.join(sep);
  }

  /* ----------- Generator ----------- */

  /* One item: `count` distinct numbers of `digits` digits, shuffled
     for the tray. The answer is the same numbers sorted. */
  function makeItem(step) {
    var min = step.digits === 1 ? 1 : Math.pow(10, step.digits - 1);
    var max = Math.pow(10, step.digits) - 1;
    var picked = [];
    while (picked.length < step.count) {
      var n = randomInt(min, max);
      if (picked.indexOf(n) === -1) picked.push(n);
    }
    var sorted = picked.slice().sort(function (a, b) { return a - b; });
    return {
      sorted: sorted,
      values: App.utils.shuffle(picked),
      prompt: t('promptOrder').replace('{count}', String(step.count)),
      detail: t('detailOrder'),
      /* Digits without separator: the voice reads them as numbers. */
      audio: sorted.map(function (n) { return String(n); }).join(', ')
    };
  }

  /* ----------- Board state ----------- */

  function isLocked(i) { return slots[i] !== null && slots[i] === item.sorted[i]; }
  function isWrong(i) { return slots[i] !== null && slots[i] !== item.sorted[i]; }
  function isComplete() {
    return slots.every(function (v, i) { return v === item.sorted[i]; });
  }
  function trayValues() {
    return item.values.filter(function (v) { return slots.indexOf(v) === -1; });
  }
  function clearSelection() { selected = null; selectedFrom = null; }

  /* Socratic hint for a wrong number in gap i. It compares the number
     with the nearest gaps that are already right, and never names the
     answer. */
  function hintFor(i) {
    var left = null;
    var right = null;
    for (var j = i - 1; j >= 0; j--) {
      if (isLocked(j)) { left = item.sorted[j]; break; }
    }
    for (var k = i + 1; k < slots.length; k++) {
      if (isLocked(k)) { right = item.sorted[k]; break; }
    }
    var v = slots[i];
    if (left !== null && v < left) return t('orderHintLeft');
    if (right !== null && v > right) return t('orderHintRight');
    if (left === null && right === null) {
      /* Same number of digits everywhere: the first digit decides. */
      var first = String(item.sorted[0]).length;
      var last = String(item.sorted[item.sorted.length - 1]).length;
      return first === last ? t('orderHintFirst') : t('orderHintDigits');
    }
    return t('orderHintCount');
  }

  function slotAria(i) {
    var n = String(i + 1);
    var v = slots[i];
    if (v === null) return t('slotEmptyAria').replace('{n}', n).replace('{total}', String(slots.length));
    if (isLocked(i)) return t('slotLockedAria').replace('{n}', n).replace('{v}', format(v));
    return t('slotWrongAria').replace('{n}', n).replace('{v}', format(v));
  }

  /* ----------- Rendering ----------- */

  function slotButton(i) {
    var v = slots[i];
    var locked = isLocked(i);
    var wrong = isWrong(i);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'order-slot' + (locked ? ' is-locked' : '') + (wrong ? ' is-wrong' : '');
    btn.setAttribute('data-gap', String(i));
    btn.setAttribute('aria-label', slotAria(i));
    btn.disabled = !waiting || locked;
    if (v !== null) {
      var value = document.createElement('span');
      value.className = 'order-value';
      value.textContent = format(v);
      btn.appendChild(value);
    }
    /* The mark is a shape as well as the colour (WCAG 1.4.1). */
    if (wrong || locked) {
      var mark = document.createElement('span');
      mark.className = 'order-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = wrong ? '✗' : '✓';
      btn.appendChild(mark);
    }
    btn.addEventListener('click', function () { if (!justDragged) tapGap(i); });
    return btn;
  }

  function renderBoard(focusGap) {
    var board = $('#orderBoard');
    board.innerHTML = '';
    for (var i = 0; i < slots.length; i++) board.appendChild(slotButton(i));
    /* The board is rebuilt on every move; give the focus back to the
       gap the person just used so keyboard users keep their place. */
    if (focusGap !== undefined && focusGap !== null) {
      var again = board.querySelector('[data-gap="' + focusGap + '"]');
      if (again && !again.disabled) again.focus();
    }
  }

  function renderTray(focusValue) {
    var tray = $('#orderTray');
    tray.innerHTML = '';
    trayValues().forEach(function (v) {
      var isSelected = selected === v && selectedFrom === null;
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'order-piece' + (isSelected ? ' is-selected' : '');
      chip.setAttribute('data-value', String(v));
      chip.setAttribute('aria-label', t('pieceAria').replace('{n}', format(v)));
      chip.setAttribute('aria-pressed', String(isSelected));
      chip.disabled = !waiting;
      chip.textContent = format(v);
      chip.addEventListener('click', function () { if (!justDragged) tapPiece(v); });
      tray.appendChild(chip);
    });
    if (focusValue !== undefined && focusValue !== null) {
      var again = tray.querySelector('[data-value="' + focusValue + '"]');
      if (again) again.focus();
    }
  }

  /* Glides a number from the rect it came from into its gap. */
  function flyIn(g, from) {
    var value = document.querySelector('#orderBoard [data-gap="' + g + '"] .order-value');
    if (!value || !from) return;
    var to = value.getBoundingClientRect();
    value.style.transition = 'none';
    value.style.transform = 'translate(' + (from.left - to.left) + 'px, ' + (from.top - to.top) + 'px)';
    void value.offsetWidth;
    value.style.transition = 'transform 0.25s ease-out';
    value.style.transform = '';
  }

  /* Where a number leaves from, before the board is redrawn. */
  function sourceRect(v, from) {
    var el = from === null
      ? document.querySelector('#orderTray [data-value="' + v + '"]')
      : document.querySelector('#orderBoard [data-gap="' + from + '"]');
    return el ? el.getBoundingClientRect() : null;
  }

  function paintSelectionFeedback() {
    if (selected !== null) $('#feedback').textContent = t('orderSelected').replace('{n}', format(selected));
  }

  /* ----------- Placing ----------- */

  /* Puts number v (from gap `from`, or the tray when null) into gap i,
     then checks it. A number already in gap i goes back to where v
     came from, or to the tray. */
  function place(v, from, i, fromRect) {
    if (from === i) {
      renderBoard(i);
      renderTray();
      return;
    }
    var occupant = slots[i];
    if (from !== null) slots[from] = null;
    if (occupant !== null && from !== null) slots[from] = occupant;
    slots[i] = v;

    var wrongNow = slots[i] !== item.sorted[i];
    if (wrongNow) {
      attempts += 1;
      /* Reinforcement: register the first miss of the item. */
      if (attempts === 1) App.reinforce.add('order:' + item.sorted.join('-'), item);
      App.feedback.encourage($('#feedback'));
      $('#feedback').textContent = t('orderWrongPlace') + ' ' + hintFor(i);
    } else {
      $('#feedback').textContent = '';
    }
    renderBoard(i);
    renderTray();
    if (fromRect) flyIn(i, fromRect);
    if (!wrongNow && isComplete()) correct();
  }

  function tapGap(i) {
    if (!waiting) return;
    if (isLocked(i)) {
      $('#feedback').textContent = t('orderLocked');
      return;
    }
    if (selected !== null) {
      var v = selected;
      var from = selectedFrom;
      var rect = sourceRect(v, from);
      clearSelection();
      place(v, from, i, rect);
      return;
    }
    /* Nothing picked up: a tap on a wrong number picks it up to move it. */
    if (slots[i] !== null) {
      selected = slots[i];
      selectedFrom = i;
      paintSelectionFeedback();
      renderBoard(i);
      renderTray();
    }
  }

  function tapPiece(v) {
    if (!waiting) return;
    if (selected === v && selectedFrom === null) {
      clearSelection();
      $('#feedback').textContent = '';
    } else {
      selected = v;
      selectedFrom = null;
      paintSelectionFeedback();
    }
    renderBoard();
    renderTray(v);
  }

  /* ----------- Dragging ----------- */

  var DRAG_START_PX = 6;
  var drag = null;          /* { value, from, ghost, moved, startX, startY } */
  var justDragged = false;  /* swallows the click that follows a drop */

  function startDrag(e, v, from) {
    if (!waiting || e.button !== 0) return;
    drag = { value: v, from: from, ghost: null, moved: false, startX: e.clientX, startY: e.clientY };
    document.addEventListener('pointermove', moveDrag);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
  }

  /* A wrong number in a gap can be picked up by any part of the gap. */
  function onBoardPointerDown(e) {
    var gap = e.target.closest ? e.target.closest('.order-slot') : null;
    if (!gap || gap.disabled) return;
    var i = Number(gap.getAttribute('data-gap'));
    if (slots[i] === null || isLocked(i)) return;
    startDrag(e, slots[i], i);
  }

  function onTrayPointerDown(e) {
    var chip = e.target.closest ? e.target.closest('.order-piece') : null;
    if (!chip || chip.disabled) return;
    startDrag(e, Number(chip.getAttribute('data-value')), null);
  }

  /* The gap under the pointer that can take a number, or null. A
     locked gap cannot; the gap the number came from is allowed (a
     drop there is a no-op). */
  function gapUnder(x, y) {
    var el = document.elementFromPoint(x, y);
    var gap = el && el.closest ? el.closest('#orderBoard .order-slot') : null;
    if (!gap) return null;
    var g = Number(gap.getAttribute('data-gap'));
    return isLocked(g) ? null : g;
  }

  function moveDrag(e) {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) < DRAG_START_PX) return;
      drag.moved = true;
      drag.ghost = document.createElement('span');
      drag.ghost.className = 'order-ghost';
      drag.ghost.setAttribute('aria-hidden', 'true');
      drag.ghost.textContent = format(drag.value);
      document.body.appendChild(drag.ghost);
    }
    drag.ghost.style.left = e.clientX + 'px';
    drag.ghost.style.top = e.clientY + 'px';
    var over = gapUnder(e.clientX, e.clientY);
    var gaps = document.querySelectorAll('#orderBoard .order-slot');
    for (var k = 0; k < gaps.length; k++) {
      gaps[k].classList.toggle('is-target', Number(gaps[k].getAttribute('data-gap')) === over);
    }
  }

  function endDrag(e) {
    var d = drag;
    var g = null;
    if (d && d.moved) g = gapUnder(e.clientX, e.clientY);
    stopDrag();
    if (!d || !d.moved) return;   /* a tap: the click does the work */
    justDragged = true;
    setTimeout(function () { justDragged = false; }, 300);
    if (g !== null && d.ghost) {
      /* Glide the number into its gap, then place it there. */
      glideTo(d.ghost, gapCenter(g), function () { place(d.value, d.from, g, null); });
    } else {
      /* Dropped outside a gap (or on a locked one): the number goes
         back to the tray if it was on the board. */
      if (d.ghost) d.ghost.remove();
      if (d.from !== null) slots[d.from] = null;
      renderBoard();
      renderTray();
    }
  }

  function gapCenter(g) {
    var r = document.querySelector('#orderBoard [data-gap="' + g + '"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* Moves an element to a point on screen, then runs done(). */
  function glideTo(el, to, done) {
    el.style.transition = 'left 0.18s ease-out, top 0.18s ease-out';
    el.style.left = to.x + 'px';
    el.style.top = to.y + 'px';
    setTimeout(function () { el.remove(); done(); }, 190);
  }

  function cancelDrag() {
    if (drag && drag.ghost) drag.ghost.remove();
    stopDrag();
  }

  function stopDrag() {
    document.removeEventListener('pointermove', moveDrag);
    document.removeEventListener('pointerup', endDrag);
    document.removeEventListener('pointercancel', cancelDrag);
    drag = null;
    var marked = document.querySelectorAll('#orderBoard .is-target');
    for (var k = 0; k < marked.length; k++) marked[k].classList.remove('is-target');
  }

  /* ----------- Round flow ----------- */

  function correct() {
    progress.stars += 1;
    save();
    paintStars();
    waiting = false;
    App.feedback.success($('#feedback'));
    $('#feedback').textContent += ' ' + t('orderCorrect').replace('{list}', item.sorted.map(function (n) { return format(n); }).join(', '));
    renderBoard();
    renderTray();
    /* After a right answer the person can hear the order read aloud. */
    if (App.tts && App.tts.available) show($('#hearAnswer'));
    show($('#nextTask'));
    $('#nextTask').focus();
  }

  function paint() {
    /* fixedItem is set during the reinforcement mini-round. */
    if (fixedItem) item = fixedItem;
    fixedItem = null;
    waiting = true;
    attempts = 0;
    clearSelection();
    slots = item.sorted.map(function () { return null; });
    $('#prompt').textContent = item.prompt;
    $('#taskDetail').textContent = item.detail;
    $('#feedback').textContent = '';
    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = '';
    hide($('#hearAnswer'));
    hide($('#nextTask'));
    renderBoard();
    renderTray();
  }

  function goNext() {
    /* Mini-round: go to the next failed item or close. */
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        closeRound();
        return;
      }
      showReinforce(reinforceList[reinforceIndex]);
      paintReinforceProgress();
      return;
    }
    index += 1;
    if (index < round.length) {
      item = round[index];
      paint();
      return;
    }
    /* consume() fires the callback if there are misses. If not,
       closeRound closes the normal round. */
    var consume = App.reinforce.consume();
    if (consume.length === 0) closeRound();
  }

  /* Closes the round and shows the final screen. Used both when
     closing the normal round and when the reinforcement mini-round
     ends. */
  function closeRound() {
    $('#finishText').textContent = t('roundSummary')
      .replace('{count}', String(round.length))
      .replace('{stars}', String(progress.stars));
    $('#contexto').textContent = t('contexto');
    $('#explanation').textContent = t('explicacion');
    App.feedback.celebrate(t('roundComplete'));
    switchTo(finishScreen);
  }

  function startRound() {
    /* Not shuffled on purpose: the steps go up one at a time. */
    round = DATA.steps.map(makeItem);
    index = 0;
    inReinforce = false;
    fixedItem = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    item = round[0];
    switchTo(taskScreen);
    paint();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      t('reinforceTitle') + ' — ' +
      t('reinforceIntro').replace('{n}', String(reinforceTotal))
    );
    showReinforce(reinforceList[0]);
  }

  function showReinforce(c) {
    fixedItem = c;
    paint();
  }

  function paintReinforceProgress() {
    $('#progressText').textContent = t('progress')
      .replace('{current}', String(reinforceIndex + 1))
      .replace('{stars}', String(reinforceTotal));
  }

  /* ----------- Screen switching ----------- */
  function switchTo(screen) {
    ALL_SCREENS.forEach(function (s) { hide(s); });
    show(screen);
    paintStars();
    window.scrollTo(0, 0);
  }

  /* ============================================================
     Wiring
     ============================================================ */

  $('#btnStart').addEventListener('click', startRound);
  $('#nextTask').addEventListener('click', goNext);
  $('#orderBoard').addEventListener('pointerdown', onBoardPointerDown);
  $('#orderTray').addEventListener('pointerdown', onTrayPointerDown);
  /* Escape drops a picked-up number, for keyboard users. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || selected === null || !waiting) return;
    clearSelection();
    $('#feedback').textContent = '';
    renderBoard();
    renderTray();
  });
  /* Audio: reads the right order aloud after a right answer. */
  $('#hearAnswer').addEventListener('click', function () {
    if (item && App.tts) App.tts.speak(item.audio);
  });
  $('#backToMenu').addEventListener('click', function () { switchTo(menuScreen); });

  function init() {
    App.i18n.apply();
    paintStars();
    switchTo(menuScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
