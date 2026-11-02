/* ============================================================
   Calculia — Múltiplos: six questions, one multiple among the options.
   The statements are in strings.<locale>.js (problems.<id>), with {a}
   (the number) filled from here. `b` is the number the answer is
   multiplied by; `wrong` are two numbers that are not multiples.
   ============================================================ */
var DATA = {
  problems: [
    { id: 1, icon: '🔢', a: 4, b: 7, answer: 28, wrong: [26, 30] },
    { id: 2, icon: '🔢', a: 6, b: 6, answer: 36, wrong: [32, 38] },
    { id: 3, icon: '🔢', a: 7, b: 7, answer: 49, wrong: [45, 52] },
    { id: 4, icon: '🔢', a: 5, b: 7, answer: 35, wrong: [33, 37] },
    { id: 5, icon: '🔢', a: 9, b: 3, answer: 27, wrong: [25, 30] },
    { id: 6, icon: '🔢', a: 3, b: 7, answer: 21, wrong: [16, 22] }
  ]
};
