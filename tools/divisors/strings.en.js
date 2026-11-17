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
      divide: '{n} ÷ {k} = {q}',
      divideRest: '{n} ÷ {k} = {q}, {r} left over',
      exactTag: 'whole division',
      restTag: 'not whole: {r} left over',
    },

    /* The explanation: one idea per slide. The divisions are in data.js. */
    intro: {
      1: { title: 'A divisor divides exactly', text: '12 ÷ 3 = 4: the division is whole, nothing is left over. So 3 is a divisor of 12. But 12 ÷ 5 is not whole: 2 is left over.' },
      2: { title: 'Divide 12 by 1, 2, 3…', text: 'If the division comes out exact, it is a divisor. If something is left over, it is not.' },
      3: { title: 'Example: divide 6 by 1, 2, 3…', text: 'If the division comes out exact, it is a divisor. If something is left over, it is not.' },
      4: { title: 'Example: divide 8 by 1, 2, 3…', text: 'If the division comes out exact, it is a divisor. If something is left over, it is not.' }
    },

    /* The practice: a game on the right of the explanation. */
    practice: {
      start: 'I choose this number',
      pick: 'Now you choose a number from 1 to 9. It is the divisor.',
      pickAria: 'Divide {a} by {b}',
      partner: 'I chose {a} and you chose {b}. Let us divide {a} by {b}:',
      listTitle: 'The divisions of {a}:',
      why: '{a} ÷ {b} is a whole division: nothing is left over. So {b} is a divisor of {a}.',
      whyNo: '{a} ÷ {b} is not whole: {r} is left over. So {b} is not a divisor of {a}.',
      other: 'Another starting number'
    }
  }, 'en');
})();
