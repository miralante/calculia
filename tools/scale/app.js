/* ============================================================
   Calculia — Escala
   The flow is the shared one (assets/js/activity-flow.js, test 'options'):
   the four ideas, the real-life examples, a menu of activities with levels,
   and a socratic test with a reinforcement at the end of each round. What is
   specific here is the ruler, the gauge and the plan drawings, and the question
   generators. The data is in data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var D = App.ScaleDrawing;
  var CONCEPTS = D.CONCEPTS, conceptSvg = D.conceptSvg;
  var Q = App.ScaleQuestions;
  var GENERATORS = Q.GENERATORS;

  /* Visible text of an option (its html may wrap spans). */
  var plainText = App.utils.plainText;

  function t(key) { return App.i18n.t(key); }

  /* A round for the test activity mixes the levels of the others, one per question, at random. */
  function buildMixedRound() {
    var ids = Object.keys(DATA.activities).filter(function (k) { return k !== 'test'; });
    var out = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      var act = DATA.activities[ids[Math.floor(Math.random() * ids.length)]];
      out.push(act.levels[Math.floor(Math.random() * act.levels.length)]);
    }
    return out;
  }

  /* The round is a list of level entries: the mixed test draws them, any other level repeats its own. */
  function buildRound(def, level) {
    if (level.tipo === 'mixedTest') return buildMixedRound();
    var out = [];
    for (var i = 0; i < DATA.perRound; i += 1) out.push(level);
    return out;
  }

  /* A level entry becomes a question: the generator of its type. After a right answer the flow shows
     the right answer (the text of the option). */
  function makeQuestion(entry, index) {
    var q = GENERATORS[entry.tipo](entry, index);
    var correct = q.options.filter(function (o) { return o.correct; })[0];
    return {
      prompt: q.prompt,
      hint: q.hint || t('hint'),
      visual: q.visual,
      visualAria: q.visualAria,
      legend: q.legend,
      inline: q.inline,
      options: q.options,
      explanation: plainText(correct.html) + '.'
    };
  }

  /* The menu entries: one per activity of DATA.activities, in its order. */
  var ACTIVITIES = Object.keys(DATA.activities).map(function (id) {
    var act = DATA.activities[id];
    return {
      id: id,
      picto: act.picto,
      levels: act.levels,
      name: function () { return t('activity.' + id + '.name'); },
      detail: function () { return t('activity.' + id + '.detail'); }
    };
  });

  App.activityFlow.setup({
    toolId: 'scale',
    test: 'options',
    socratic: true,
    review: 'none',
    reinforce: true,
    menuPlacement: 'afterReal',
    activities: ACTIVITIES,
    testVisuals: true,
    testVisualClass: 'visual',
    /* The four ideas are the slides; the real-life examples are the three of the data. */
    intro: CONCEPTS.map(function (id) { return { visual: { concept: id } }; }),
    real: DATA.real.map(function (item) { return { visual: item }; }),
    visualHtml: function (spec) { return conceptSvg(spec.concept); },
    realVisualHtml: function (item) {
      return '<span class="real-object" aria-hidden="true">' + item.picto + '</span>' +
        '<p class="real-caption">' + t('real.' + item.id + '.name') + '</p>';
    },
    introCopy: function (i) {
      var id = CONCEPTS[i];
      return { title: t('concept.' + id + '.title'), text: t('concept.' + id + '.text') };
    },
    realText: function (i) { return t('real.' + DATA.real[i].id + '.text'); },
    buildRound: buildRound,
    makeQuestion: makeQuestion,
    endNotes: [{ key: 'transfer', cls: 'transfer' }],
    endSummaryKey: 'endSummary',
    backHref: '../../'
  });
})();
