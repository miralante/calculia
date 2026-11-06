/* ============================================================
   Calculia — Greatest common divisor: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change are
   in braces: {a}, {b}, {g}… Says "fits exactly into" when it can.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔗 Greatest common divisor',
    btnMenu: 'Back to the start',

    ui: {
      visualAria: 'Drawing of objects that shows the sharing.',
      realLabel: 'Real-life examples',
      share: 'There are {g} equal groups. In each group there are {x} and {y}.',
      tiles: 'A floor of {a} × {b} cm, covered with tiles of {g} × {g} cm.',
      divisorsOf: 'Numbers that fit exactly into {n}:',
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'The greatest common divisor (GCD)', text: 'You have 12 apples and 18 oranges. You can make 6 equal baskets, with nothing left over. The GCD of 12 and 18 is 6.' },
      2: { title: 'Numbers that fit exactly', text: '12 fits exactly into 1, 2, 3, 4, 6 and 12. 18 fits exactly into 1, 2, 3, 6, 9 and 18. The ones that fit both are marked.' },
      3: { title: 'Choose the biggest of the marked ones', text: '8 and 20 have 1, 2 and 4 in common. The biggest is 4. So the GCD of 8 and 20 is 4.' },
      4: { title: 'If one fits exactly into the other, the GCD is the smaller one', text: '4 fits exactly into 12. So the GCD of 4 and 12 is 4.' }
    },

    /* Real-life examples: one situation per screen. */
    real: {
      1: 'You have 8 strawberry sweets and 20 lemon sweets. You make equal bags, with none left over. You get 4 bags: each one has 2 strawberry and 5 lemon sweets.',
      2: 'You want to cover a 12 × 18 cm floor with equal square tiles, as big as possible. Each tile is 6 × 6 cm, and no piece is left over.',
      3: 'You have 12 books and 18 notebooks. You make equal sets, with nothing left over. You get 6 sets: each one has 2 books and 3 notebooks.'
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      gcd: {
        prompt: 'What is the GCD of {a} and {b}?',
        hint: '🤔 Find the biggest number that fits exactly into both.',
        explain: 'The biggest number that fits exactly into {a} and into {b} is {g}.'
      },
      story: {
        prompt: 'You have {a} apples and {b} oranges. What is the biggest number of equal baskets, with nothing left over?',
        hint: '🤔 Try how many baskets you get with both amounts at the same time.'
      },
      common: {
        prompt: 'Which of these numbers fits exactly into {a} and into {b}?',
        hint: '🤔 Check whether each number fits exactly into {a}, and also into {b}.',
        explain: '{g} fits exactly into {a} and into {b}. It is the biggest one that does.'
      }
    }
  }, 'en');
})();
