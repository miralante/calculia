/* ============================================================
   Calculia — Divisibility: texts (EN)
   Locale-specific file. Loaded from index.html.
   Short sentences, one idea per sentence (UNE 153101). The numbers that
   change in the games go between braces: {n}, {d}, {q}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✅ Divisibility',
    btnMenu: 'Back to the start',

    ui: {
      visualAria: 'Divisions that show whether they come out exact.',
      divChoice: '÷ {d}',
      lineExact: '{n} ÷ {d} = {q}',
      lineRest: '{n} ÷ {d} = {q}, {r} left over',
      exactTag: 'comes out exact',
      restTag: '{r} left over',
      teacherStart: 'I choose {n}. You choose a divisor: 2, 3, 5 or 10.',
      teacherNext: 'I choose another number',
      digitsInstruction: 'Add the digits of {n}.',
      digitsResult: '{parts} = {s}',
      ballsInstruction: '{n} balls in groups of {d}.',
      groupFull: '✔ full group',
      ballsLeft: '{r} left over',
      calcSum: '{n} ÷ {d} =',
      calcNoDecimals: 'no decimals: divides exactly',
      calcHasDecimals: 'with decimals: does not divide exactly',
      decimalSep: '.',
      ruleCard2: 'Rule for 2: if it ends in 0, 2, 4, 6 or 8, it divides exactly by 2.',
      ruleCard3: 'Rule for 3: if the sum of its digits divides exactly by 3, the number does too.',
      ruleCard5: 'Rule for 5: if it ends in 0 or 5, it divides exactly by 5.',
      ruleCard10: 'Rule for 10: if it ends in 0, it divides exactly by 10.'
    },

    /* The explanation: one idea per slide. The games of each rule are in the practice (data.js and app.js). */
    intro: {
      1: { title: 'Divisible: it comes out exact', text: '12 ÷ 3 = 4: nothing is left over. So 12 is divisible by 3.' },
      2: { title: 'Not divisible: something is left over', text: '13 ÷ 3 = 4 with 1 left over. That 1 is the remainder. So 13 is not divisible by 3.' },
      3: { title: 'The calculator: check for decimals', text: 'Divide with the calculator. If the screen shows a number with no decimals, it is divisible. If it shows decimals, it is not.' },
      4: { title: 'Rule for 2: ends in an even digit', text: 'If it ends in 0, 2, 4, 6 or 8, it divides exactly by 2. I choose a number and you choose the divisor: I tell you if it comes out exact.' },
      5: { title: 'Rule for 3: add the digits', text: 'Add the digits: if the sum divides exactly by 3, the number does too. I choose a number and you choose the divisor.' },
      6: { title: 'Rule for 5: ends in 0 or 5', text: 'If it ends in 0 or 5, it divides exactly by 5. I choose a number and you choose the divisor.' },
      7: { title: 'Rule for 10: ends in 0', text: 'If it ends in 0, it divides exactly by 10. I choose a number and you choose the divisor.' },
      8: { title: 'If the sum is not divisible by 3, neither is the number', text: 'Add the digits of 14: 1 + 4 = 5. Since 5 is not divisible by 3, 14 is not divisible by 3.' },
      9: { title: 'What is left over is the remainder', text: '13 ÷ 5 = 2 with 3 left over. That 3 is the remainder: it does not fill a group of 5.' }
    },

    /* The games: the answers of the rule each one puts in place. */
    q: {
      rule: {
        sumExplain: 'The digits of {n} are {a} and {b}: {a} + {b} = {s}.',
        div3Yes: '{s} ÷ 3 = {q3}: nothing is left over.',
        div3No: '{s} ÷ 3 = {q3} with {r} left over.',
        check: {
          2: { yes: '{c} is even.', no: '{c} is odd.' },
          5: { yes: '{c} is 0 or 5.', no: '{c} is neither 0 nor 5.' },
          10: { yes: '{c} is 0.', no: '{c} is not 0.' }
        }
      },
      yesno: {
        yes: '{n} ÷ {d} = {q}: nothing is left over. It divides exactly.',
        no: '{n} ÷ {d} = {q} with {r} left over. It does not divide exactly.'
      }
    }
  }, 'en');
})();
