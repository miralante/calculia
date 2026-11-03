/* ============================================================
   Calculia — Divisibility: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the questions are in braces: {n}, {d}, {q}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✅ Divisibility',
    btnMenu: 'Back to the start',

    ui: {
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      visualAria: 'Drawing of dots shared into groups.',
      division: '{T} ÷ {d} = {q}',
      remainder: '{r} left over',
      yes: 'Yes',
      no: 'No',
      right: '✅ Well done!',
      review: '← Review the explanation',
      startTest: 'Start practising →',
      roundDone: 'You have finished the round: {n} of {total} right the first time. You now have {stars} stars.'
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'Divisible: nothing is left over', text: '12 divided by 3: you get 4 groups and nothing is left over. So 12 is divisible by 3.' },
      2: { title: 'Not divisible: something is left over', text: '13 divided by 3: you get 4 groups and 1 is left over. So 13 is not divisible by 3.' },
      3: { title: 'Divisible by 2: ends in an even digit', text: 'The even digits are 0, 2, 4, 6 and 8. 14 ends in 4, so it divides exactly by 2.' },
      4: { title: 'Divisible by 5: ends in 0 or 5', text: '15 ends in 5, so it divides exactly by 5. If it ends in another digit, it does not.' },
      5: { title: 'Divisible by 10: ends in 0', text: '30 ends in 0, so it divides exactly by 10. If it ends in another digit, it does not.' },
      6: { title: 'Divisible by 3: add the digits', text: 'Add the digits of 12: 1 + 2 = 3. Since 3 divides exactly by 3, 12 does too.' },
      7: { title: 'If the sum is not divisible by 3, neither is the number', text: 'Add the digits of 14: 1 + 4 = 5. Since 5 is not divisible by 3, 14 is not divisible by 3.' }
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      pick: {
        prompt: 'Choose the number that divides exactly by {d}.',
        hint: '🤔 Use the rule for {d}, or divide. Is anything left over?',
        explain: '{n} divides exactly by {d}: nothing is left over.'
      },
      yesno: {
        prompt: 'Does {n} divide exactly by {d}?',
        hint: '🤔 Divide and check if anything is left over.',
        yes: '{n} ÷ {d} = {q}: nothing is left over. It divides exactly.',
        no: '{n} ÷ {d} = {q} with {r} left over. It does not divide exactly.'
      },
      sum: {
        prompt: 'Add the digits of {n}. Does it divide exactly by 3?',
        hint: '🤔 Add the digits one by one. Does that total divide by 3?',
        yes: 'The digits add up to {s}. {s} divides by 3, so {n} divides exactly by 3.',
        no: 'The digits add up to {s}. {s} does not divide by 3, so {n} does not divide exactly by 3.'
      },
      rest: {
        prompt: 'How much is left over when you divide {n} by {d}?',
        hint: '🤔 Find the multiple of {d} just below {n}, without going over.',
        explain: '{n} ÷ {d} = {q}, with {r} left over.',
        none: '{n} ÷ {d} = {q}: nothing is left over.'
      }
    }
  }, 'en');
})();
