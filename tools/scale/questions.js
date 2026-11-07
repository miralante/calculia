/* ============================================================
   Calculia — Scale: the generators: one per kind of question.
   ============================================================ */
(function () {
  'use strict';

  var M = App.ScaleModel;
  var labelNeighbours = M.labelNeighbours, optionsFor = M.optionsFor, unitWord = M.unitWord;
  var D = App.ScaleDrawing;
  var rulerSvg = D.rulerSvg, gaugeSvg = D.gaugeSvg, spanSvg = D.spanSvg, objectSpanSvg = D.objectSpanSvg,
      planSvg = D.planSvg;

  /* ---- Question generators ----
     Every generator returns { prompt, visual, visualAria, legend,
     options }. The prompt is always the whole question in one sentence:
     this audience reads one idea at a time. */
  var GENERATORS = {
    /* The same question on the ruler and on the other two instruments:
       the object reaches a mark, say how much it measures. The wrong
       answers are the marks next to it on that very instrument, so
       they are the numbers a person reads by mistake — the number
       printed to the left, the one to the right, and the neighbouring
       marks themselves. */
    /* What is reached, depends on the instrument: the length of a pencil,
       the temperature of a thermometer, how much water is in a jug. One
       shared sentence for the three of them would say "the pencil" on a
       jug, and the person reads the words before the picture. */
    readValue: function (nv) {
      var value = App.utils.drawRound(nv.id, DATA.readings[nv.id]);
      var near = labelNeighbours(nv, value);
      var wrongs = [near.left, near.right, value - nv.step, value + nv.step];
      var isRuler = nv.shape === 'ruler';
      var visual = isRuler
        ? rulerSvg({ from: nv.from, to: nv.to, step: nv.step, labelEvery: nv.labelEvery, value: value, unit: nv.unit })
        : gaugeSvg({ shape: nv.shape, from: nv.from, to: nv.to, step: nv.step, labelEvery: nv.labelEvery, value: value, unit: nv.unit });
      var aria = isRuler
        ? App.i18n.t('gen.readAria').replace(/\{value\}/g, value)
        : (nv.shape === 'jar'
          ? App.i18n.t('gen.jarAria').replace(/\{value\}/g, value)
          : App.i18n.t('gen.levelAria').replace(/\{value\}/g, value));
      var prompt = isRuler
        ? App.i18n.t('gen.readPromptRuler')
        : (nv.shape === 'jar'
          ? App.i18n.t('gen.readPromptJar')
          : App.i18n.t('gen.readPromptTermo'));
      return {
        prompt: prompt,
        visual: visual,
        visualAria: aria,
        legend: App.i18n.t('gen.readHint'),
        hint: App.i18n.t('gen.socraticRead'),
        options: optionsFor(value, wrongs, nv.unit)
      };
    },

    /* What one mark is worth. The answer is the stretch divided by the
       number of marks, and it only comes out right if the marks were
       counted right — which is why the two numbers are printed and
       every mark between them is drawn. */
    stepValue: function (nv) {
      var span = App.utils.drawRound(nv.id, DATA.spans);
      var step = (span.to - span.from) / span.gaps;
      var total = span.to - span.from;
      return {
        prompt: App.i18n.t('gen.stepPrompt'),
        visual: spanSvg(span, nv.unit),
        visualAria: App.i18n.t('gen.stepAria')
          .replace(/\{gaps\}/g, span.gaps)
          .replace(/\{from\}/g, span.from)
          .replace(/\{to\}/g, span.to),
        legend: App.i18n.t('gen.stepHint'),
        hint: App.i18n.t('gen.socraticStep'),
        /* The total between the two numbers is the mistake here: it is
           on the picture, it is plausible, and it is not what a mark is
           worth. */
        options: optionsFor(step, [total, step * 2, step * 3], nv.unit)
      };
    },

    /* The other direction: how many marks a thing goes through. The
       classic answer is one short, from counting the marks a person
       can point at and forgetting that the starting mark is not one of
       the marks it passes. */
    stepsCounted: function (nv) {
      var rec = App.utils.drawRound(nv.id, DATA.recorridos);
      var answer = rec.to - rec.from;
      return {
        prompt: App.i18n.t('gen.stepsPrompt'),
        visual: objectSpanSvg(rec, nv.unit),
        visualAria: App.i18n.t('gen.stepsAria')
          .replace(/\{from\}/g, rec.from)
          .replace(/\{to\}/g, rec.to),
        legend: App.i18n.t('gen.stepsHint'),
        hint: App.i18n.t('gen.socraticSteps'),
        options: optionsFor(answer, [answer - 1, answer + 1, rec.to], nv.unit)
      };
    },

    /* Plan to real life: each centimetre of the drawing is worth so
       much, so the centimetres are counted and multiplied. */
    planToReal: function () {
      var plano = App.utils.drawRound('d1', DATA.planos);
      /* The pool key carries the plan it came from. A single pool for
         the whole level would hand a centimetre count over from one
         scale to another, and "3 cm at 1:50" would come out as the
         same 3 cm at 1:5 — two different questions wearing the same
         number. */
      var cm = App.utils.drawRound('d1:' + plano.key + ':' + plano.unit, plano.cm);
      var answer = cm * plano.key;
      return {
        prompt: App.i18n.t('gen.planPrompt')
          .replace(/\{cm\}/g, cm)
          .replace(/\{unit\}/g, unitWord(plano.unit)),
        visual: planSvg({ key: plano.key, unit: plano.unit, cm: cm }),
        visualAria: App.i18n.t('gen.planAria')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit)
          .replace(/\{cm\}/g, cm),
        /* The key and then the advice, in that order: the drawing does not
           carry the numbers, so the sentence that states them has to be
           there. The advice does not repeat them — saying "each
           centimetre is 10 m" twice on one screen is two readings of
           the same line. */
        legend: App.i18n.t('gen.planKey')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit) + ' ' + App.i18n.t('gen.planHint'),
        hint: App.i18n.t('gen.socraticPlanToReal'),
        /* Adding instead of multiplying is the mistake a plan really
           produces: two numbers are written and the eye adds them. */
        options: optionsFor(answer, [answer - plano.key, answer + plano.key, cm + plano.key], plano.unit)
      };
    },

    /* And the same convention read the other way round. The distance in
       real life has to be one of THIS plan's distances: taking it
       from a pool shared across plans is how 150 m ends up divided by
       50 to give 0.08 cm, a number no plan has. */
    realToPlan: function () {
      var plano = App.utils.drawRound('d2', DATA.planos);
      var real = App.utils.drawRound('d2:' + plano.key + ':' + plano.unit, plano.real);
      var answer = real / plano.key;
      return {
        prompt: App.i18n.t('gen.planBackPrompt')
          .replace(/\{real\}/g, real)
          .replace(/\{unit\}/g, unitWord(plano.unit)),
        visual: planSvg({ key: plano.key, unit: plano.unit, real: real }),
        visualAria: App.i18n.t('gen.planBackAria')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit)
          .replace(/\{real\}/g, real),
        legend: App.i18n.t('gen.planKey')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit) + ' ' +
          App.i18n.t('gen.planBackHint')
            .replace(/\{real\}/g, real)
            .replace(/\{unit\}/g, plano.unit),
        hint: App.i18n.t('gen.socraticRealToPlan'),
        options: optionsFor(answer, [answer - 1, answer + 1, answer * 2], 'cm')
      };
    }
  };

  App.ScaleQuestions = {
    GENERATORS: GENERATORS
  };
})();
