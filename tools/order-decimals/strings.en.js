/* ============================================================
   Calculia — Order decimals: texts (EN)
   Language-specific file. Loaded from index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔹 Order decimals',
    instructionIntro: 'See how decimals are compared.',
    realTitle: 'Decimals are in real life.',
    transfer: 'You use this to compare times, prices and weights with cents and tenths.',

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
      rowAria: 'Row of numbers: {row}. The gap needs a number.',
      hintSmallest: 'Look at the whole part first, the digits before the decimal point. If they are equal, compare the tenths, then the hundredths.',
      hintSmallestNeg: 'They are all negative. The one furthest from zero is the smallest.',
      hintLargest: 'Look at the whole part first, the digits before the decimal point. The one with the bigger whole part is the largest. If they tie, compare the tenths.',
      hintLargestNeg: 'They are all negative. The one closest to zero is the largest.',
      hintOrder: 'Find the number with the smallest whole part first. If they tie, look at the tenths.',
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
      halves: { name: 'Round decimals', detail: '1.0 · 1.5 · 2.0 · 2.5…' },
      tenths: { name: 'Tenths', detail: '1.3 · 0.7 · 2.6…' },
      roundHundredths: { name: 'Round hundredths', detail: '1.25 · 0.75 · 2.05…' },
      all: { name: 'All decimals', detail: 'Any decimal with two digits.' }
    },

    concept: {
      1: { title: 'The point separates', text: 'The decimal point separates the whole part from the decimal part. 2.5 is in the middle, between 2 and 3.' },
      2: { title: 'Whole part first', text: 'Look first at what is before the point. 3.9 is less than 4.1, even though it has more tenths.' },
      3: { title: 'If they tie, tenths', text: 'If the whole part is the same, look at the tenths. 3.4 is less than 3.7.' },
      4: { title: 'If they tie, hundredths', text: 'If the tenths tie too, look at the hundredths. 2.46 is less than 2.49.' }
    },

    real: {
      race: 'Race: 9.85 seconds beats 9.92 seconds.',
      price: 'Prices: £1.25 is less than £1.5.',
      weight: 'Weights: 2.75 kg weighs less than 2.8 kg.',
      milk: 'Liquids: 0.5 litres is less than 0.75 litres.'
    }
  }, 'en');
})();
