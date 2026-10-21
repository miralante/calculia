/* ============================================================
   Calculia — Ordering fractions: texts (EN).
   Language file, loaded from index.html. Same keys as strings.es.js.
   Fractions are written as 1/2, 3/4… The engine compares their value,
   never how they are written.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🍰 Ordering fractions',
    instructionIntro: 'See how fractions are compared.',
    realTitle: 'Fractions are in real life.',
    transfer: 'You use it to tell which part of a pizza, a cake or an hour is bigger.',

    ui: {
      prev: 'Previous',
      next: 'Next',
      conceptCount: '{i} of {n}',
      introContinue: 'See real examples →',
      realContinue: 'Start practising →',
      check: 'Check',
      newRound: 'Another round →',
    },

    /* Questions. {a}, {b}, {rel} are filled in by the engine. The
       comparison is the only question type of this activity. */
    q: {
      promptCompare: 'Which sign goes between the two fractions?',
      relLess: 'less than',
      relGreater: 'greater than',
      relEqual: 'equal to',
      compareAria: 'Two fractions: {a} and {b}. Which sign goes between them?',
      explainCompare: '{a} is {rel} {b}.',
      hintCompare: '🤔 Look at which fraction has a bigger part of the whole. With the same denominator, the one with more parts wins.',
    },

    level: {
      halves: { name: 'Halves and quarters', detail: '1/2 · 1/4 · 3/4…' },
      thirds: { name: 'Thirds and sixths', detail: '1/3 · 2/6 · 5/6…' },
      eighths: { name: 'Eighths and fifths', detail: '1/8 · 2/5 · 7/10…' },
      all: { name: 'All fractions', detail: 'Any fraction smaller than one whole.' }
    },

    concept: {
      1: { title: 'The denominator', text: 'In 1/4, the 4 says how many equal parts the whole is cut into. The more parts, the smaller each one: 1/2 is bigger than 1/4, and 1/4 is bigger than 1/8.' },
      2: { title: 'Same numerator', text: 'If both have the same numerator, the one with bigger parts wins. 2/3 is bigger than 2/5, because a third is bigger than a fifth.' },
      3: { title: 'Same denominator', text: 'If both have the same denominator, compare the numerators. 1/4 is smaller than 3/4, because it has fewer parts.' },
      4: { title: 'Equal fractions', text: '1/2 and 2/4 are the same amount. Two quarters make one half, so 1/2 = 2/4.' }
    },

    real: {
      pizza: 'Pizza: 1/3 of a pizza is less than 1/2 of a pizza.',
      cake: 'Cake: 3/4 of a cake is more than 1/2 of a cake.',
      hour: 'Time: 1/4 of an hour is 15 minutes; 1/2 an hour is 30 minutes.',
      bottle: 'Bottles: 5/6 of a bottle is more than 1/2 a bottle.'
    }
  }, 'en');
})();
