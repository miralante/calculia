/* ============================================================
   Calculia — Cantidades.

   Three practices in the menu:
     - read   : the number is shown and the user copies it.
     - write  : the number is spoken and the user writes it.
     - points : a game. The number is shown with no separators and
                the user drags the points (dots in Spanish, commas
                in English) from the right into the gaps between
                the digits. See app.js.

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
    ]
  },
  /* Points game: the digit count of each number, one entry per round
     item, going up one digit at a time. A number with N digits has
     (N - 1) / 3 points, rounded down:
       4 to 6 digits   -> 1 point   (thousands)
       7 to 9 digits   -> 2 points  (millions)
       10 to 12 digits -> 3 points  (billions)
     Not shuffled on purpose: the numbers get bigger as the round goes on. */
  pointsDigits: [4, 5, 6, 7, 8, 9, 10, 11, 12]
};
