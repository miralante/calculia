/*
 * Math Tables — data only (no logic, no UI text).
 *
 * Format:
 *   modes: entries of the main menu, in pedagogical order.
 *     - id: used as suffix for i18n keys (addName, multiplyDetail, …).
 *   tables (add/multiply): table numbers the user can choose (one button each).
 *   factsPerTable: each table goes from <table> op 1 to <table> op factsPerTable.
 *   dotColors: fill colors for the unit dots. In addition, color 0 is the first
 *     addend and color 1 the second. In multiplication, group i uses color i,
 *     so each repetition of the table number has its own color.
 */
var DATA = {
  /* Menu order: addition first, multiplication second. */
  modes: [
    { id: 'add', icon: '➕' },
    { id: 'multiply', icon: '✖️' }
  ],
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  factsPerTable: 10,
  dotColors: [
    '#1565C0', '#E65100', '#00695C', '#6A1B9A', '#AD1457',
    '#2E7D32', '#5D4037', '#283593', '#B8860B', '#006064'
  ]
};
