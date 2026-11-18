/* ============================================================
   Calculia — Divisibilidad — datos
   Two stages, one after the other: the explanation, then the practice.
   Explanation: one slide per idea. The text is on the left (strings.<locale>.js,
   intro.<n>.title and intro.<n>.text). On the right, a frame the child looks at
   (app.js), when the slide has one. Frame kinds, all text and drawn dots, no pictures:
     balls   n balls put in groups of d, drawn: each full group is a box, and
             what is left over sits outside it.
     calc    the divisions of the `pairs` ([n, d]) as a calculator shows them:
             a whole number with no decimals is exact; decimals mean it is not.
     sum     the digits of n written with their sum, and the sum divided by 3.
   The slides of the rules have no frame: the rule is practised in the games.
   Practice: the games, one for each rule. The teacher (the app) chooses a number
   from `numbers`, the child chooses the divisor `d`, and the app checks the rule
   and the division for both. For 3, the numbers are two-digit, so the digits can
   be added on the screen. There is no test and no real-life stage.
   `divisors` are the numbers whose rule is taught and practised.
   ============================================================ */
var DATA = {
  divisors: [2, 3, 5, 10],

  intro: [
    { frame: { kind: 'balls', n: 12, d: 3 } },
    { frame: { kind: 'balls', n: 13, d: 3 } },
    { frame: { kind: 'calc', pairs: [[12, 3], [13, 3]] } },
    /* The rules 2, 3, 5 and 10: text only. Each one is practised in its game. */
    {},
    {},
    {},
    {},
    { frame: { kind: 'sum', n: 14 } },
    { frame: { kind: 'balls', n: 13, d: 5 } }
  ],

  games: [
    { d: 2, numbers: [14, 22, 27, 33] },
    { d: 3, numbers: [12, 21, 25, 33] },
    { d: 5, numbers: [15, 23, 30, 42] },
    { d: 10, numbers: [30, 45, 61, 100] }
  ]
};
