// Verify the numbers tool restructure: no orphan references to ordinales / recta / numberLine.
const dir = 'D:/apps/onedrive/jrodriguezgar/OneDrive/dev/git/Miralante/calculia/tools/numbers';
const files = ['data.js', 'app.js', 'strings.es.js', 'strings.en.js', 'styles.css'];
// Patterns that MUST be gone. Each pattern is matched as a substring.
const patterns = [
  'ordinales',
  'queueMembers',
  'numberLinePrompt',
  'numberLineHint',
  'numberLineAria',
  'numberLine:',
  'ordinalPositionPrompt',
  'ordinalMemberPrompt',
  'ordinalHint',
  'ordinalVisualAria',
  'ordinalPlace.',
  'socraticOrdinalPlace',
  'socraticOrdinalMember',
  'socraticNumberLine',
  '.queue-row',
  '.queue-member',
  '.queue-start',
  '.queue-pointer',
  '.queue-pointers',
  '.number-line',
  '.line-rule',
  '.line-label',
  '.line-mark'
];

// Patterns that ARE expected (positive check): the menu order, levels, eti.
const expected = [
  /"positivos-y-negativos": \{ picto: '\ud83c\udfe2'/,
  /unidades: \{[\s\S]*?picto: '\ud83e\uddf1'/,
  /placevalue: \{[\s\S]*?picto: '\ud83d\udd01'/,
  /comparar: \{[\s\S]*?picto: '⚖️'/
];

let ok = true;
for (const f of files) {
  const s = require('fs').readFileSync(dir + '/' + f, 'utf8');
  console.log('=== ' + f + ' ===');
  // The 'recta' pattern is checked only as a top-level key (activity.recta), not as substring.
  // Skip the false-positive prone patterns and just check well-bounded ones.
  const bounded = [
      'activity.ordinales',
      'activity.recta',
      'recta: {',
      'ordinales: {',
      'ordinales: {'
    ];
  for (const p of bounded) {
    if (s.indexOf(p) !== -1) {
      console.log('  FAIL: still contains "' + p + '"');
      ok = false;
    }
  }
  for (const p of patterns) {
    if (s.indexOf(p) !== -1) {
      console.log('  FAIL: still contains "' + p + '"');
      ok = false;
    }
  }
  // Positives
  if (f === 'data.js') {
    const idxPos = s.indexOf('"positivos-y-negativos"');
    const idxUni = s.indexOf('unidades:');
    const idxPl  = s.indexOf('placevalue:');
    const idxCom = s.indexOf('comparar:');
    if (!(idxPos < idxUni && idxUni < idxPl && idxPl < idxCom)) {
      console.log('  FAIL: order not positivos-y-negativos < unidades < placevalue < comparar');
      console.log('    indices:', idxPos, idxUni, idxPl, idxCom);
      ok = false;
    } else {
      console.log('  OK: order positivos-y-negativos, unidades, placevalue, comparar');
    }
  }
  if (f === 'app.js') {
    // Should still have GENERATORS, but not ordinal/numberLine.
    const has = (k) => s.indexOf(k) !== -1;
    if (!has('ascensorLibre') || !has('ascensorMeta') || !has('comparar') ||
        !has('bloques') || !has('dictado') || !has('lectura') ||
        !has('canje') || !has('escalera') || !has('counter')) {
      console.log('  FAIL: missing required generators');
      ok = false;
    } else {
      console.log('  OK: required generators present');
    }
  }
}

console.log(ok ? '\nALL CLEAN ✓' : '\nFAILURES ABOVE ✗');
process.exit(ok ? 0 : 1);