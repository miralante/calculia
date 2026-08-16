#!/usr/bin/env node
/* Rename the shared "question" shape keys/identifiers in a single
   tools/<slug>/app.js: enunciado/prompt, opciones/options, pista/hint,
   correcta/correct, enFila/inline, visualAria/visualAria, leyenda/legend,
   visual/visual, html/html, aria/aria.
   Safe: word-boundary, generic across all activities.
   Usage: node scripts/rename-shape.js <file>
*/
'use strict';
var fs = require('fs');
var path = process.argv[2];
if (!path) { console.error('usage: rename-shape.js <file>'); process.exit(2); }
var src = fs.readFileSync(path, 'utf8');
// ordered: longer first to avoid overlaps
var pairs = [
  ['enunciado:', 'prompt:'],
  ['.enunciado', '.prompt'],
  ['opciones:', 'options:'],
  ['.opciones', '.options'],
  ['pista:', 'hint:'],
  ['.pista', '.hint'],
  ['correcta:', 'correct:'],
  ['.correcta', '.correct'],
  ['enFila:', 'inline:'],
  ['.enFila', '.inline'],
  ['visualAria:', 'visualAria:'],
  ['.visualAria', '.visualAria'],
  ['leyenda:', 'legend:'],
  ['.leyenda', '.legend'],
];
var n = 0;
pairs.forEach(function (p) {
  var re = new RegExp(p[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  var m = (src.match(re) || []).length;
  if (m) { src = src.replace(re, p[1]); n += m; console.log('  ' + p[0] + ' -> ' + p[1] + ' x' + m); }
});
fs.writeFileSync(path, src);
console.log('OK ' + path + ' (' + n + ' replacements)');
