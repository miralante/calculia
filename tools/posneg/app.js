/* ============================================================
   Calculia — Positivos y negativos
   Data and texts in data.js / strings.<locale>.js.
   Shared modules in assets/js/.

   Linear screen chain (no menu), in this fixed order:
   - introScreen    : reading screen with a number line.
                      "Mueve el termómetro →" advances.
   - tempScreen     : free-exploration mission (mirror of the
                      temperature activity but with the goal
                      being the SIGN, not the physical state).
                      "Sube al ascensor →" advances.
   - elevScreen     : free-exploration mission that takes the
                      user up/down floor by floor to a target.
                      "Terminar →" reaches endScreen.
   - endScreen      : round summary, "Volver al inicio" goes
                      back to introScreen.

   Same persistence shape as the rest of Calculia:
   App.storage.get/set('posneg', { stars, completedRounds }).
   The 'phaseProgress' flag from earlier versions is read but
   ignored — see the comment in init() — so existing storage
   keeps working without manual migration.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'posneg';
  var $ = App.utils.$;

  /* ---- Screen refs ---- */
  var introScreen = $('#introScreen');
  var tempScreen = $('#tempScreen');
  var elevScreen = $('#elevScreen');
  var endScreen = $('#endScreen');
  var starsEl = $('#stars');
  var transferEl = $('#transfer');

  /* Intro refs */
  var theoryBody = $('#theoryBody');
  var theoryExample = $('#theoryExample');
  var numberlineEl = $('#numberline');
  var btnIntroNext = $('#btnIntroNext');

  /* Temperature refs */
  var tempCard = $('#tempCard');
  var tempGoal = $('#tempGoal');
  var tempNumber = $('#tempNumber');
  var tempSign = $('#tempSign');
  var tempReset = $('#tempReset');
  var tempExit = $('#tempExit');
  var tempHint = $('#tempHint');
  var tempSuggestion = $('#tempSuggestion');
  var tempAudio = $('#tempAudio');
  var tempCrossedZero = $('#tempCrossedZero');
  var btnTempNext = $('#btnTempNext');

  /* Elevator refs */
  var elevGoal = $('#elevGoal');
  var elevCabin = $('#elevCabin');
  var elevFloor = $('#elevFloor');
  var elevUp = $('#elevUp');
  var elevDown = $('#elevDown');
  var elevReset = $('#elevReset');
  var elevExit = $('#elevExit');
  var elevHint = $('#elevHint');
  var elevSuggestion = $('#elevSuggestion');
  var elevAudio = $('#elevAudio');
  var elevCrossedZero = $('#elevCrossedZero');
  var btnElevFinish = $('#btnElevFinish');

  /* Shared feedback zone (was the quiz feedback; reused for
   * the per-mission success / cross-zero messages). */
  var feedbackEl = $('#feedback');

  /* ---- Persistent progress ---- */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  /* Older versions stored a per-phase completion flag here
   * (phaseProgress: { theory, temperature, elevator }). The
   * phase menu no longer exists, so the flag is meaningless
   * now. We keep reading it so existing storage doesn't blow
   * up, but nothing writes it and nothing reads it. New users
   * never get it. */

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Round state ---- */
    var currentLevel = null;

    /* Temperature state */
    var tempValue = 0;

    /* Elevator state: currentFloor and targetFloor (generated
     * per level on entry). */
    var currentFloor = 0;
    var targetFloor = 0;
    var elevCelebrated = false;

    /* ============================================================
       Helpers
       ============================================================ */

    function pickRandomInt(min, max, avoid) {
      if (max <= min) return min;
      var range = max - min + 1;
      for (var i = 0; i < 8; i++) {
        var v = min + Math.floor(Math.random() * range);
        if (v !== avoid) return v;
      }
      return min;
    }

    function formatSigned(n, showPlus) {
      if (n === 0) return '0';
      if (n < 0) return '−' + Math.abs(n);
      return (showPlus ? '+' : '') + n;
    }

    function signOf(n) {
      if (n > 0) return 'positive';
      if (n < 0) return 'negative';
      return 'zero';
    }

    /* ============================================================
       Screen flow (linear chain: intro → temp → elev → end)
       ============================================================ */

    function show(screen) {
      [introScreen, tempScreen, elevScreen, endScreen].forEach(function (p) {
        if (!p) return;
        p.classList.toggle('hidden', p !== screen);
      });
    }

    /* Pick the current level for one of the two playable
     * sections. Uses progress.completedRounds, but a single
     * session walks the user through ALL the temperature
     * missions and ALL the elevator missions in order, so the
     * counter is bumped once per section per session (not once
     * per individual level). This keeps the linear flow
     * stable while still tracking progress for the stars
     * counter. */
    function levelFromProgress(section) {
      var rounds = progress.completedRounds || 0;
      var idx = Math.min(rounds, section.levels.length - 1);
      return section.levels[idx];
    }

    /* Show the intro screen and paint its reading content. */
    function startIntro() {
      show(introScreen);
      paintIntro();
      paintStars();
    }

    /* Paint the intro content (theoretical rules + number line
     * + example). Static content driven by strings.<locale>.js,
     * so any wording change happens in the strings files. */
    function paintIntro() {
      theoryBody.innerHTML = '';
      var intro = document.createElement('p');
      intro.textContent = App.i18n.t('theory.intro');
      theoryBody.appendChild(intro);
      var rules = App.i18n.data('theory.rules') || [];
      if (rules.length) {
        var ul = document.createElement('ul');
        rules.forEach(function (rule) {
          var li = document.createElement('li');
          li.textContent = rule;
          ul.appendChild(li);
        });
        theoryBody.appendChild(ul);
      }
      theoryExample.textContent = App.i18n.t('theory.examples');
      paintNumberline();
    }

    /* Render the tick row used in the intro card. The tick
     * labels match the mission visuals (−3, 0, +2) so the
     * user is already familiar with the notation by the time
     * they reach the temperature mission. */
    function paintNumberline() {
      numberlineEl.innerHTML = '';
      var span = DATA.numberline.span;
      for (var i = -span; i <= span; i++) {
        var tick = document.createElement('div');
        tick.className = 'numberline-tick' + (i === 0 ? ' zero' : '');
        tick.textContent = formatSigned(i, DATA.numberline.showPlus && i > 0);
        numberlineEl.appendChild(tick);
      }
    }

    /* Show the temperature screen and start the current level
     * from DATA.temperature.levels. */
    function startTemperature() {
      currentLevel = levelFromProgress(DATA.temperature);
      show(tempScreen);
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      runTemperature(currentLevel);
    }

    /* Show the elevator screen and start the current level
     * from DATA.elevator.levels. */
    function startElevator() {
      currentLevel = levelFromProgress(DATA.elevator);
      show(elevScreen);
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      runElevator(currentLevel);
    }

  /* ============================================================
       Temperature mission (paint + state + buttons)
       ============================================================ */

    function runTemperature(level) {
        /* No need to hide the elevator screen: each screen is its
         * own <section> and show() makes only one visible. */
    tempValue = (typeof level.inicioC === 'number') ? level.inicioC : 0;
      /* Reset the cross-zero flag for the new mission. */
      tempCrossedZeroCelebrated = false;
      tempStartSign = null;
      tempVisitedZero = false;
      if (tempCrossedZero) tempCrossedZero.classList.add('hidden');
      paintTempGoal();
      paintTempSuggestion();
      paintTemp();
    }

  function paintTempGoal() {
    var level = currentLevel;
    var key;
    if (level.tipo === 'misionEstado') {
      key = level.meta === 'negativo' ? 'gen.goalNegativo'
        : level.meta === 'positivo' ? 'gen.goalPositivo'
        : null;
    } else {
      key = 'gen.goalCero';
    }
    var text = key ? App.i18n.t(key) : '';
    tempGoal.textContent = text.replace('{tol}', String(DATA.tolerancia));
  }

  function paintTempSuggestion() {
    if (currentLevel.tipo === 'misionExacta') {
      tempSuggestion.textContent = '';
      tempSuggestion.classList.add('hidden');
      return;
    }
    var start = tempValue;
    var v = pickRandomInt(DATA.minC, DATA.maxC, start);
    while (v === 0) v = pickRandomInt(DATA.minC, DATA.maxC, start);
    var sign = v < 0 ? '−' : '+';
    var key = v < 0 ? 'gen.tempSuggestionDown' : 'gen.tempSuggestionUp';
    tempSuggestion.textContent = App.i18n.t(key)
      .replace('{temp}', sign + Math.abs(v));
    tempSuggestion.classList.remove('hidden');
  }

  function paintTemp() {
    var n = tempValue;
    var sign = signOf(n);
    tempNumber.textContent = formatSigned(n, false) + ' °C';
    tempNumber.className = 'temp-number sign-' + sign;
    var card = tempNumber.parentElement.parentElement;
    card.className = 'card centered temp-card sign-' + sign;
    tempSign.textContent = App.i18n.t(
      sign === 'positive' ? 'gen.signPositive'
      : sign === 'negative' ? 'gen.signNegative'
      : 'gen.signZero'
    );
    tempNumber.setAttribute(
      'aria-label',
      App.i18n.t('gen.tempReadoutAria').replace('{temp}', String(n))
    );
    /* Disable step buttons when the next step would exceed
     * the temperature range. */
    App.utils.$$('#tempScreen .btn-temp[data-step]').forEach(function (b) {
      var step = parseInt(b.getAttribute('data-step'), 10);
      var wouldBe = tempValue + step;
      b.disabled = (wouldBe < DATA.minC) || (wouldBe > DATA.maxC);
    });
        celebrateTempCrossedZero();
        celebrateTemp();
      }

      /* Crossing 0 in the thermometer uses the same start+visit
       * detection as the elevator (see that comment for the full
       * didactic definition). Fires once per mission. */
      var tempStartSign = null;
      var tempVisitedZero = false;
      var tempCrossedZeroCelebrated = false;
      function celebrateTempCrossedZero() {
        if (tempCrossedZeroCelebrated) return;
        var currentSign = signOf(tempValue);
        if (tempStartSign === null) {
          tempStartSign = currentSign;
          return;
        }
        if (currentSign === 'zero') { tempVisitedZero = true; return; }
        if (!tempVisitedZero) return;
        if (tempStartSign === 'zero') return;
        if (currentSign === tempStartSign) return;
        tempCrossedZeroCelebrated = true;
        if (tempCrossedZero) {
          tempCrossedZero.textContent = App.i18n.t('gen.crossedZero');
          tempCrossedZero.classList.remove('hidden');
        }
        App.feedback.celebrate(App.i18n.t('gen.crossedZeroShort'));
      }

  function celebrateTemp() {
    var level = currentLevel;
    var done = false;
    if (level.tipo === 'misionEstado') {
      if (level.meta === 'negativo' && tempValue < 0) done = true;
      if (level.meta === 'positivo' && tempValue > 0) done = true;
    } else if (level.tipo === 'misionExacta') {
      done = Math.abs(tempValue - level.meta) <= DATA.tolerancia;
    }
    if (!done) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      return;
    }
    feedbackEl.textContent = App.i18n.t('gen.successLine');
    feedbackEl.className = 'feedback success';
  }

  function tempAddStep(step) {
    var next = tempValue + step;
    if (next < DATA.minC || next > DATA.maxC) return;
    tempValue = next;
    paintTemp();
  }

  /* Read the current temperature aloud. Same pattern as
       * temperature/thermoSay: TTS is gated in production but the
       * button stays for accessibility. */
    function tempSay() {
      var n = tempValue;
      var main = App.i18n.t('gen.tempTtsReadout').replace('{temp}', String(n));
      if (false && App.tts && App.tts.speak) App.tts.speak(main);
    }

  /* ---- Elevator ---- */

  function runElevator(level) {
      currentFloor = DATA.inicioFloor;
        /* Pick a target per the level's direction. 'libre' has NO
         * target (the user just explores — like 'ascensorLibre' in
         * tools/numbers). 'random' / 'up' / 'down' pick a target on
         * the requested side, always avoiding the start floor. */
        if (level.direction === 'libre') {
          targetFloor = null;
        } else if (level.direction === 'up') {
          targetFloor = pickRandomInt(1, DATA.maxFloor, currentFloor);
        } else if (level.direction === 'down') {
          targetFloor = pickRandomInt(DATA.minFloor, -1, currentFloor);
        } else {
          targetFloor = pickRandomInt(DATA.minFloor, DATA.maxFloor, currentFloor);
        }
        elevCelebrated = false;
        /* Reset the cross-zero flag too, so the celebration fires
         * again on the next replay of the same mission. */
        elevCrossedZeroCelebrated = false;
        elevStartSign = null;
        elevVisitedZero = false;
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
        if (elevCrossedZero) elevCrossedZero.classList.add('hidden');
        paintElevGoal();
        paintElevSuggestion();
        paintElev();
      }

  function paintElevGoal() {
      if (currentLevel.direction === 'libre') {
        elevGoal.textContent = '';
        return;
      }
      var direction = currentLevel.direction;
      var key = direction === 'up' ? 'gen.elevGoalUp'
        : direction === 'down' ? 'gen.elevGoalDown'
        : 'gen.elevGoalRandom';
      elevGoal.textContent = App.i18n.t(key)
        .replace('{target}', formatSigned(targetFloor, false));
    }

  /* The cabin's vertical position is set in % of the shaft,
   * mapping maxFloor -> 0% top, minFloor -> 100% top (so going
   * up moves the cabin visually upward). Using percentage
   * keeps the layout responsive. */
  function paintElev() {
    var span = DATA.maxFloor - DATA.minFloor;
    var pct = ((DATA.maxFloor - currentFloor) / span) * 100;
    elevCabin.style.top = pct + '%';
    elevCabin.classList.remove('reached');

    var sign = signOf(currentFloor);
    elevFloor.textContent = formatSigned(currentFloor, true);
    elevFloor.className = 'elev-floor sign-' + sign;
    elevFloor.setAttribute(
      'aria-label',
      App.i18n.t('gen.elevFloorAria').replace('{floor}', String(currentFloor))
    );
    elevUp.disabled = (currentFloor >= DATA.maxFloor);
    elevDown.disabled = (currentFloor <= DATA.minFloor);
        celebrateCrossedZero();
        celebrateElev();
      }

  function celebrateElev() {
    if (elevCelebrated) return;
      if (targetFloor === null) return; /* libre mission: no target */
      if (currentFloor !== targetFloor) return;
      elevCelebrated = true;
      elevCabin.classList.add('reached');
      feedbackEl.textContent = App.i18n.t('gen.elevSuccess');
      feedbackEl.className = 'feedback success';
    }

    /* Cross-zero detection for the elevator.
         *
         * Didactic definition: the user has crossed zero when, in
         * the current mission, they have:
         *   1. started on a non-zero floor (a side: positive or
         *      negative), AND
         *   2. at some point stood on floor 0, AND
         *   3. now stand on the OPPOSITE side of zero from where
         *      they started.
         *
         * Why these three conditions and not "any time the cabin
         * moved from non-zero to non-zero with a different sign":
         * a single tap sequence like −1 → 0 → +1 IS a crossing,
         * and so is 5 → 0 → −3 (the start sign and current sign
         * are opposite, and zero was visited). But 5 → 1 → 5 is
         * not (zero was never visited) and 5 → 0 → 5 is not
         * (current sign equals start sign). The third condition
         * also avoids celebrating when the user goes back to
         * where they began — which would feel wrong.
         *
         * Fires exactly once per mission (rule 5). Reset on
         * startElevator and on the reset button. */
        var elevStartSign = null;
        var elevVisitedZero = false;
        var elevCrossedZeroCelebrated = false;
        function celebrateCrossedZero() {
          if (elevCrossedZeroCelebrated) return;
          var currentSign = signOf(currentFloor);
          if (elevStartSign === null) {
            elevStartSign = currentSign;
            return;
          }
          if (currentSign === 'zero') { elevVisitedZero = true; return; }
          if (!elevVisitedZero) return;
          if (elevStartSign === 'zero') return;
          if (currentSign === elevStartSign) return;
          elevCrossedZeroCelebrated = true;
          if (elevCrossedZero) {
            elevCrossedZero.textContent = App.i18n.t('gen.crossedZero');
            elevCrossedZero.classList.remove('hidden');
          }
          App.feedback.celebrate(App.i18n.t('gen.crossedZeroShort'));
        }

    /* Suggestion line for the elevator. Only shown in 'libre'
     * missions (no goal line, so a random idea adds direction);
     * for missions with a target, the goal already names the
     * floor, so showing another would conflict — same pattern
     * as tools/numbers/positivos-y-negativos and the
     * temperature tool. */
    function paintElevSuggestion() {
      if (currentLevel.direction !== 'libre') {
        elevSuggestion.textContent = '';
        elevSuggestion.classList.add('hidden');
        return;
      }
      var v = pickRandomInt(DATA.minFloor, DATA.maxFloor, currentFloor);
      while (v === 0) v = pickRandomInt(DATA.minFloor, DATA.maxFloor, currentFloor);
      var sign = v < 0 ? '−' : '+';
      var key = v < 0 ? 'gen.elevSuggestionDown' : 'gen.elevSuggestionUp';
      elevSuggestion.textContent = App.i18n.t(key)
        .replace('{piso}', sign + Math.abs(v));
      elevSuggestion.classList.remove('hidden');
    }

    /* Read the current floor aloud. Same pattern as
     * temperature/thermoSay and numbers/elevatorSay. TTS is
     * gated in production (if (false && App.tts...) blocks
     * elsewhere) but the button stays for accessibility. */
    function elevSay() {
      var n = currentFloor;
      var main = App.i18n.t('gen.elevTtsFloor').replace('{piso}', String(n));
      if (false && App.tts && App.tts.speak) App.tts.speak(main);
    }

  function elevGo(delta) {
    var next = currentFloor + delta;
    if (next < DATA.minFloor || next > DATA.maxFloor) return;
    currentFloor = next;
    paintElev();
  }

  function exitElev() {
      /* Kept for compatibility with legacy callers; the wire-up
       * now advances to the next screen inline. */
      progress.stars += 1;
      save();
      paintStars();
    }

    /* ============================================================
       End of round
       ============================================================ */

    function endRound() {
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      save();
      show(endScreen);
      var summaryEl = $('#endSummary');
      if (summaryEl) {
        summaryEl.textContent = App.i18n.t('gen.endSummary')
          .replace('{stars}', progress.stars);
      }
      $('#contexto').textContent = App.i18n.t('contexto');
      $('#explanation').textContent = App.i18n.t('explicacion');
      if (transferEl) transferEl.textContent = App.i18n.t('transfer');
      App.feedback.celebrate(App.i18n.t('core.roundComplete'));
    }

  /* ============================================================
     Wire-up
     ============================================================ */

    /* Intro → Temperature. The button text on the intro screen
     * already names the next concrete action (e.g. "Mueve el
     * termómetro"), but the button itself just advances. */
    btnIntroNext.addEventListener('click', function () {
      progress.stars += 1;
      save();
      paintStars();
      startTemperature();
    });

    /* Temperature controls (note: scope is now the whole
     * #tempScreen, since the old #tempUI wrapper is gone). */
    App.utils.$$('#tempScreen .btn-temp[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        tempAddStep(parseInt(b.getAttribute('data-step'), 10));
      });
    });
    tempReset.addEventListener('click', function () {
      tempValue = (typeof currentLevel.inicioC === 'number') ? currentLevel.inicioC : 0;
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      /* Reset the cross-zero state too, so the user can re-cross
       * after a reset and celebrate again. */
      tempStartSign = null;
      tempVisitedZero = false;
      tempCrossedZeroCelebrated = false;
      if (tempCrossedZero) tempCrossedZero.classList.add('hidden');
      paintTempSuggestion();
      paintTemp();
    });
    /* tempExit still grants the star, then advances to the
     * elevator screen (instead of going straight to the end
     * screen). The button text makes it clear this is "exit
     * this mission", not "finish the activity". */
    tempExit.addEventListener('click', function () {
      progress.stars += 1;
      save();
      paintStars();
      startElevator();
    });
    if (tempAudio) {
      tempAudio.addEventListener('click', tempSay);
      tempAudio.setAttribute('aria-label', App.i18n.t('gen.btnAudio'));
    }
    tempReset.textContent = App.i18n.t('gen.btnReset');
    tempExit.textContent = App.i18n.t('gen.btnExit');

    /* Temperature → Elevator (action button at the bottom of the
     * temperature screen). Same effect as tempExit but gives
     * the user a second, more prominent way to advance. */
    btnTempNext.addEventListener('click', function () {
      progress.stars += 1;
      save();
      paintStars();
      startElevator();
    });

    /* Elevator controls (scope is the whole #elevScreen). */
    elevUp.addEventListener('click', function () { elevGo(1); });
    elevDown.addEventListener('click', function () { elevGo(-1); });
    elevReset.addEventListener('click', function () {
      currentFloor = DATA.inicioFloor;
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      /* Reset the cross-zero state so the user can celebrate
       * again on the next replay of the same mission. */
      elevStartSign = null;
      elevVisitedZero = false;
      elevCrossedZeroCelebrated = false;
      if (elevCrossedZero) elevCrossedZero.classList.add('hidden');
      paintElevSuggestion();
      paintElev();
    });
    /* elevExit advances straight to the end screen (this is the
     * LAST mission in the chain). */
    elevExit.addEventListener('click', function () {
      progress.stars += 1;
      save();
      paintStars();
      endRound();
    });
    if (elevAudio) {
      elevAudio.addEventListener('click', elevSay);
      elevAudio.setAttribute('aria-label', App.i18n.t('gen.btnAudio'));
    }
    elevUp.textContent = App.i18n.t('gen.btnUp');
    elevDown.textContent = App.i18n.t('gen.btnDown');
    elevExit.textContent = App.i18n.t('gen.btnExit');

    /* Elevator → End (action button at the bottom of the
     * elevator screen). */
    btnElevFinish.addEventListener('click', function () {
      progress.stars += 1;
      save();
      paintStars();
      endRound();
    });

    /* End-of-round buttons. */
    /* 'Volver al inicio' returns to the intro screen — same
     * shape as roman-numerals/btnMenu (which goes back to
     * introScreen). The linear chain means 'Jugar otra vez'
     * starts over from the intro as well. */
    $('#btnRepeat').addEventListener('click', function () {
      startIntro();
    });
    $('#btnMenu').addEventListener('click', function () {
      startIntro();
    });

    /* Initial paint: start at the intro screen. */
    paintStars();
    startIntro();
  })();