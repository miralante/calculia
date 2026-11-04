/* ============================================================
   Calculia — Prime and composite numbers (EN)
   Language-specific file. Same keys as strings.es.js.
   It is loaded conditionally from index.html based on App.i18n.locale().
   'answer.*' are the three answers to the classify question: app.js
   compares them with what dividing the number gives.
   Short sentences, one idea per sentence (easy-read principles). Says
   "share" and "equal rows" instead of "divisor".
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
        text: '7 is prime. You can only put it in one row of 7 dots. Equal rows of another size do not fit.'
      },
      upto10: {
        title: 'The primes up to 10',
        text: 'They are 2, 3, 5 and 7. They have a ring so you can see them better.'
      },
      composite: {
        title: 'Composite number',
        text: '6 is composite. You can put it in 2 rows of 3 dots. Also in 3 rows of 2.'
      },
      notPrime: {
        title: 'It can be written as a multiplication',
        text: '4 = 2 × 2. 6 = 2 × 3. 9 = 3 × 3. That is why they are composite.'
      },
      one: {
        title: '1 is not prime',
        text: '1 is just 1 dot. It is neither prime nor composite.'
      },
      factors: {
        title: 'Break into primes',
        text: 'It is writing a number as a multiplication of primes. 12 = 2 × 2 × 3.'
      }
    },
    realTitle: 'Primes and composites are in everyday life',
    realContinue: 'Start practising →',
    real: {
      candies: 'You have 7 sweets. You can only share them equally between 1 person or 7 people. 7 is prime.',
      tiles: 'You have 12 tiles. You can put them in rows of 2, 3, 4 or 6. 12 is composite.',
      clock: 'A clock has 60 minutes. It can be split into 2 halves, 3 thirds, 4 quarters or 5 fifths, with nothing left over.'
    },
    answer: {
      prime: 'Prime',
      composite: 'Composite',
      neither: 'Neither prime nor composite'
    },
    check: 'Check',
    newRound: 'Another round →',
    btnMenu: 'Back to start',
    hint: '🤔 Try again. Can it be shared with nothing left over?',
    transfer: 'This helps you share things into equal groups and simplify fractions.',
    gen: {
      classifyPrompt: 'Is this number prime, composite or neither?',
      pickPrompt: 'Which of these numbers is prime?',
      factorsPrompt: 'What is the prime factorisation of this number?',
      hintClassify: '🤔 Can it be shared into equal groups another way? Try 2, 3 and 5.',
      hintPick: '🤔 A prime number only goes in one row. Try them one by one.',
      hintFactors: '🤔 Check that each number you multiply is prime. Multiply them and see if they give the number.'
    }
  }, 'en');
})();
