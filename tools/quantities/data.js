/* ============================================================
   Calculia — Quantities (read and write large numbers).
   Four practices:
     - read:      the number is shown (without separator) and the
                  user writes it with the right separator (or
                  without it if < 10.000).
     - write:     the number is heard and the user writes it,
                  with separator if applicable.
     - points:    the number is shown WITHOUT separator and the
                  user must write it WITH the separator in the
                  right place.
     - decompose: the number is shown with digits coloured by
                  position and the user is asked for the value of
                  a specific digit (3 options).

   "Thousand" rule: below 10.000 no separator is used (matches
   how primary textbooks present positional value before
   introducing the thousands separator). From 10.000 up the
   separator is mandatory in read, write and points modes.
   In decompose the user does not type the number, only the
   single digit.

   Ranges per practice (gradual, SPEC §6 rule 13: each level
   changes only the range or the response mode, never both at
   once):
     - read, write, points share the same ranges so difficulty
       is comparable;
     - decompose keeps the same ceiling but includes the
       "millions" range to ask for digits in higher groups.
   ============================================================ */
var DATA = {
  perRound: 6,
  /* Absolute ceiling of the activity. The user asked "up to one
     trillion" (10⁹). In Spanish 10� reads "mil millones" — we do
     not use the word "billón" to avoid introducing a new unit;
     the ceiling is 999,999,999, which falls in the "mil millones"
     group. */
  ceiling: 999999999,
  practices: [
    { id: 'read', icon: '👀' },
    { id: 'write', icon: '✍️' },
    { id: 'points', icon: '·' },
    { id: 'decompose', icon: '🧱' }
  ],
  /* Available ranges per practice. min/max inclusive.
     'level' is informational only (the UI uses it in messages). */
  ranges: {
    read: [
      { id: 'l1', min: 0,         max: 99 },           /* no separator */
      { id: 'l2', min: 100,       max: 9999 },        /* no separator */
      { id: 'l3', min: 10000,     max: 99999 },       /* one separator */
      { id: 'l4', min: 100000,    max: 999999 },      /* one separator */
      { id: 'l5', min: 1000000,   max: 999999999 }    /* two separators */
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
    ],
    decompose: [
      { id: 'd1', min: 0,         max: 99 },
      { id: 'd2', min: 100,       max: 9999 },
      { id: 'd3', min: 10000,     max: 999999 },
      { id: 'd4', min: 1000000,   max: 999999999 }
    ]
  }
};
