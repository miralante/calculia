/* ============================================================
   Calculia — Factorial Numbers: texts (EN)
   Language-specific file. Loaded from index.html.
   Short sentences, one idea per sentence (easy read). The numbers that
   change in the questions go between braces: {n}, {T}, {chain}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '❗ Factorial Numbers',
    instruction: 'Learn what the sign "!" means.',
    btnMenu: 'Back to start',

    /* What it is for, outside the app (SPEC §3.6, key context). */
    contextTitle: 'What it is for',
    context: 'Factorials count the different ways things can be put in order.',

    ui: {
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      seeReal: 'See real examples →',
      startTest: 'Start practising →',
      reviewRule: 'Review the rule',
      backToPractice: 'Back to practice →',
      realLabel: 'Real-life examples',
      roundDone: 'Round finished: {n} of {total} right the first time. You have {stars} ⭐.',
      visualAria: 'Drawing that explains factorials with numbers and boxes.',
      noRest: 'Every division comes out exact: nothing is left over.',
      hintPrefix: '💡 ',
      wrongPrefix: 'Look at how it is solved. '
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

    /* Practice: question, hint (first miss), explanation. */
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
    },

    /* Closing: summary, what was practised, and the transfer sentence (SPEC §3.8). */
    recap: 'Remember: 4! = 4 × 3 × 2 × 1 = 24, and 0! = 1.',
    transfer: 'Factorials count the ways to put things in order: in a line, on a shelf or on a bench.'
  }, 'en');
})();
