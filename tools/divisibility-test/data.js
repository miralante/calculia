/* ============================================================
   Calculia — Divisibilidad — datos
   Explanation: one slide per idea. Each slide draws `total` items shared
   in rows of `size`; the drawing writes the division under it. A slide
   with `calc: true` writes the calculator's answer instead, with its
   decimal part, and draws the leftover as a pack only partly filled.
   The texts are in strings.<locale>.js (intro.<n>.title and intro.<n>.text).
   Test: each round mixes the `questions` types, `perRound` questions.
   `divisors` are the numbers whose rule is taught and practised.
   ============================================================ */
var DATA = {
  perRound: 8,
  divisors: [2, 3, 5, 10],
  /* Every round has the four step-by-step rules (one question for each divisor),
     plus the explanation questions: which number divides, yes or no, the whole
     part and the decimal part. */
  questions: ['rule2', 'rule3', 'rule5', 'rule10', 'pick', 'yesno', 'integer', 'decimal'],

  intro: [
    { visual: { total: 12, size: 3 } },
    { visual: { total: 13, size: 3 } },
    { visual: { total: 14, size: 2 } },
    { visual: { total: 15, size: 5 } },
    { visual: { total: 30, size: 10 } },
    { visual: { total: 12, size: 3 } },
    { visual: { total: 14, size: 3 } },
    { visual: { total: 7, size: 3 } },
    { visual: { total: 13, size: 5 } },
    { visual: { total: 7, size: 3, calc: true } },
    { visual: { total: 13, size: 5, calc: true } }
  ]
};
