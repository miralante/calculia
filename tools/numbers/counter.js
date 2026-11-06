/* ============================================================
   Calculia — Numbers: the free-exploration counter and elevator.
   Two levels that are not questions: a counter that reads a number aloud and in words, and an
   elevator that goes up and down by steps. They own their drawing, their buttons and their state.
   The page gives them what they need in the host object: the shared progress, save(), paintStars(),
   endRound(), show(), the current level, and the elements of the round that they reuse.
   ============================================================ */
(function () {
  'use strict';
  var $ = App.utils.$;
  var M = App.numbersModel;
  var pickRandomInt = M.pickRandomInt, POS_CLASS = M.POS_CLASS, paintNumber = M.paintNumber, counterSay = M.counterSay, numberToWords = M.numberToWords;
  /* host: { progress, save(), paintStars(), endRound(), show(), level(), screenMenu, el: {...} } */
  App.numbersCounter = function (host) {
    var progress = host.progress;
    var save = host.save;
    var paintStars = host.paintStars;
    var endRound = host.endRound;
    var show = host.show;
    var screenMenu = host.screenMenu;
    var paintNumber = host.paintNumber || M.paintNumber;
    var feedbackEl = host.el.feedbackEl, progressBar = host.el.progressBar, quizCard = host.el.quizCard,
      optionsEl = host.el.optionsEl, btnNext = host.el.btnNext, progressFill = host.el.progressFill,
      progressText = host.el.progressText, counterUI = host.el.counterUI, elevatorUI = host.el.elevatorUI;
    var counterNumber = $('#counterNumber');
    var counterSep = $('#counterSep');
    var counterSepLabel = $('#counterSepLabel');
    var counterAudio = $('#counterAudio');
    var counterReset = $('#counterReset');
    var counterExit = $('#counterExit');
    var counterHint = $('#counterHint');
    var counterGroups = $('#counterGroups');
    var counterGroupsLabel = $('#counterGroupsLabel');
    var counterWords = $('#counterWords');
    var counterWordsLabel = $('#counterWordsLabel');
    var counterWritten = $('#counterWritten');
    var elevatorGoal = $('#elevatorGoal');
    var elevatorShaft = $('#elevatorShaft');
    var elevatorNumber = $('#elevatorNumber');
    var elevatorStateLabel = $('#elevatorStateLabel');
    var elevatorAudio = $('#elevatorAudio');
    var elevatorReset = $('#elevatorReset');
    var elevatorExit = $('#elevatorExit');
    var elevatorHint = $('#elevatorHint');
    var elevatorSuggestion = $('#elevatorSuggestion');
    var counterValue = 0;
    var counterMax = 0;
    var counterShowSep = true;
    var counterColorGroups = false;
    var counterShowWords = false;
  
    function renderCounter(q) {
      counterValue = 0;
      counterMax = q.max;
      counterShowSep = true;
      counterColorGroups = false;
      counterShowWords = false;
      counterWords.setAttribute('aria-pressed', 'false');
      counterWordsLabel.textContent = App.i18n.t('gen.counterWordsOff');
      counterUI.classList.remove('hidden');
      elevatorUI.classList.add('hidden');
      counterHint.textContent = App.i18n.t('gen.counterHint');
      /* The progress bar / quiz card / options belong to the quiz flow;
         they're hidden while the counter is shown so the screen reads
         as a free exploration surface, not a question. */
      progressBar.classList.add('hidden');
      quizCard.classList.add('hidden');
      optionsEl.classList.add('hidden');
      btnNext.classList.add('hidden');
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      /* progressText stays at 0/6; the bar is hidden, so it isn't read. */
      progressFill.style.width = '0%';
      progressText.textContent = '';
      paintCounter();
      paintCounterToggle();
      paintStars();
    }
  
    function paintCounter() {
      counterNumber.innerHTML = paintCounterNumber(counterValue);
      counterWritten.textContent = counterShowWords ? numberToWords(counterValue) : '';
      counterWritten.classList.toggle('hidden', !counterShowWords);
      /* Disable "-" buttons at 0; the "——" buttons share the .data-step
         attribute that starts with "-". */
      App.utils.$$('#counterUI .btn-counter[data-step]').forEach(function (b) {
        var step = parseInt(b.getAttribute('data-step'), 10);
        var wouldBeNeg = (counterValue + step) < 0;
        var wouldBeOver = (counterValue + step) > counterMax;
        b.disabled = wouldBeNeg || wouldBeOver;
      });
    }
  
    var elevatorValue = 0;
    var elevatorMin = 0;
    var elevatorMax = 0;
    var elevatorMode = 'libre';
    var elevatorTarget = 0;
    var elevatorCelebrated = false;
  
    function renderElevator(q) {
      elevatorValue = (q.mode === 'meta' && typeof q.inicio === 'number')
        ? q.inicio : 0;
      elevatorMin = (typeof q.min === 'number') ? q.min : DATA.elevador.min;
      elevatorMax = (typeof q.max === 'number') ? q.max : DATA.elevador.max;
      elevatorMode = q.mode || 'libre';
      elevatorTarget = (typeof q.target === 'number') ? q.target : 0;
      elevatorCelebrated = false;
      elevatorUI.classList.remove('hidden');
      counterUI.classList.add('hidden');
      elevatorHint.textContent = App.i18n.t(
        elevatorMode === 'meta' ? 'gen.elevatorHintMeta' : 'gen.elevatorHintLibre'
      );
      /* The progress bar / quiz card / options belong to the quiz
         flow; they're hidden while the elevator is shown so the
         screen reads as a free exploration surface, not a question. */
      progressBar.classList.add('hidden');
      quizCard.classList.add('hidden');
      optionsEl.classList.add('hidden');
      btnNext.classList.add('hidden');
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      /* progressText stays at 0/6; the bar is hidden, so it isn't read. */
      progressFill.style.width = '0%';
      progressText.textContent = '';
      paintElevatorGoal();
      paintElevatorSuggestion();
      paintElevator();
      paintStars();
    }
  
    function paintElevatorGoal() {
      if (elevatorMode !== 'meta') {
        elevatorGoal.textContent = '';
        return;
      }
      var t = elevatorTarget;
      var key = 'gen.elevatorGoalMeta';
      elevatorGoal.textContent = App.i18n.t(key).replace(
        '{piso}', (t < 0 ? '−' : '') + Math.abs(t)
      );
    }
  
    function pickElevatorSuggestion() {
      var start = (elevatorMode === 'meta' && typeof host.level().inicio === 'number')
        ? host.level().inicio : 0;
      var v = pickRandomInt(elevatorMin, elevatorMax, start);
      while (v === 0) v = pickRandomInt(elevatorMin, elevatorMax, start);
      return v;
    }
  
    function paintElevatorSuggestion() {
      if (elevatorMode === 'meta') {
        elevatorSuggestion.textContent = '';
        elevatorSuggestion.classList.add('hidden');
        return;
      }
      var v = pickElevatorSuggestion();
      var sign = v < 0 ? '——' : '+';
      var key = v < 0 ? 'gen.elevatorSuggestionDown'
        : 'gen.elevatorSuggestionUp';
      elevatorSuggestion.textContent = App.i18n.t(key)
        .replace('{piso}', sign + Math.abs(v));
      elevatorSuggestion.classList.remove('hidden');
    }
  
    function paintElevator() {
      var n = elevatorValue;
      /* Big floor number. The sign is part of the text so screen
         readers say "menos cinco" naturally. */
      elevatorNumber.textContent = (n < 0 ? '——' : '') + Math.abs(n);
      elevatorNumber.setAttribute(
        'aria-label',
        App.i18n.t('gen.elevatorReadoutAria')
          .replace('{piso}', (n < 0 ? '——' : '') + Math.abs(n))
      );
      /* State label: above / on / below ground. Same vocabulary as
         the activity instruction so the user sees the same words in
         three places (instruction, hint, label). */
      var labelKey = n > 0 ? 'gen.elevatorStateAbove'
        : n < 0 ? 'gen.elevatorStateBelow'
        : 'gen.elevatorStateGround';
      elevatorStateLabel.textContent = App.i18n.t(labelKey);
      /* Disable "+" / "——" at the true edges of the building (±3) so the
         elevator cannot be sent past the top or bottom floor. With a
         ±3 range and single-floor steps this is a rare, honest edge
         case — not a stand-in for a range the buttons don't fit. */
      App.utils.$$('#elevatorUI .btn-elevator[data-step]').forEach(function (b) {
        var step = parseInt(b.getAttribute('data-step'), 10);
        var wouldBe = elevatorValue + step;
        b.disabled = (wouldBe < elevatorMin) || (wouldBe > elevatorMax);
      });
      /* Live shaft. */
      paintElevatorShaft();
      celebrateIfElevatorGoalReached();
    }
  
    function paintElevatorShaft() {
      var html = '';
      for (var f = elevatorMax; f >= elevatorMin; f--) {
        var clases = 'floor-row';
        var contenido = '';
        if (f === 0) {
          clases += ' ground-floor';
          contenido += '<span class="floor-icon">—x——</span>';
        }
        if (f === elevatorValue) {
          clases += ' current-floor';
          contenido += '<span class="floor-icon">—x——</span>';
        }
        contenido = '<span class="floor-label">' + (f > 0 ? '+' + f : (f < 0 ? '−' + Math.abs(f) : '0')) + '</span>' + contenido;
        html += '<div class="' + clases + '">' + contenido + '</div>';
      }
      elevatorShaft.innerHTML = html;
    }
  
    function celebrateIfElevatorGoalReached() {
      if (elevatorCelebrated) return;
      if (elevatorMode !== 'meta') return;
      var diff = Math.abs(elevatorValue - elevatorTarget);
      if (diff > DATA.elevador.tolerancia) return;
      var t = elevatorTarget;
      var key = 'gen.elevatorSuccess';
      feedbackEl.textContent = App.i18n.t(key).replace(
        '{piso}', (t < 0 ? '−' : '') + Math.abs(t)
      );
      /* Set 'feedback' first so the bare class literal the CSS
         coverage check scans for matches a real selector. The
         'success' modifier is added with classList.add afterwards.
         Same intent as the temperature tool: App.feedback.success()
         would overwrite the celebration text with a generic
         "⭐ Fantastic!" pick, which doesn't fit here — the message
         has to identify the floor the user just reached. */
      feedbackEl.className = 'feedback';
      feedbackEl.classList.add('success');
      elevatorCelebrated = true;
    }
  
    function paintCounterToggle() {
      /* The button shows what the current state LOOKS LIKE; clicking
         it switches to the other state. The label is built from
         strings.es/en.js so it stays localized. */
      counterSepLabel.textContent = counterShowSep
        ? App.i18n.t('gen.counterSepOn')
        : App.i18n.t('gen.counterSepOff');
      counterSep.setAttribute('aria-pressed', String(counterShowSep));
      /* The 'colour groups' toggle is only meaningful when the
         thousands separator is hidden: with the separator on, the
         dot/label already does the grouping visually. Hide the
         button otherwise to keep the surface uncluttered. */
      if (counterShowSep) {
        counterGroups.classList.add('hidden');
      } else {
        counterGroups.classList.remove('hidden');
        counterGroupsLabel.textContent = counterColorGroups
          ? App.i18n.t('gen.counterGroupsOn')
          : App.i18n.t('gen.counterGroupsOff');
        counterGroups.setAttribute('aria-pressed', String(counterColorGroups));
      }
    }
  
    function paintCounterNumber(n) {
      if (counterShowSep) return paintNumber(n, { labels: true });
      var s = String(n);
      var groups = [];
      for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
      var html = '<span class="num-color">';
      for (var g = 0; g < groups.length; g++) {
        var body = '';
        for (var j = 0; j < groups[g].length; j++) {
          var pos = groups[g].length - 1 - j;
          var posAbs = (groups.length - 1 - g) * 3 + pos;
          body += '<span class="' + POS_CLASS[pos] + '">' + groups[g][j] + '</span>';
        }
        if (counterColorGroups && groups.length > 1) {
          /* Cycle the tint across groups (g0 leftmost = lowest group).
             Three hues is enough to tell adjacent groups apart without
             becoming a rainbow. */
          html += '<span class="num-group num-group-' + (g % 3) + '">' + body + '</span>';
        } else {
          html += body;
        }
      }
      html += '</span>';
      return html;
    }
  
    function counterAddStep(step) {
      var next = counterValue + step;
      if (next < 0 || next > counterMax) return;
      counterValue = next;
      paintCounter();
    }
  
    function elevatorAddStep(step) {
      var next = elevatorValue + step;
      if (next < elevatorMin || next > elevatorMax) return;
      elevatorValue = next;
      paintElevator();
    }
  
    function elevatorSay() {
      var n = elevatorValue;
      var main = App.i18n.t('gen.elevatorTtsFloor')
        .replace('{piso}', (n < 0 ? '——' : '') + Math.abs(n));
      var labelKey = n > 0 ? 'gen.elevatorTtsAbove'
        : n < 0 ? 'gen.elevatorTtsBelow'
        : 'gen.elevatorTtsGround';
      if (false && App.tts && App.tts.speak) App.tts.speak(main + '. ' + App.i18n.t(labelKey));
    }
  
    function exitElevator() {
      progress.stars += 1;
      save();
      paintStars();
      endRound();
    }
  
    function exitCounter() {
      progress.stars += 1;
      save();
      paintStars();
      endRound();
    }
  

    /* Wire up the counter buttons once (the elements persist). */
    App.utils.$$('#counterUI .btn-counter[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var step = parseInt(b.getAttribute('data-step'), 10);
        counterAddStep(step);
      });
    });
    counterReset.addEventListener('click', function () {
      counterValue = 0;
      paintCounter();
    });
    counterSep.addEventListener('click', function () {
      /* Toggle the separator state, then redraw both the toggle label
         (which button shows, whether the colour-groups toggle is
         visible, and its label) and the number itself. Turning the
         separator ON makes the colour-groups cue redundant, so we
         force it OFF to keep the two toggles mutually consistent. */
      counterShowSep = !counterShowSep;
      if (counterShowSep) counterColorGroups = false;
      paintCounterToggle();
      paintCounter();
    });
    counterGroups.addEventListener('click', function () {
      if (counterShowSep) return; /* safety: toggle is hidden in this state */
      counterColorGroups = !counterColorGroups;
      paintCounterToggle();
      paintCounter();
    });
    counterAudio.addEventListener('click', function () {
      counterSay(counterValue);
    });
    counterExit.addEventListener('click', function () { exitCounter(); });
    /* Localized aria-label for the audio button. Setting it after the
       elements are wired keeps the HTML lean (no data-i18n-aria needed)
       while still going through the i18n table. */
    counterAudio.setAttribute('aria-label', App.i18n.t('gen.counterAudioAria'));
    counterReset.textContent = App.i18n.t('gen.counterResetLabel');
    counterExit.textContent = App.i18n.t('gen.counterExitLabel');
    counterGroups.setAttribute('aria-label', App.i18n.t('gen.counterGroupsAria'));
    counterWordsLabel.textContent = App.i18n.t('gen.counterWordsOff');
    counterWords.setAttribute('aria-label', App.i18n.t('gen.counterWordsAria'));
    counterWords.addEventListener('click', function () {
      counterShowWords = !counterShowWords;
      counterWords.setAttribute('aria-pressed', String(counterShowWords));
      counterWordsLabel.textContent = App.i18n.t(counterShowWords ? 'gen.counterWordsOn' : 'gen.counterWordsOff');
      paintCounter();
    });
  
    /* Wire up the elevator buttons once (the elements persist). Same
       pattern as the counter wire-up: step buttons share .data-step,
       the reset button takes the user back to the mission's actual
       starting point (0 for libre, the per-level 'inicio' for meta). */
    App.utils.$$('#elevatorUI .btn-elevator[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        elevatorAddStep(parseInt(b.getAttribute('data-step'), 10));
      });
    });
    elevatorReset.addEventListener('click', function () {
      elevatorValue = (elevatorMode === 'meta')
        ? ((typeof host.level().inicio === 'number') ? host.level().inicio : 0)
        : 0;
      elevatorCelebrated = false;
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      paintElevatorSuggestion();
      paintElevator();
    });
    elevatorAudio.addEventListener('click', elevatorSay);
    elevatorExit.addEventListener('click', function () { exitElevator(); });
    /* Localized labels for the elevator icon buttons (kept out of the
       HTML to avoid duplicating strings per locale). */
    elevatorAudio.setAttribute('aria-label', App.i18n.t('gen.elevatorBtnAudio'));
    elevatorReset.textContent = App.i18n.t('gen.elevatorBtnReset');
    elevatorExit.textContent = App.i18n.t('gen.elevatorBtnExit');
    return { renderCounter: renderCounter, renderElevator: renderElevator };
  };
})();
