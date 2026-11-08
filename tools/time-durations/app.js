/* ============================================================
   Calculia — ¿Cuánto tarda?
   Three stages: 1. the explanation (slides with a drawing), 2. real life (one
   example at a time), 3. the test, one question per slide. The stages and
   the test are built by assets/js/activity-flow.js; this file has the
   questions. The data is in data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  /* Checked at start-up, so bad data fails loudly: each task has one
     correct duration and two wrong ones, and the three are different. */
  DATA.tasks.forEach(function (task) {
    var labels = [task.correct].concat(task.wrong).map(function (d) { return d[0] + ' ' + d[1]; });
    var distinct = labels.filter(function (l, i) { return labels.indexOf(l) === i; });
    if (task.wrong.length !== 2 || distinct.length !== 3) {
      throw new Error('time-durations: bad task ' + task.id);
    }
  });

  /* "2 minutos", "1 año": the unit name agrees with the number. */
  function durationLabel(duration) {
    var n = duration[0];
    var key = 'units.' + duration[1] + (n === 1 ? '.one' : '.many');
    return n + ' ' + t(key);
  }

  /* ---- Test ----
     One question per slide: a task of daily life, and three durations to
     choose from, each in its own unit. */
  function question(task) {
    var options = [task.correct].concat(task.wrong).map(function (d) {
      var label = durationLabel(d);
      return {
        html: '<span class="answer-text">' + label + '</span>',
        aria: label,
        correct: d === task.correct
      };
    });

    return {
      prompt: t('task.' + task.id),
      hint: t('gen.hint'),
      options: App.utils.shuffle(options),
      inline: false
    };
  }

  App.activityFlow.setup({
    toolId: 'time-durations',
    test: 'options',
    intro: DATA.intro.map(function (step) { return { visual: step }; }),
    real: DATA.real.map(function (example) { return { visual: example }; }),
    introHeading: function () { return t('instructionIntro'); },
    visualHtml: function (spec) {
      return '<span class="carousel-figure" aria-hidden="true">' + spec.picto + '</span>';
    },
    /* A round is a shuffled list of tasks; each one is one question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(App.utils.drawRound('time-durations', DATA.tasks));
      return App.utils.shuffle(list);
    },
    makeQuestion: function (task) { return question(task); }
  });
})();
