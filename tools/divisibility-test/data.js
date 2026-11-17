/* ============================================================
   Calculia — Divisibilidad — datos
   Explanation: one slide per idea. The text is on the left (strings.<locale>.js,
   intro.<n>.title and intro.<n>.text). The practice is on the right, a frame
   the child reads or works with (app.js). Frame kinds, all text, no pictures:
     divide  the divisions of the `pairs` ([n, d]), one per line; each line says
             whether it comes out exact, or what is left over.
     teacher the app chooses a number from `numbers`, the child chooses the
             divisor `d`, and the app checks the rule and the division for both.
     sum     the digits of n written with their sum, and the sum divided by 3.
   The whole part and the decimal part of a division are not here: they are
   taught in the division activity of Operaciones (tools/operation-concepts).
   Test: each round mixes the `questions` types, `perRound` questions.
   `divisors` are the numbers whose rule is taught and practised.
   ============================================================ */
var DATA = {
  perRound: 6,
  divisors: [2, 3, 5, 10],
  /* Every round has the four step-by-step rules (one question for each divisor),
     plus the explanation questions: which number divides, and yes or no. */
  questions: ['rule2', 'rule3', 'rule5', 'rule10', 'pick', 'yesno'],

  /* The rules, in the order of the explanation. Each rule is a game with the teacher:
     the teacher (the app) chooses a number from `numbers`, the user chooses the divisor
     `d` (2, 3, 5 or 10), and the teacher checks the rule and the division for both.
     For 3, the numbers are two-digit, so the digits can be added on the screen. */
  intro: [
    { frame: { kind: 'divide', pairs: [[12, 3]] } },
    { frame: { kind: 'divide', pairs: [[13, 3]] } },
    { frame: { kind: 'teacher', d: 2, numbers: [14, 22, 27, 33] } },
    { frame: { kind: 'teacher', d: 3, numbers: [12, 21, 25, 33] } },
    { frame: { kind: 'teacher', d: 5, numbers: [15, 23, 30, 42] } },
    { frame: { kind: 'teacher', d: 10, numbers: [30, 45, 61, 100] } },
    { frame: { kind: 'sum', n: 14 } },
    { frame: { kind: 'divide', pairs: [[13, 5]] } }
  ]
};
