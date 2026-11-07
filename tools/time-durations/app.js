/* ============================================================
   Calculia — ¿Cuánto tarda?
   Data in data.js. Shared modules in assets/js/.
   Screens: explanation → test sheet. The whole round is on one
   screen, as in Máximo común divisor.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'time-durations';
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

  /* Checked at start-up, so bad data fails loudly: each task has one
     correct duration and two wrong ones, and the three are different. */
  DATA.tasks.forEach(function (task) {
    var labels = [task.correct].concat(task.wrong).map(function (d) { return d[0] + ' ' + d[1]; });
    var distinct = labels.filter(function (l, i) { return labels.indexOf(l) === i; });
    if (task.wrong.length !== 2 || distinct.length !== 3) {
      throw new Error('time-durations: bad task ' + task.id);
    }
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
      prompt: App.i18n.t('task.' + task.id),
      hint: App.i18n.t('gen.hint'),
      options: App.utils.shuffle(options),
      inline: false
    };
  }

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(question(App.utils.drawRound(TOOL_ID, DATA.tasks)));
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
