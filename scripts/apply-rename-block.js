#!/usr/bin/env node
/* Apply rename-app + rename-shape + rename-html-css to a list of slugs. */
'use strict';
var execFile = require('child_process').execFileSync;
var slugs = process.argv.slice(2);
if (!slugs.length) { console.error('usage: apply-rename-block.js slug1 [slug2...]'); process.exit(2); }
var failures = 0;
slugs.forEach(function (slug) {
  console.log('=== ' + slug + ' ===');
  [['scripts/rename-app.js', 'tools/' + slug + '/app.js'],
   ['scripts/rename-shape.js', 'tools/' + slug + '/app.js'],
   ['scripts/rename-html-css.js', slug]].forEach(function (cmd) {
    try {
      var out = execFile('node', cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
      console.log('  ' + cmd[0] + ': ' + out.replace(/\n/g, ' ').trim());
    } catch (e) {
      failures += 1;
      console.log('  FAIL ' + cmd[0] + ': ' + (e.stderr ? e.stderr.toString().trim() : e.message));
    }
  });
  try {
    var parse = execFile('node', ['--check', 'tools/' + slug + '/app.js'], { stdio: ['ignore', 'pipe', 'pipe'] });
    console.log('  parse: OK');
  } catch (e) {
    failures += 1;
    console.log('  parse: FAIL');
  }
});
console.log('---');
console.log(failures ? 'FAILURES=' + failures : 'ALL OK');
process.exit(failures ? 1 : 0);
