/* ============================================================
   Calculia — Decimal comma: data.

   One entry per item of the round, as { enteras, decimales }: the
   digits before the comma and the digits after it. Each step changes
   one thing only: first the whole part, then the decimals. The whole
   part stays under 1.000 so that no thousands separator can collide
   with the decimal comma.

   The round is not shuffled on purpose: the items get harder as the
   round goes on. The digits of each item are drawn in app.js.
   ============================================================ */

var DATA = {
  steps: [
    { enteras: 1, decimales: 1 },
    { enteras: 2, decimales: 1 },
    { enteras: 2, decimales: 2 },
    { enteras: 3, decimales: 2 },
    { enteras: 3, decimales: 3 }
  ]
};
