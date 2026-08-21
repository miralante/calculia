/* ============================================================
   Calculia — Water Temperature (explore negative numbers through
   a thermometer that can freeze or boil the water).

   Data and levels in data.js. Shared modules in assets/js/.

   This activity is NOT a quiz: every level is a free-exploration
   "mission" where the person manipulates the temperature with +/−
   buttons and tries to reach a goal (a state, or an exact value).
   The visual reacts to every change (water freezes / stays
   liquid / boils), and on goal-reach the matching celebration
   message plays. No wrong-answer feedback — there are no wrong
   answers, only states.

   Mechanics mirror the numbers counter (free exploration with
   buttons, +1 star on exit) so the cumulative progress across
   activities stays consistent and the storage shape is the same.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'temperature';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var starsEl = $('#stars');
  var noteExtra = $('#noteExtra');
  var transferEl = $('#transfer');

  /* Quiz-mode parts (kept in DOM for layout consistency with other
     tools, but always hidden — every level in this tool is a
     mission, not a question). */
  var progressBar = $('#progressBar');
  var quizCard = $('#quizCard');
  var promptEl = $('#prompt');
  var visualEl = $('#visual');
  var legendEl = $('#legend');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');

  /* Thermometer / mission-mode refs. */
  var thermoUI = $('#thermoUI');
  var thermoGoal = $('#thermoGoal');
  var thermoState = $('#thermoState');
  var thermoNumber = $('#thermoNumber');
  var thermoStateLabel = $('#thermoStateLabel');
  var thermoAudio = $('#thermoAudio');
  var thermoReset = $('#thermoReset');
  var thermoExit = $('#thermoExit');
  var thermoHint = $('#thermoHint');

  /* Persistent progress. Same shape as every other tool: an object
     with a `stars` counter. */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state. */
  var activity = null;
  var level = null;

  /* Per-mission state. Held in closures so re-entering the level
     (Exit → Play again) starts fresh. */
  var thermoValue = DATA.inicioC;
  var thermoLastState = null;
  /* Set to the celebration key once a mission is completed, so we
     don't replay the same celebration on every subsequent
     step in the same mission. Reset on exit/re-enter. */
  var thermoCelebrated = false;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ============================================================
     Screen flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenLevels, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, same pattern as numbers/quantities) ---- */
  function paintMenu() {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    Object.keys(DATA.activities).forEach(function (id) {
      var act = DATA.activities[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML =
        '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
        '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
        '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
      btn.addEventListener('click', function () { openActivity(id); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    $('#activityTitle').textContent = activity.picto + ' ' + App.i18n.t('activity.' + id + '.name');
    $('#activityInstruction').textContent = App.i18n.t('activity.' + id + '.instruction');
    var cont = $('#levels');
    cont.innerHTML = '';
    activity.levels.forEach(function (nv) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-level';
      btn.innerHTML = App.i18n.t('level.' + nv.id);
      btn.addEventListener('click', function () { startRound(nv); });
      cont.appendChild(btn);
    });
    show(screenLevels);
  }

  function startRound(nv) {
    level = nv;
    show(screenGame);
    render();
  }

  /* The whole `render()` is just a switch into mission mode. No
     quiz state is generated; the mission UI drives the loop. */
  function render() {
    /* Hide quiz-mode parts: this tool never asks a question. */
    progressBar.classList.add('hidden');
    quizCard.classList.add('hidden');
    optionsEl.classList.add('hidden');
    btnNext.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    /* Reset per-mission state and start the thermometer. The starting
     temperature can be overridden per level (DATA.levels[i].inicioC)
     so missions that need a non-neutral start (e.g. "balance"
     starts at 90 °C to make the target feel earned) can specify
     their own. */
    thermoValue = (level && typeof level.inicioC === 'number') ? level.inicioC : DATA.inicioC;
    thermoLastState = null;
    thermoCelebrated = false;
    thermoUI.classList.remove('hidden');
    paintThermoGoal();
    paintThermo();
    paintStars();
  }

  /* ============================================================
     Thermometer state
     ============================================================ */

  /* Return the state key ('ice' / 'liquid' / 'steam') for a given
     temperature. Looks up DATA.states; the entry whose min/max
     range contains n wins. */
  function stateFor(n) {
    var states = DATA.states;
    if (n <= 0) return 'ice';
    if (n >= 100) return 'steam';
    return 'liquid';
  }

  /* i18n keys for the goal message and the success message, per
     'tipo'. Keeping the mapping local to renderThermo makes it
     easy to add new missions without touching the core logic. */
  var GOAL_KEY = {
    misionEstado: function (nv) {
      return nv.meta === 'ice' ? 'gen.goalFreeze'
        : nv.meta === 'steam' ? 'gen.goalSteam'
        : null;
    },
    misionExacta: function (nv) {
      return 'gen.goalBalance';
    }
  };
  var SUCCESS_KEY = {
    misionEstado: function (nv) {
      return nv.meta === 'ice' ? 'gen.successIce'
        : nv.meta === 'steam' ? 'gen.successSteam'
        : null;
    },
    /* 'balance' celebrates when the user lands in the ±tolerance
       band, not at startRound — see celebrateIfGoalReached(). */
    misionExacta: function (nv) { return 'gen.successBalance'; }
  };

  /* Show the goal line. Set once per mission (it doesn't change as
     the temperature moves). */
  function paintThermoGoal() {
    var key = GOAL_KEY[level.tipo](level);
    thermoGoal.textContent = key ? App.i18n.t(key) : '';
  }

  /* Main render: number, state emoji, state label, accessibility
     text, button enable/disable. Called on every value change. */
  function paintThermo() {
    /* The big number: signed integer with the °C unit glued on.
       The sign is part of the text so screen readers say
       "menos cinco grados Celsius" naturally. */
    var n = thermoValue;
    thermoNumber.textContent = (n < 0 ? '−' : '') + Math.abs(n) + ' °C';
    thermoNumber.setAttribute(
      'aria-label',
      App.i18n.t('gen.tempReadoutAria').replace('{temp}', String(n))
    );

    /* Physical state visual + label. The card's background tint
       follows the state so the page feels alive. */
    var state = stateFor(n);
    var entry = DATA.states[state];
    thermoState.textContent = entry.emoji;
    /* Drop the previous tint class before adding the new one so
       successive states don't accumulate classes. */
    thermoState.className = 'thermo-state state-' + entry.color;
    /* The big card keeps the same tint as the state (CSS scoped). */
    var card = thermoNumber.parentElement.parentElement;
    card.classList.remove('state-ice', 'state-liquid', 'state-steam');
    card.classList.add('state-' + entry.color);
    /* i18n state label (es: "hielo" / "agua líquida" / "vapor"). */
    var labelKey = state === 'ice' ? 'gen.stateIce'
      : state === 'steam' ? 'gen.stateSteam'
      : 'gen.stateLiquid';
    thermoStateLabel.textContent = App.i18n.t(labelKey);

    /* Disable "+" / "−" buttons when the next step would exceed
     DATA.minC / DATA.maxC. The buttons share the .data-step
     attribute that starts with "-" or "+", so a single loop
     covers all four step buttons. */
    App.utils.$$('#thermoUI .btn-thermo[data-step]').forEach(function (b) {
      var step = parseInt(b.getAttribute('data-step'), 10);
      var wouldBe = thermoValue + step;
      b.disabled = (wouldBe < DATA.minC) || (wouldBe > DATA.maxC);
    });

    /* Fire feedback whenever the state transitions. Announce the
       new state out loud (screen reader + audio button matches)
       so the user gets an immediate cue beyond just the visual. */
    if (state !== thermoLastState) {
      thermoLastState = state;
      var ttsKey = state === 'ice' ? 'gen.ttsIce'
        : state === 'steam' ? 'gen.ttsSteam'
        : 'gen.ttsLiquid';
      App.tts.speak(App.i18n.t(ttsKey));
    }

    celebrateIfGoalReached();
  }

  /* If the current state matches the mission goal, show the
     celebration once. For 'misionEstado' the goal is a state
     (ice / steam); for 'misionExacta' it's the ±tolerance band
     around the target value. */
  function celebrateIfGoalReached() {
    if (thermoCelebrated) return;
    if (level.tipo === 'misionEstado') {
      if (stateFor(thermoValue) === level.meta) {
        feedbackEl.textContent = App.i18n.t(SUCCESS_KEY.misionEstado(level));
        /* Set 'feedback' first so the bare class literal the CSS
           coverage check scans for matches a real selector. The
           'success' modifier is added with classList.add afterwards.
           We deliberately do NOT call App.feedback.success() here:
           it would overwrite the celebration text with a random
           "⭐ Fantastic!" pick from core.success, which is the
           generic reward pattern for quiz tools — wrong here, where
           the message has to identify the physical state the user
           just reached. The CSS class is enough to trigger the
           success tint. */
        feedbackEl.className = 'feedback';
        feedbackEl.classList.add('success');
        thermoCelebrated = true;
      }
    } else if (level.tipo === 'misionExacta') {
      var diff = Math.abs(thermoValue - level.meta);
      if (diff <= DATA.tolerancia) {
        feedbackEl.textContent = App.i18n.t(SUCCESS_KEY.misionExacta(level));
        feedbackEl.className = 'feedback';
        feedbackEl.classList.add('success');
        /* See the comment in the 'misionEstado' branch above for why
           App.feedback.success() is intentionally not called here. */
        thermoCelebrated = true;
      }
    }
  }

  /* ============================================================
     Button handlers
     ============================================================ */

  function thermoAddStep(step) {
    var next = thermoValue + step;
    if (next < DATA.minC || next > DATA.maxC) return;
    thermoValue = next;
    paintThermo();
  }

  /* Reads the current temperature aloud with the right wording
     for the locale. Kept simple: "{n} grados" + (if ice/steam) the
     matching state line. */
  function thermoSay() {
    var n = thermoValue;
    var main = App.i18n.t('gen.ttsTemp').replace('{temp}', String(n));
    var state = stateFor(n);
    var stateLine = App.i18n.t(
      state === 'ice' ? 'gen.ttsIce'
      : state === 'steam' ? 'gen.ttsSteam'
      : 'gen.ttsLiquid'
    );
    App.tts.speak(main + '. ' + stateLine);
  }

  function exitThermo() {
    progress.stars += 1;
    save();
    paintStars();
    endRound();
  }

  /* ============================================================
     End of round
     ============================================================ */

  function endRound() {
    show(screenEnd);
    $('#endSummary').textContent =
      App.i18n.t('gen.resumenFinal').replace('{estrellas}', progress.stars);
    $('#contexto').textContent = App.i18n.t('contexto');
    $('#explicacion').textContent = App.i18n.t('explicacion');
    transferEl.textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ============================================================
     Wire-up (runs once at load)
     ============================================================ */

  /* Step buttons. data-step carries the integer so a single loop
     covers −10, −1, +1 and +10. */
  App.utils.$$('#thermoUI .btn-thermo[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      thermoAddStep(parseInt(b.getAttribute('data-step'), 10));
    });
  });
  thermoReset.addEventListener('click', function () {
    /* Same per-level override as render() — the reset button takes
       the user back to the mission's actual starting point, not
       always 0 °C. */
    thermoValue = (level && typeof level.inicioC === 'number') ? level.inicioC : DATA.inicioC;
    thermoLastState = null;
    thermoCelebrated = false;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    paintThermo();
  });
  thermoAudio.addEventListener('click', thermoSay);
  thermoExit.addEventListener('click', exitThermo);

  /* Localized labels for the icon buttons (kept out of the HTML to
     avoid duplicating strings per locale). */
  thermoAudio.setAttribute('aria-label', App.i18n.t('gen.btnAudio'));
  thermoReset.textContent = App.i18n.t('gen.btnReset');
  thermoExit.textContent = App.i18n.t('gen.btnExit');

  /* "Repeat" / "Other level" / "Other activity" wired up to the
     standard end-of-round actions. */
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () { openActivity(activity.id); });
  $('#btnOtherActivity').addEventListener('click', function () {
    show(screenMenu);
    paintMenu();
  });
  $('#btnBackToMenu').addEventListener('click', function () { show(screenMenu); paintMenu(); });

  /* Initial paint. */
  paintStars();
  paintMenu();
})();