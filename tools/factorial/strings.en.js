/* ============================================================
   Calculia — Factorials: texts (EN)
   Language-specific file. Loaded from index.html.
   Short sentences, one idea per sentence (easy read). The numbers that
   change in the questions go between braces: {n}, {T}, {chain}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '❗ Factorials',
    instruction: 'What the sign "!" means, and what it is for.',
    btnMenu: 'Back to start',

    ui: {
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      seeReal: 'See real examples →',
      startTest: 'Start practising →',
      realLabel: 'Real-life examples',
      right: '✅ Well done!',
      roundDone: 'Round finished: {n} of {total} right the first time. You have {stars} ⭐.',
      visualAria: 'Drawing that explains factorials with numbers and boxes.',
      noRest: 'Every division comes out exact: nothing is left over.'
    },

    /* Explanation in slides with a drawing. */
    intro: {
      1: { title: 'What is a factorial?', text: '4! is read «4 factorial». It means 4 × 3 × 2 × 1. The result is 24.' },
      2: { title: 'It grows very fast', text: '1! = 1, 2! = 2, 3! = 6, 4! = 24, 5! = 120. Each step multiplies by one more number. By agreement, 0! = 1.' },
      3: { title: 'It helps with divisibility', text: '5! = 120. 120 divides exactly by 1, 2, 3, 4 and 5: nothing is left over. That is why factorials help us understand divisibility.' }
    },

    /* Real-life examples. */
    real: {
      1: '3 friends line up for a photo. There are 6 different ways to stand.',
      2: 'You have 4 books for one shelf. You can put them in 24 different orders.',
      3: '5 friends sit on a bench. There are 120 different ways to sit.'
    },

    /* The test: one question at a time. */
    q: {
      value: {
        prompt: 'How much is {n}!?',
        hint: 'Multiply, do not add. Keep going down to 1.',
        explain: '{chain} = {T}.'
      },
      meaning: {
        prompt: 'What does {n}! mean?',
        hint: 'The sign ! means: multiply from that number down to 1.',
        explain: '{n}! = {chain}.'
      },
      slots: {
        prompt: 'In how many ways can {n} friends stand in a line?',
        hint: 'The first place has {n} choices. The next one has one less. Keep going to the last place.',
        explain: '{chain} = {T} ways.'
      },
      divides: {
        prompt: 'Which of these numbers divides {n}! exactly?',
        hint: 'Divide {T} by each number. The one that leaves nothing over is the answer.',
        explain: '{T} ÷ {k} = {g}, nothing left over.'
      }
    }
  }, 'en');
})();
