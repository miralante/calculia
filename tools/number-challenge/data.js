/* ============================================================
   Calculia — Number challenge: data.

   A ladder of ten steps. Each step draws from one kind of number
   and asks one or two question types. The first steps are the
   simplest; the last ones mix positives, negatives and decimals.
   `sign: 0` means each number may be positive or negative.
   Texts are in strings.<locale>.js.
   ============================================================ */
var DATA = {
  steps: [
    { pool: { kind: 'single', sign: 1 }, types: ['smallest', 'largest'] },
    { pool: { kind: 'round', sign: 1 }, types: ['smallest', 'largest', 'order'] },
    { pool: { kind: 'single', sign: -1 }, types: ['smallest', 'largest'] },
    { pool: { kind: 'round', sign: -1 }, types: ['order', 'between'] },
    { pool: { kind: 'halves', sign: 1 }, types: ['order', 'smallest', 'largest'] },
    { pool: { kind: 'halves', sign: -1 }, types: ['order', 'between'] },
    { pool: { kind: 'lessRound', sign: 0 }, types: ['between', 'missing'] },
    { pool: { kind: 'tenths', sign: 0 }, types: ['missing', 'order'] },
    { pool: { kind: 'roundHundredths', sign: 0 }, types: ['between', 'missing'] },
    { pool: { kind: 'any', sign: 0 }, types: ['order', 'missing', 'between'] }
  ]
};
