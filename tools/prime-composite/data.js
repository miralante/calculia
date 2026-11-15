/* ============================================================
   Calculia — Primo o compuesto — datos
   The explanation goes composites first, then primes. Each slide in
   `concepts` has a drawing (`kind`):
     rows    a number of dots the user arranges in rows (n)
     arrays  several arrangements side by side (list of [rows, cols])
     grid    the numbers 1 … max; the user taps the ones of `mode`
             ('composite' or 'prime')
     one     the 1, a single dot
   The texts are in strings.<locale>.js (concept.<id>.title and .text).
   The taps are handled in app.js.

   The test: each round mixes the `questions` types, `perRound` questions.
   `primes` and `composites` are the numbers the test asks about.
   ============================================================ */
var DATA = {
  perRound: 6,
  questions: ['yesno', 'pick', 'divisors'],

  concepts: [
    { id: 'composite', kind: 'rows', n: 6 },
    { id: 'compositeMult', kind: 'arrays', list: [[2, 2], [2, 3], [2, 4], [3, 3]] },
    { id: 'compositeOther', kind: 'rows', n: 15 },
    { id: 'compositeGrid', kind: 'grid', mode: 'composite', max: 20 },
    { id: 'prime', kind: 'rows', n: 7 },
    { id: 'one', kind: 'one' },
    { id: 'primeGrid', kind: 'grid', mode: 'prime', max: 20 }
  ],

  primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
  composites: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28]
};
