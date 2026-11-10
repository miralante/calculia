/* ============================================================
   Calculia — Multiples: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the game are in braces: {d}, {k}, {m}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Multiples',
    btnMenu: 'Back to the start',

    ui: {
      visualAria: 'Drawing or multiplications that show the multiples.',
      product: '{k} × {d} = {m}',
      times: '{d} × {k} = {m}',
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'A multiple comes from multiplying', text: '3 × 4 = 12. So 12 is a multiple of 3 and also of 4.' },
      2: { title: 'Multiply 5 by 1, 2, 3…', text: 'Each line is a multiplication. The result is a multiple of 5.' },
      3: { title: 'Example: multiply 2 by 1, 2, 3…', text: 'Each line is a multiplication. The result is a multiple of 2.' },
      4: { title: 'Example: multiply 3 by 1, 2, 3…', text: 'Each line is a multiplication. The result is a multiple of 3.' }
    },

    /* The practice: a game. Pick a number and tap each card to see the result. */
    practice: {
      pick: 'Choose a number.',
      pickAria: 'Multiples of {d}',
      title: 'Multiples of {d}. Tap each card to see the result.',
      card: '{d} × {k} = ?',
      cardAria: '{d} times {k}. Tap to see the result.',
      shown: '{d} × {k} = {m}',
      done: 'You now have the multiples of {d} up to 10!',
      other: 'Another number'
    }
  }, 'en');
})();
