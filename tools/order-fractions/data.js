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
      visual: { kind: 'chips', labels: ['1/2', '1/4', '1/8'], values: [60, 30, 15] } },
    { title: 'concept.2.title', text: 'concept.2.text',
      visual: { kind: 'chips', labels: ['2/3', '2/5'], values: [80, 48] } },
    { title: 'concept.3.title', text: 'concept.3.text',
      visual: { kind: 'chips', labels: ['1/4', '3/4'], values: [30, 90] } },
    { title: 'concept.4.title', text: 'concept.4.text',
      visual: { kind: 'chips', labels: ['1/2', '2/4'], values: [60, 60] } }
  ],

  examples: [
    { emoji: '🍕', caption: 'real.pizza' },
    { emoji: '🎂', caption: 'real.cake' },
    { emoji: '⏱️', caption: 'real.hour' },
    { emoji: '🍾', caption: 'real.bottle' }
  ]
};
