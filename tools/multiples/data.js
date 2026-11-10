/* ============================================================
   Calculia — Múltiplos — datos
   Explanation: one slide per idea. Each slide has a `visual`: `groups`
   (equal groups of dots and their product) or `times` (the multiplications
   of `each` by 1 to `count`, one per line, as text, no pictures). The texts
   are in strings.<locale>.js (intro.<n>.title and intro.<n>.text).
   Practice: the game offers the numbers in `numbers`; each one has its table
   up to 10 (see app.js).
   ============================================================ */
var DATA = {
  numbers: [2, 3, 4, 5, 6, 7, 8, 9],

  intro: [
    { visual: { kind: 'groups', each: 4, count: 3 } },
    { visual: { kind: 'times', each: 5, count: 10 } },
    { visual: { kind: 'times', each: 2, count: 10 } },
    { visual: { kind: 'times', each: 3, count: 10 } }
  ]
};
