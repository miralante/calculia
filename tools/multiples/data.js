/* ============================================================
   Calculia — Múltiplos — datos
   Explanation: one slide per idea. Each slide has a `visual`: `times` (the
   multiplications of `each` by 1 to `count`, one per line, as text; the product
   is the multiple and is marked). No pictures. The texts are in
   strings.<locale>.js (intro.<n>.title and intro.<n>.text).
   Practice: the game draws its starting number from `numbers` (1 to 9) and
   the user picks the other one from the same list (see app.js).
   ============================================================ */
var DATA = {
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  intro: [
    { visual: { kind: 'example', each: 3, k: 2 } },
    { visual: { kind: 'times', each: 3, count: 4 } },
    { visual: { kind: 'times', each: 5, count: 10 } },
    { visual: { kind: 'times', each: 2, count: 10 } },
    { visual: { kind: 'times', each: 3, count: 10 } }
  ]
};
