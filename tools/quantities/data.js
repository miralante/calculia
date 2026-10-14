/* ============================================================
   Calculia — Cantidades.

   Three practices in the menu:
     - read   : the number is shown and the user copies it.
     - write  : the number is spoken and the user writes it.
     - points : the number is shown WITHOUT separator; the user
                must type it WITH the separator in the right place.

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
  /* Absolute ceiling of the read/write/points practices.
     The ceiling is 999,999,999, which falls in the "mil millones"
     group; we do not introduce "billón". */
  ceiling: 999999999,
  practices: [
    { id: 'read', icon: '👀' },
    { id: 'write', icon: '✍️' },
    { id: 'points', icon: '·' }
  ],
  /* Ranges for the three typing practices. */
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
    points: [
      /* For the exercise to make sense the number must be >= 10.000.
         In "points" mode the separator is removed; the user must
         put it back. */
      { id: 'p1', min: 10000,     max: 99999 },
      { id: 'p2', min: 100000,    max: 999999 },
      { id: 'p3', min: 1000000,   max: 9999999 },
      { id: 'p4', min: 10000000,  max: 99999999 },
      { id: 'p5', min: 100000000, max: 999999999 }
    ]
  }
};