/* One-off: are any of the unstyled classes actually JS hooks?

   `digital-live` in clock carries no CSS on purpose — app.js reads it
   back with querySelector to find the running clock. If one of the
   inert-looking classes from the sweeper is read the same way, then
   "just delete the unused class" is wrong advice and the class has to
   stay.  */
'use strict';
const fs = require('fs');
const path = require('path');

const TOOLS = path.resolve(__dirname, '..', '..', 'tools');
const CLASSES = [
  'center-row', 'difficulty', 'emoji-large', 'instruction', 'legend', 'options',
  'prompt', 'transfer', 'visual', 'block-model', 'block-tablero', 'contexto',
  'actions', 'card-grid', 'price', 'product', 'stack-monedas', 'total',
  'explanation-wrap', 'hint', 'reference-card', 'reference-text', 'reference-title',
  'intro-buttons', 'answer-name', 'layer-row', 'digital-live', 'options-row',
];

const READERS = /querySelector(?:All)?\s*\(|closest\s*\(|\.matches\s*\(/;
let any = false;

for (const slug of fs.readdirSync(TOOLS)) {
  const app = path.join(TOOLS, slug, 'app.js');
  if (!fs.existsSync(app)) continue;
  const code = fs.readFileSync(app, 'utf8');
  const hits = [];
  for (const cls of CLASSES) {
    const re = new RegExp('(?:querySelector(?:All)?|closest|matches)\\s*\\([^)]*\\.' + cls + '(?![\\w-])');
    if (re.test(code)) hits.push(cls);
  }
  if (hits.length) {
    any = true;
    console.log('  ' + slug.padEnd(16) + '→ ' + hits.join(', '));
  }
}
if (!any) console.log('  (ninguna clase se lee de vuelta desde JS)');
console.log('\n' + READERS.source ? '' : '');