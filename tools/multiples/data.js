/* ============================================================
   Calculia — Múltiplos — datos
   Explanation: one slide per idea. Each slide has a drawing (`visual`):
   `groups` (equal groups and their product), `ladder` (the first multiples
   of a number, one row each) or `pack` (a total shared in rows of `size`,
   with what is left over). The texts are in strings.<locale>.js
   (intro.<n>.title and intro.<n>.text).
   Test: each round mixes the `questions` types, `perRound` questions.
   `numbers` are the numbers the test asks about.
   ============================================================ */
var DATA = {
  perRound: 6,
  numbers: [2, 3, 4, 5, 6, 7, 8, 9],
  questions: ['pick', 'first', 'yesno', 'next'],

  intro: [
    { visual: { kind: 'groups', each: 4, count: 3 } },
    { visual: { kind: 'ladder', each: 2, count: 5 } },
    { visual: { kind: 'ladder', each: 3, count: 4 } },
    { visual: { kind: 'ladder', each: 4, count: 4 } },
    { visual: { kind: 'ladder', each: 5, count: 4 } },
    { visual: { kind: 'groups', each: 7, count: 1 } },
    { visual: { kind: 'pack', total: 13, size: 4 } }
  ]
};
