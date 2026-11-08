/* ============================================================
   Calculia — ¿Cuál dura más?
   Three stages: 1. the explanation (slides with a drawing), 2. real life (one
   example at a time), 3. the test, one question per slide. The stages and
   the test are built by assets/js/activity-flow.js; this file has the
   questions. The data is in data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  function seconds(duration) {
    return duration[0] * DATA.seconds[duration[1]];
  }

  /* Checked at start-up, so bad data fails loudly: every duration has a
     known unit and no two durations are the same length. */
  DATA.durations.forEach(function (d) {
    if (!(DATA.seconds[d[1]] > 0)) throw new Error('time-compare: unknown unit ' + d[1]);
  });
  DATA.durations.forEach(function (d, i) {
    DATA.durations.forEach(function (other, j) {
      if (i !== j && seconds(d) === seconds(other)) {
        throw new Error('time-compare: same length ' + d.join(' ') + ' and ' + other.join(' '));
      }
    });
  });

  /* "2 minutos", "1 año": the unit name agrees with the number. */
  function durationLabel(duration) {
    var n = duration[0];
    var key = 'units.' + duration[1] + (n === 1 ? '.one' : '.many');
    return n + ' ' + t(key);
  }

  /* ---- Test ----
     One question per slide. Three durations, each in its own unit. Half the
     questions ask for the longest one and half for the shortest, so the
     person must compare, not just read the biggest number. */
  function question() {
    var items = App.utils.shuffle(DATA.durations).slice(0, 3);
    var longest = App.utils.shuffle([true, false])[0];
    var answer = items.reduce(function (best, d) {
      if (longest) return seconds(d) > seconds(best) ? d : best;
      return seconds(d) < seconds(best) ? d : best;
    });

    return {
      prompt: t(longest ? 'q.longest' : 'q.shortest'),
      hint: t('gen.hint'),
      options: App.utils.shuffle(items.map(function (d) {
        var label = durationLabel(d);
        return {
          html: '<span class="answer-text">' + label + '</span>',
          aria: label,
          correct: d === answer
        };
      })),
      inline: false
    };
  }

  App.activityFlow.setup({
    toolId: 'time-compare',
    test: 'options',
    intro: DATA.intro.map(function (step) { return { visual: step }; }),
    real: DATA.real.map(function (example) { return { visual: example }; }),
    introHeading: function () { return t('instructionIntro'); },
    visualHtml: function (spec) {
      return '<span class="carousel-figure" aria-hidden="true">' + spec.picto + '</span>';
    },
    /* A round is one entry per question; each question is generated when it is shown. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(i);
      return App.utils.shuffle(list);
    },
    makeQuestion: function () { return question(); }
  });
})();
