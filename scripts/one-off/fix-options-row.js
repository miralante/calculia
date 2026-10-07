/* One-off: add the `.options.options-row` rule to the activities that
   toggle the class but never style it.

   app.js does `optionsEl.classList.toggle('options-row', !!question.inline)`.
   money, measures, mental-math, numbers and fractions-measures carry
   the rule; algebra, calendar, charts, divisibility, operations,
   percent, places, problems and similar toggle the class with nothing
   behind it, so every `inline: true` question stacks its answers in a
   column and the row layout silently never happens.

   These files have MIXED line endings (algebra, charts and divisibility
   carry both CRLF and LF), so the block is appended in each file's
   dominant EOL and no existing byte is rewritten.  */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SLUGS = ['algebra', 'calendar', 'charts', 'divisibility', 'operations', 'percent', 'places', 'problems', 'similar'];

const BLOCK = [
  '',
  '/* Answer options */',
  '/* app.js toggles `.options-row` for questions marked `inline: true`.',
  '   Without this rule the class is inert and those answers stack in a',
  '   column — three side-by-side figures become a tower that pushes the',
  '   next button off the screen. Same rule as money/measures/numbers. */',
  '.options.options-row { flex-direction: row; justify-content: center; flex-wrap: wrap; }',
  '.options.options-row .option-btn { width: auto; min-width: 180px; }',
  '',
].join('\n');

function dominantEol(text) {
  const crlf = (text.match(/\r\n/g) || []).length;
  const lf = (text.match(/(?<!\r)\n/g) || []).length;
  return crlf > lf ? '\r\n' : '\n';
}

for (const slug of SLUGS) {
  const file = path.join(ROOT, 'tools', slug, 'styles.css');
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('.options.options-row')) {
    console.log('  = ' + slug + ': ya definida, no se toca');
    continue;
  }
  const eol = dominantEol(text);
  const block = BLOCK.split('\n').join(eol);
  const before = text.length;
  const next = text.endsWith(eol) || text.endsWith('\n') ? text + block.slice(eol.length) : text + eol + block.slice(eol.length);
  fs.writeFileSync(file, next, 'utf8');
  console.log('  + ' + slug + ': añadida (' + eol === '\r\n' ? 'CRLF' : 'LF' + ', ' + (next.length - before) + ' bytes)');
}
console.log('\nListo. Verifica con: node scripts/one-off/probe-options-row.js');