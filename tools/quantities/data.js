/* ============================================================
   Calculia — Cantidades.

   Three practices in the menu:
     - read   : the number is shown and the user copies it.
     - write  : the number is spoken and the user writes it.
     - points : a game. The number is shown with no separators and
                the user places the points (dots in Spanish, commas
                in English) in the right gaps, from thousands up to
                billions. See app.js.

   "Thousand" rule (see ranges below): < 10.000 has no separator;
   >= 10.000 does. In read/write modes the format shown matches
   what the user must type; in "points" mode that match is broken
   on purpose — the exercise is precisely to put the separator back.

   The 'groups' practice (counting in tens/hundreds/thousands/half
   dozen/dozen) moved to Mental Math in 2026-10. Its data and i18n
   keys travelled with it.
   The 'parity' practice (even / odd) became its own tool at
   tools/parity/ on the same date.
   ============================================================ */

var DATA = {
  perRound: 6,
  /* Absolute ceiling of the read/write practices.
     The ceiling is 999,999,999, which falls in the "mil millones"
     group; we do not introduce "billón". */
  ceiling: 999999999,
  practices: [
    { id: 'read', icon: '👀' },
    { id: 'write', icon: '✍️' },
    { id: 'points', icon: '·' }
  ],
  /* Ranges for the read and write practices. */
  ranges: {
    read: [
      { id: 'l1', min: 0,         max: 99 },
      { id: 'l2', min: 100,       max: 9999 },
      { id: 'l3', min: 10000,     max: 99999 },
      { id: 'l4', min: 100000,    max: 999999 },
      { id: 'l5', min: 1000000,   max: 999999999 }
    ],
    write: [
      { id: 'e1', min: 0,         max: 99 },
      { id: 'e2', min: 100,       max: 9999 },
      { id: 'e3', min: 10000,     max: 99999 },
      { id: 'e4', min: 100000,    max: 999999 },
      { id: 'e5', min: 1000000,   max: 999999999 }
    ],
    /* Levels of the points game, by number of digits. A number with
       N digits has (N - 1) / 3 points, rounded down, so each level
       fixes how many points the user must place:
         p1 = thousands  (1 point):  1.000 to 999.999
         p2 = millions   (2 points): 1.000.000 to 999.999.999
         p3 = billions   (3 points): 1.000.000.000 to 999.999.999.999 */
    points: [
      { id: 'p1', minDigits: 4,  maxDigits: 6 },
      { id: 'p2', minDigits: 7,  maxDigits: 9 },
      { id: 'p3', minDigits: 10, maxDigits: 12 }
    ]
  },
  /* Order of the points rounds: one random number per entry, going
     up from thousands to billions. Not shuffled on purpose. */
  pointsSequence: ['p1', 'p1', 'p2', 'p2', 'p3', 'p3']
};
