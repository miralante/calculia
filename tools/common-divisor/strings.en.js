/* ============================================================
   Calculia — Greatest common divisor texts (EN)
   Language-specific file. Same keys as strings.es.js.
   Loaded from index.html according to App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔗 Greatest common divisor',
    instructionIntro: 'Read the explanation.',
    introContinue: 'Start practising →',
    intro: {
      title: 'Greatest common divisor',
      text: 'It is the biggest number that divides two numbers at the same time, with nothing left over. For example, for 12 and 18: the divisors of 12 are 1, 2, 3, 4, 6 and 12. The divisors of 18 are 1, 2, 3, 6, 9 and 18. The ones in both lists are 1, 2, 3 and 6. The biggest is 6.'
    },
    check: 'Check',
    newRound: 'Another round →',
    btnMenu: 'Back to start',
    hint: '🤔 Try again. Think about the divisors.',
    gen: {
      prompt: 'What is the greatest common divisor of {a} and {b}?',
      hint: '🤔 Write the divisors of {a} and of {b}. Find the biggest one that is in both lists.'
    }
  }, 'en');
})();
