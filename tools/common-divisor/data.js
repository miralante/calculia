/* ============================================================
   Calculia — Máximo común divisor — datos
   Explanation: one slide per idea. Each slide has a drawing (`visual`):
   `baskets` (a total shared into equal groups), `divisors` (the divisors
   of two numbers, the common ones marked) or `tiles` (a floor covered with
   the biggest square tiles). The texts are in strings.<locale>.js.
   Real life: one example at a time (`real`), same drawings.
   Test: each round mixes the `questions` types, `perRound` questions.
   The numbers of the test come from `factorPairs` times a `gcds` value,
   so the answer is always that value and never a trivial one.
   ============================================================ */
var DATA = {
  perRound: 6,
  questions: ['gcd', 'story', 'common'],

  intro: [
    { visual: { kind: 'baskets', a: 12, b: 18, g: 6, iconA: '🍎', iconB: '🍊' } },
    { visual: { kind: 'divisors', a: 12, b: 18 } },
    { visual: { kind: 'divisors', a: 8, b: 20 } },
    { visual: { kind: 'baskets', a: 4, b: 12, g: 4, iconA: '🍎', iconB: '🍊' } }
  ],

  real: [
    { visual: { kind: 'baskets', a: 8, b: 20, g: 4, iconA: '🍓', iconB: '🍋' } },
    { visual: { kind: 'tiles', a: 12, b: 18, g: 6 } },
    { visual: { kind: 'baskets', a: 12, b: 18, g: 6, iconA: '📕', iconB: '📓' } }
  ],

  /* Pairs of coprime numbers: g × x and g × y have g as their greatest common divisor. */
  factorPairs: [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [2, 7], [5, 7]],
  gcds: [2, 3, 4, 5, 6]
};
