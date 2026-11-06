/* ============================================================
   Calculia — Leer fechas
   Data in data.js. Shared modules in assets/js/.
   Screens: explanation (carousel) → test sheet. The whole round is on
   one screen, as in Cambia de unidad.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'date-format';
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
  var roundSheets = [];

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  function show(screen) {
    [screenIntro, screenGame].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Explanation carousel ----
     One card per step: a picto, the name and one sentence. Clicking the
     card (or pressing Enter) moves forward. */
  function paintExplain(step) {
    var el = $('#carouselDisplay');
    el.textContent = '';
    var picto = document.createElement('span');
    picto.className = 'carousel-figure';
    picto.setAttribute('aria-hidden', 'true');
    picto.textContent = step.picto;
    var name = document.createElement('span');
    name.className = 'carousel-name';
    name.textContent = App.i18n.t('explain.' + step.id + '.name');
    var text = document.createElement('p');
    text.className = 'gallery-note';
    text.textContent = App.i18n.t('explain.' + step.id + '.text');
    el.appendChild(picto);
    el.appendChild(name);
    el.appendChild(text);
  }

  var explIdx = 0;
  function explStep(delta) {
    explIdx = (explIdx + delta + DATA.explain.length) % DATA.explain.length;
    paintExplain(DATA.explain[explIdx]);
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* A random date. The day is 1–28 so it exists in every month. */
  function randomDate() {
    return { day: randomInt(1, 28), month: randomInt(1, 12), year: randomInt(2020, 2030) };
  }

  /* 10/01/2025: day, month and year, with slashes. */
  function slashDate(d) { return pad(d.day) + '/' + pad(d.month) + '/' + d.year; }

  function monthName(n) { return App.i18n.t('month.m' + pad(n)); }

  function longDate(d) {
    return App.i18n.t('longDate')
      .replace('{d}', String(d.day))
      .replace('{m}', monthName(d.month))
      .replace('{y}', String(d.year));
  }

  /* Numbers close to `answer`, inside [min, max], that are not in `avoid`.
     They make the wrong options look like the right one. */
  function nearNumbers(answer, min, max, avoid) {
    var out = [];
    for (var k = 1; k <= 10 && out.length < 6; k += 1) {
      [answer - k, answer + k].forEach(function (v) {
        if (v >= min && v <= max && avoid.indexOf(v) === -1 && out.indexOf(v) === -1) out.push(v);
      });
    }
    return out;
  }

  /* Keeps the distinct values that differ from the right answer, shuffled. */
  function wrongOnly(answer, list) {
    return App.utils.shuffle(list.filter(function (v, i, all) {
      return v !== answer && all.indexOf(v) === i;
    })).slice(0, 2);
  }

  /* Builds one question of the given kind. The right answer is a string, and
     so are the wrong ones, so they compare the same way. */
  function question(kind) {
    var d = randomDate();
    var answer;
    var wrong;
    var prompt;
    var inline;
    var key = 'q.' + kind;

    if (kind === 'day') {
      answer = String(d.day);
      wrong = wrongOnly(answer, [String(d.month)].concat(nearNumbers(d.day, 1, 28, [d.month]).map(String)));
      prompt = App.i18n.t(key).replace('{date}', slashDate(d));
      inline = true;
    } else if (kind === 'month') {
      answer = monthName(d.month);
      var otherMonths = [];
      for (var m = 1; m <= 12; m += 1) if (m !== d.month) otherMonths.push(monthName(m));
      wrong = App.utils.shuffle(otherMonths).slice(0, 2);
      prompt = App.i18n.t(key).replace('{date}', slashDate(d));
      inline = true;
    } else if (kind === 'year') {
      answer = String(d.year);
      wrong = wrongOnly(answer, nearNumbers(d.year, 2020, 2030, []).map(String));
      prompt = App.i18n.t(key).replace('{date}', slashDate(d));
      inline = true;
    } else {
      /* Written in words: the right way is day/month/year. The wrong ones are the
         common mix-ups: month first, year first, or a short year. */
      answer = slashDate(d);
      wrong = wrongOnly(answer, [
        pad(d.month) + '/' + pad(d.day) + '/' + d.year,
        d.year + '/' + pad(d.month) + '/' + pad(d.day),
        pad(d.day) + '/' + pad(d.month) + '/' + String(d.year).slice(2)
      ]);
      prompt = App.i18n.t(key).replace('{long}', longDate(d));
      inline = true;
    }

    var isText = kind === 'month' || kind === 'written';
    var options = App.utils.shuffle([answer].concat(wrong)).map(function (v) {
      return {
        html: '<span class="' + (isText ? 'answer-text' : 'answer-num') + '">' + v + '</span>',
        aria: v,
        correct: v === answer
      };
    });

    return {
      prompt: prompt,
      hint: App.i18n.t('gen.hint'),
      options: options,
      inline: inline
    };
  }

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(question(App.utils.drawRound(TOOL_ID, DATA.kinds)));
    }
    roundSheets = App.utils.shuffle(questions).map(function (q) {
      return { question: q, selected: null, correct: null };
    });
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
      progress.stars += rightFirstTry;
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

  $('#carouselPrev').addEventListener('click', function () { explStep(-1); });
  $('#carouselNext').addEventListener('click', function () { explStep(1); });
  var carouselDisplay = $('#carouselDisplay');
  carouselDisplay.addEventListener('click', function () { explStep(1); });
  carouselDisplay.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      explStep(1);
    }
  });

  paintExplain(DATA.explain[explIdx]);
  $('#introContinue').addEventListener('click', startRound);
  $('#btnCheck').addEventListener('click', checkAnswers);
  $('#btnNewRound').addEventListener('click', startRound);

  paintStars();
})();
