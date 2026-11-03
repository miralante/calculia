/* ============================================================
   Calculia — Greatest common divisor: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change are
   in braces: {a}, {b}, {g}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔗 Greatest common divisor',
    btnMenu: 'Back to the start',

    ui: {
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      visualAria: 'Drawing of objects that shows the sharing.',
      seeReal: 'See real examples →',
      realLabel: 'Real-life examples',
      startTest: 'Start practising →',
      review: '← Review the explanation',
      share: 'There are {g} equal groups. In each group there are {x} and {y}.',
      tiles: 'A floor of {a} × {b} cm, covered with tiles of {g} × {g} cm.',
      divisorsOf: 'Divisors of {n}:',
      right: '✅ Well done!',
      roundDone: 'You have finished the round: {n} of {total} right the first time. You now have {stars} stars.'
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'The greatest common divisor (GCD)', text: 'With 12 apples and 18 oranges we make 6 equal baskets. Nothing is left over. So the GCD of 12 and 18 is 6.' },
      2: { title: 'Divisors are the numbers that divide exactly', text: 'The divisors of 12 are 1, 2, 3, 4, 6 and 12. The divisors of 18 are 1, 2, 3, 6, 9 and 18. The ones in both lists are marked.' },
      3: { title: 'The biggest one that is in both lists', text: 'The ones in both lists of 8 and 20 are 1, 2 and 4. The biggest is 4. So the GCD of 8 and 20 is 4.' },
      4: { title: 'If one divides the other, the GCD is the smaller one', text: '4 divides 12. So the GCD of 4 and 12 is 4.' }
    },

    /* Real-life examples: one situation per screen. */
    real: {
      1: 'You have 8 strawberry sweets and 20 lemon sweets. You make equal bags, with none left over. You get 4 bags, with 2 strawberry and 5 lemon sweets in each one.',
      2: 'You want to cover a 12 × 18 cm floor with equal square tiles, as big as possible. Each tile is 6 × 6 cm, and no piece is left over.',
      3: 'You have 12 books and 18 notebooks. You make equal sets, with nothing left over. You get 6 sets, with 2 books and 3 notebooks in each one.'
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      gcd: {
        prompt: 'What is the greatest common divisor of {a} and {b}?',
        hint: '🤔 Write the divisors of {a} and of {b}. Find the biggest one that is in both lists.',
        explain: 'Divisors of {a}: {la}. Divisors of {b}: {lb}. The biggest one in both lists is {g}.'
      },
      story: {
        prompt: 'You have {a} apples and {b} oranges. What is the biggest number of equal baskets, with nothing left over?',
        hint: '🤔 Think about how many baskets fit both amounts at the same time, with nothing left over.'
      },
      common: {
        prompt: 'Which of these numbers divides {a} and {b} exactly?',
        hint: '🤔 Try each number: does it divide {a} exactly, and {b} too?',
        explain: '{g} divides {a} and {b}. It is the biggest one that does.'
      }
    }
  }, 'en');
})();
