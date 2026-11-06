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
  var randomInt = App.utils.rint;

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
    sheetTest.set(App.utils.shuffle(questions));
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
      progress.stars += rightFirstTry;
      save();
      paintStars();
    }
  });

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
  $('#btnCheck').addEventListener('click', sheetTest.check);
  $('#btnNewRound').addEventListener('click', startRound);

  paintStars();
})();
