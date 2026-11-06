/* ============================================================
   Calculia — Least common multiple: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change are
   in braces: {a}, {b}, {m}… Says "counting up by 4" when it can.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Least common multiple',
    btnMenu: 'Back to the start',

    ui: {
      visualAria: 'Drawing of numbers or objects that shows the jumps when counting.',
      realLabel: 'Real-life examples',
      multiplesOf: 'Counting up by {n}:',
      packs: '{c} packs of {s} = {m}',
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'The least common multiple (LCM)', text: 'It is the first number you reach when you count up by 4 and also when you count up by 6.' },
      2: { title: 'Full packs of both sizes', text: '12 pencils fit into packs of 4 and into packs of 6, with none left over. The LCM of 4 and 6 is 12.' },
      3: { title: 'Count up to the first one that matches', text: 'Counting up by 6: 6, 12, 18, 24. Counting up by 8: 8, 16, 24. The first one that comes up in both is 24.' },
      4: { title: 'If you reach one by counting up by the other, the LCM is the bigger one', text: 'You reach 6 when you count up by 3. So the LCM of 3 and 6 is 6.' }
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
        prompt: 'What is the LCM of {a} and {b}?',
        hint: '🤔 Count up by {a} and by {b}. Which number comes up in both?',
        explain: 'The first number you reach counting up by {a} and by {b} is {m}.'
      },
      story: {
        prompt: 'You have packs of {a} sweets and packs of {b} sweets. What is the smallest number of sweets that fills full packs of both kinds?',
        hint: '🤔 Count up by {a} and by {b}. Which is the first one that matches?'
      },
      common: {
        prompt: 'Which of these numbers comes up when you count up by {a} and also by {b}?',
        hint: '🤔 Check whether the number comes up when you count up by {a}, and also when you count up by {b}.',
        explain: '{m} comes up when you count up by {a} and by {b}. It is the first one that matches.'
      }
    }
  }, 'en');
})();
