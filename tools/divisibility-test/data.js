/* ============================================================
   Calculia — Divisibilidad — datos
   Explanation: one slide per idea. The text is on the left (strings.<locale>.js,
   intro.<n>.title and intro.<n>.text). The practice is on the right, a frame
   the child works with (app.js). Frame kinds:
     groups  n balls, shared in groups of d (the child picks d, makes the groups
             one at a time, and reads the result).
     tap     numbers as buttons: the child taps the ones that divide exactly by d.
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

  intro: [
    { frame: { kind: 'groups', n: 12, d: 3 } },
    { frame: { kind: 'groups', n: 13, d: 3 } },
    { frame: { kind: 'tap', d: 2, numbers: [14, 15, 22, 27, 30, 41] } },
    { frame: { kind: 'tap', d: 5, numbers: [15, 23, 30, 41, 50, 62] } },
    { frame: { kind: 'tap', d: 10, numbers: [30, 45, 50, 61, 100, 27] } },
    { frame: { kind: 'digits', n: 12 } },
    { frame: { kind: 'digits', n: 14 } },
    { frame: { kind: 'groups', n: 13, d: 5 } }
  ]
};
