/* ============================================================
   Calculia — Climb the ladder: texts (EN)
   Language-specific file. Loaded from index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🪜 Climb the ladder',
    menuTitle: 'Climb the ladder',
    menuDetail: 'There are positive numbers, negative numbers and decimals. Each right answer takes you up one step. No rush: you set the pace.',
    btnStart: 'Start',
    transfer: 'Ordering numbers of every kind helps you read a thermometer, compare prices and find the highest score.',

    game: {
      ladderAria: 'Rungs of the ladder',
      streak: 'Streak: {n}',
      next: 'Next step →',
      summaryTitle: 'You reached the top!',
      summaryText: 'You got {n} of {total} right first time.',
      endBack: 'Back to the start'
    },

    /* Questions. Every type and every sign appears here, so the same
       texts serve the positive, negative and decimal steps. */
    q: {
      promptSmallest: 'Which is the smallest number?',
      promptLargest: 'Which is the largest number?',
      promptOrder: 'Which row goes from smallest to largest?',
      promptBetween: 'Which of these numbers is between {a} and {b}?',
      promptMissing: 'Which number is missing from the row?',
      rowAria: 'Row of numbers: {row}. The gap needs a number.',
      hintSmallest: 'If there are negatives, the smallest is the one furthest from zero. If they are all positive, look at the whole part first, then the tenths.',
      hintSmallestNeg: 'They are all negative. The one furthest from zero is the smallest.',
      hintLargest: 'If there are negatives, the largest is the one closest to zero. If they are all positive, look at the whole part first, then the tenths.',
      hintLargestNeg: 'They are all negative. The one closest to zero is the largest.',
      hintOrder: 'Find the smallest first: negatives come before zero, and zero comes before the positives.',
      hintOrderNeg: 'They are all negative. The one furthest from zero goes first.',
      hintBetween: 'Look for the number that is bigger than {a} and smaller than {b}.',
      hintMissing: 'Look at the number on the left and the one on the right of the gap. Which one fits between them?',
      explainSmallest: '{v} is the smallest.',
      explainSmallestNeg: '{v} is the smallest: it is furthest from zero.',
      explainLargest: '{v} is the largest.',
      explainLargestNeg: '{v} is the largest: it is closest to zero.',
      explainOrder: 'From smallest to largest: {list}.',
      explainBetween: '{v} is between {a} and {b}.',
      explainMissing: 'It goes {v}. The row, from smallest to largest: {list}.'
    }
  }, 'en');
})();
