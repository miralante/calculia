/* ============================================================
   Calculia — Divisibilidad — datos
   Explanation: one slide per idea. Each slide draws `total` items shared
   in rows of `size`; the drawing writes the division under it. The texts
   are in strings.<locale>.js (intro.<n>.title and intro.<n>.text).
   Test: each round mixes the `questions` types, `perRound` questions.
   `divisors` are the numbers whose rule is taught and practised.
   ============================================================ */
var DATA = {
  perRound: 6,
  divisors: [2, 3, 5, 10],
  questions: ['pick', 'yesno', 'sum', 'rest'],

  intro: [
    { visual: { total: 12, size: 3 } },
    { visual: { total: 13, size: 3 } },
    { visual: { total: 14, size: 2 } },
    { visual: { total: 15, size: 5 } },
    { visual: { total: 30, size: 10 } },
    { visual: { total: 12, size: 3 } },
    { visual: { total: 14, size: 3 } }
  ]
};
