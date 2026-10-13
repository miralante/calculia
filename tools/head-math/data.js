/*
 * Head Math — data only (no logic, no UI text).
 *
 * Format:
 *   modes: entries of the main menu, in pedagogical order.
 *     - id: used as suffix for i18n keys (stepsName, decomposeDetail, …).
 *   steps mode ("count in your head"): levels are the step size. For steps 1-3
 *     bases go from 1 to stepBaseMax (counting one by one); for steps 5 and 10
 *     bases are multiples of the step up to step × stepMultipleMax, and the
 *     dots are drawn in rows of the step size (counting in fives/tens).
 *   decompose ("make ten first", e.g. 7 + 5 = 7 + 3 + 2): pairs are generated
 *     with a in aMin..aMax, b up to bMax and a + b >= minSum (crosses ten).
 *   divide: only by 10 — quotients go from 1 to maxQuotient and the dots are
 *     drawn in rows of 10, one color per row, so the answer is the row count.
 *   perRound: questions per practice round.
 *   dotColors: fill colors for the unit dots. In steps, color 0 is the first
 *     addend and color 1 the second. In decompose, color 1 is the part that
 *     completes ten and color 2 the rest.
 */
var DATA = {
  /* Menu order goes from the most concrete to the most abstract:
     counting, then bridging ten, then dividing by 10. The reference
     behind this order is in TODO.md, which is not served to the
     browser. Keep this order when adding a mode. */
  modes: [
    { id: 'steps', icon: '🔼' },
    { id: 'decompose', icon: '🔟' },
    { id: 'divide', icon: '➗' }
  ],
  stepLevels: [1, 2, 3, 5, 10],
  stepBaseMax: 12,
  stepMultipleMax: 9,
  decompose: { aMin: 6, aMax: 9, bMax: 9, minSum: 11 },
  divide: { divisor: 10, maxQuotient: 10 },
  perRound: 10,
  dotColors: [
    '#1565C0', '#E65100', '#00695C', '#6A1B9A', '#AD1457',
    '#2E7D32', '#5D4037', '#283593', '#B8860B', '#006064'
  ]
};
