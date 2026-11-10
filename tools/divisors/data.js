/* ============================================================
   Calculia — Divisores — datos
   Explanation: one slide per idea. Each slide has a `visual`: `groups`
   (equal groups of dots and their product) or `divide` (the divisions of
   `each` by 1 to `count`, one per line, as text; «sobra» when it is not
   exact). The texts are in strings.<locale>.js (intro.<n>.title and
   intro.<n>.text).
   Practice: the game offers the numbers in `numbers`; each one has its
   divisors up to 10 (see app.js). Every number is 10 or more, so the
   divisions up to 10 are all there is to check.
   ============================================================ */
var DATA = {
  numbers: [10, 12, 14, 15, 16, 18, 20, 24],

  intro: [
    { visual: { kind: 'groups', each: 4, count: 3 } },
    { visual: { kind: 'divide', each: 12, count: 10 } },
    { visual: { kind: 'divide', each: 6, count: 6 } },
    { visual: { kind: 'divide', each: 8, count: 8 } }
  ]
};
