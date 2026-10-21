/* ============================================================
   Calculia — Ordering decimals.
   Levels, slides and examples are in data.js; the three stages and
   the questions are shared in assets/js/number-sort.js.
   ============================================================ */
(function () {
  'use strict';

  App.numberSort.setup({
    toolId: 'order-fractions',
    levels: DATA.levels,
    concepts: DATA.concepts,
    examples: DATA.examples,
    buildRound: function (level) {
      return App.utils.shuffle(App.numberSort.makeRound(level, DATA.perRound));
    }
  });
})();
