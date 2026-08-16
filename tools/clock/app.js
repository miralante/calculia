/* ============================================================
   Calculia — The Clock (time)
   Data in data.js (DATA.levels, DATA.moments). Shared modules
   in assets/js/. Two question types per round:
   "read" (look at a clock and pick the time in text) and
   "associate" (read a moment of the day and pick the right clock).
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'clock';
  var $ = App.utils.$;

  var screenStart = $('#screenStart');
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

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state */
  var level = null;
  var questions = [];
  var roundIndex = 0;
  var roundCorrect = 0;
  /* Reinforcement: missed questions are replayed at the end.
     inReinforce prevents the mini-round from chaining. currentQ is
     what render() paints: in the normal round it is questions[roundIndex],
     in the mini-round it is reinforceList[reinforceIndex]. */
  var inReinforce = false;
  var reinforceIndex = 0;
  var reinforceList = [];
  var reinforceTotal = 0;
  var currentQ = null;
  var answered = false;
  var attempts = 0;

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  function hour12(hour24) {
    var h = hour24 % 12;
    return h === 0 ? 12 : h;
  }

  /* Easy Read text for a given time (12-hour analog format).
     Each language has its own time expressions (see strings.js);
     it is NOT a literal word-for-word translation. */
  function timeText(h, minute) {
    if (minute === 0) return App.i18n.t('oClock').replace('{h}', h);
    if (minute === 15) return App.i18n.t('quarterPast').replace('{h}', h);
    if (minute === 30) return App.i18n.t('halfPast').replace('{h}', h);
    /* 45: it is named with respect to the next hour */
    var next = h === 12 ? 1 : h + 1;
    return App.i18n.t('quarterTo').replace('{h}', next);
  }

  function clockSvg(h, minute) {
    var hourAngle = ((h % 12) + minute / 60) * 30;
    var minuteAngle = minute * 6;
    var numbers = [
      { n: 12, x: 50, y: 20 },
      { n: 3, x: 80, y: 52 },
      { n: 6, x: 50, y: 84 },
      { n: 9, x: 20, y: 52 }
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

  function randomHour() { return 1 + Math.floor(Math.random() * 12); }

  function randomMinute() {
    var options = level.minutes;
    return options[Math.floor(Math.random() * options.length)];
  }

  function differentCombination(exclude) {
    var h, m, attempts = 0;
    do {
      h = randomHour();
      m = randomMinute();
      attempts++;
    } while (exclude.some(function (e) { return e.h === h && e.m === m; }) && attempts < 30);
    return { h: h, m: m };
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

  function makeAssociateQuestion() {
    var moment = DATA.moments[Math.floor(Math.random() * DATA.moments.length)];
    var h = hour12(moment.hour);
    var m = randomMinute();
    var used = [{ h: h, m: m }];
    var options = [{ h: h, m: m, isCorrect: true }];
    while (options.length < 3) {
      var d = differentCombination(used);
      used.push(d);
      options.push({ h: d.h, m: d.m, isCorrect: false });
    }
    return { type: 'associate', moment: moment, options: options };
  }

  /* ---- Start screen ---- */
  function paintLevels() {
    var cont = $('#levels');
    cont.innerHTML = '';
    DATA.levels.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-level';
      var levelDescription = App.i18n.t('levelDescription.' + n.id);
      btn.innerHTML = levelDescription;
      btn.addEventListener('click', function () { startRound(n); });
      cont.appendChild(btn);
    });
  }

  function startRound(n) {
    level = n;
    questions = [];
    for (var i = 0; i < DATA.perRound; i++) {
      questions.push(i % 2 === 0 ? makeReadQuestion() : makeAssociateQuestion());
    }
    roundIndex = 0;
    roundCorrect = 0;
    inReinforce = false;
    reinforceIndex = 0;
    currentQ = null;
    App.reinforce.banner.hide();
    /* Reinforcement: the callback is called with the missed questions
       at the end of the normal round. startReinforce mounts the
       mini-round with those questions. */
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    screenStart.classList.add('hidden');
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

    if (p.type === 'read') {
      questionZoneEl.innerHTML = clockSvg(p.hour, p.minute);
      questionTextEl.textContent = App.i18n.t('whatTime');
      var readOptions = App.utils.shuffle(p.options);
      readOptions.forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.textContent = op.text;
        btn.addEventListener('click', function () { answer(btn, op.isCorrect, p); });
        optionsEl.appendChild(btn);
      });
    } else {
      questionZoneEl.innerHTML = '<div class="moment-picto" aria-hidden="true">' + p.moment.picto + '</div>';
      questionTextEl.textContent = App.i18n.t('moment.' + p.moment.id + '.question');
      optionsEl.className = 'stack options-clock';
      var associateOptions = App.utils.shuffle(p.options);
      associateOptions.forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn option-clock';
        btn.innerHTML = clockSvg(op.h, op.m);
        btn.setAttribute('aria-label', App.i18n.t('clockAria').replace('{text}', timeText(op.h, op.m)));
        btn.addEventListener('click', function () { answer(btn, op.isCorrect, p); });
        optionsEl.appendChild(btn);
      });
    }

    paintProgress();
    paintStars();
  }

  function correctAnswerText(p) {
    var correct = p.options.filter(function (o) { return o.isCorrect; })[0];
    return p.type === 'read' ? correct.text : timeText(correct.h, correct.m);
  }

  function showExplanation(isCorrect, p) {
    var text = (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      correctAnswerText(p) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer is not given,
     the person is encouraged to look at the clock/moment again.
     Only on the second mistake is the correct time explained
     (showExplanation). */
  function showHint(p) {
    explanationEl.textContent = App.i18n.t(p.type === 'read' ? 'readHint' : 'associateHint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, p) {
    if (answered) return;
    if (isCorrect) {
      showExplanation(isCorrect, p);
      answered = true;
      btn.classList.add('correcta');
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      /* Reinforcement: register the first miss of the question so
         it is replayed in the mini-round. Stable key:
         level.id + ':' + roundIndex. */
      if (attempts === 1) App.reinforce.add(level.id + ':' + roundIndex, p);
      if (attempts === 1) {
        showHint(p);
      } else {
        showExplanation(isCorrect, p);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function goNext() {
    /* Mini-round: go to the next item or close. */
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

  /* Events */
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () {
    screenEnd.classList.add('hidden');
    paintLevels();
    screenStart.classList.remove('hidden');
  });

  paintLevels();
  paintStars();
})();
