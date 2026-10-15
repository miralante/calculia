/* ============================================================
   Calculia — Ordering numbers: data.

   One entry per item of the round. Each step adds one number or
   one digit to the step before, never both at once, so the round
   goes up gently: 3 small numbers, then 3 two-digit numbers, and so
   on until 7 five-digit numbers. The round is not shuffled on
   purpose: the items get harder as the round goes on. The numbers
   inside each item are shuffled in app.js.
   ============================================================ */

var DATA = {
  steps: [
    { count: 3, digits: 1 },
    { count: 3, digits: 2 },
    { count: 4, digits: 2 },
    { count: 4, digits: 3 },
    { count: 5, digits: 3 },
    { count: 5, digits: 4 },
    { count: 6, digits: 4 },
    { count: 6, digits: 5 },
    { count: 7, digits: 5 }
  ]
};
