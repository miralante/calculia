/* ============================================================
   Calculia — Ordering fractions: data.

   Proper fractions, from the simplest (halves and quarters) to any
   denominator up to twelfths. A level opens when the one before it has a
   round finished. The values themselves are drawn in assets/js/number-sort.js
   (kinds fracHalvesQuarters … fracAny).
   Names and texts are in strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  levels: [
    { id: 'halves', name: 'level.halves.name', detail: 'level.halves.detail',
      pool: { kind: 'fracHalvesQuarters', sign: 1 },
      types: ['compare'] },
    { id: 'thirds', name: 'level.thirds.name', detail: 'level.thirds.detail',
      pool: { kind: 'fracThirdsSixths', sign: 1 },
      pools: [{ kind: 'fracHalvesQuarters', sign: 1 }, { kind: 'fracThirdsSixths', sign: 1 }],
      types: ['compare'] },
    { id: 'eighths', name: 'level.eighths.name', detail: 'level.eighths.detail',
      pool: { kind: 'fracEighthsTenths', sign: 1 },
      pools: [{ kind: 'fracThirdsSixths', sign: 1 }, { kind: 'fracEighthsTenths', sign: 1 }],
      types: ['compare'] },
    { id: 'all', name: 'level.all.name', detail: 'level.all.detail',
      pool: { kind: 'fracAny', sign: 1 },
      pools: [{ kind: 'fracEighthsTenths', sign: 1 }, { kind: 'fracAny', sign: 1 }],
      types: ['compare'] }
  ],

  /* The values are in 120ths of a whole: 1/2 is 60, 1/4 is 30, 1/8 is 15. */
  concepts: [
    { title: 'concept.1.title', text: 'concept.1.text',
      visual: { kind: 'pies', fractions: [[1, 8], [1, 4], [1, 2]], labels: ['1/8', '1/4', '1/2'] } },
    { title: 'concept.2.title', text: 'concept.2.text',
      visual: { kind: 'pies', fractions: [[2, 5], [2, 3]], labels: ['2/5', '2/3'] } },
    { title: 'concept.3.title', text: 'concept.3.text',
      visual: { kind: 'pies', fractions: [[1, 4], [3, 4]], labels: ['1/4', '3/4'] } },
    { title: 'concept.4.title', text: 'concept.4.text',
      visual: { kind: 'pies', fractions: [[1, 2], [2, 4]], labels: ['1/2', '2/4'], signs: ['eq'] } }
  ],

  examples: [
    { emoji: '🍕', caption: 'real.pizza', visual: { kind: 'pies', fractions: [[1, 3], [1, 2]], labels: ['1/3', '1/2'] } },
    { emoji: '🎂', caption: 'real.cake', visual: { kind: 'pies', fractions: [[1, 2], [3, 4]], labels: ['1/2', '3/4'] } },
    { emoji: '⏱️', caption: 'real.hour', visual: { kind: 'pies', fractions: [[1, 4], [1, 2]], labels: ['1/4', '1/2'] } },
    { emoji: '🍾', caption: 'real.bottle', visual: { kind: 'pies', fractions: [[1, 2], [5, 6]], labels: ['1/2', '5/6'] } }
  ]
};
