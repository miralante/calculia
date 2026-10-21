/* ============================================================
   Calculia — Ordering decimals: data.

   From the roundest decimals to the least round ones: first the
   halves (1,0 · 1,5 · 2,5), then tenths (1,3 · 0,7), then the
   hundredths that end in 0 or 5 (1,25 · 0,75), then any decimal
   with two digits. A level opens when the one before it has a round
   finished.
   Names and texts are in strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  levels: [
    { id: 'halves', name: 'level.halves.name', detail: 'level.halves.detail',
      pool: { kind: 'halves', sign: 1 },
      types: ['compare'] },
    { id: 'tenths', name: 'level.tenths.name', detail: 'level.tenths.detail',
      pool: { kind: 'tenths', sign: 1 },
      pools: [{ kind: 'halves', sign: 1 }, { kind: 'tenths', sign: 1 }],
      types: ['compare'] },
    { id: 'roundHundredths', name: 'level.roundHundredths.name', detail: 'level.roundHundredths.detail',
      pool: { kind: 'roundHundredths', sign: 1 },
      pools: [{ kind: 'tenths', sign: 1 }, { kind: 'roundHundredths', sign: 1 }],
      types: ['compare'] },
    { id: 'all', name: 'level.all.name', detail: 'level.all.detail',
      pool: { kind: 'hundredths', sign: 1 },
      pools: [{ kind: 'roundHundredths', sign: 1 }, { kind: 'hundredths', sign: 1 }],
      types: ['compare'] }
  ],

  concepts: [
    { title: 'concept.1.title', text: 'concept.1.text',
      visual: { kind: 'chips', dec: 2, values: [3.47] } },
    { title: 'concept.2.title', text: 'concept.2.text',
      visual: { kind: 'line', from: 2, to: 3, step: 0.5, dec: 1, marks: [2.5] } },
    { title: 'concept.3.title', text: 'concept.3.text',
      visual: { kind: 'chips', dec: 1, values: [3.9, 4.1] } },
    { title: 'concept.4.title', text: 'concept.4.text',
      visual: { kind: 'chips', dec: 1, values: [3.4, 3.7] } },
    { title: 'concept.5.title', text: 'concept.5.text',
      visual: { kind: 'chips', dec: 2, values: [2.46, 2.49] } }
  ],

  examples: [
    { emoji: '⏱️', caption: 'real.race' },
    { emoji: '💶', caption: 'real.price' },
    { emoji: '⚖️', caption: 'real.weight' },
    { emoji: '🥛', caption: 'real.milk' }
  ]
};
