/* ============================================================
   Calculia — Least common multiple: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change are
   in braces: {a}, {b}, {m}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Least common multiple',
    btnMenu: 'Back to the start',

    ui: {
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      visualAria: 'Drawing of numbers or objects that shows the multiples.',
      seeReal: 'See real examples →',
      realLabel: 'Real-life examples',
      startTest: 'Start practising →',
      review: '← Review the explanation',
      multiplesOf: 'Multiples of {n}:',
      packs: '{c} packs of {s} = {m}',
      right: '✅ Well done!',
      roundDone: 'You have finished the round: {n} of {total} right the first time. You now have {stars} stars.'
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'The least common multiple (LCM)', text: 'It is the smallest number that is in both lists of multiples. It is the first one where they meet.' },
      2: { title: 'Full packs of both sizes', text: '12 pencils can be put into packs of 4 and into packs of 6, with none left over. So the least common multiple (LCM) of 4 and 6 is 12.' },
      3: { title: 'Find the first one that repeats', text: 'The multiples of 6 are 6, 12, 18 and 24. The multiples of 8 are 8, 16 and 24. The first one in both lists is 24.' },
      4: { title: 'If one is a multiple of the other, the least common multiple (LCM) is the bigger one', text: '6 is a multiple of 3. So the least common multiple (LCM) of 3 and 6 is 6.' }
    },

    /* Real-life examples: one situation per screen. */
    real: {
      1: 'A bus leaves every 4 minutes and another every 6. Both leave at the same time at 12 minutes. After that, they meet again every 12 minutes.',
      2: 'You have boxes of 6 eggs and boxes of 8 eggs. You want a number of eggs that fills full boxes of both kinds. It is 24: 4 boxes of 6 or 3 boxes of 8.',
      3: 'A red light turns on every 6 seconds and a blue one every 9. Both turn on at the same time at 18 seconds.'
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      lcm: {
        prompt: 'What is the least common multiple of {a} and {b}?',
        hint: '🤔 Write the first multiples of {a} and of {b}. Find the first one that is in both lists.',
        explain: 'Multiples of {a}: {la}. Multiples of {b}: {lb}. The first one in both lists is {m}.'
      },
      story: {
        prompt: 'You have packs of {a} sweets and packs of {b} sweets. What is the smallest number of sweets that fills full packs of both kinds?',
        hint: '🤔 Find the first number you reach when you count up by {a} and by {b}.'
      },
      common: {
        prompt: 'Which of these numbers is a multiple of {a} and of {b}?',
        hint: '🤔 Check whether the number comes up when you count by {a}, and also when you count by {b}.',
        explain: '{m} is a multiple of {a} and of {b}. It is the first one in both lists.'
      }
    }
  }, 'en');
})();
