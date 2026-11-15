/* ============================================================
   Calculia — Divisibility: texts (EN)
   Locale-specific file. Loaded from index.html.
   Short sentences, one idea per sentence (UNE 153101). The numbers that
   change in the questions go between braces: {n}, {d}, {q}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✅ Divisibility',
    btnMenu: 'Back to the start',

    ui: {
      nextStep: 'Next step',
      stepOf: 'Step {i} of {n}',
      visualAria: 'Drawing of dots shared into groups.',
      yes: 'Yes',
      no: 'No',
      divInstruction: 'Share {T} balls into groups of {d}.',
      divChoice: '÷ {d}',
      divOne: 'Make a group of {d}',
      divReset: 'Start again',
      divWhole: '{T} ÷ {d} = {q}. Nothing is left over: it divides exactly.',
      divRest: '{T} ÷ {d} = {q} with {r} left over: it does not divide exactly.',
      tapInstruction: 'Tap the numbers that divide exactly by {d}.',
      tapYes: '{n} ÷ {d} = {q}: nothing is left over.',
      tapNo: '{n} ÷ {d} = {q} with {r} left over.',
      digitsInstruction: 'Add the digits of {n}.',
      digitsSum: 'Add the digits',
      digitsResult: '{parts} = {s}',
      digitsAsk: 'Now check whether {s} divides by 3.'
    },

    /* The explanation: one idea per slide. The practice is on the right (data.js and app.js). */
    intro: {
      1: { title: 'Divisible: nothing is left over', text: '12 divided by 3: you get 4 groups and nothing is left over. So 12 is divisible by 3.' },
      2: { title: 'Not divisible: something is left over', text: '13 divided by 3: you get 4 groups and 1 is left over. That 1 is the remainder. So 13 is not divisible by 3.' },
      3: { title: 'Divisible by 2: ends in an even digit', text: 'The even digits are 0, 2, 4, 6 and 8. 14 ends in 4, so it divides exactly by 2.' },
      4: { title: 'Divisible by 5: ends in 0 or 5', text: '15 ends in 5, so it divides exactly by 5. If it ends in another digit, it does not.' },
      5: { title: 'Divisible by 10: ends in 0', text: '30 ends in 0, so it divides exactly by 10. If it ends in another digit, it does not.' },
      6: { title: 'Divisible by 3: add the digits', text: 'Add the digits of 12: 1 + 2 = 3. 3 divides exactly by 3. So 12 is divisible by 3.' },
      7: { title: 'If the sum is not divisible by 3, neither is the number', text: 'Add the digits of 14: 1 + 4 = 5. Since 5 is not divisible by 3, 14 is not divisible by 3.' },
      8: { title: 'What is left over is the remainder', text: '13 balls in packs of 5: 2 packs are full. 3 balls are left over. That 3 is the remainder: it does not fill a pack.' }
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
      /* The rules, step by step: each step is a question with its hint and its explanation. */
      rule: {
        lastPrompt: 'Look at the last digit of {n}. Which digit is it?',
        lastHint: '🤔 The last digit is the one on the right of the number.',
        lastExplain: 'The last digit of {n} is {c}.',
        sumPrompt: 'Add the digits of {n}. What do they add up to?',
        sumHint: '🤔 Add the first digit to the second one.',
        sumExplain: 'The digits of {n} are {a} and {b}: {a} + {b} = {s}.',
        div3Prompt: 'Does {s} divide exactly by 3?',
        div3Hint: '🤔 Divide by 3 and check if anything is left over.',
        div3Yes: '{s} ÷ 3 = {q3}: nothing is left over.',
        div3No: '{s} ÷ 3 = {q3} with {r} left over.',
        check: {
          2: { prompt: 'Is the digit {c} even?', hint: '🤔 The even digits are 0, 2, 4, 6 and 8.', yes: '{c} is even.', no: '{c} is odd.' },
          5: { prompt: 'Is the digit {c} 0 or 5?', hint: '🤔 Check if the digit is 0 or 5.', yes: '{c} is 0 or 5.', no: '{c} is neither 0 nor 5.' },
          10: { prompt: 'Is the digit {c} 0?', hint: '🤔 Only a zero counts here.', yes: '{c} is 0.', no: '{c} is not 0.' }
        },
        finalPrompt: 'Does {n} divide exactly by {d}?',
        finalHint: '🤔 Think about what you found in the steps before.',
        finalYes: 'So {n} divides exactly by {d}.',
        finalNo: 'So {n} does not divide exactly by {d}.'
      }
    }
  }, 'en');
})();
