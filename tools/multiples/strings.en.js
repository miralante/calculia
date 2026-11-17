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
      1: { title: 'A multiple comes from multiplying', text: 'A multiple comes from multiplying a number by another. 3 × 4 = 12. So 12 is a multiple of 3 and also of 4.' },
      2: { title: 'Multiply 5 by 1, 2, 3…', text: 'Each line is a multiplication. The marked result is a multiple of 5.' },
      3: { title: 'Example: multiply 2 by 1, 2, 3…', text: 'Each line is a multiplication. The marked result is a multiple of 2.' },
      4: { title: 'Example: multiply 3 by 1, 2, 3…', text: 'Each line is a multiplication. The marked result is a multiple of 3.' }
    },

    /* The practice: a game on the right of the explanation. */
    practice: {
      start: 'I choose this number',
      pick: 'Now you choose another number from 1 to 9.',
      pickAria: 'Multiply {a} by {b}',
      partner: 'I chose {a} and you chose {b}. We multiply {a} by {b}:',
      listTitle: 'The multiples of {a}:',
      result: '{a} × {b} = {m}',
      why: '{m} is a multiple of {a} and of {b}. A multiple of {a} comes from multiplying it by {b}.',
      other: 'Another starting number'
    }
  }, 'en');
})();
