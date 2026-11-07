/* ============================================================
   Calculia — Trigonometría
   Data and levels in data.js. Shared modules in assets/js/.
   Every question is generated on the fly from the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'trigonometry';
  var $ = App.utils.$;

  var screenLearn = $('#screenLearn');
  var screenReal = $('#screenReal');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
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
  var starsEl = $('#stars');
  var learnTitleEl = $('#learnTitle');
  var learnContextEl = $('#learnContext');
  var learnVisualEl = $('#learnVisual');
  var learnRuleEl = $('#learnRule');
  var learnRampVisualEl = $('#learnRampVisual');
  var learnRampRuleEl = $('#learnRampRule');
  var realVisualEl = $('#realVisual');
  var realCaptionEl = $('#realCaption');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  if (!progress.levelByActivity || typeof progress.levelByActivity !== 'object') progress.levelByActivity = {};

  /* Round state */
  var activity = null;
  var level = null;
  var roundQuestions = [];
  var realIndex = 0;
  var lessonReturnTo = 'menu';
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var reinforcement = App.reinforce.session({ titleKey: 'reinforceTitle', introKey: 'reinforceIntro', show: paintQuestion });

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    activity: function () { return activity; },
    roundCorrect: function () { return roundCorrect; },
    screenEnd: function () { return screenEnd; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars, endRound = glue.endRound;

  var F = App.trigonometryFigures;
  var Q = App.trigonometryQuestions;
  var laddersSvg = F.laddersSvg;
  var rampPairHtml = Q.rampPairHtml, rampPairAria = Q.rampPairAria, GENERATOR_FOR = Q.GENERATOR_FOR;

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenLearn, screenReal, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* Small pictures of everyday places where the rise and run matter. The
     rails and rungs make the ladder recognizable; the house and paired
     ramps keep each example grounded in a familiar object. */
  function realExamplePicture(id) {
    if (id === 'ladder') {
      return {
        html: '<svg viewBox="0 0 190 170" class="real-life-svg real-ladder-svg" aria-hidden="true">' +
          '<line x1="34" y1="12" x2="34" y2="151" class="real-wall"/>' +
          '<line x1="18" y1="151" x2="174" y2="151" class="real-ground"/>' +
          '<line x1="36" y1="24" x2="119" y2="151" class="real-ladder-rail"/>' +
          '<line x1="48" y1="24" x2="131" y2="151" class="real-ladder-rail"/>' +
          '<path d="M48 42h12 M58 58h12 M68 74h12 M78 90h12 M88 106h12 M98 122h12 M108 138h12" class="real-ladder-rung"/>' +
          '</svg>',
        aria: App.i18n.t('realExampleAria.ladder')
      };
    }
    if (id === 'roof') {
      return {
        html: '<svg viewBox="0 0 200 170" class="real-life-svg" aria-hidden="true">' +
          '<path d="M42 71v84h116V71" class="real-house"/>' +
          '<path d="M25 73 100 15l75 58-8 8-67-52-67 52Z" class="real-roof"/>' +
          '<path d="M25 73h75V22" class="real-guide"/>' +
          '<path d="M41 73 A16 16 0 0 0 37.7 63.2" class="real-angle-mark"/>' +
          '<rect x="56" y="94" width="26" height="27" rx="2" class="real-window"/>' +
          '<line x1="69" y1="94" x2="69" y2="121" class="real-detail"/>' +
          '<line x1="56" y1="107" x2="82" y2="107" class="real-detail"/>' +
          '<path d="M118 155v-43a14 14 0 0 1 28 0v43Z" class="real-door"/>' +
          '<circle cx="139" cy="135" r="2" class="real-knob"/></svg>',
        aria: App.i18n.t('realExampleAria.roof')
      };
    }
    var gentle = App.i18n.t('realExampleLabel.gentle');
    var steep = App.i18n.t('realExampleLabel.steep');
    var car = '<path d="M4 23v-6l5-2 6-9h18l9 9 7 2 3 6v4H4Z" class="real-car-body"/>' +
      '<path d="m18 8-5 7h11V8Zm9 0v7h11l-6-7Z" class="real-car-window"/>' +
      '<circle cx="14" cy="27" r="5" class="real-car-wheel"/>' +
      '<circle cx="41" cy="27" r="5" class="real-car-wheel"/>' +
      '<circle cx="14" cy="27" r="2" class="real-wheel-hub"/>' +
      '<circle cx="41" cy="27" r="2" class="real-wheel-hub"/>';
    return {
      html: '<svg viewBox="0 0 360 180" class="real-life-svg" aria-hidden="true">' +
          '<line x1="8" y1="137" x2="352" y2="137" class="real-ground"/>' +
          '<path d="M16 137 166 109v28Z" class="real-ramp"/>' +
          '<path d="M197 137 337 62v75Z" class="real-ramp"/>' +
          '<path d="M16 137 166 109 M197 137 337 62" class="real-slope"/>' +
          '<g transform="translate(65 99) rotate(-10.6)">' + car + '</g>' +
          '<g transform="translate(231 83.5) rotate(-28.2)">' + car + '</g>' +
          '<path d="M35 137 A19 19 0 0 0 34.65 133.5 M216 137 A19 19 0 0 0 213.75 128" class="real-angle-mark"/>' +
          '<text x="91" y="164" class="real-label">' + gentle + '</text>' +
          '<text x="267" y="164" class="real-label">' + steep + '</text></svg>',
      aria: App.i18n.t('realExampleAria.cars')
    };
  }

  function paintRealExample() {
    var examples = ['ladder', 'roof', 'cars'];
    var id = examples[realIndex];
    var picture = realExamplePicture(id);
    realVisualEl.innerHTML = picture.html;
    realVisualEl.setAttribute('role', 'img');
    realVisualEl.setAttribute('aria-label', picture.aria);
    realCaptionEl.textContent = '';
    ['first', 'second', 'third'].forEach(function (part, i) {
      var step = document.createElement('li');
      step.textContent = App.i18n.t('realExampleSteps.' + id + '.' + part);
      realCaptionEl.appendChild(step);
    });
    $('#realPrev').setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    $('#realNext').setAttribute('aria-label', App.i18n.t('galleryNext'));
    $('#realContinue').textContent = App.i18n.t('realContinue');
  }

  /* A short visual reference comes before practice and stays one tap away
     during the round. It explains what the drawing means before asking a
     question about it. */
  function lessonPicture() {
    var letters = App.i18n.t('gen.ladderLetters').split('');
    var pair = [DATA.ladders[0], DATA.ladders[1]].map(function (ladder, i) {
      return { ladder: ladder, letter: letters[i] };
    }).sort(function (a, b) { return a.ladder.run - b.ladder.run; });
    return {
      html: '<div class="tri-stage">' + laddersSvg(pair.map(function (item) { return item.ladder; }), {
        labels: pair.map(function (item) { return item.letter; })
      }) + '</div>',
      aria: App.i18n.t('gen.twoLaddersAria')
        .replace(/\{a\}/g, pair[0].letter).replace(/\{b\}/g, pair[0].ladder.rise)
        .replace(/\{c\}/g, pair[0].ladder.run).replace(/\{d\}/g, pair[1].letter)
        .replace(/\{e\}/g, pair[1].ladder.rise).replace(/\{f\}/g, pair[1].ladder.run)
    };
  }

  function showLesson(returnTo) {
    lessonReturnTo = returnTo;
    var picture = lessonPicture();
    learnTitleEl.textContent = App.i18n.t('activity.' + activity.id + '.name');
    learnContextEl.textContent = App.i18n.t('activity.' + activity.id + '.instruction');
    learnVisualEl.innerHTML = picture.html;
    learnVisualEl.setAttribute('role', 'img');
    learnVisualEl.setAttribute('aria-label', picture.aria);
    learnRuleEl.textContent = App.i18n.t('activity.' + activity.id + '.lessonRule');
    var ramps = DATA.steeperExample.map(function (t, i) {
      return { triangle: t, letter: i === 0 ? 'A' : 'B' };
    });
    learnRampVisualEl.innerHTML = rampPairHtml(ramps);
    learnRampVisualEl.setAttribute('role', 'img');
    learnRampVisualEl.setAttribute('aria-label', rampPairAria(ramps));
    learnRampRuleEl.textContent = App.i18n.t('activity.' + activity.id + '.lessonRampRule');
    $('#btnStartLesson').textContent = App.i18n.t('btnStartLesson');
    $('#btnRealExamples').textContent = App.i18n.t('btnRealExamples');
    $('#btnStartLesson').classList.toggle('hidden', returnTo !== 'menu');
    show(screenLearn);
  }

  function showRealExamples() {
    paintRealExample();
    show(screenReal);
  }

  /* One test contains all the activity's question types. */
  function levelFromProgress() {
    var levels = activity.levels;
    var savedIndex = Number(progress.levelByActivity[activity.id]) || 0;
    return levels[Math.min(savedIndex, levels.length - 1)];
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    roundQuestions = level.tipo === 'mixed'
      ? App.utils.shuffle(level.questions.slice())
      : [];
    index = 0;
    roundCorrect = 0;
    App.utils.drawRoundReset();
    reinforcement.begin();
    show(screenGame);
    render();
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level. */
  function paintQuestion(fixed) {
    var questionLevel = level;
    if (!fixed && level.tipo === 'mixed') questionLevel = roundQuestions[index];
    question = fixed || GENERATOR_FOR[questionLevel.tipo](questionLevel, index);
    /* Every question must have exactly ONE right answer, and the answer
       list must be something the screen can hold. This is the guard that
       catches a generator quietly dropping its own correct option: the
       page would otherwise accept nothing at all, and the explanation
       code below would throw on `undefined` while trying to explain a
       question that has no answer. */
    var right = question.options.filter(function (o) { return o.correct; });
    if (right.length !== 1 || question.options.length < 2) {
      throw new Error('trigonometry: level "' + level.id + '" built a question with ' +
        right.length + ' correct answer(s) out of ' + question.options.length);
    }
    answered = false;
    attempts = 0;

    promptEl.textContent = question.prompt;
    visualEl.innerHTML = question.visual || '';
    visualEl.classList.toggle('hidden', !question.visual);
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.textContent = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!question.inline);
    question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = (reinforcement.active()
      ? ((reinforcement.position() + 1) / reinforcement.total())
      : (index / DATA.perRound)) * 100 + '%';
    progressText.textContent = '';
    paintStars();
  }

  function render() { paintQuestion(null); }

  /* Visible text of an option (its html may wrap spans, or be a drawing
     with no words at all). */
  var plainText = App.utils.plainText;


  function showExplanation(isCorrect) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    /* A picture option has no words of its own, so the explanation falls
       back to its aria text rather than saying nothing. */
    var said = plainText(correct.html).replace(/\s+/g, ' ').trim();
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      (said || correct.aria || '') + '.' +
      (question.explanation ? ' ' + question.explanation : '');
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question —which is what
     to do with the figure in front of you— and not the same sentence for
     every question. The generic line is only the fallback, for a question
     that forgot to bring its own. */
  function showHint(op) {
    explanationEl.textContent = App.feedback.hintText(
      (question && question.hint) || App.i18n.t('hint'), op ? plainText(op.html) : '');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (answered) return;
    if (op.correct) {
      showExplanation(true);
      answered = true;
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      App.reinforce.add(level.id + ':' + index, question);
      var respuestaTrasPista = attempts > 1;
      showHint(op);
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(false); });
    }
  }

  function next() {
    if (reinforcement.active()) {
      if (!reinforcement.nextItem()) endRound();
      return;
    }
    index += 1;
    if (index >= DATA.perRound) {
      /* consume() returns [] when nothing was failed; otherwise it fires
         the callback that mounts the mini-round, which ends the round
         itself, so endRound must not also run here. */
      if (App.reinforce.consume().length === 0) endRound();
    } else {
      render();
    }
  }


  /* ---- Events ---- */

  $('#btnStartLesson').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnRealExamples').addEventListener('click', showRealExamples);
  $('#realPrev').addEventListener('click', function () {
    realIndex = (realIndex + 2) % 3;
    paintRealExample();
  });
  $('#realNext').addEventListener('click', function () {
    realIndex = (realIndex + 1) % 3;
    paintRealExample();
  });
  $('#realContinue').addEventListener('click', function () {
    if (lessonReturnTo === 'menu') startRound(levelFromProgress());
    else show(screenGame);
  });
  $('#btnReference').addEventListener('click', function () { showLesson('game'); });
  $('#btnNext').addEventListener('click', next);


  activity = DATA.activities.trigonometria;
  activity.id = 'trigonometria';
  showLesson('menu');
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
