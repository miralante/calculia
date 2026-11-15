/* ============================================================
   Calculia — Divisors: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the game are in braces: {a}, {b}, {m}, {k}, {q}, {r}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Divisors',
    btnMenu: 'Back to the start',

    ui: {
      visualAria: 'Drawing or divisions that show the divisors.',
      product: '{k} × {d} = {m}',
      divide: '{n} ÷ {k} = {q}',
      divideRest: '{n} ÷ {k} = {q}, {r} left over',
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'A divisor divides exactly', text: '12 splits into 3 groups of 4, with nothing left over. So 3 is a divisor of 12.' },
      2: { title: 'Divide 12 by 1, 2, 3…', text: 'If the division comes out exact, it is a divisor. If something is left over, it is not.' },
      3: { title: 'Example: divide 6 by 1, 2, 3…', text: 'If the division comes out exact, it is a divisor. If something is left over, it is not.' },
      4: { title: 'Example: divide 8 by 1, 2, 3…', text: 'If the division comes out exact, it is a divisor. If something is left over, it is not.' }
    },

    /* The practice: a game on the right of the explanation. */
    practice: {
      start: 'Starting number',
      pick: 'Choose another number from 1 to 9.',
      pickAria: 'Multiply {a} by {b}',
      result: '{a} × {b} = {m}',
      why: '{m} ÷ {a} = {b}, with nothing left over. So {a} is a divisor of {m}. {b} is a divisor of {m} too.',
      other: 'Another starting number'
    }
  }, 'en');
})();
