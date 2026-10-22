/* ============================================================
   Calculia — Lines (EN)
   Language-specific file. Same keys as strings.es.js.
   It is loaded conditionally from index.html based on App.i18n.locale().
   'kind.*' are the three names for a pair of lines: app.js looks each
   one up by the class it reads from the drawing.
   Short sentences, one idea per sentence (easy-read principles).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➕ Lines',
    instructionIntro: 'Look at the lines.',
    introContinue: 'See them in real life →',
    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    concept: {
      line: {
        title: 'Line',
        text: 'It is a straight line that does not bend and has no end: it goes on in both directions.'
      },
      parallel: {
        title: 'Parallel',
        text: 'Two lines that never touch, even if they are made longer.'
      },
      crossing: {
        title: 'Intersecting',
        text: 'Two lines that cross at one point, but do not make a square corner.'
      },
      perpendicular: {
        title: 'Perpendicular',
        text: 'Two lines that cross and make a square corner.'
      }
    },
    realTitle: 'Lines are all around us',
    realContinue: 'Start practising →',
    real: {
      rails: 'The railway tracks are parallel: they never touch.',
      scissors: 'The scissors cross at one point, but they do not make a square corner: they are intersecting.',
      square: 'The set square has a right-angle corner: its sides are perpendicular.',
      streets: 'Streets on a grid cross and make a corner: they are perpendicular.'
    },
    kind: {
      parallel: 'Parallel',
      crossing: 'Intersecting',
      perpendicular: 'Perpendicular'
    },
    check: 'Check',
    newRound: 'Another round →',
    btnMenu: 'Back to start',
    hint: '🤔 Try again. Look at the picture calmly.',
    transfer: 'This will help you see whether two streets cross or never meet, and understand plans and maps.',
    gen: {
      kindPrompt: 'What are these two lines like?',
      linesAria: 'Two lines inside a box.',
      socraticKind: '🤔 Look to see if they touch. If they cross, look to see if the corner is an exact square.'
    }
  }, 'en');
})();
