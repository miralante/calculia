/* ============================================================
   Calculia — ¿Cuál dura más?
   Data in data.js. Shared modules in assets/js/.
   Screens: explanation → test sheet. The whole round is on one
   screen, as in Máximo común divisor.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'time-compare';
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
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0 });

  /* Right answers of the round, counted at the first check. */
  var roundCorrect = 0;

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

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

  function show(screen) {
    [screenIntro, screenGame].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* "2 minutos", "1 año": the unit name agrees with the number. */
  function durationLabel(duration) {
    var n = duration[0];
    var key = 'units.' + duration[1] + (n === 1 ? '.one' : '.many');
    return n + ' ' + App.i18n.t(key);
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  /* Three durations, each in its own unit. Half the questions ask for the
     longest one and half for the shortest, so the person must compare, not
     just read the biggest number. */
  function question() {
    var items = App.utils.shuffle(DATA.durations).slice(0, 3);
    var longest = App.utils.shuffle([true, false])[0];
    var answer = items.reduce(function (best, d) {
      if (longest) return seconds(d) > seconds(best) ? d : best;
      return seconds(d) < seconds(best) ? d : best;
    });

    return {
      prompt: App.i18n.t(longest ? 'q.longest' : 'q.shortest'),
      hint: App.i18n.t('gen.hint'),
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

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(question());
    }
    sheetTest.set(App.utils.shuffle(questions));
    roundCorrect = 0;
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
      roundCorrect = rightFirstTry;
      progress.stars += roundCorrect;
      save();
      paintStars();
    }
  });

  /* ---- Events ---- */

  $('#introContinue').addEventListener('click', startRound);
  $('#btnCheck').addEventListener('click', sheetTest.check);
  $('#btnNewRound').addEventListener('click', startRound);

  paintStars();
})();
