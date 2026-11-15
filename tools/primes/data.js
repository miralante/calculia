/* ============================================================
   Calculia — Primos y compuestos — datos
   The explanation goes composites first, then primes. Each slide in
   `concepts` has a drawing (`kind`):
     rows    a number of dots the user arranges in rows (n)
     arrays  several arrangements side by side (list of [rows, cols])
     tree    the factor tree of 12
     grid    the numbers 1 … max; the user taps the ones of `mode`
             ('composite' or 'prime')
     one     the 1, a single dot
   The texts are in strings.<locale>.js (concept.<id>.title and .text).
   The taps are handled in app.js.

   `real` are the everyday examples. `classifyNumbers` are the numbers
   the test asks about (prime, composite or neither); `pickSets` have one
   prime and three composites; `factorNumbers` are composites whose
   prime factors are asked for.
   ============================================================ */
var DATA = {
  perRound: 6,

  concepts: [
    { id: 'composite', kind: 'rows', n: 6 },
    { id: 'compositeMult', kind: 'arrays', list: [[2, 2], [2, 3], [2, 4], [3, 3]] },
    { id: 'factorTree', kind: 'tree' },
    { id: 'compositeGrid', kind: 'grid', mode: 'composite', max: 20 },
    { id: 'prime', kind: 'rows', n: 7 },
    { id: 'one', kind: 'one' },
    { id: 'primeGrid', kind: 'grid', mode: 'prime', max: 20 }
  ],

  /* Ejemplos de la vida real. `object` es el dibujo y `count` cuántos se ven. */
  real: [
    { id: 'candies', object: '🍬', count: 7 },
    { id: 'tiles', object: '🧱', count: 12 },
    { id: 'clock', object: '⏰', count: 1 }
  ],

  classifyNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30],

  pickSets: [
    { prime: 2, others: [9, 15, 21] },
    { prime: 3, others: [4, 8, 10] },
    { prime: 5, others: [12, 14, 16] },
    { prime: 13, others: [15, 20, 25] },
    { prime: 17, others: [18, 21, 27] },
    { prime: 23, others: [24, 26, 28] },
    { prime: 29, others: [30, 33, 35] },
    { prime: 31, others: [32, 34, 36] },
    { prime: 37, others: [38, 39, 40] },
    { prime: 43, others: [44, 46, 48] },
    { prime: 47, others: [45, 49, 51] }
  ],

  factorNumbers: [6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 24, 28, 30, 36, 45, 60]
};
