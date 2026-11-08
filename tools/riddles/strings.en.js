/* ============================================================
   Calculia — Riddles texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧩 Riddles',
    instruction: 'Read the riddle. Then choose the answer.',
    question: 'What is it?',
    btnMenu: 'Back to start',
    endSummary: 'You won {n} {nWord}. You now have {stars} {starsWord}.',
    explicacionCorrecta: '✅ Correct! The answer is: ',
    explicacionIncorrectaA: '❌ ',
    explicacionIncorrectaB: ' is not right. The correct answer is: ',
    pista: '🤔 «{elegida}» does not fit the riddle. Read the clue again: ',
    refuerzoTitulo: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    transfer: 'This will help you think cleverly in everyday life: when a problem has a simple solution you did not expect.'
  }, 'en');
})();
