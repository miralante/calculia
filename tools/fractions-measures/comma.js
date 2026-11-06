/* ============================================================
   Calculia — Fractions and measures: the comma exercise (activity 'coma').
   Put the decimal comma in a whole number (452567 becomes 452,567). The person taps or
   drags the comma to a gap; the check says whether it is right, and a wrong gap gets the
   exact move as a hint. The numbers, the words and the random cases are in model.js.
   This file owns the exercise and its events. The page gives it what it needs through a
   host object, so it does not reach into the rest of the activity: the shared progress,
   the count of right answers, the steps of the activity, and the screens.
   ============================================================ */
(function () {
  'use strict';

  var M = App.fractionsMeasuresModel;
  var comaT = M.comaT, comaSeparator = M.comaSeparator, genComma = M.genComma, COMA_DRAG_PX = M.COMA_DRAG_PX;
  var $ = App.utils.$;

  /* host: { progress, save(), paintStars(), steps(), countCorrect(), resetCorrect(), endRound(),
     showComma(), showMenu() } */
  App.fractionsMeasuresComma = function (host) {
    var progress = host.progress;
    var save = host.save;
    var paintStars = host.paintStars;
    /* ---- Poner la coma decimal (activity 'coma') ----
       A whole number is shown with no separator (452567). The person taps the
       gap where the decimal comma goes (452,567). The prompt says how many
       decimal digits the number has, so the comma is found by counting from
       the right. The comma can be dragged from the tray to a gap, or from one
       gap to another; dropped anywhere else it goes back to the tray. A tap
       works too: an empty gap puts the comma there, the comma itself removes
       it. The Escuchar button reads the question and the digits. English shows
       a point. Stars and rounds go to this tool's shared progress,
       like every other activity here. Data in data.js (activities.coma.steps). */
    var comaCase = null;
    var comaPlaced = null;      /* gap the comma sits in, or null */
    var comaWrongGap = null;    /* gap marked ✗ by the last check, or null */
    var comaWaiting = true;
    var comaAttempts = 0;
    var comaFixed = null;       /* reinforcement case to show instead of a new one */
    var comaInReinforce = false;
    var comaReinforceList = [];
    var comaReinforceIndex = 0;
    var comaIndex = 0;
  
    /* Spoken numbers: the audio says the whole part as a number and the decimals
       digit by digit ("tres coma cinco", "three point five"). The whole part is
       at most three digits, so only 1 to 999 is needed. */
    /* One item: a random number with the step's digit counts. No trailing zero,
       because "2,50" would be heard and read as "2,5". */
    function renderComaBoard() {
      var board = $('#commaBoard');
      var digits = String(comaCase.n);
      board.innerHTML = '';
      for (var i = 0; i < digits.length; i++) {
        var digit = document.createElement('span');
        digit.className = 'comma-digit';
        digit.textContent = digits.charAt(i);
        board.appendChild(digit);
        if (i < digits.length - 1) board.appendChild(comaGapButton(i));
      }
    }
  
    function comaGapButton(i) {
      var isPlaced = comaPlaced === i;
      var isWrong = comaWrongGap === i;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'comma-gap' + (isPlaced ? ' is-placed' : '') + (isWrong ? ' is-wrong' : '');
      btn.setAttribute('data-gap', String(i));
      btn.setAttribute('aria-label', comaT(isPlaced ? 'gapFilledAria' : 'gapEmptyAria'));
      btn.disabled = !comaWaiting;
      if (isPlaced) {
        var point = document.createElement('span');
        point.className = 'comma-point';
        point.textContent = comaSeparator();
        btn.appendChild(point);
      }
      if (isWrong) {
        /* The mark is a shape as well as the colour (WCAG 1.4.1). */
        var mark = document.createElement('span');
        mark.className = 'comma-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = '✗';
        btn.appendChild(mark);
      }
      btn.addEventListener('click', function () { if (!comaJustDragged) comaTapGap(i); });
      return btn;
    }
  
    /* One chip in the tray while the comma is still to be placed. */
    function renderComaTray() {
      var tray = $('#commaTray');
      tray.innerHTML = '';
      if (comaPlaced !== null) return;
      var chip = document.createElement('span');
      chip.className = 'comma-chip';
      chip.textContent = comaSeparator();
      tray.appendChild(chip);
    }
  
    function comaTapGap(i) {
      if (!comaWaiting) return;
      /* Tapping the placed comma removes it; tapping another gap moves it. */
      comaPlaced = comaPlaced === i ? null : i;
      comaRefreshWrong();
      renderComaBoard();
      renderComaTray();
      /* Keep the keyboard user's place on the gap they just used. */
      var again = document.querySelector('#commaBoard [data-gap="' + i + '"]');
      if (again) again.focus();
    }
  
    /* ---- Dragging the comma ----
       The comma can be dragged from the tray to a gap, or from one gap to
       another. Dropped anywhere else, it goes back to the tray (or is removed
       when it was in a gap). Pointer events cover mouse, touch and pen. A
       drag starts only after a few pixels of movement, so a tap is never a
       drag; the click that follows a drop is swallowed (comaJustDragged). */
    var comaDrag = null;          /* { from, ghost, moved, startX, startY } */
    var comaJustDragged = false;
  
    function comaStartDrag(e, from) {
      if (!comaWaiting || e.button !== 0) return;
      comaDrag = { from: from, ghost: null, moved: false, startX: e.clientX, startY: e.clientY };
      document.addEventListener('pointermove', comaMoveDrag);
      document.addEventListener('pointerup', comaEndDrag);
      document.addEventListener('pointercancel', comaCancelDrag);
    }
  
    /* The gap under the pointer, or null. */
    function comaGapUnder(x, y) {
      var el = document.elementFromPoint(x, y);
      var gap = el && el.closest ? el.closest('#commaBoard .comma-gap') : null;
      return gap ? Number(gap.getAttribute('data-gap')) : null;
    }
  
    function comaMoveDrag(e) {
      var d = comaDrag;
      if (!d) return;
      if (!d.moved) {
        if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) < COMA_DRAG_PX) return;
        d.moved = true;
        d.ghost = document.createElement('span');
        d.ghost.className = 'comma-ghost';
        d.ghost.setAttribute('aria-hidden', 'true');
        d.ghost.textContent = comaSeparator();
        document.body.appendChild(d.ghost);
      }
      d.ghost.style.left = e.clientX + 'px';
      d.ghost.style.top = e.clientY + 'px';
      var over = comaGapUnder(e.clientX, e.clientY);
      var gaps = document.querySelectorAll('#commaBoard .comma-gap');
      for (var k = 0; k < gaps.length; k++) {
        gaps[k].classList.toggle('is-target', Number(gaps[k].getAttribute('data-gap')) === over && over !== d.from);
      }
    }
  
    function comaEndDrag(e) {
      var d = comaDrag;
      if (!d) return;
      /* Read the target before comaStopDrag clears the drag state. */
      var target = d.moved ? comaGapUnder(e.clientX, e.clientY) : null;
      comaStopDrag();
      if (!d.moved) return;   /* a tap: the click does the work */
      comaJustDragged = true;
      setTimeout(function () { comaJustDragged = false; }, 300);
      if (target !== null && d.ghost) {
        /* Glide the comma into the gap, then settle it there. */
        comaGlide(d.ghost, comaGapCenter(target), function () { comaDrop(d.from, target); });
      } else {
        if (d.ghost) d.ghost.remove();
        comaDrop(d.from, null);
      }
    }
  
    /* from: the gap the comma was lifted from, or null when it came from the
       tray. to: the gap it landed on, or null when it was dropped elsewhere. */
    function comaDrop(from, to) {
      if (to !== null) comaPlaced = to;
      else if (from !== null) comaPlaced = null;
      comaRefreshWrong();
      renderComaBoard();
      renderComaTray();
    }
  
    function comaGapCenter(g) {
      var r = document.querySelector('#commaBoard [data-gap="' + g + '"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  
    /* Moves an element to a point on screen, then runs done(). */
    function comaGlide(el, to, done) {
      el.style.transition = 'left 0.18s ease-out, top 0.18s ease-out';
      el.style.left = to.x + 'px';
      el.style.top = to.y + 'px';
      setTimeout(function () { el.remove(); done(); }, 190);
    }
  
    function comaCancelDrag() {
      if (comaDrag && comaDrag.ghost) comaDrag.ghost.remove();
      comaStopDrag();
    }
  
    function comaStopDrag() {
      document.removeEventListener('pointermove', comaMoveDrag);
      document.removeEventListener('pointerup', comaEndDrag);
      document.removeEventListener('pointercancel', comaCancelDrag);
      comaDrag = null;
      var marked = document.querySelectorAll('#commaBoard .is-target');
      for (var k = 0; k < marked.length; k++) marked[k].classList.remove('is-target');
    }
  
    /* The short socratic hint for a comma in a wrong gap: the exact move. Each
       gap moves the comma one digit, so the number of gaps is the difference
       between the digits to the right now and the decimals the number has. Too
       many digits to the right means move right; too few means move left. */
    function comaMoveHint(gap) {
      var digitsToRight = String(comaCase.n).length - 1 - gap;
      var gapsToMove = Math.abs(digitsToRight - comaCase.decimals);
      var moves = gapsToMove === 1 ? comaT('oneGap') : comaT('manyGaps').replace('{n}', gapsToMove);
      var direction = digitsToRight > comaCase.decimals ? comaT('moveRight') : comaT('moveLeft');
      return comaT('wrongHint').replace('{moves}', moves).replace('{direction}', direction);
    }
  
    /* Marks a comma in a wrong gap at once, with its move, as the points game
       does. The check button still decides the answer. */
    function comaRefreshWrong() {
      var wrong = comaPlaced !== null && comaPlaced !== comaCase.gap;
      comaWrongGap = wrong ? comaPlaced : null;
      $('#comaFeedback').textContent = wrong ? comaMoveHint(comaPlaced) : '';
    }
  
    function comaCheckAnswer() {
      if (!comaWaiting) return;
      var feedbackEl = $('#comaFeedback');
      if (comaPlaced === null) {
        App.feedback.encourage(feedbackEl);
        feedbackEl.textContent = comaT('missing');
        return;
      }
      if (comaPlaced === comaCase.gap) {
        comaCorrect();
        return;
      }
      comaAttempts += 1;
      /* Reinforcement: register the first miss of the item. */
      if (comaAttempts === 1) App.reinforce.add('coma:' + comaCase.correct, comaCase);
      comaWrongGap = comaPlaced;
      App.feedback.encourage(feedbackEl);
      feedbackEl.textContent = comaMoveHint(comaPlaced);
      renderComaBoard();
    }
  
    function comaCorrect() {
      var feedbackEl = $('#comaFeedback');
      progress.stars += 1;
      host.countCorrect();
      save();
      paintStars();
      App.feedback.success(feedbackEl);
      feedbackEl.textContent += ' ' + comaT('correctFormat').replace('{n}', comaCase.correct);
      comaWaiting = false;
      renderComaBoard();
      $('#comaCheck').classList.add('hidden');
      $('#comaNext').classList.remove('hidden');
      $('#comaNext').focus();
    }
  
    function comaPaint() {
      /* A reinforcement case replaces the current one for this paint only. */
      if (comaFixed) comaCase = comaFixed;
      comaFixed = null;
      comaWaiting = true;
      comaAttempts = 0;
      comaPlaced = null;
      comaWrongGap = null;
      $('#comaPrompt').textContent = comaCase.prompt;
      $('#comaDetail').textContent = comaT('detailDecimal');
      $('#comaFeedback').textContent = '';
      renderComaBoard();
      renderComaTray();
      $('#comaCheck').classList.remove('hidden');
      $('#comaNext').classList.add('hidden');
      /* Escuchar is there from the start: it reads the question, then the number. */
      $('#comaHear').classList.toggle('hidden', !(App.tts && App.tts.available));
      var fillEl = $('#comaProgressFill');
      var textEl = $('#comaProgressText');
      var current = comaInReinforce ? comaReinforceIndex : comaIndex;
      var total = comaInReinforce ? comaReinforceList.length : host.steps().length;
      fillEl.style.width = ((current / total) * 100) + '%';
      textEl.textContent = comaT('roundProgress').replace('{current}', current + 1).replace('{total}', total);
    }
  
    function comaNext() {
      comaWaiting = false;
      if (comaInReinforce) {
        comaReinforceIndex += 1;
        if (comaReinforceIndex >= comaReinforceList.length) {
          comaInReinforce = false;
          App.reinforce.clear();
          App.reinforce.banner.hide();
          host.endRound();
          return;
        }
        comaFixed = comaReinforceList[comaReinforceIndex];
        comaPaint();
        return;
      }
      comaIndex += 1;
      if (comaIndex < host.steps().length) {
        comaCase = genComma(host.steps()[comaIndex]);
        comaPaint();
        return;
      }
      /* consume() starts the mini-round if there were misses; otherwise the round ends. */
      if (App.reinforce.consume().length === 0) host.endRound();
    }
  
    function startComma() {
      host.resetCorrect();
      comaIndex = 0;
      comaInReinforce = false;
      comaFixed = null;
      comaReinforceList = [];
      comaReinforceIndex = 0;
      App.reinforce.banner.hide();
      App.reinforce.start(function (fallos) { startComaReinforce(fallos); });
      comaCase = genComma(host.steps()[0]);
      host.showComma();
      comaPaint();
    }
  
    function startComaReinforce(fallos) {
      comaReinforceList = fallos.map(function (f) { return f.payload; });
      comaReinforceIndex = 0;
      comaInReinforce = true;
      App.reinforce.banner.set(
        comaT('reinforceTitle') + ' — ' +
        comaT('reinforceIntro').replace('{n}', comaReinforceList.length)
      );
      comaFixed = comaReinforceList[0];
      comaPaint();
    }
  
    /* ---- Events ---- */
  
    $('#comaCheck').addEventListener('click', comaCheckAnswer);
    $('#comaNext').addEventListener('click', comaNext);
    $('#comaHear').addEventListener('click', function () {
      if (comaCase && App.tts) App.tts.speak(comaWaiting ? comaCase.listen : comaCase.audio);
    });
    $('#comaBack').addEventListener('click', function () { host.showMenu(); });
    $('#commaBoard').addEventListener('pointerdown', function (e) {
      var gap = e.target.closest ? e.target.closest('.comma-gap.is-placed') : null;
      if (gap) comaStartDrag(e, Number(gap.getAttribute('data-gap')));
    });
    $('#commaTray').addEventListener('pointerdown', function (e) {
      var chip = e.target.closest ? e.target.closest('.comma-chip') : null;
      if (chip) comaStartDrag(e, null);
    });
    return { start: startComma };
  };
})();
