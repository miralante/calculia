/* ============================================================
   Calculia — Multiples: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the game are in braces: {a}, {b}, {m}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Multiples',
    btnMenu: 'Back to the start',

    ui: {
      division: '{T} ÷ {d} = {q}',
      remainder: '{r} left over',
      yes: 'Yes',
      no: 'No',
      visualAria: 'Drawing or multiplications that show the multiples.',
      multipleTag: 'multiple of {d}',
    },

    /* The explanation: one idea per slide. The lines are in data.js. */
    intro: {
      1: { title: 'What is a multiple?', text: 'A multiple of 3 comes from multiplying 3 by another number. For example, 3 × 2 = 6. So 6 is a multiple of 3.' },
      2: { title: 'Multiply 3 by 1, 2, 3, 4…', text: 'Each line is a multiplication. The marked result is a multiple of 3.' },
      3: { title: 'Multiply 5 by 1, 2, 3…', text: 'Each line is a multiplication. The marked result is a multiple of 5.' },
      4: { title: 'Example: multiply 2 by 1, 2, 3…', text: 'Each line is a multiplication. The marked result is a multiple of 2.' },
      5: { title: 'Example: multiply 3 by 1, 2, 3…', text: 'Each line is a multiplication. The marked result is a multiple of 3.' }
    },

    /* The practice: a game on the right of the explanation. */
    practice: {
      concept: 'A multiple of {a} comes from multiplying {a} by another number.',
      ask: 'Tap a number. We multiply it by {a}.',
      pickAria: 'Multiply {a} by {b}',
      why: 'So {m} is a multiple of {a}.',
      trail: 'The multiples of {a} you have so far:',
      other: 'Another starting number'
    }
  }, 'en');
})();
