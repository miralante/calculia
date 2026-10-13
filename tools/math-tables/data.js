/*
 * Math Tables — data only (no logic, no UI text).
 *
 * Format:
 *   modes: entries of the main menu, in pedagogical order.
 *     - id: used as suffix for i18n keys (addName, multiplyDetail, …).
 *   tables (add/multiply/subtract/divide): table numbers the user can
 *     choose (one button each).
 *   factsPerTable: each table goes from <table> op 1 to <table> op factsPerTable
 *     for add / multiply / subtract. For 'subtract' the minuend is
 *     table + n (so the result is always >= 1 and >= the table, never a
 *     negative number). For 'divide' the dividend is just n — so most
 *     tables will land on dividends that do NOT divide evenly and the
 *     round has to deal with remainders.
 *   dotColors: fill colors for the unit dots. Each operation reuses
 *     them in a different way (see renderVisual). The first table
 *     color is reserved for the minuend in subtraction and for the
 *     dividend's group in division; the leftover dot in a divide with
 *     remainder uses the next color, so the visual signal is the
 *     "is there an unmatched dot?" rather than just arithmetic.
 */
var DATA = {
  /* Menu order: addition first (most concrete), then multiplication,
     subtraction (still close to concrete but with a stroke-out cue),
     and division last (the only one that uses a free-text input and
     teaches remainders). The first three work the same way (3-option
     shuffle); division is the odd one out and stands for that. */
  modes: [
    { id: 'add', icon: '➕' },
    { id: 'multiply', icon: '✖️' },
    { id: 'subtract', icon: '➖' },
    { id: 'divide', icon: '➗' }
  ],
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  factsPerTable: 10,
  dotColors: [
    '#1565C0', '#E65100', '#00695C', '#6A1B9A', '#AD1457',
    '#2E7D32', '#5D4037', '#283593', '#B8860B', '#006064'
  ]
};
