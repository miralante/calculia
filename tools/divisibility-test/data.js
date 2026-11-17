/* ============================================================
   Calculia — Divisibilidad — datos
   Explanation: one slide per idea. The text is on the left (strings.<locale>.js,
   intro.<n>.title and intro.<n>.text). The practice is on the right, a frame
   the child works with (app.js). Frame kinds:
     groups  n balls, shared in groups of d (the child picks d, makes the groups
             one at a time, and reads the result).
     teacher the app chooses a number, the child chooses the divisor, and the
             app checks the rule and the division for both.
     digits  the digits of n added up; the sum is then shared in groups of 3.
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

  /* The balls are coloured like the pairs of Pares e impares: one colour per
     full group, and the balls left over in their own colour. */
  groupColors: ['#F9C5D1', '#BFE3F7', '#FFE7A0', '#CDEFC4'],
  leftoverColor: '#FFB08A',

  /* The rules, in the order of the explanation. Each rule is a game with the teacher:
     the teacher (the app) chooses a number from `numbers`, the user chooses the divisor
     `d` (2, 3, 5 or 10), and the teacher checks the rule and the division for both.
     For 3, the numbers are two-digit, so the digits can be added on the screen. */
  intro: [
    { frame: { kind: 'balls', n: 12, d: 3 } },
    { frame: { kind: 'balls', n: 13, d: 3 } },
    { frame: { kind: 'teacher', d: 2, numbers: [14, 22, 27, 33] } },
    { frame: { kind: 'teacher', d: 3, numbers: [12, 21, 25, 33] } },
    { frame: { kind: 'teacher', d: 5, numbers: [15, 23, 30, 42] } },
    { frame: { kind: 'teacher', d: 10, numbers: [30, 45, 61, 100] } },
    { frame: { kind: 'digits', n: 14 } },
    { frame: { kind: 'groups', n: 13, d: 5 } }
  ]
};
