/* ============================================================
   Calculia — The Clock (time).
   Four mechanics, chosen at the start screen:
     - read       See the analog clock → pick the right time text.
     - set        Read the time text  → set the analog clock hands.
     - convert    Pair an analog clock with its digital twin
                  (and the reverse direction within the same round).
     - situations See a moment of the day → pick the analog clock.

   Data in data.js (DATA.modes, DATA.levels, DATA.moments).
   Shared modules in assets/js/. All UI text in strings.<locale>.js.
   Mistakes are never punished: 2 attempts, Socratic hint, then
   the right answer is shown and the question is replayed at the
   end (App.reinforce). Stars are only ever added.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'clock';
  var $ = App.utils.$;

  var screenStart = $('#screenStart');
  var screenLevels = $('#screenLevels');
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
  var listenBtn = $('#btnListen');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state */
  var mode = null;     // { id, stars }   chosen mechanic
  var level = null;    // { id, stars, minutes[] } chosen difficulty
  var questions = [];
  var roundIndex = 0;
  var roundCorrect = 0;
  /* Reinforcement: missed questions replay at the end of the round.
     inReinforce prevents the mini-round from chaining itself.
     currentQ is what render() paints. */
  var inReinforce = false;
  var reinforceIndex = 0;
  var reinforceList = [];
  var reinforceTotal = 0;
  var currentQ = null;
  var answered = false;
  var attempts = 0;
  /* set-mode scratch state (built per question by render()). */
  var setDraftHour = null;
  var setDraftMinute = null;

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Time helpers ---- */
  function hour12(hour24) {
    var h = hour24 % 12;
    return h === 0 ? 12 : h;
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  /* "8 en punto", "8 y cuarto", "8 y media", "9 menos cuarto". */
  function timeText(h, minute) {
    if (minute === 0) return App.i18n.t('oClock').replace('{h}', h);
    if (minute === 15) return App.i18n.t('quarterPast').replace('{h}', h);
    if (minute === 30) return App.i18n.t('halfPast').replace('{h}', h);
    var next = h === 12 ? 1 : h + 1;
    return App.i18n.t('quarterTo').replace('{h}', next);
  }

  /* "08:00" — locale-neutral, two digits each. */
  function timeDigital(h, minute) { return pad2(h) + ':' + pad2(minute); }

  function clockSvg(h, minute) {
    var hourAngle = ((h % 12) + minute / 60) * 30;
    var minuteAngle = minute * 6;
    var numbers = [
      { n: 12, x: 50, y: 20 },
      { n: 3,  x: 80, y: 52 },
      { n: 6,  x: 50, y: 84 },
      { n: 9,  x: 20, y: 52 }
    ].map(function (p) {
      return '<text x="' + p.x + '" y="' + p.y + '" text-anchor="middle" ' +
        'font-size="12" font-weight="700" fill="var(--color-texto)" ' +
        'style="font-family:var(--fuente)">' + p.n + '</text>';
    }).join('');
    return '<svg viewBox="0 0 100 100" width="120" height="120" role="img" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="var(--color-texto)" stroke-width="4"/>' +
      numbers +
      '<line x1="50" y1="50" x2="50" y2="28" stroke="var(--color-texto)" stroke-width="5" ' +
      'stroke-linecap="round" transform="rotate(' + hourAngle + ' 50 50)"/>' +
      '<line x1="50" y1="50" x2="50" y2="18" stroke="var(--color-texto)" stroke-width="3.5" ' +
      'stroke-linecap="round" transform="rotate(' + minuteAngle + ' 50 50)"/>' +
      '<circle cx="50" cy="50" r="3" fill="var(--color-texto)"/>' +
      '</svg>';
  }

  /* Plain digital LCD-style face (no seconds). */
  function digitalFace(h, minute) {
    return '<div class="digital-face" role="img" aria-hidden="true">' +
      '<span class="dig-pair">' + pad2(h) + ':' + pad2(minute) + '</span>' +
      '</div>';
  }

  /* Live digital face with running seconds. Returns the host element;
     the caller must later call stopLiveDigital(host) (or rely on
     render()'s cleanup) to stop the interval. */
  function startLiveDigital(host) {
    function paint() {
      var now = new Date();
      var h = now.getHours() % 12; if (h === 0) h = 12;
      var m = now.getMinutes();
      var s = now.getSeconds();
      host.innerHTML =
        '<span class="dig-pair">' + pad2(h) + ':' + pad2(m) + '</span>' +
        '<span class="dig-seg">:' + pad2(s) + '</span>';
    }
    host.classList.add('digital-live');
    host.setAttribute('role', 'img');
    paint();
    var id = setInterval(paint, 1000);
    host.dataset.tickId = String(id);
    return host;
  }

  function stopLiveDigital(host) {
    if (!host || !host.dataset.tickId) return;
    clearInterval(parseInt(host.dataset.tickId, 10));
    delete host.dataset.tickId;
  }

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
  function makeReadQuestion() {
    var h = randomHour();
    var m = randomMinute();
    var used = [{ h: h, m: m }];
    var options = [{ text: timeText(h, m), isCorrect: true }];
    while (options.length < 3) {
      var d = differentCombination(used);
      used.push(d);
      var text = timeText(d.h, d.m);
      if (options.some(function (o) { return o.text === text; })) continue;
      options.push({ text: text, isCorrect: false });
    }
    return { type: 'read', hour: h, minute: m, options: options };
  }

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

  function makeSituationQuestion() {
    var moment = DATA.moments[Math.floor(Math.random() * DATA.moments.length)];
    var h = hour12(moment.hora);
    var m = randomMinute();
    var used = [{ h: h, m: m }];
    var options = [{ h: h, m: m, isCorrect: true }];
    while (options.length < 3) {
      var d = differentCombination(used);
      used.push(d);
      options.push({ h: d.h, m: d.m, isCorrect: false });
    }
    return { type: 'situations', moment: moment, options: options };
  }

  function makeReadQuestion() {
    var h = randomHour();
    var m = randomMinute();
    var used = [{ h: h, m: m }];
    var options = [{ text: timeText(h, m), isCorrect: true }];
    while (options.length < 3) {
      var d = differentCombination(used);
      used.push(d);
      var text = timeText(d.h, d.m);
      if (options.some(function (o) { return o.text === text; })) continue;
      options.push({ text: text, isCorrect: false });
    }
    return { type: 'read', hour: h, minute: m, options: options };
  }

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

  function makeSituationQuestion() {
    var moment = DATA.moments[Math.floor(Math.random() * DATA.moments.length)];
    var h = hour12(moment.hora);
    var m = randomMinute();
    var used = [{ h: h, m: m }];
    var options = [{ h: h, m: m, isCorrect: true }];
    while (options.length < 3) {
      var d = differentCombination(used);
      used.push(d);
      options.push({ h: d.h, m: d.m, isCorrect: false });
    }
    return { type: 'situations', moment: moment, options: options };
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
    screenLevels.classList.remove('hidden');
    paintLevels();
  }

  function paintLevels() {
    var cont = $('#levels');
    cont.innerHTML = '';
    DATA.levels.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-level';
      btn.innerHTML = App.i18n.t('levelDescription.' + n.id);
      btn.addEventListener('click', function () { startRound(n); });
      cont.appendChild(btn);
    });
  }

  function startRound(n) {
    level = n;
    var builderByMode = {
      read: makeReadQuestion,
      set: makeSetQuestion,
      convert: makeConvertQuestion,
      situations: makeSituationQuestion
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
    roundIndex = 0;
    roundCorrect = 0;
    inReinforce = false;
    reinforceIndex = 0;
    currentQ = null;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    screenStart.classList.add('hidden');
    screenLevels.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  /* Launches the mini-round with the missed questions. The bar shows
     the progress inside the reinforcement. Stars are already added
     on each correct item (see answer); roundCorrect is not incremented
     here (it is the normal round counter). */
  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      App.i18n.t('reinforceTitle') + ' — ' +
      App.i18n.t('reinforceIntro').replace('{n}', reinforceTotal)
    );
    currentQ = reinforceList[0];
    paintReinforceProgress();
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforceIndex + 1) / reinforceTotal) * 100) + '%';
    progressText.textContent = (reinforceIndex + 1) + ' / ' + reinforceTotal;
  }

  function paintProgress() {
    progressFill.style.width = ((roundIndex / DATA.perRound) * 100) + '%';
    progressText.textContent = roundIndex + ' / ' + DATA.perRound;
  }

  /* ---- Render dispatcher ---- */
  function render() {
    var p = questions[roundIndex];
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
    if (p.type === 'read')            renderRead(p);
    else if (p.type === 'set')        renderSet(p);
    else if (p.type === 'convert')    renderConvert(p);
    else if (p.type === 'situations') renderSituation(p);

    paintProgress();
    paintStars();
  }

  function renderRead(p) {
    questionZoneEl.innerHTML = clockSvg(p.hour, p.minute);
    questionTextEl.textContent = App.i18n.t('whatTime');
    App.utils.shuffle(p.options).forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = op.text;
      btn.addEventListener('click', function () { answer(btn, op.isCorrect, p); });
      optionsEl.appendChild(btn);
    });
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

  function renderSituation(p) {
    questionZoneEl.innerHTML = '<div class="moment-picto" aria-hidden="true">' +
      p.moment.picto + '</div>';
    questionTextEl.textContent = App.i18n.t('moment.' + p.moment.id + '.question');
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

  /* ---- Answer evaluation (shared by all four mechanics) ---- */
  function correctAnswerText(p) {
    if (p.type === 'read') {
      var c0 = p.options.filter(function (o) { return o.isCorrect; })[0];
      return c0 ? c0.text : '';
    }
    if (p.type === 'set') return timeText(p.hour, p.minute);
    if (p.type === 'convert') {
      var c1 = p.options.filter(function (o) { return o.isCorrect; })[0];
      return p.direction === 'a2d'
        ? timeDigital(c1.h, c1.m)
        : timeText(c1.h, c1.m);
    }
    if (p.type === 'situations') {
      var c2 = p.options.filter(function (o) { return o.isCorrect; })[0];
      return timeText(c2.h, c2.m);
    }
    return '';
  }

  function showExplanation(isCorrect, p) {
    var prefix = isCorrect ? App.i18n.t('correctExplanation')
                           : App.i18n.t('incorrectExplanationA');
    explanationEl.textContent = prefix + correctAnswerText(p) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer is not given —
     the person is encouraged to look again. Only on the second
     mistake is the correct time explained (showExplanation). */
  function showHint(p) {
    var key;
    if (p.type === 'read') key = 'readHint';
    else if (p.type === 'situations') key = 'associateHint';
    else if (p.type === 'set') key = 'setHint';
    else key = 'convertHint';
    explanationEl.textContent = App.i18n.t(key);
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, p) {
    if (answered) return;
    if (isCorrect) {
      showExplanation(isCorrect, p);
      answered = true;
      btn.classList.add('correcta');
      App.utils.$$('#options .option-btn, #options .btn-step, #btnConfirmSet')
        .forEach(function (b) { b.disabled = true; });
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
      if (attempts === 1) {
        showHint(p);
      } else {
        showExplanation(isCorrect, p);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(
        App.utils.$$('#options .option-btn, #options .btn-step, #btnConfirmSet'),
        explanationWrap);
    }
  }

  function goNext() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        currentQ = null;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
        return;
      }
      currentQ = reinforceList[reinforceIndex];
      paintReinforceProgress();
      optionsEl.className = 'stack';
      render();
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
    save();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    $('#endSummary').textContent = App.i18n.t('endSummary')
      .replace('{n}', roundCorrect)
      .replace('{estrellas}', progress.stars);
    $('#transfer').textContent = App.i18n.t('transfer');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ---- Events ---- */
  $('#btnNext').addEventListener('click', goNext);
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () {
    screenEnd.classList.add('hidden');
    screenLevels.classList.remove('hidden');
  });
  $('#btnOtherMode').addEventListener('click', function () {
    screenEnd.classList.add('hidden');
    screenLevels.classList.add('hidden');
    screenStart.classList.remove('hidden');
  });
  if (listenBtn) {
    listenBtn.addEventListener('click', function () {
      var t = questionTextEl.textContent || '';
      if (t) App.tts.speak(t);
    });
  }

  paintModes();
  paintStars();
})();
