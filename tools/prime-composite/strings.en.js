/* ============================================================
   Calculia — Prime or composite: texts (EN)
   Language file, loaded from index.html. Same keys as strings.es.js.
   Composites first, then primes. Short sentences, one idea per
   sentence. The numbers that change in the game are in braces:
   {a}, {b}, {m}, {n}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔎 Prime or composite',
    btnMenu: 'Back to the start',

    ui: {
      product: '{k} × {d} = {m}'
    },

    /* The explanation: one idea per slide. Composites come first. */
    concept: {
      composite: {
        title: 'Composite number',
        text: 'Tap a number of rows. If no dot is left over, the rows are equal. 6 makes 2 rows of 3, so it is composite.'
      },
      compositeMult: {
        title: 'It can be written as a multiplication',
        text: '4 = 2 × 2. 6 = 2 × 3. 8 = 2 × 4. 9 = 3 × 3. They are all composite.'
      },
      compositeOther: {
        title: 'If it works another way, it is composite',
        text: 'Tap a number of rows. 15 works in 3 rows of 5, and also in 5 rows of 3. That is why it is composite.'
      },
      compositeGrid: {
        title: 'Find the composites',
        text: 'Tap the composite numbers from 1 to 20. 1 and the primes are not composite.'
      },
      prime: {
        title: 'Prime number',
        text: 'Tap a number of rows. 7 only makes 1 row of 7, or 7 rows of 1. That is why it is prime.'
      },
      one: {
        title: '1 is neither prime nor composite',
        text: '1 is just one dot. It has no two ways to make rows, so it is not prime. It is not composite either.'
      },
      primeGrid: {
        title: 'Find the primes',
        text: 'Tap the prime numbers from 1 to 20. The composites and 1 are not prime.'
      }
    },

    /* The rows the learner picks on the slide. */
    rows: {
      ask: 'How many rows do you make?',
      aria: 'Make {r} rows',
      exact: '{n} = {r} × {c}. It works exactly.',
      left: 'With {r} rows, {left} dots are left over. It does not work exactly.',
      leftOne: 'With {r} rows, 1 dot is left over. It does not work exactly.'
    },

    /* The numbers the learner taps on the grid from 1 to 20. */
    grid: {
      startComposite: 'Tap the composite numbers.',
      startPrime: 'Tap the prime numbers.',
      found: 'Found: {i} of {total}.',
      yesComposite: 'Yes. {n} = {a} × {b}. It is composite.',
      yesPrime: 'Yes. {n} is prime: it has only two ways to make rows.',
      noPrime: 'No. {n} is prime: it has only two ways to make rows.',
      noComposite: 'No. {n} = {a} × {b}. It is composite.',
      noOne: 'No. 1 is neither prime nor composite.',
      done: 'Well done! You found them all.'
    },

    /* The practice: a game on the left of the explanation. */
    practice: {
      start: 'Starting number',
      pick: 'Choose another number from 2 to 9.',
      pickAria: 'Multiply {a} by {b}',
      result: '{a} × {b} = {m}',
      why: '{m} is composite: it comes from multiplying {a} by {b}. It has more than two divisors, so it is not prime.',
      other: 'Another starting number'
    }
  }, 'en');
})();
