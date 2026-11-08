/* ============================================================
   Calculia — Unidades de tiempo
   Three stages: 1. the explanation (one card per unit, from the century to
   the second), 2. real life (one example per unit and per month case),
   3. the test, one question per slide ('options' mode). The stages and the
   test are built by assets/js/activity-flow.js; this file has the drawings
   and the questions. The data is in data.js and the texts in
   strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  function esc(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var monthName = App.time.monthNameByNumber;

  function pictoHtml(unit) {
    return '<span class="carousel-figure" aria-hidden="true">' + unit.picto + '</span>';
  }

  /* The twelve months as a grid of tiles: the number of the month over its name. */
  function monthGridHtml() {
    var tiles = '';
    for (var m = 1; m <= 12; m += 1) {
      tiles += '<li class="month-tile"><span class="month-num">' + (m < 10 ? '0' + m : String(m)) +
        '</span><span class="month-name">' + esc(monthName(m)) + '</span></li>';
    }
    return '<ol class="month-grid">' + tiles + '</ol>';
  }

  /* The parts of the year: one tile per part, with the months it covers. */
  function partGridHtml(unit) {
    var tiles = '';
    for (var k = 1; k <= unit.count; k += 1) {
      var from = (k - 1) * unit.size + 1;
      var to = k * unit.size;
      tiles += '<li class="part-tile"><span class="part-label">' +
        esc(t('unit.' + unit.id + '.part').replace('{n}', String(k))) + '</span>' +
        '<span class="part-range">' + esc(monthName(from)) + '</span>' +
        '<span class="part-range">– ' + esc(monthName(to)) + '</span></li>';
    }
    return '<ol class="part-grid">' + tiles + '</ol>';
  }

  /* The given months as tiles: the name, then the number of days. February also
     shows the leap-year note. One tile on its own is shown larger. */
  function dayTilesHtml(months) {
    var tiles = '';
    months.forEach(function (m) {
      tiles += '<li class="month-tile"><span class="month-name">' + esc(monthName(m)) + '</span>' +
        '<span class="month-num">' + esc(t('days').replace('{n}', String(DATA.monthDays[m - 1]))) + '</span>' +
        (m === 2 ? '<span class="month-leap">' + esc(t('leapDays')) + '</span>' : '') + '</li>';
    });
    return '<ol class="month-grid' + (months.length === 1 ? ' month-grid-one' : '') + '">' + tiles + '</ol>';
  }

  /* The days of each month: all twelve. */
  function dayGridHtml() {
    var all = [];
    for (var m = 1; m <= 12; m += 1) all.push(m);
    return dayTilesHtml(all);
  }

  /* The continuous line under a card, with its numbers. Two shapes, both
     decorative (aria-hidden): with `marks` it is a scale from 0 to `total`
     with a number at each mark (hours, minutes); without them every box
     holds its number from 1 to `total` (months, days of the week). `band`
     groups the boxes in two shades, so a semester shows as months 1-6 and
     7-12. */
  function timelineHtml(line) {
    var html = '';
    var k;
    if (line.marks) {
      var bands = '';
      for (k = 0; k * line.band < line.total; k += 1) {
        if (k % 2 === 1) {
          var start = k * line.band;
          var width = Math.min(line.band, line.total - start);
          bands += '<span class="time-band-b" style="left:' + (start / line.total * 100) + '%;width:' +
            (width / line.total * 100) + '%"></span>';
        }
      }
      var ticks = '';
      var labels = '';
      line.marks.forEach(function (mark) {
        var at = (mark / line.total * 100) + '%';
        ticks += '<span class="time-tick" style="left:' + at + '"></span>';
        labels += '<span class="time-mark" style="left:' + at + '">' + mark + '</span>';
      });
      html = '<div class="time-scale" aria-hidden="true"><div class="time-track">' + bands + ticks +
        '</div><div class="time-marks">' + labels + '</div></div>';
    } else {
      var cells = '';
      for (k = 1; k <= line.total; k += 1) {
        var shaded = Math.floor((k - 1) / line.band) % 2 === 1;
        cells += '<li class="time-cell' + (shaded ? ' time-band-b' : '') + '"><span class="time-num">' + k +
          '</span></li>';
      }
      html = '<ol class="time-line" aria-hidden="true">' + cells + '</ol>';
    }
    return html;
  }

  /* A sphere (a clock face) with the part of the hour that the unit names
     coloured in, from the top and clockwise. `dial.part` of `dial.of` equal
     parts; the lines mark the parts. Decorative (aria-hidden). */
  function dialHtml(dial) {
    var r = 46;
    var c = 50;
    var body;
    if (dial.part === dial.of) {
      body = '<circle cx="50" cy="50" r="' + r + '" class="dial-fill"/>';
    } else {
      var angle = 2 * Math.PI * dial.part / dial.of;
      var x = c + r * Math.sin(angle);
      var y = c - r * Math.cos(angle);
      var large = dial.part / dial.of > 0.5 ? 1 : 0;
      body = '<circle cx="50" cy="50" r="' + r + '" class="dial-rest"/>' +
        '<path class="dial-fill" d="M50 50 L50 ' + (c - r) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' +
        x.toFixed(2) + ' ' + y.toFixed(2) + ' Z"/>';
    }
    var lines = '';
    if (dial.of > 1) {
      for (var k = 0; k < dial.of; k += 1) {
        var a = 2 * Math.PI * k / dial.of;
        lines += '<line class="dial-line" x1="50" y1="50" x2="' + (c + r * Math.sin(a)).toFixed(2) +
          '" y2="' + (c - r * Math.cos(a)).toFixed(2) + '"/>';
      }
    }
    /* The arrow goes round the same part, from the top and clockwise, on a
       smaller circle inside the sphere. A full turn stops just short of the
       top, so the arrowhead is still visible. */
    var ra = 30;
    var end = dial.part === dial.of ? 2 * Math.PI * 0.92 : 2 * Math.PI * dial.part / dial.of;
    var ax = c + ra * Math.sin(end);
    var ay = c - ra * Math.cos(end);
    var arrowLarge = end > Math.PI ? 1 : 0;
    var arrow = '<path class="dial-arrow" marker-end="url(#dial-arrowhead)" d="M50 ' + (c - ra) + ' A' + ra +
      ' ' + ra + ' 0 ' + arrowLarge + ' 1 ' + ax.toFixed(2) + ' ' + ay.toFixed(2) + '"/>';

    return '<svg class="dial" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="dial-sphere" cx="38%" cy="32%" r="70%">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.55"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<marker id="dial-arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">' +
      '<path class="dial-arrowhead" d="M0 0 L10 5 L0 10 z"/></marker></defs>' +
      body + lines + arrow +
      '<circle cx="50" cy="50" r="' + r + '" class="dial-edge"/>' +
      '<circle cx="50" cy="50" r="' + r + '" fill="url(#dial-sphere)"/>' +
      '</svg>';
  }

  /* The drawing of an explanation slide or of a real-life example. The name is the title of the
     slide (or is written beside the picture in a real-life example), so a grid does not repeat it.
     A unit with a `dial` gets the sphere with its part coloured in, in place of the picture; a unit
     with a `line` gets the continuous line with its numbers under the drawing. */
  function unitVisualHtml(unit) {
    var drawing;
    if (unit.grid === 'months') drawing = monthGridHtml();
    else if (unit.grid === 'parts') drawing = partGridHtml(unit);
    else if (unit.grid === 'days') drawing = dayGridHtml();
    else if (unit.dial) drawing = dialHtml(unit.dial);
    else drawing = pictoHtml(unit);
    return unit.line ? drawing + timelineHtml(unit.line) : drawing;
  }

  /* ---- Test sheet ----
     The wrong answers are the other numbers of the list, so the person has
     to know which unit is which, not just pick a number that looks right. */
  function question(pair) {
    var others = DATA.pairs.map(function (p) { return p.answer; })
      .filter(function (n) { return n !== pair.answer; })
      .filter(function (n, i, all) { return all.indexOf(n) === i; });
    var wrong = App.utils.shuffle(others).slice(0, 2);

    return {
      prompt: t('q.' + pair.id),
      hint: t('gen.hint'),
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

  /* The real-life slides: every unit, with the month cases right after the
     days of each month. */
  var realList = [];
  DATA.units.forEach(function (unit) {
    realList.push(unit);
    if (unit.id === 'monthDays') DATA.monthCases.forEach(function (c) { realList.push(c); });
  });

  App.activityFlow.setup({
    toolId: 'time-units',
    test: 'options',
    intro: DATA.units.map(function (unit) { return { visual: unit }; }),
    real: realList.map(function (unit) { return { visual: unit }; }),
    introHeading: function () { return t('instructionIntro'); },
    introCopy: function (i) {
      var unit = DATA.units[i];
      return { title: t('unit.' + unit.id + '.name'), text: t('unit.' + unit.id + '.text') };
    },
    realText: function (i) { return t('example.' + realList[i].id); },
    visualHtml: unitVisualHtml,
    realVisualHtml: function (unit) {
      var name = '<span class="carousel-name">' + esc(t('unit.' + unit.id + '.name')) + '</span>';
      return (unit.months ? dayTilesHtml(unit.months) : pictoHtml(unit)) + name;
    },
    /* A round is a shuffled list of question types; every type is one question of the pairs. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(App.utils.drawRound('time-units', DATA.pairs));
      return App.utils.shuffle(list);
    },
    makeQuestion: function (pair) { return question(pair); }
  });
})();
