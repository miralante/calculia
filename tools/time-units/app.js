/* ============================================================
   Calculia — Unidades de tiempo
   Data in data.js. Shared modules in assets/js/.
   Screens: explanation (carousel) → real-life examples (carousel) →
   test sheet. The whole round is on one screen, as in Máximo común
   divisor.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'time-units';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenExamples = $('#screenExamples');
  var screenGame = $('#screenGame');
  var testSheetEl = $('#testSheet');
  var btnCheck = $('#btnCheck');
  var btnNewRound = $('#btnNewRound');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0 });

  /* Right answers of the round, counted at the first check. */
  var roundCorrect = 0;

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  /* Checked at start-up, so bad data fails loudly: every answer is a
     positive number. */
  DATA.pairs.forEach(function (pair) {
    if (!(pair.answer > 0)) throw new Error('time-units: bad pair ' + pair.id);
  });

  function show(screen) {
    [screenIntro, screenExamples, screenGame].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Carousels ----
     Both carousels draw one card: a picto, the unit name and one
     sentence. Clicking the card (or pressing Enter) moves forward. */
  function paintCard(el, unit, sentence) {
    el.textContent = '';
    var picto = document.createElement('span');
    picto.className = 'carousel-figure';
    picto.setAttribute('aria-hidden', 'true');
    picto.textContent = unit.picto;
    var name = document.createElement('span');
    name.className = 'carousel-name';
    name.textContent = App.i18n.t('unit.' + unit.id + '.name');
    var text = document.createElement('p');
    text.className = 'gallery-note';
    text.textContent = sentence;
    el.appendChild(picto);
    el.appendChild(name);
    el.appendChild(text);
  }

  /* The twelve months as a grid of tiles: the number of the month over its
     name, so the order and the number are read at a glance. */
  function paintMonthGrid(el, unit, sentence) {
    el.textContent = '';
    var name = document.createElement('span');
    name.className = 'carousel-name';
    name.textContent = App.i18n.t('unit.' + unit.id + '.name');
    var grid = document.createElement('ol');
    grid.className = 'month-grid';
    for (var m = 1; m <= 12; m += 1) {
      var tile = document.createElement('li');
      tile.className = 'month-tile';
      var num = document.createElement('span');
      num.className = 'month-num';
      num.textContent = m < 10 ? '0' + m : String(m);
      var label = document.createElement('span');
      label.className = 'month-name';
      label.textContent = App.i18n.t('month.m' + (m < 10 ? '0' + m : String(m)));
      tile.appendChild(num);
      tile.appendChild(label);
      grid.appendChild(tile);
    }
    var text = document.createElement('p');
    text.className = 'gallery-note';
    text.textContent = sentence;
    el.appendChild(name);
    el.appendChild(grid);
    el.appendChild(text);
  }

  function monthName(m) {
    return App.i18n.t('month.m' + (m < 10 ? '0' + m : String(m)));
  }

  /* The parts of the year (2 semesters, 3 quadrimesters, 4 trimesters, 6
     bimesters): one tile per part, with its name and the months it covers. */
  function paintPartGrid(el, unit, sentence) {
    el.textContent = '';
    var name = document.createElement('span');
    name.className = 'carousel-name';
    name.textContent = App.i18n.t('unit.' + unit.id + '.name');
    var grid = document.createElement('ol');
    grid.className = 'part-grid';
    for (var k = 1; k <= unit.count; k += 1) {
      var from = (k - 1) * unit.size + 1;
      var to = k * unit.size;
      var tile = document.createElement('li');
      tile.className = 'part-tile';
      var label = document.createElement('span');
      label.className = 'part-label';
      label.textContent = App.i18n.t('unit.' + unit.id + '.part').replace('{n}', String(k));
      var first = document.createElement('span');
      first.className = 'part-range';
      first.textContent = monthName(from);
      var last = document.createElement('span');
      last.className = 'part-range';
      last.textContent = '– ' + monthName(to);
      tile.appendChild(label);
      tile.appendChild(first);
      tile.appendChild(last);
      grid.appendChild(tile);
    }
    var text = document.createElement('p');
    text.className = 'gallery-note';
    text.textContent = sentence;
    el.appendChild(name);
    el.appendChild(grid);
    el.appendChild(text);
  }

  /* The days of each month: one tile per month with its number of days.
     February shows the leap-year note as well (29 days in a leap year). */
  function paintDayGrid(el, unit, sentence) {
    el.textContent = '';
    var name = document.createElement('span');
    name.className = 'carousel-name';
    name.textContent = App.i18n.t('unit.' + unit.id + '.name');
    var grid = document.createElement('ol');
    grid.className = 'month-grid';
    for (var m = 1; m <= 12; m += 1) {
      var tile = document.createElement('li');
      tile.className = 'month-tile';
      var label = document.createElement('span');
      label.className = 'month-name';
      label.textContent = monthName(m);
      var days = document.createElement('span');
      days.className = 'month-num';
      days.textContent = App.i18n.t('days').replace('{n}', String(DATA.monthDays[m - 1]));
      tile.appendChild(label);
      tile.appendChild(days);
      if (m === 2) {
        var leap = document.createElement('span');
        leap.className = 'month-leap';
        leap.textContent = App.i18n.t('leapDays');
        tile.appendChild(leap);
      }
      grid.appendChild(tile);
    }
    var text = document.createElement('p');
    text.className = 'gallery-note';
    text.textContent = sentence;
    el.appendChild(name);
    el.appendChild(grid);
    el.appendChild(text);
  }

  function paintExplanation(unit) {
    var el = $('#carouselDisplay');
    var sentence = App.i18n.t('unit.' + unit.id + '.text');
    if (unit.grid === 'months') paintMonthGrid(el, unit, sentence);
    else if (unit.grid === 'parts') paintPartGrid(el, unit, sentence);
    else if (unit.grid === 'days') paintDayGrid(el, unit, sentence);
    else paintCard(el, unit, sentence);
  }

  function paintExample(unit) {
    paintCard($('#exampleDisplay'), unit, App.i18n.t('example.' + unit.id));
  }

  var explIdx = 0;
  function explStep(delta) {
    explIdx = (explIdx + delta + DATA.units.length) % DATA.units.length;
    paintExplanation(DATA.units[explIdx]);
  }

  var exampleIdx = 0;
  function exampleStep(delta) {
    exampleIdx = (exampleIdx + delta + DATA.units.length) % DATA.units.length;
    paintExample(DATA.units[exampleIdx]);
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  /* The wrong answers are the other numbers of the list, so the person has
     to know which unit is which, not just pick a number that looks right. */
  function question(pair) {
    var others = DATA.pairs.map(function (p) { return p.answer; })
      .filter(function (n) { return n !== pair.answer; })
      .filter(function (n, i, all) { return all.indexOf(n) === i; });
    var wrong = App.utils.shuffle(others).slice(0, 2);

    return {
      prompt: App.i18n.t('q.' + pair.id),
      hint: App.i18n.t('gen.hint'),
      options: App.utils.shuffle([pair.answer].concat(wrong).map(function (n) {
        return {
          html: '<span class="answer-num">' + n + '</span>',
          aria: String(n),
          correct: n === pair.answer
        };
      })),
      inline: true
    };
  }

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(question(App.utils.drawRound(TOOL_ID, DATA.pairs)));
    }
    sheetTest.set(App.utils.shuffle(questions));
    roundCorrect = 0;
    show(screenGame);
    sheetTest.render();
  }

  /* The test sheet: the whole round on one screen, checked at once. */
  var sheetTest = App.sheetTest.create({
    sheetEl: testSheetEl,
    checkBtn: btnCheck,
    newRoundBtn: btnNewRound,
    progressFill: progressFill,
    progressText: progressText,
    onScored: function (rightFirstTry) {
      roundCorrect = rightFirstTry;
      progress.stars += roundCorrect;
      save();
      paintStars();
    }
  });

  /* ---- Events ---- */

  function onCardKey(el, step) {
    el.addEventListener('click', function () { step(1); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        step(1);
      }
    });
  }

  $('#carouselPrev').addEventListener('click', function () { explStep(-1); });
  $('#carouselNext').addEventListener('click', function () { explStep(1); });
  onCardKey($('#carouselDisplay'), explStep);
  $('#introNext').addEventListener('click', function () {
    exampleIdx = 0;
    paintExample(DATA.units[exampleIdx]);
    show(screenExamples);
  });

  $('#examplePrev').addEventListener('click', function () { exampleStep(-1); });
  $('#exampleNext').addEventListener('click', function () { exampleStep(1); });
  onCardKey($('#exampleDisplay'), exampleStep);
  $('#examplesNext').addEventListener('click', startRound);

  $('#btnCheck').addEventListener('click', sheetTest.check);
  $('#btnNewRound').addEventListener('click', startRound);

  paintExplanation(DATA.units[explIdx]);
  paintStars();
})();
