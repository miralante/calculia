/* ============================================================
   Calculia — Rectas
   Data in data.js. Shared modules in assets/js/.
   Screens: concepts → real examples → test sheet. The test sheet shows
   every question of the round at once, as in Formas.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'lines';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var galleryVisual = $('#galleryVisual');
  var galleryCaption = $('#galleryCaption');
  var galleryNote = $('#galleryNote');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var testSheetEl = $('#testSheet');
  var btnCheck = $('#btnCheck');
  var btnNewRound = $('#btnNewRound');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state. Each roundSheets entry is one question of the round with
     the option the person picked (selected, null until chosen) and whether
     "Comprobar" accepted it (correct, null until it is checked). */
  var roundCorrect = 0;
  var roundSheets = [];
  var galleryIndex = 0;
  var realIndex = 0;

  var KINDS = ['parallel', 'crossing', 'perpendicular'];

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Nothing that can be worked out is stored ----
     Which pair it is comes out of the drawing: the slopes of the two lines
     decide it, so the picture and the answer cannot disagree. */
  function slopeOf(line) {
    var dx = line[1][0] - line[0][0];
    var dy = line[1][1] - line[0][1];
    return dx === 0 ? null : dy / dx;
  }

  function pairKind(pair) {
    var sa = slopeOf(pair.a);
    var sb = slopeOf(pair.b);
    var close = function (x, y) { return Math.abs(x - y) < 0.01; };
    if (sa === null && sb === null) return 'parallel';
    if (sa === null) return close(sb, 0) ? 'perpendicular' : 'crossing';
    if (sb === null) return close(sa, 0) ? 'perpendicular' : 'crossing';
    if (close(sa, sb)) return 'parallel';
    return close(sa * sb, -1) ? 'perpendicular' : 'crossing';
  }

  /* Checked at start-up, so a pair that says the wrong kind fails loudly
     instead of teaching a lie, and the test has all three kinds to ask. */
  DATA.linePairs.forEach(function (pair) {
    if (pairKind(pair) !== pair.kind) {
      throw new Error('lines: "' + pair.id + '" is ' + pairKind(pair) +
        ', not ' + pair.kind);
    }
  });
  KINDS.forEach(function (k) {
    if (!DATA.linePairs.some(function (p) { return p.kind === k; })) {
      throw new Error('lines: no pair of lines that is "' + k + '"');
    }
  });

  /* ---- Drawings ----
     Both lines are drawn the same way everywhere: one solid and one dashed,
     so they are still two lines without any colour at all (WCAG 1.4.1). */
  function lineTag(l, cls) {
    return '<line x1="' + l[0][0] + '" y1="' + l[0][1] + '" x2="' + l[1][0] +
      '" y2="' + l[1][1] + '" class="' + cls + '"/>';
  }

  function linesSvg(pair) {
    return '<svg viewBox="0 0 120 120" width="190" height="190" aria-hidden="true">' +
      '<rect x="0" y="0" width="120" height="120" class="line-box"/>' +
      lineTag(pair.a, 'pair-line is-first') + lineTag(pair.b, 'pair-line is-second') +
      '</svg>';
  }

  /* The concept slides. The line runs past the edge of the box on purpose:
     a line does not end. */
  var CONCEPT_LINES = {
    line: [[[-20, 60], [140, 60]]],
    parallel: [[[0, 35], [120, 35]], [[0, 85], [120, 85]]],
    crossing: [[[0, 100], [120, 20]], [[0, 30], [120, 90]]],
    perpendicular: [[[0, 60], [120, 60]], [[60, 0], [60, 120]]]
  };

  function conceptSvg(id) {
    var lines = CONCEPT_LINES[id];
    var body = lineTag(lines[0], 'pair-line is-first');
    if (lines.length > 1) body += lineTag(lines[1], 'pair-line is-second');
    /* A dot marks where two lines meet, and a small square marks a square
       corner, so the two kinds of crossing are told apart by drawing. */
    if (id === 'crossing') body += '<circle cx="60" cy="60" r="4" class="meet-dot"/>';
    if (id === 'perpendicular') body += '<path d="M60 50 L70 50 L70 60" class="corner-mark"/>';
    return '<svg viewBox="0 0 120 120" width="190" height="190" aria-hidden="true">' +
      '<rect x="0" y="0" width="120" height="120" class="line-box"/>' + body + '</svg>';
  }

  /* ---- Questions ----
     Each question shows one pair and asks which of the three kinds it is. */
  function questionFor(pair) {
    var kind = pairKind(pair);
    return {
      prompt: App.i18n.t('gen.kindPrompt'),
      hint: App.i18n.t('gen.socraticKind'),
      visual: '<div class="grid-stage">' + linesSvg(pair) + '</div>',
      visualAria: App.i18n.t('gen.linesAria'),
      options: App.utils.shuffle(KINDS.map(function (k) {
        return {
          html: '<span class="answer-name">' + App.i18n.t('kind.' + k) + '</span>',
          aria: App.i18n.t('kind.' + k),
          correct: k === kind
        };
      })),
      inline: true
    };
  }

  /* ---- Screens ---- */

  function show(screen) {
    [screenIntro, screenReal, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Concept carousel ---- */

  function paintGallery() {
    var item = DATA.concepts[galleryIndex];
    galleryVisual.innerHTML = '<div class="grid-stage">' + conceptSvg(item.id) + '</div>';
    galleryCaption.textContent = App.i18n.t('concept.' + item.id + '.title');
    galleryNote.textContent = App.i18n.t('concept.' + item.id + '.text');
  }

  /* ---- Real-life carousel ---- */

  function paintRealExample() {
    var item = DATA.real[realIndex];
    realObject.textContent = item.object;
    realCaption.textContent = App.i18n.t('real.' + item.id);
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(questionFor(App.utils.drawRound('lines', DATA.linePairs)));
    }
    roundSheets = App.utils.shuffle(questions).map(function (q) {
      return { question: q, selected: null, correct: null };
    });
    roundCorrect = 0;
    show(screenGame);
    renderSheet();
  }

  /* Paints the whole round at once. The user can change a selection on any
     question until "Comprobar" is pressed. Right answers lock; a missed
     question shows its hint (never the answer) and stays open. */
  function renderSheet() {
    testSheetEl.innerHTML = '';
    roundSheets.forEach(function (sheet, i) {
      var card = document.createElement('article');
      card.className = 'card stack test-sheet-card';

      var promptEl = document.createElement('p');
      promptEl.className = 'prompt';
      promptEl.textContent = sheet.question.prompt;
      card.appendChild(promptEl);

      var visualEl = document.createElement('div');
      visualEl.className = 'visual';
      visualEl.innerHTML = sheet.question.visual;
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', sheet.question.visualAria);
      card.appendChild(visualEl);

      var optionsEl = document.createElement('div');
      optionsEl.className = 'stack options';
      if (sheet.question.inline) optionsEl.classList.add('options-row');
      sheet.question.options.forEach(function (op, j) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = op.html;
        if (op.aria) btn.setAttribute('aria-label', op.aria);
        btn.addEventListener('click', function () { selectOption(i, j); });
        optionsEl.appendChild(btn);
      });
      card.appendChild(optionsEl);

      var feedbackEl = document.createElement('p');
      feedbackEl.className = 'feedback hidden';
      feedbackEl.setAttribute('aria-live', 'polite');
      card.appendChild(feedbackEl);

      testSheetEl.appendChild(card);
    });

    btnCheck.classList.remove('hidden');
    btnCheck.disabled = false;
    btnNewRound.classList.add('hidden');
    paintSheetProgress();
  }

  function selectOption(sheetIdx, optionIdx) {
    var sheet = roundSheets[sheetIdx];
    if (sheet.correct === true) return; /* already right: locked */
    sheet.selected = optionIdx;
    var card = testSheetEl.querySelectorAll('.test-sheet-card')[sheetIdx];
    card.querySelectorAll('.option-btn').forEach(function (b, j) {
      b.classList.toggle('selected', j === optionIdx);
      b.classList.remove('incorrect');
    });
    paintSheetProgress();
  }

  function checkAnswers() {
    var firstUnanswered = -1;
    for (var i = 0; i < roundSheets.length; i += 1) {
      if (roundSheets[i].correct !== true && roundSheets[i].selected === null) {
        firstUnanswered = i;
        break;
      }
    }
    if (firstUnanswered !== -1) {
      /* Not checked half-way: scroll to the first unanswered card and shake
         it so it is noticed. The round does not count yet. */
      var target = testSheetEl.querySelectorAll('.test-sheet-card')[firstUnanswered];
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('shake');
      setTimeout(function () { target.classList.remove('shake'); }, 500);
      return;
    }

    /* Only the first check of the round scores. Later checks walk through
       the questions still wrong and add no stars. */
    var firstCheck = roundSheets.every(function (sheet) { return sheet.correct === null; });
    var rightFirstTry = 0;
    var cards = testSheetEl.querySelectorAll('.test-sheet-card');
    roundSheets.forEach(function (sheet, i) {
      if (sheet.correct === true) return; /* already right: stays locked */
      var card = cards[i];
      var options = card.querySelectorAll('.option-btn');
      var selected = sheet.question.options[sheet.selected];
      sheet.correct = selected.correct;
      if (selected.correct && firstCheck) rightFirstTry += 1;

      options.forEach(function (b) { b.classList.remove('selected'); });
      var feedbackEl = card.querySelector('.feedback');
      feedbackEl.classList.remove('hidden', 'success', 'error', 'encourage');
      if (selected.correct) {
        options.forEach(function (b) { b.disabled = true; });
        options[sheet.selected].classList.add('correct');
        feedbackEl.textContent = '✅';
        feedbackEl.classList.add('success');
      } else {
        /* Wrong: the hint shows, the answer does not. The card stays open. */
        options[sheet.selected].classList.add('incorrect');
        App.feedback.encourage(feedbackEl);
        feedbackEl.textContent = ' ' + (sheet.question.hint || App.i18n.t('hint'));
        feedbackEl.classList.add('error');
      }
    });

    if (firstCheck) {
      roundCorrect = rightFirstTry;
      progress.stars += roundCorrect;
      save();
      paintStars();
    }

    var allRight = roundSheets.every(function (sheet) { return sheet.correct === true; });
    btnCheck.classList.toggle('hidden', allRight);
    btnNewRound.classList.remove('hidden');
    if (allRight) btnNewRound.focus();
    paintSheetProgress();
  }

  /* Before "Comprobar" the bar counts the questions with an option picked;
     after it, the ones already right. The figure is always "x / total". */
  function paintSheetProgress() {
    var total = roundSheets.length;
    var checked = roundSheets[0].correct !== null;
    var numerator = checked
      ? roundSheets.filter(function (s) { return s.correct === true; }).length
      : roundSheets.filter(function (s) { return s.selected !== null; }).length;
    progressFill.style.width = (numerator / total * 100) + '%';
    progressText.textContent = numerator + ' / ' + total;
  }

  /* ---- Events ---- */

  $('#galleryPrev').addEventListener('click', function () {
    galleryIndex = (galleryIndex + DATA.concepts.length - 1) % DATA.concepts.length;
    paintGallery();
  });
  $('#galleryNext').addEventListener('click', function () {
    galleryIndex = (galleryIndex + 1) % DATA.concepts.length;
    paintGallery();
  });
  $('#realPrev').addEventListener('click', function () {
    realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length;
    paintRealExample();
  });
  $('#realNext').addEventListener('click', function () {
    realIndex = (realIndex + 1) % DATA.real.length;
    paintRealExample();
  });
  $('#introContinue').addEventListener('click', function () { show(screenReal); });
  $('#realContinue').addEventListener('click', startRound);
  $('#btnCheck').addEventListener('click', checkAnswers);
  $('#btnNewRound').addEventListener('click', startRound);

  /* End screen: the only button is "Volver al inicio", which goes back to
     the Calculia landing. The test sheet never reaches it; the guard keeps
     the wire the same as the other activities. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

  paintGallery();
  paintRealExample();
  paintStars();
})();
