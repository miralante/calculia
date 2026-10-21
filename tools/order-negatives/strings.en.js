/* ============================================================
   Calculia — Order negatives: texts (EN)
   Language-specific file. Loaded from index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➖ Order negatives',
    instructionIntro: 'See how numbers below zero are ordered.',
    realTitle: 'Negative numbers are in real life.',
    transfer: 'You use this to read a thermometer or the floors of a car park.',

    ui: {
      prev: 'Previous',
      next: 'Next',
      conceptCount: '{i} of {n}',
      introContinue: 'See real examples →',
      realContinue: 'Start practising →',
      check: 'Check',
      newRound: 'Another round →',
    },

    /* Questions. {a}, {b}, {v}, {list}, {row} are filled in by the engine. */
    q: {
      promptSmallest: 'Which is the smallest number?',
      promptLargest: 'Which is the largest number?',
      promptOrder: 'Which row goes from smallest to largest?',
      promptBetween: 'Which of these numbers is between {a} and {b}?',
      promptMissing: 'Which number is missing from the row?',
      promptCompare: 'Which sign goes between the two numbers?',
      relLess: 'less than',
      relGreater: 'greater than',
      relEqual: 'equal to',
      compareAria: 'Two numbers: {a} and {b}. Which sign goes between them?',
      explainCompare: '{a} is {rel} {b}.',
      hintCompare: '🤔 Look at which of the two is further right on the number line. With negatives, the one closer to zero is the greater.',
      rowAria: 'Row of numbers: {row}. The gap needs a number.',
      hintSmallest: 'Count the digits of each number. The one with fewer digits is usually the smallest.',
      hintSmallestNeg: 'They are all negative. The one furthest from zero is the smallest.',
      hintLargest: 'Count the digits of each number. The one with more digits is usually the largest.',
      hintLargestNeg: 'They are all negative. The one closest to zero is the largest.',
      hintOrder: 'Find the smallest number in the list first. Which row puts it at the start?',
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
    },

    level: {
      simple: { name: 'Simple negatives', detail: 'From −1 to −9.' },
      round: { name: 'Round negatives', detail: '−10, −30, −200, −500…' },
      lessRound: { name: 'Less round negatives', detail: '−110, −120, −220, −1100…' },
      all: { name: 'All negatives', detail: 'Any negative number.' }
    },

    concept: {
      1: { title: 'Below zero', text: 'Negative numbers are on the left of zero. They are less than zero.' },
      2: { title: 'Further away, smaller', text: 'Among negatives, the one furthest from zero is the smallest. −9 is less than −2.' },
      3: { title: 'More digits, further away', text: 'If a negative has more digits, it is further from zero. So −100 is less than −20.' },
      4: { title: 'The < sign', text: 'The < sign is like a beak that always points to the smaller number. In −30 < −5, the beak points to −30.' },
      5: { title: 'Zero in the middle', text: 'Any negative is less than zero, and zero is less than any positive number.' }
    },

    real: {
      thermometer: 'Thermometer: −10 °C shows a lower temperature than −2 °C.',
      parking: 'Car park: basement −3 is at a lower level than −1.'
    }
  }, 'en');
})();
