/* ============================================================
   Calculia — Least common multiple texts (EN)
   Language-specific file. Same keys as strings.es.js.
   Loaded from index.html according to App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Least common multiple',
    instructionIntro: 'Read the explanation.',
    introContinue: 'Start practising →',
    intro: {
      title: 'Least common multiple',
      text: 'It is the smallest number that is a multiple of both numbers at the same time. For example, for 4 and 6: the multiples of 4 are 4, 8, 12, 16... The multiples of 6 are 6, 12, 18... The first one in both lists is 12.'
    },
    check: 'Check',
    newRound: 'Another round →',
    btnMenu: 'Back to start',
    hint: '🤔 Try again. Think about the multiples.',
    gen: {
      prompt: 'What is the least common multiple of {a} and {b}?',
      hint: '🤔 Write the first multiples of {a} and of {b}. Find the first one that is in both lists.'
    }
  }, 'en');
})();
