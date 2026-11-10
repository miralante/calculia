/* ============================================================
   Calculia — Divisors: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the game are in braces: {n}, {k}, {q}, {r}…
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

    /* The practice: a game. Pick a number and tap each card to see the division. */
    practice: {
      pick: 'Choose a number.',
      pickAria: 'Divisors of {n}',
      title: 'Divisors of {n}. Tap each card to see the result.',
      card: '{n} ÷ {k} = ?',
      cardAria: '{n} divided by {k}. Tap to see the result.',
      done: 'Done! The divisors of {n} up to 10 are: {list}.',
      other: 'Another number'
    }
  }, 'en');
})();
