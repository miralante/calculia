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
      start: 'I choose this number',
      pick: 'Now you choose a number from 1 to 9. It is the divisor.',
      pickAria: 'Divide {a} by {b}',
      partner: 'I chose {a} and you chose {b}. Let us share it into groups of {b}:',
      why: '{a} splits into {q} groups of {b} with nothing left over. So {b} is a divisor of {a}.',
      whyNo: '{a} does not split into groups of {b} with nothing left over: {r} is left over. So {b} is not a divisor of {a}.',
      other: 'Another starting number'
    }
  }, 'en');
})();
