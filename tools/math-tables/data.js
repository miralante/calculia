/*
 * Math Tables — data only (no logic, no UI text).
 *
 * Format:
 *   modes: entries of the main menu, in pedagogical order.
 *     - id: used as suffix for i18n keys (stepsName, addDetail, …).
 *   steps mode ("count in your head"): levels are the step size. For steps 1-3
 *     bases go from 1 to stepBaseMax (counting one by one); for steps 5 and 10
 *     bases are multiples of the step up to step × stepMultipleMax, and the
 *     dots are drawn in rows of the step size (counting in fives/tens).
 *   tables (add/multiply): table numbers the user can choose (one button each).
 *   factsPerTable: each table goes from <table> op 1 to <table> op factsPerTable.
 *   decompose ("make ten first", e.g. 7 + 5 = 7 + 3 + 2): pairs are generated
 *     with a in aMin..aMax, b up to bMax and a + b >= minSum (crosses ten).
 *   divide: only by 10 — quotients go from 1 to maxQuotient and the dots are
 *     drawn in rows of 10, one color per row, so the answer is the row count.
 *   perRound: questions per practice round.
 *   dotColors: fill colors for the unit dots. In addition, color 0 is the first
 *     addend and color 1 the second. In multiplication, group i uses color i,
 *     so each repetition of the table number has its own color. In decompose,
 *     color 1 is the part that completes ten and color 2 the rest.
 */
var DATA = {
  modes: [
    { id: 'steps', icon: '🔼' },
    { id: 'add', icon: '➕' },
    { id: 'decompose', icon: '🔟' },
    { id: 'multiply', icon: '✖️' },
    { id: 'divide', icon: '➗' },
    { id: 'parity', icon: '🟦' }
  ],
  stepLevels: [1, 2, 3, 5, 10],
  stepBaseMax: 12,
  stepMultipleMax: 9,
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  factsPerTable: 10,
  decompose: { aMin: 6, aMax: 9, bMax: 9, minSum: 11 },
  divide: { divisor: 10, maxQuotient: 10 },
  /* Even/odd classification: numbers drawn from 0 to max, no table/level picker. */
  parity: { max: 24 },
  perRound: 10,
  dotColors: [
    '#1565C0', '#E65100', '#00695C', '#6A1B9A', '#AD1457',
    '#2E7D32', '#5D4037', '#283593', '#B8860B', '#006064'
  ]
};
