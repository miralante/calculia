/* ============================================================
   Calculia — Factorización: six numbers to break into prime factors.
   The statements are in strings.<locale>.js (problems.<id>), with
   {a} filled from here. The answers are written as products; `wrong`
   are two products that are not made only of prime factors.
   ============================================================ */
var DATA = {
  problems: [
    { id: 1, icon: '🌳', a: 12, b: 0, answer: '2 × 2 × 3', wrong: ['2 × 6', '3 × 4'] },
    { id: 2, icon: '🌳', a: 18, b: 0, answer: '2 × 3 × 3', wrong: ['2 × 9', '3 × 6'] },
    { id: 3, icon: '🌳', a: 20, b: 0, answer: '2 × 2 × 5', wrong: ['4 × 5', '2 × 10'] },
    { id: 4, icon: '🌳', a: 30, b: 0, answer: '2 × 3 × 5', wrong: ['5 × 6', '2 × 15'] },
    { id: 5, icon: '🌳', a: 16, b: 0, answer: '2 × 2 × 2 × 2', wrong: ['4 × 4', '2 × 8'] },
    { id: 6, icon: '🌳', a: 45, b: 0, answer: '3 × 3 × 5', wrong: ['5 × 9', '3 × 15'] }
  ]
};
