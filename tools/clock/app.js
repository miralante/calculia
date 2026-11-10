/* ============================================================
   Calculia — The Clock (time).
   Four mechanics, chosen at the start screen:
     - set        Read the time text  → set the analog clock hands.
     - convert    Pair an analog clock with its digital twin
                  (and the reverse direction within the same round).
     - elapsed    Two clocks: the first one walks on, half an hour per press,
                  until it reaches the second; then pick how much time passed.
   Moments of the day are a separate activity (tools/moments).

   Data in data.js (DATA.modes, DATA.levels, DATA.moments).
   Shared modules in assets/js/. All UI text in strings.<locale>.js.
   Mistakes are never punished: 2 attempts, Socratic hint, then
   the right answer is shown and the question is replayed at the
   end (App.reinforce). Stars are only ever added.
   ============================================================ */
(function () {
  'use strict';

  var F = App.ClockFaces;
  var hour12 = F.hour12, timeText = F.timeText, timeDigital = F.timeDigital, clockSvg = F.clockSvg,
      referenceClockSvg = F.referenceClockSvg, stopLiveDigital = F.stopLiveDigital;


  var TOOL_ID = 'clock';
  var $ = App.utils.$;

  var screenStart = $('#screenStart');
  var screenLearn = $('#screenLearn');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var questionZoneEl = $('#questionZone');
  var questionTextEl = $('#questionText');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  var dificultadEl = $('#difficulty');
  var listenBtn = $('#btnListen');

  /* Persistent progress */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0 });

  /* Round state */
  var mode = null;     // { id, stars }   chosen mechanic
  var level = null;    // { id, stars, minutes[] } chosen difficulty
  var questions = [];
  var roundIndex = 0;
  var roundCorrect = 0;
  /* Reinforcement: missed questions replay at the end of the round.
     reinforcement.active() tells a mini-round from a normal one.
     currentQ is what render() paints. */
  var reinforcement = App.reinforce.session({
    titleKey: 'reinforceTitle',
    introKey: 'reinforceIntro',
    show: function (q) { currentQ = q; paintReinforceProgress(); render(); }
  });
  var currentQ = null;
  var answered = false;
  var attempts = 0;
  /* set-mode scratch state (built per question by render()). */
  var setDraftHour = null;
  var setDraftMinute = null;

  /* true when the reference screen was opened from inside a round. */
  var learnFromGame = false;

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  function randomHour() { return 1 + Math.floor(Math.random() * 12); }

  function randomMinute() {
    var options = level.minutes;
    return options[Math.floor(Math.random() * options.length)];
  }

  function differentCombination(exclude) {
    var h, m, tries = 0;
    do {
      h = randomHour();
      m = randomMinute();
      tries++;
    } while (exclude.some(function (e) { return e.h === h && e.m === m; }) && tries < 30);
    return { h: h, m: m };
  }

  /* ---- Question builders (one per mechanic) ---- */

  function makeSetQuestion() {
    var h = randomHour();
    var m = randomMinute();
    return { type: 'set', hour: h, minute: m };
  }

  function makeConvertQuestion() {
    var h = randomHour();
    var m = randomMinute();
    var used = [{ h: h, m: m }];
    var options = [{ h: h, m: m, isCorrect: true }];
    while (options.length < 3) {
      var d = differentCombination(used);
      used.push(d);
      options.push({ h: d.h, m: d.m, isCorrect: false });
    }
    return { type: 'convert', hour: h, minute: m, options: options };
  }

  /* How long between two clocks: the first clock walks on until it reaches
     the second (see renderElapsed). */
  function makeElapsedQuestion() {
    var gap = DATA.gaps[Math.floor(Math.random() * DATA.gaps.length)];
    var startM = randomMinute();
    /* Kept inside the 12 hours the face shows: a gap that wrapped past 12
       would need a second idea (morning and afternoon) to be read. */
    var maxStart = 12 - Math.ceil((gap + startM) / 60);
    var startH = 1 + Math.floor(Math.random() * Math.max(1, maxStart));
    var total = startH * 60 + startM + gap;
    var options = [{ gap: gap, isCorrect: true }];
    var others = DATA.gaps.filter(function (g) { return g !== gap; });
    App.utils.shuffle(others).slice(0, 2).forEach(function (g) {
      options.push({ gap: g, isCorrect: false });
    });
    return {
      type: 'elapsed',
      hour: startH, minute: startM,
      endHour: Math.floor(total / 60), endMinute: total % 60,
      gap: gap,
      options: options
    };
  }


  /* ---- Start screens (mode → level → game) ---- */
  function paintModes() {
    var cont = $('#modes');
    cont.innerHTML = '';
    DATA.modes.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-mode';
      btn.innerHTML =
        '<strong data-i18n="mode.' + m.id + '.name">' +
          App.i18n.t('mode.' + m.id + '.name') +
        '</strong>' +
        '<span class="mode-desc" data-i18n="mode.' + m.id + '.description">' +
          App.i18n.t('mode.' + m.id + '.description') +
        '</span>';
      btn.addEventListener('click', function () { chooseMode(m); });
      cont.appendChild(btn);
    });
  }

  function chooseMode(m) {
    mode = m;
    screenStart.classList.add('hidden');
    showLearn(false);
  }

  /* The reference is shown before the first question and can be
     reopened mid-round: the rule stays consultable instead of having
     to be held in memory. `fromGame` swaps the footer button so
     reopening it never restarts the round. */
  function showLearn(fromGame) {
    learnFromGame = !!fromGame;
    paintLearn();
    screenStart.classList.add('hidden');
    screenGame.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenLearn.classList.remove('hidden');
    $('#learnStart').classList.toggle('hidden', learnFromGame);
  }

  /* 3 o'clock: the long hand sits on the 12, which is the first rule
     the screen states, so example and rule agree. */
  function paintLearn() {
    $('#learnClock').innerHTML = referenceClockSvg(3, 0);
    $('#learnExample').textContent =
      App.i18n.t('learnExample').replace('{t}', timeText(3, 0));
  }

  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var idxN = Math.min(progress.completedRounds || 0, DATA.levels.length - 1);
    return DATA.levels[idxN];
  }

  function startRound(n) {
    level = n;
    var builderByMode = {
      set: makeSetQuestion,
      convert: makeConvertQuestion,
      elapsed: makeElapsedQuestion
    };
    questions = [];
    for (var i = 0; i < DATA.perRound; i++) {
      var q = builderByMode[mode.id]();
      if (mode.id === 'convert') {
        /* Even index → show analog, ask for digital.
           Odd  index → show digital, ask for analog. */
        q.direction = (i % 2 === 0) ? 'a2d' : 'd2a';
      }
      questions.push(q);
    }
    /* Barajamos la ronda: en una sola sentada se ven las cinco mecánicas
       en orden (read, set, convert, situations, elapsed) si el modo es
       "todas" y el usuario aprende la posición del botón más que la
       hora. El barajado se hace aquí, no por pregunta, porque el orden
       de la ronda no forma parte de lo que se enseña. */
    questions = App.utils.shuffle(questions);
    roundIndex = 0;
    roundCorrect = 0;
    currentQ = null;
    reinforcement.begin();
    screenStart.classList.add('hidden');
    screenLearn.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  /* Launches the mini-round with the missed questions. The bar shows
     the progress inside the reinforcement. Stars are already added
     on each correct item (see answer); roundCorrect is not incremented
     here (it is the normal round counter). */
  function paintReinforceProgress() {
    App.reinforce.paintBar(progressFill, reinforcement);
    progressText.textContent = '';
  }

  function paintProgress() {
    progressFill.style.width = ((roundIndex / DATA.perRound) * 100) + '%';
    progressText.textContent = '';
  }

  /* ---- Render dispatcher ---- */
  function render() {
    /* currentQ is set while a reinforcement mini-round runs; the normal
       round paints questions[roundIndex]. */
    var p = currentQ || questions[roundIndex];
    answered = false;
    attempts = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');
    optionsEl.innerHTML = '';
    optionsEl.className = 'stack';
    /* Stop any tick left from a previous question. */
    var live = questionZoneEl.querySelector('.digital-live');
    if (live) stopLiveDigital(live);
    questionZoneEl.innerHTML = '';
    setDraftHour = null;
    setDraftMinute = null;
    questionTextEl.textContent = '';
    if (listenBtn) listenBtn.classList.add('hidden');

    if (!p) return;
    else if (p.type === 'set')        renderSet(p);
    else if (p.type === 'convert')    renderConvert(p);
    else if (p.type === 'elapsed')    renderElapsed(p);

    paintProgress();
    paintStars();
  }


  /* "Set the clock" — two accessible steppers (no drag). The clock
     face updates live as the user moves the values. Initial draft is
     one hour off so the round is non-trivial on first paint. */
  function renderSet(p) {
    var startH = ((p.hour % 12) + 11) % 12 + 1;   // -1 hour wrapped 1..12
    if (startH === p.hour) startH = ((p.hour % 12) + 6) % 12 + 1;
    var startM = level.minutes[0];
    setDraftHour = startH;
    setDraftMinute = startM;

    questionZoneEl.innerHTML =
      '<div class="set-target">' +
        '<span class="set-label">' + App.i18n.t('setLabel') + '</span>' +
        '<span class="set-time">' + timeText(p.hour, p.minute) + '</span>' +
      '</div>' +
      clockSvg(setDraftHour, setDraftMinute);

    questionTextEl.textContent = App.i18n.t('mode.set.question');

    optionsEl.className = 'stack options-steppers';
    optionsEl.innerHTML =
      stepperHtml('hour', App.i18n.t('setHour'), startH, 1, 12) +
      stepperHtml('minute', App.i18n.t('setMinute'), startM, 0, 59) +
      '<button type="button" class="btn btn-confirm" id="btnConfirmSet">' +
        App.i18n.t('setConfirm') + '</button>';

    bindStepper('hour', 1, 12);
    bindStepper('minute', 0, 59);

    $('#btnConfirmSet').addEventListener('click', function () {
      answer($('#btnConfirmSet'),
        setDraftHour === p.hour && setDraftMinute === p.minute,
        p);
    });
  }

  function stepperHtml(kind, label, value, min, max) {
    return '<div class="stepper" data-kind="' + kind + '">' +
      '<span class="stepper-label">' + label + '</span>' +
      '<button type="button" class="btn-step btn-step-down" aria-label="' +
        App.i18n.t('setDecrement') + '">−</button>' +
      '<span class="stepper-value" data-value="' + value + '">' + value + '</span>' +
      '<button type="button" class="btn-step btn-step-up" aria-label="' +
        App.i18n.t('setIncrement') + '">+</button>' +
      '</div>';
  }

  function bindStepper(kind, min, max) {
    var root = optionsEl.querySelector('.stepper[data-kind="' + kind + '"]');
    if (!root) return;
    var valEl = root.querySelector('.stepper-value');
    function setVal(v) {
      if (v < min) v = max;
      if (v > max) v = min;
      valEl.setAttribute('data-value', String(v));
      valEl.textContent = String(v);
      if (kind === 'hour') setDraftHour = v;
      else setDraftMinute = v;
      /* Re-render the clock face in-place. */
      var svgHost = questionZoneEl.querySelector('svg');
      if (svgHost) {
        var tmp = document.createElement('div');
        tmp.innerHTML = clockSvg(setDraftHour, setDraftMinute);
        var newSvg = tmp.firstChild;
        svgHost.parentNode.replaceChild(newSvg, svgHost);
      }
    }
    root.querySelector('.btn-step-down').addEventListener('click', function () {
      setVal(parseInt(valEl.getAttribute('data-value'), 10) - 1);
    });
    root.querySelector('.btn-step-up').addEventListener('click', function () {
      setVal(parseInt(valEl.getAttribute('data-value'), 10) + 1);
    });
  }

  /* Convert — analog ↔ digital. Direction is locked per question at
     round-build time (a2d or d2a). */
  function renderConvert(p) {
    if (p.direction === 'a2d') {
      questionZoneEl.innerHTML = clockSvg(p.hour, p.minute);
      questionTextEl.textContent = App.i18n.t('convertAnalogToDigital');
      App.utils.shuffle(p.options).forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = '<span class="dig-pair">' + timeDigital(op.h, op.m) + '</span>';
        btn.setAttribute('aria-label', App.i18n.t('clockAria')
          .replace('{texto}', timeDigital(op.h, op.m)));
        btn.addEventListener('click', function () { answer(btn, op.isCorrect, p); });
        optionsEl.appendChild(btn);
      });
    } else {
      questionZoneEl.innerHTML = '<div class="digital-face">' +
        '<span class="dig-pair">' + timeDigital(p.hour, p.minute) + '</span></div>';
      questionTextEl.textContent = App.i18n.t('convertDigitalToAnalog');
      optionsEl.className = 'stack options-clock';
      App.utils.shuffle(p.options).forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn option-clock';
        btn.innerHTML = clockSvg(op.h, op.m);
        btn.setAttribute('aria-label', App.i18n.t('clockAria')
          .replace('{texto}', timeText(op.h, op.m)));
        btn.addEventListener('click', function () { answer(btn, op.isCorrect, p); });
        optionsEl.appendChild(btn);
      });
    }
  }

  /* "How long in between", as a walk. The first clock starts at its time and
     the person lets half an hour pass with each press, one step at a time,
     until it reaches the second clock. Each step is written down, and the
     total so far is shown. Only when the walk arrives do the answers appear. */
  var walk = null;  // { total (minutes from 0:00), passed (minutes), gap, stepMinutes }

  /* A clock time in digits from a count of minutes, the hour on the 12 face. */
  function walkDigital(total) {
    return timeDigital(hour12(Math.floor(total / 60)), total % 60);
  }

  function paintWalk() {
    var h = hour12(Math.floor(walk.total / 60));
    var m = walk.total % 60;
    $('#elapsedNowFace').innerHTML = clockSvg(h, m);
    $('#elapsedNowText').textContent = timeDigital(h, m);
    $('#elapsedTotal').textContent = walk.passed > 0
      ? App.i18n.t('elapsedPassed').replace('{t}', App.i18n.t('gap.' + walk.passed))
      : '';
  }

  function elapsedStep(p) {
    var before = walk.total;
    walk.total += walk.stepMinutes;
    walk.passed += walk.stepMinutes;
    var entry = document.createElement('li');
    entry.textContent = walkDigital(before) + ' → ' + walkDigital(walk.total) + ': ' +
      App.i18n.t('gap.' + walk.stepMinutes);
    $('#elapsedSteps').appendChild(entry);
    paintWalk();
    if (walk.passed >= walk.gap) {
      $('#btnElapsedStep').classList.add('hidden');
      questionTextEl.textContent = App.i18n.t('elapsedArrived');
      showGapOptions(p);
    }
  }

  function showGapOptions(p) {
    App.utils.shuffle(p.options).forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = App.i18n.t('gap.' + op.gap);
      btn.addEventListener('click', function () { answer(btn, op.isCorrect, p); });
      optionsEl.appendChild(btn);
    });
  }

  function renderElapsed(p) {
    walk = { total: p.hour * 60 + p.minute, passed: 0, gap: p.gap, stepMinutes: DATA.elapsedStepMinutes };
    questionZoneEl.innerHTML =
      '<div class="elapsed-walk">' +
        '<div class="elapsed-now">' +
          '<span class="elapsed-label">' + App.i18n.t('elapsedNow') + '</span>' +
          '<span id="elapsedNowFace"></span>' +
          '<span class="elapsed-time" id="elapsedNowText"></span>' +
        '</div>' +
        '<div class="elapsed-target">' +
          '<span class="elapsed-label" data-when="to">' + App.i18n.t('elapsedTo') + '</span>' +
          clockSvg(p.endHour, p.endMinute) +
          '<span class="elapsed-time">' + timeDigital(p.endHour, p.endMinute) + '</span>' +
        '</div>' +
        '<p class="elapsed-total" id="elapsedTotal" aria-live="polite"></p>' +
        '<ol class="elapsed-steps" id="elapsedSteps" aria-label="' + App.i18n.t('elapsedSteps') + '"></ol>' +
        '<button type="button" class="btn" id="btnElapsedStep">' + App.i18n.t('elapsedStep') + '</button>' +
      '</div>';
    questionTextEl.textContent = App.i18n.t('mode.elapsed.question');
    paintWalk();
    $('#btnElapsedStep').addEventListener('click', function () { elapsedStep(p); });
  }


  /* ---- Answer evaluation (shared by all four mechanics) ---- */
  function correctAnswerText(p) {
    if (p.type === 'set') return timeText(p.hour, p.minute);
    if (p.type === 'convert') {
      var c1 = p.options.filter(function (o) { return o.isCorrect; })[0];
      return p.direction === 'a2d'
        ? timeDigital(c1.h, c1.m)
        : timeText(c1.h, c1.m);
    }
    return '';
  }

  /* The sentence that explains a right answer of the elapsed walk. */
  function explanationBody(p) {
    return App.i18n.t('explainElapsed').replace('{gap}', App.i18n.t('gap.' + p.gap));
  }

  function showExplanation(isCorrect, p) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    if (p.type === 'elapsed') {
      var lead = isCorrect ? App.i18n.t('correctLead') : App.i18n.t('incorrectLead');
      explanationEl.textContent = lead + explanationBody(p);
      explanationWrap.classList.remove('hidden');
      return;
    }
    var prefix = isCorrect ? App.i18n.t('correctExplanation')
                           : App.i18n.t('incorrectExplanationA');
    explanationEl.textContent = prefix + correctAnswerText(p) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer is not given —
     the person is encouraged to look again. Only on the second
     mistake is the correct time explained (showExplanation). */
  function showHint(p, btn) {
    var key;
    if (p.type === 'set') key = 'setHint';
    else if (p.type === 'elapsed') key = 'elapsedHint';
    else key = 'convertHint';
    /* Only a picked option names «{elegida}»; a clock set by hand has no label. */
    var picked = btn && btn.classList.contains('option-btn') ? btn.textContent : '';
    explanationEl.textContent = App.feedback.hintText(App.i18n.t(key), picked);
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, p) {
    if (answered) return;
    if (isCorrect) {
      showExplanation(isCorrect, p);
      answered = true;
      App.feedback.markCorrect(btn, App.utils.$$('#options .option-btn, #options .btn-step'));
      App.utils.$$('#btnConfirmSet').forEach(function (b) { b.disabled = true; });
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) App.reinforce.add(level.id + ':' + roundIndex, p);
      var respuestaTrasPista = attempts > 1;
      showHint(p, btn);
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(
        App.utils.$$('#options .option-btn, #options .btn-step, #btnConfirmSet'),
        explanationWrap, function () { if (respuestaTrasPista) showExplanation(isCorrect, p); });
    }
  }

  function goNext() {
    if (reinforcement.active()) {
      optionsEl.className = 'stack';
      if (!reinforcement.nextItem()) {
        currentQ = null;
        endRound();
      }
      return;
    }
    roundIndex += 1;
    optionsEl.className = 'stack';
    if (roundIndex >= DATA.perRound) {
      var consume = App.reinforce.consume();
      if (consume.length === 0) endRound();
      return;
    }
    currentQ = null;
    render();
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{nWord}', App.i18n.starsWord(roundCorrect))
        .replace('{stars}', progress.stars)
        .replace('{starsWord}', App.i18n.starsWord(progress.stars));
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ---- Events ---- */
  $('#btnNext').addEventListener('click', goNext);

  $('#learnStart').addEventListener('click', function () {
    screenLearn.classList.add('hidden');
    startRound(levelFromProgress());
  });
  if (listenBtn) {
    listenBtn.addEventListener('click', function () {
      var t = questionTextEl.textContent || '';
      if (t) if (false && App.tts && App.tts.speak) App.tts.speak(t);
    });
  }

  paintModes();
  paintStars();

  /* A link from the Tiempo y reloj group can open one mechanic straight
     away: clock/#situations or clock/#elapsed. The hash is not sent to the
     server, so the page still comes from the cache offline. */
  var presetMode = DATA.modes.filter(function (m) {
    return m.id === location.hash.replace('#', '');
  })[0];
  if (presetMode) chooseMode(presetMode);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();
