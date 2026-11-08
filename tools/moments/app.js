/* ============================================================
   Calculia — Momentos del día
   Three stages: 1. the explanation (one slide per part of the day), 2. real
   life (one everyday moment at a time), 3. the test, one question per slide.
   The stages and the test are built by assets/js/activity-flow.js; this file
   has the questions. The data is in data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  /* ---- Test ----
     Each question asks in which part of the day a moment is. The three parts
     are the answers, shuffled; the explanation says why. */
  function question(moment) {
    var options = DATA.parts.map(function (part) {
      var label = t('part.' + part);
      return {
        html: '<span class="answer-text">' + label + '</span>',
        aria: label,
        correct: part === moment.part
      };
    });

    return {
      prompt: t('q.' + moment.id),
      hint: t('gen.hint'),
      explanation: t('explain.' + moment.id),
      options: App.utils.shuffle(options),
      inline: false
    };
  }

  App.activityFlow.setup({
    toolId: 'moments',
    test: 'options',
    socratic: true,
    intro: DATA.intro.map(function (step) { return { visual: step }; }),
    real: DATA.moments.map(function (moment) { return { visual: moment }; }),
    introHeading: function () { return t('instructionIntro'); },
    realText: function (i) { return t('example.' + DATA.moments[i].id); },
    visualHtml: function (spec) {
      return '<span class="carousel-figure" aria-hidden="true">' + spec.picto + '</span>';
    },
    /* A round is a shuffled list of moments; every one is one question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(App.utils.drawRound('moments', DATA.moments));
      return App.utils.shuffle(list);
    },
    makeQuestion: function (moment) { return question(moment); }
  });
})();
