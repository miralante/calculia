/* ============================================================
   Calculia — Prime or composite: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the questions are in braces: {n}, {p}, {a}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔎 Prime or composite',
    btnMenu: 'Back to the start',

    ui: {
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      visualAria: 'Drawing of dots in rows that shows the number.',
      product: '{k} × {d} = {m}',
      yes: 'Yes',
      no: 'No',
      right: '✅ Well done!',
      review: '← Review the explanation',
      startTest: 'Start practising →',
      roundDone: 'You have finished the round: {n} of {total} right the first time. You now have {stars} stars.'
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'A prime number is divided only by 1 and by itself', text: '7 only comes out as 1 × 7. So 7 is prime.' },
      2: { title: 'A composite number is divided by more numbers', text: '6 also comes out as 2 × 3. It is divided by 1, 2, 3 and 6. So 6 is composite.' },
      3: { title: 'The primes up to 20', text: 'They have a thick border: 2, 3, 5, 7, 11, 13, 17 and 19. The others, except 1, are composite.' },
      4: { title: '1 is neither prime nor composite', text: '1 has only one divisor: itself. So it is not prime. It is not composite either.' },
      5: { title: 'Composite numbers: 4, 6, 8, 9', text: 'They come from multiplying two numbers bigger than 1: 2 × 2 = 4, 2 × 3 = 6, 2 × 4 = 8, 3 × 3 = 9.' },
      6: { title: 'If you can make it another way, it is composite', text: '15 = 3 × 5. It is divided by 3 and by 5, as well as by 1 and 15, so it is composite.' }
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      yesno: {
        prompt: 'Is {n} a prime number?',
        hint: '🤔 Look at which numbers divide {n} exactly. Does it divide only by 1 and by itself?',
        prime: '{n} is divided only by 1 and {n}: it is prime.',
        composite: '{n} = {a} × {b}: it is divided by more numbers. It is composite.',
        one: '1 has only one divisor: itself. So it is not prime.'
      },
      pick: {
        prompt: 'Choose the prime number.',
        hint: '🤔 A prime is divided only by 1 and by itself. Find the one that cannot be made another way.',
        explain: '{p} is prime: it is divided only by 1 and {p}. The other two are composite.'
      },
      divisors: {
        prompt: 'How many numbers divide {n} exactly? Count 1 and {n}.',
        hint: '🤔 Divide {n} by 2, 3, 4… and see which ones come out exactly.',
        prime: '{n} is divided by {list}: that is {count}. Since there are only 2, it is prime.',
        composite: '{n} is divided by {list}: that is {count}. Since there are more than 2, it is composite.'
      }
    }
  }, 'en');
})();
