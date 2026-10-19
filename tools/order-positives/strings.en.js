/* ============================================================
   Calculia — Order numbers (positives): texts (EN)
   Language-specific file. Loaded from index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Order positives',
    instructionIntro: 'See how numbers are compared.',
    realTitle: 'These numbers are in real life.',
    transfer: 'You use this every time you look for the lowest price or the highest score on a list.',

    ui: {
      prev: 'Previous',
      next: 'Next',
      conceptCount: '{i} of {n}',
      introContinue: 'See real examples →',
      realContinue: 'Start practising →',
      instructionMenu: 'Choose a level.',
      levelLocked: 'Finish the level before to open it.',
      levelDone: 'Rounds done: {n}',
      check: 'Check',
      newRound: 'Another round →',
      chooseLevel: 'Change level'
    },

    /* Questions. {a}, {b}, {v}, {list}, {row} are filled in by the engine. */
    q: {
      promptSmallest: 'Which is the smallest number?',
      promptLargest: 'Which is the largest number?',
      promptOrder: 'Which row goes from smallest to largest?',
      promptBetween: 'Which of these numbers is between {a} and {b}?',
      promptMissing: 'Which number is missing from the row?',
      rowAria: 'Row of numbers: {row}. The gap needs a number.',
      hintSmallest: 'Count the digits of each number. The one with fewer digits is usually the smallest. If they tie, compare the first digit.',
      hintLargest: 'Count the digits of each number. The one with more digits is usually the largest. If they tie, compare the first digit.',
      hintOrder: 'Find the smallest number in the list first. Which row puts it at the start?',
      hintBetween: 'Look for the number that is bigger than {a} and smaller than {b}.',
      hintMissing: 'Look at the number on the left and the one on the right of the gap. Which one fits between them?',
      explainSmallest: '{v} is the smallest.',
      explainLargest: '{v} is the largest.',
      explainOrder: 'From smallest to largest: {list}.',
      explainBetween: '{v} is between {a} and {b}.',
      explainMissing: 'It goes {v}. The row, from smallest to largest: {list}.'
    },

    level: {
      simple: { name: 'Simple digits', detail: 'From 1 to 9.' },
      round: { name: 'Round numbers', detail: '10, 30, 200, 500, 1000…' },
      lessRound: { name: 'Less round', detail: '110, 120, 220, 1100, 1200…' },
      all: { name: 'All numbers', detail: 'Any number, with any number of digits.' }
    },

    concept: {
      1: { title: 'More digits, bigger', text: 'A number with more digits is bigger. 9 is less than 10, and 10 is less than 100.' },
      2: { title: 'Look at the first digit', text: 'If they have the same number of digits, look at the first one. 213 is less than 301, because 2 is less than 3.' },
      3: { title: 'If they tie, go on', text: 'If the first digit is the same, look at the second one. 245 is less than 263.' },
      4: { title: 'From smallest to largest', text: 'To order is to put the smallest first and the largest last. On a line, the one on the left is smaller.' }
    },

    real: {
      price: 'Prices: the cheapest one goes first when you order them.',
      house: 'House numbers: on a street, number 12 comes before number 25.',
      score: 'Scores: the one with more points is higher up.',
      pages: 'Book pages: page 150 comes after page 99.'
    }
  }, 'en');
})();
