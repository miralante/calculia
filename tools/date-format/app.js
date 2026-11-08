/* ============================================================
   Calculia — Leer fechas
   Two stages, in the flow of the test sheet: 1. the explanation (one card per
   step), 2. the test sheet, where the whole round is on one screen. The stages
   and the sheet are built by assets/js/activity-flow.js; this file has the
   dates and the questions. The data is in data.js and the texts in
   strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  var rint = App.utils.rint;

  /* A random date. The day is 1–28 so it exists in every month. */
  function randomDate() {
    return { day: rint(1, 28), month: rint(1, 12), year: rint(2020, 2030) };
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

  /* The twelve months as a grid of tiles: the number of the month over its name,
     the same drawing as Unidades de tiempo. */
  function monthGridHtml() {
    var tiles = '';
    for (var m = 1; m <= 12; m += 1) {
      tiles += '<li class="month-tile"><span class="month-num">' + pad(m) +
        '</span><span class="month-name">' + monthName(m) + '</span></li>';
    }
    return '<ol class="month-grid">' + tiles + '</ol>';
  }

  App.activityFlow.setup({
    toolId: 'date-format',
    test: 'options',
    skipReal: true,
    real: [],
    intro: DATA.explain.map(function (step) { return { visual: step }; }),
    introHeading: function () { return t('instructionIntro'); },
    introCopy: function (i) {
      var step = DATA.explain[i];
      return { title: t('explain.' + step.id + '.name'), text: t('explain.' + step.id + '.text') };
    },
    visualHtml: function (step) {
      if (step.grid === 'months') return monthGridHtml();
      return '<span class="carousel-figure" aria-hidden="true">' + step.picto + '</span>';
    },
    /* A round is a shuffled list of question kinds; every kind is one question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(App.utils.drawRound('date-format', DATA.kinds));
      return App.utils.shuffle(list);
    },
    makeQuestion: function (kind) { return question(kind); }
  });
})();
