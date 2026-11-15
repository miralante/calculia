/* ============================================================
   Calculia — Divisores — datos
   Explanation: one slide per idea. Each slide has a `visual`: `groups`
   (equal groups of dots and their product) or `divide` (the divisions of
   `each` by 1 to `count`, one per line, as text; «sobra» when it is not
   exact). The texts are in strings.<locale>.js (intro.<n>.title and
   intro.<n>.text).
   Practice: the game draws its starting number from `numbers` (1 to 9) and
   the user picks the other one from the same list (see app.js).
   ============================================================ */
var DATA = {
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  intro: [
    { visual: { kind: 'groups', each: 4, count: 3 } },
    { visual: { kind: 'divide', each: 12, count: 10 } },
    { visual: { kind: 'divide', each: 6, count: 6 } },
    { visual: { kind: 'divide', each: 8, count: 8 } }
  ]
};
