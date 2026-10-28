/* ============================================================
   Calculia — Cambia de unidad
   Data in data.js. Shared modules in assets/js/.
   Screens: explanation → test sheet. The whole round is on one
   screen, as in Máximo común divisor.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'time-convert';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenGame = $('#screenGame');
  var testSheetEl = $('#testSheet');
  var btnCheck = $('#btnCheck');
  var btnNewRound = $('#btnNewRound');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state. Each roundSheets entry is one question with the option
     the person picked (selected, null until chosen) and whether
     "Comprobar" accepted it (correct, null until it is checked). */
  var roundCorrect = 0;
  var roundSheets = [];

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* Checked at start-up, so bad data fails loudly: each conversion has a
     factor above 1 and at least two amounts to ask about. */
  DATA.conversions.forEach(function (conv) {
    if (!(conv.factor > 1) || conv.ns.length < 2) {
      throw new Error('time-convert: bad conversion ' + conv.id);
    }
  });

  function show(screen) {
    [screenIntro, screenGame].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  /* The wrong answers are the slips people make: the amount left as it is,
     the answer one step too high or too low, and the answer times ten. */
  function question(conv) {
    var n = App.utils.shuffle(conv.ns)[0];
    var answer = n * conv.factor;
    var pool = [n, answer + conv.factor, answer - conv.factor, answer * 10]
      .filter(function (v) { return v > 0 && v !== answer; })
      .filter(function (v, i, all) { return all.indexOf(v) === i; });
    var wrong = App.utils.shuffle(pool).slice(0, 2);

    return {
      prompt: App.i18n.t('q.' + conv.id).replace('{n}', n),
      hint: App.i18n.t('gen.hint'),
      options: App.utils.shuffle([answer].concat(wrong).map(function (v) {
        return {
          html: '<span class="answer-num">' + v + '</span>',
          aria: String(v),
          correct: v === answer
        };
      })),
      inline: true
    };
  }

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(question(App.utils.drawRound(TOOL_ID, DATA.conversions)));
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
        feedbackEl.textContent = ' ' + sheet.question.hint;
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

  $('#introContinue').addEventListener('click', startRound);
  $('#btnCheck').addEventListener('click', checkAnswers);
  $('#btnNewRound').addEventListener('click', startRound);

  paintStars();
})();
