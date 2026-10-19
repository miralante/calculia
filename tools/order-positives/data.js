/* ============================================================
   Calculia — Ordering numbers (positives): data.

   levels: from the simplest to any number. Each level says which
   numbers it draws (`pool`, see assets/js/number-sort.js) and which
   question types it asks (`types`). A level opens when the one before
   it has a round finished, so the practice goes up one step at a time.

   concepts: the explanation slides, one rule each. `visual` is either
   a row of chips ('chips') or a number line ('line').
   examples: everyday cases of the same comparison.
   Names and texts are in strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  levels: [
    { id: 'simple', name: 'level.simple.name', detail: 'level.simple.detail',
      pool: { kind: 'single', sign: 1 },
      types: ['smallest', 'largest'] },
    { id: 'round', name: 'level.round.name', detail: 'level.round.detail',
      pool: { kind: 'round', sign: 1 },
      types: ['smallest', 'largest', 'order'] },
    { id: 'lessRound', name: 'level.lessRound.name', detail: 'level.lessRound.detail',
      pool: { kind: 'lessRound', sign: 1 },
      types: ['smallest', 'largest', 'order', 'between'] },
    { id: 'all', name: 'level.all.name', detail: 'level.all.detail',
      pool: { kind: 'any', sign: 1 },
      types: ['smallest', 'largest', 'order', 'between', 'missing'] }
  ],

  concepts: [
    { title: 'concept.1.title', text: 'concept.1.text',
      visual: { kind: 'chips', dec: 0, values: [9, 10, 100] } },
    { title: 'concept.2.title', text: 'concept.2.text',
      visual: { kind: 'chips', dec: 0, values: [213, 301] } },
    { title: 'concept.3.title', text: 'concept.3.text',
      visual: { kind: 'chips', dec: 0, values: [245, 263] } },
    { title: 'concept.4.title', text: 'concept.4.text',
      visual: { kind: 'line', from: 0, to: 10, step: 1, dec: 0, marks: [2, 5, 9] } }
  ],

  examples: [
    { emoji: '🏷️', caption: 'real.price' },
    { emoji: '🏠', caption: 'real.house' },
    { emoji: '🏆', caption: 'real.score' },
    { emoji: '📚', caption: 'real.pages' }
  ]
};
