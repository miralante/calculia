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

   Practice: the game draws its starting number from `numbers` (2 to 9) and
   the user picks the other one from the same list (see app.js).
   `primes` and `composites` are checked at start-up (app.js).
   ============================================================ */
var DATA = {
  numbers: [2, 3, 4, 5, 6, 7, 8, 9],

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
