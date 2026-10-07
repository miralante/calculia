'use strict';
const fs = require('fs');
const s = fs.readFileSync(process.argv[2] || 'sw.js', 'utf8');
const m = s.match(/var\s+(?:ARCHIVOS|FILES)\s*=\s*\[([\s\S]*?)\];/);
const files = [...m[1].matchAll(/['"]\.\/([^'"]+)['"]/g)].map((x) => x[1]);
const css = files.filter((f) => f.endsWith('.css'));
console.log('total en manifiesto:', files.length);
console.log('entradas .css:', css.length);
css.forEach((c) => console.log('   ', c));