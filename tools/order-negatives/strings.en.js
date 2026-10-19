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
    transfer: 'You use this to read a thermometer, the floors of a car park or how deep the sea is.',

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
      4: { title: 'Zero in the middle', text: 'Any negative is less than zero, and zero is less than any positive number.' }
    },

    real: {
      thermometer: 'Thermometer: −10 °C is colder than −2 °C.',
      parking: 'Car park: basement level −3 is lower than level −1.',
      dive: 'Diving: −30 metres is deeper than −5 metres.',
      freezer: 'Freezer: −18 °C is colder than −5 °C.'
    }
  }, 'en');
})();
