/* ============================================================
   Calculia — Cambia de unidad
   Three stages: 1. the explanation (one card per step), 2. real life (one
   everyday example at a time), 3. the test, one question per slide. The
   stages and the test are built by assets/js/activity-flow.js; this file has
   the questions. The data is in data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  /* ---- Test ----
     A question asks for the amount in the other unit. Forward conversions
     multiply (3 horas → medias horas); `back` ones divide (4 medias horas →
     horas). The wrong answers are the slips people make: the amount left as
     it is, the answer one step too high or too low, and the answer times ten. */
  function question(conv) {
    var m = App.utils.shuffle(conv.ns)[0];
    var shown = conv.back ? m * conv.factor : m;
    var answer = conv.back ? m : m * conv.factor;
    var values = { shown: shown, factor: conv.factor, answer: answer };

    return {
      prompt: t('q.' + conv.id).replace('{n}', shown),
      hint: t('gen.hint'),
      input: { answer: answer },
      explanation: App.utils.fill(t(conv.back ? 'gen.explainDivide' : 'gen.explainMultiply'), values)
    };
  }

  /* Checked at start-up, so bad data fails loudly: each conversion has a
     factor above 1 and at least two amounts to ask about. */
  DATA.conversions.forEach(function (conv) {
    if (!(conv.factor > 1) || conv.ns.length < 2) {
      throw new Error('time-convert: bad conversion ' + conv.id);
    }
  });

  App.activityFlow.setup({
    toolId: 'time-convert',
    pairedTest: true,
    test: 'options',
    /* The answer is a typed number: the wrong tries get a hint, then the explanation. */
    socratic: true,
    typedAnswers: true,
    intro: DATA.explain.map(function (step) { return { visual: step }; }),
    real: DATA.real.map(function (example) { return { visual: example }; }),
    realText: function (i) { return t('example.' + DATA.real[i].id); },
    realVisualHtml: function (example) {
      return '<span class="carousel-figure" aria-hidden="true">' + example.picto + '</span>';
    },
    introHeading: function () { return t('instructionIntro'); },
    introCopy: function (i) {
      var step = DATA.explain[i];
      return { title: t('explain.' + step.id + '.name'), text: t('explain.' + step.id + '.text') };
    },
    visualHtml: function (step) {
      return '<span class="carousel-figure" aria-hidden="true">' + step.picto + '</span>';
    },
    /* A round is a shuffled list of conversions; every one is one question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(App.utils.drawRound('time-convert', DATA.conversions));
      return App.utils.shuffle(list);
    },
    makeQuestion: function (conv) { return question(conv); }
  });
})();
