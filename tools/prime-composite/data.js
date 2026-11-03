/* ============================================================
   Calculia — Primo o compuesto — datos
   Explanation: one slide per idea. Each slide has a drawing (`visual`):
   `array` (dots in rows, written as a product), `arrays` (several of
   them side by side) or `sieve` (the numbers 1 … max, primes with a
   thick border). The texts are in strings.<locale>.js (intro.<n>.title
   and intro.<n>.text).
   Test: each round mixes the `questions` types, `perRound` questions.
   `primes` and `composites` are the numbers the test asks about.
   ============================================================ */
var DATA = {
  perRound: 6,
  questions: ['yesno', 'pick', 'divisors'],

  intro: [
    { visual: { kind: 'array', rows: 1, cols: 7 } },
    { visual: { kind: 'array', rows: 2, cols: 3 } },
    { visual: { kind: 'sieve', max: 20 } },
    { visual: { kind: 'array', rows: 1, cols: 1 } },
    { visual: { kind: 'arrays', list: [[2, 2], [2, 3], [2, 4], [3, 3]] } },
    { visual: { kind: 'array', rows: 3, cols: 5 } }
  ],

  primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
  composites: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28]
};
