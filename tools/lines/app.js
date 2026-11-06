/* ============================================================
   Calculia — Rectas
   Three stages, in the flow of the test sheet: 1. the concepts (slides
   with a drawing), 2. real life (one example at a time), 3. the test sheet,
   where the whole round is on one screen, as in Formas.
   The stages and the sheet are built by assets/js/activity-flow.js; this
   file has the drawings and the questions. The data is in data.js and the
   texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var KINDS = ['parallel', 'crossing', 'perpendicular'];

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
      prompt: t('gen.kindPrompt'),
      hint: t('gen.socraticKind'),
      visual: '<div class="grid-stage">' + linesSvg(pair) + '</div>',
      visualAria: t('gen.linesAria'),
      options: App.utils.shuffle(KINDS.map(function (k) {
        return {
          html: '<span class="answer-name">' + t('kind.' + k) + '</span>',
          aria: t('kind.' + k),
          correct: k === kind
        };
      })),
      inline: true
    };
  }

  App.activityFlow.setup({
    toolId: 'lines',
    test: 'sheet',
    slideProgress: false,
    intro: DATA.concepts.map(function (concept) { return { visual: concept }; }),
    real: DATA.real.map(function (item) { return { visual: item }; }),
    introHeading: function () { return t('instructionIntro'); },
    introCopy: function (i) {
      var id = DATA.concepts[i].id;
      return { title: t('concept.' + id + '.title'), text: t('concept.' + id + '.text') };
    },
    realText: function (i) { return t('real.' + DATA.real[i].id); },
    visualHtml: function (concept) {
      return '<div class="grid-stage">' + conceptSvg(concept.id) + '</div>';
    },
    realVisualHtml: function (item) {
      return '<div class="real-object" aria-hidden="true">' + item.object + '</div>';
    },
    /* The round is a shuffled list of question types; every type is one question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push('pair');
      return App.utils.shuffle(list);
    },
    makeQuestion: function () {
      return questionFor(App.utils.drawRound('lines', DATA.linePairs));
    }
  });
})();
