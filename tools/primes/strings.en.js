/* ============================================================
   Calculia — Prime and composite numbers (EN)
   Language-specific file. Same keys as strings.es.js.
   It is loaded conditionally from index.html based on App.i18n.locale().
   'answer.*' are the three answers to the classify question: app.js
   compares them with what dividing the number gives.
   Short sentences, one idea per sentence (easy-read principles).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔍 Primes and composites',
    instructionIntro: 'Look at the numbers.',
    introContinue: 'See them in real life →',
    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    concept: {
      prime: {
        title: 'Prime number',
        text: 'A prime number can only be divided by 1 and by itself, with nothing left over. For example, 7 can only be made into one row of 7 dots.'
      },
      upto10: {
        title: 'Primes up to 10',
        text: 'There are four: 2, 3, 5 and 7. The number 1 is not prime. The numbers 4, 6, 8, 9 and 10 can be divided by other numbers.'
      },
      composite: {
        title: 'Composite number',
        text: 'A composite number can be divided by other numbers, with nothing left over. For example, 6 can be made into 2 rows of 3 dots.'
      },
      notPrime: {
        title: 'Examples that are not prime',
        text: '4 = 2 × 2. 6 = 2 × 3. 8 = 2 × 2 × 2. 9 = 3 × 3. 10 = 2 × 5. Each one can be written as a multiplication.'
      },
      one: {
        title: 'The number 1',
        text: 'The number 1 has only one divisor: itself. So it is neither prime nor composite.'
      },
      factors: {
        title: 'Factorising',
        text: 'It is writing a number as a multiplication of prime numbers. For example: 12 = 2 × 2 × 3.'
      }
    },
    realTitle: 'Primes and composites are in everyday life',
    realContinue: 'Start practising →',
    real: {
      candies: 'You have 7 sweets. You can only share them equally between 1 or 7 people. 7 is prime.',
      tiles: 'You have 12 tiles. You can put them in rows of 2, 3, 4 or 6. 12 is composite.',
      clock: 'A clock has 60 minutes: 60 = 2 × 2 × 3 × 5. So it can be split into halves, thirds, quarters and fifths, and it always comes out exact.'
    },
    answer: {
      prime: 'Prime',
      composite: 'Composite',
      neither: 'Neither prime nor composite'
    },
    check: 'Check',
    newRound: 'Another round →',
    btnMenu: 'Back to start',
    hint: '🤔 Try again. Think about the divisors.',
    transfer: 'This helps you share things into equal groups and simplify fractions.',
    gen: {
      classifyPrompt: 'Is this number prime, composite or neither?',
      pickPrompt: 'Which of these numbers is prime?',
      factorsPrompt: 'What is the prime factorisation of this number?',
      hintClassify: '🤔 Can it be divided by another number, besides 1 and itself? Try 2, 3 and 5.',
      hintPick: '🤔 A prime number is only divided by 1 and by itself. Try them one by one.',
      hintFactors: '🤔 Check that each number you multiply is prime. Multiply them to check they give the number.'
    }
  }, 'en');
})();
