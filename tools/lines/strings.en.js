/* ============================================================
   Calculia — Two lines texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   'lines.*' are the three names of a pair of lines; app.js looks them up
   by the kind it works out from the slopes of the drawing.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➕ Two lines',
    instructionMenu: 'Choose an activity.',
    contexto: 'Railway tracks never touch. Streets on a grid do cross.',
    explicacion: '✅ Look at the picture and decide. If they never meet, they are parallel; if they cross making a square corner, they are perpendicular.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the picture calmly.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    transfer: 'This will help you see whether two streets cross or never meet, and understand plans and maps.',
    lines: {
      parallel: 'Parallel: they never touch',
      perpendicular: 'Perpendicular: a square corner',
      crossing: 'They cross, but without a square corner'
    },
    activity: {
      rectas: { name: 'Two lines', detail: 'Do they touch?', instruction: 'Two lines may never touch at all: they are parallel. Or they may cross. And if they make a square corner where they cross, they are perpendicular. Look at the drawing and decide.' }
    },
    gen: {
      linePair: 'What are these two lines like?',
      linesHint: 'If they meet anywhere, they cross. And if they make a square corner where they cross, they are perpendicular.',
      linesAria: 'Two lines inside a box.',
      socraticLines: '🤔 Look for the point where the two lines meet each other.'
    }
  }, 'en');
})();
