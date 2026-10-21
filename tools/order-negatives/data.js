/* ============================================================
   Calculia — Ordering negatives: data.

   Only negative numbers. Same graduation as the positive activity:
   a single digit first, then round numbers, then less round ones,
   then any negative number. The more digits a negative has, the
   further it is from zero and the smaller it is: that is the rule
   the explanation slides build.
   Names and texts are in strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  levels: [
    { id: 'simple', name: 'level.simple.name', detail: 'level.simple.detail',
      pool: { kind: 'single', sign: -1 },
      types: ['compare'] },
    { id: 'round', name: 'level.round.name', detail: 'level.round.detail',
      pool: { kind: 'round', sign: -1 },
      pools: [{ kind: 'single', sign: -1 }, { kind: 'round', sign: -1 }],
      types: ['compare'] },
    { id: 'lessRound', name: 'level.lessRound.name', detail: 'level.lessRound.detail',
      pool: { kind: 'lessRound', sign: -1 },
      pools: [{ kind: 'round', sign: -1 }, { kind: 'lessRound', sign: -1 }],
      types: ['compare'] },
    { id: 'all', name: 'level.all.name', detail: 'level.all.detail',
      pool: { kind: 'any', sign: -1 },
      pools: [{ kind: 'lessRound', sign: -1 }, { kind: 'any', sign: -1 }],
      types: ['compare'] }
  ],

  concepts: [
    { title: 'concept.1.title', text: 'concept.1.text',
      visual: { kind: 'line', from: -5, to: 5, step: 1, dec: 0, marks: [-3] } },
    { title: 'concept.2.title', text: 'concept.2.text',
      visual: { kind: 'chips', dec: 0, values: [-9, -2] } },
    { title: 'concept.3.title', text: 'concept.3.text',
      visual: { kind: 'chips', dec: 0, values: [-100, -20] } },
    { title: 'concept.4.title', text: 'concept.4.text',
      visual: { kind: 'chips', dec: 0, values: [-30, -5] } },
    { title: 'concept.5.title', text: 'concept.5.text',
      visual: { kind: 'line', from: -3, to: 3, step: 1, dec: 0, marks: [-2, 2] } }
  ],

  examples: [
    { emoji: '🌡️', caption: 'real.thermometer' },
    { emoji: '🏢', caption: 'real.parking', column: { values: [2, 1, 0, -1, -2, -3], mark: -3, ground: 0 } }
  ]
};
