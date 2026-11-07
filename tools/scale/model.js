/* ============================================================
   Calculia — Scale: the round helpers, the options and the units.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Utilities ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* Four different options: the right one and three that come out of the
     same instrument. A repeated wrong answer would make "the correct
     answer" not one, so duplicates are dropped and the fourth is taken
     further along the scale. */
  function optionsFor(correct, wrongs, unit) {
    var values = [correct];
    var pool = wrongs.slice();
    var extra = 1;
    while (values.length < 4) {
      var candidate = null;
      if (pool.length) {
        candidate = pool.shift();
      } else {
        extra += 1;
        candidate = correct + extra;
      }
      if (candidate !== null && candidate > 0 && values.indexOf(candidate) === -1) {
        values.push(candidate);
      }
    }
    var suffix = ' ' + unit;
    return App.utils.shuffle(values).map(function (v) {
      return { html: v + suffix, aria: v + suffix, correct: v === correct };
    });
  }

  /* The numbers printed on each side of the reached mark: the label to
     its left and the label to its right. When the mark IS a label the
     neighbours are one label further out, which is the pair a person
     actually reads by mistake. */
  function labelNeighbours(nv, value) {
    var off = value - nv.from;
    var isLabel = (off % nv.labelEvery) === 0;
    var left = isLabel
      ? value - nv.labelEvery
      : nv.from + Math.floor(off / nv.labelEvery) * nv.labelEvery;
    var right = isLabel ? value + nv.labelEvery : left + nv.labelEvery;
    return { left: left, right: right };
  }

  /* Words for the unit in the question text: "¿cuántos metros?" needs the
     word, while the rule and the options carry the symbol. */
  function unitWord(symbol) {
    if (symbol === 'km') return App.i18n.t('gen.unitKm');
    if (symbol === 'm') return App.i18n.t('gen.unitMetre');
    return App.i18n.t('gen.unitCentimetre');
  }

  App.ScaleModel = {
    labelNeighbours: labelNeighbours,
    optionsFor: optionsFor,
    unitWord: unitWord
  };
})();
