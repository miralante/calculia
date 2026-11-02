/* ============================================================
   Calculia — Problemas de multiplicar.
   The six problems are in data.js and their texts in
   strings.<locale>.js. The shared engine (assets/js/word-problems.js)
   shows them, scores them and ends the round.
   ============================================================ */
(function () {
  'use strict';

  App.wordProblems.setup({
    toolId: 'word-multiply',
    buildRound: function () {
      return App.utils.shuffle(DATA.problems.slice());
    }
  });
})();
