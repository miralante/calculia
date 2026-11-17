/* ============================================================
   Calculia — Divisores — datos
   Explanation: one slide per idea. Each slide has a `visual`: `divide` (the
   divisions of `each` by 1 to `count`, one per line, as text; each line says
   whether the division is whole, or what is left over). No pictures. The texts
   are in strings.<locale>.js (intro.<n>.title and intro.<n>.text).
   Practice: the game draws its starting number from `numbers` (1 to 9) and
   the user picks the other one from the same list (see app.js).
   ============================================================ */
var DATA = {
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  /* The partner's own numbers: the app chooses one of these, the user chooses a divisor from `numbers`. */
  starts: [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24],

  intro: [
    { visual: { kind: 'divide', each: 12, count: 5 } },
    { visual: { kind: 'divide', each: 12, count: 10 } },
    { visual: { kind: 'divide', each: 6, count: 6 } },
    { visual: { kind: 'divide', each: 8, count: 8 } }
  ]
};
