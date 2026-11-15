/* ============================================================
   Calculia — Prime and composite numbers (EN)
   Language-specific file. Same keys as strings.es.js.
   Loaded from index.html. Composites first, then primes.
   'answer.*' are the three answers to the classify question: app.js
   compares them with what sharing the number into rows gives.
   Short sentences, one idea per sentence (easy-read principles).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    btnMenu: 'Back to start',
    title: '🔍 Primes and composites',
    instructionIntro: 'Tap the numbers and see what happens.',

    /* Screen texts (shared by the flow engine, assets/js/activity-flow.js). */
    ui: {
      seeReal: 'See them in real life →',
      realLabel: 'Primes and composites are in everyday life',
      hint: '🤔 Try again. Can it be shared with nothing left over?',
      product: '{k} × {d} = {m}',
      hintPrefix: '💡 ',
      wrongPrefix: '❌ Look: ',
      rightPrefix: '✅ Correct! '
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
      factorTree: {
        title: 'It breaks into primes',
        text: 'A composite number can be written as a multiplication of primes. 12 = 2 × 2 × 3.'
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

    /* The everyday examples. */
    real: {
      candies: 'You have 7 sweets. You can only share them equally between 1 person or 7 people. 7 is prime.',
      tiles: 'You have 12 tiles. You can put them in rows of 2, 3, 4 or 6. 12 is composite.',
      clock: 'A clock has 60 minutes. It can be split into 2 halves, 3 thirds, 4 quarters or 5 fifths, with nothing left over.'
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

    answer: {
      prime: 'Prime',
      composite: 'Composite',
      neither: 'Neither prime nor composite'
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      classify: {
        prompt: 'Is {n} prime, composite or neither?',
        hint: 'Try to make equal rows with them. Can they make rows in more than one way?',
        visualAria: '{n} dots.',
        prime: '{n} only makes 1 row of {n}, or {n} rows of 1. It is prime.',
        composite: '{n} = {a} × {b}: it makes equal rows. It is composite.',
        neither: '1 is just one dot. It is neither prime nor composite.'
      },
      pick: {
        prompt: 'Which of these numbers is prime?',
        hint: 'A prime number has only two ways to make rows. Try them one by one.',
        explain: '{p} is prime. The others are composite.'
      },
      factors: {
        prompt: 'What is the prime factorisation of {n}?',
        hint: 'Check that each number in the multiplication is prime. Multiply them: do they give {n}?',
        explain: '{n} = {f}. They are all prime, and multiplied they give {n}.'
      }
    }
  }, 'en');
})();
