#!/usr/bin/env node
/* Final-pass cleanup: rename stray Spanish classes/keys/identifiers
   that the bulk scripts missed. Idempotent. */
'use strict';
var fs = require('fs');
var path = require('path');
var ROOT = path.join(__dirname, '..');
// One-off replacements
var replacements = [
  // numbers has stale pista-flecha class in HTML
  ['tools/numbers/index.html', /class="pista-flecha"/g, 'class="hint-arrow"'],
  ['tools/numbers/styles.css', /\.pista-flecha/g, '.hint-arrow'],
  // clock
  ['tools/clock/app.js', /\.classList\.add\('correcta'\)/g, ".classList.add('correct')"],
  ['tools/clock/index.html', /class="explicacion"/g, 'class="explanation"'],
  ['tools/clock/styles.css', /\.explicacion/g, '.explanation'],
  // roman-numerals
  ['tools/roman-numerals/app.js', /\.classList\.add\('correcta'\)/g, ".classList.add('correct')"],
  ['tools/roman-numerals/index.html', /class="explicacion"/g, 'class="explanation"'],
  ['tools/roman-numerals/styles.css', /\.explicacion/g, '.explanation'],
  // general: any 'correcta' as a class string (rare)
  ['tools/clock/app.js', /'correcta'/g, "'correct'"],
  ['tools/roman-numerals/app.js', /'correcta'/g, "'correct'"],
];
var total = 0;
replacements.forEach(function (r) {
  var p = path.join(ROOT, r[0]);
  if (!fs.existsSync(p)) return;
  var src = fs.readFileSync(p, 'utf8');
  var n = (src.match(r[1]) || []).length;
  if (n) { src = src.replace(r[1], r[2]); fs.writeFileSync(p, src); total += n; console.log('  ' + r[0] + ' x' + n); }
});
console.log('Total: ' + total);
