/* ============================================================
   Calculia — Mínimo común múltiplo — datos
   Explanation: one slide per idea. Each slide has a drawing (`visual`):
   `lists` (the multiples of two numbers, the common ones marked, the first
   common one filled in) or `packs` (the same total in packs of each size).
   The texts are in strings.<locale>.js.
   Real life: one example at a time (`real`), same drawings.
   Test: each round mixes the `questions` types, `perRound` questions.
   `pairs` are two numbers that share a factor, so the answer is never
   simply their product.
   ============================================================ */
var DATA = {
  perRound: 6,
  questions: ['lcm', 'story', 'common'],

  intro: [
    { visual: { kind: 'lists', a: 4, b: 6 } },
    { visual: { kind: 'packs', a: 4, b: 6, icon: '✏️' } },
    { visual: { kind: 'lists', a: 6, b: 8 } },
    { visual: { kind: 'lists', a: 3, b: 6 } }
  ],

  real: [
    { visual: { kind: 'lists', a: 4, b: 6 } },
    { visual: { kind: 'packs', a: 6, b: 8, icon: '🥚' } },
    { visual: { kind: 'lists', a: 6, b: 9 } }
  ],

  pairs: [[4, 6], [6, 8], [6, 9], [4, 10], [9, 12], [10, 15], [8, 12], [6, 10], [12, 15], [4, 12]]
};
