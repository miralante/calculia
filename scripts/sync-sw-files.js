#!/usr/bin/env node
/* Keeps the shared shell files of sw.js in step with the disk.

   Every file under assets/css, assets/js, assets/img and assets/fonts is part
   of the app shell, so it must be in the service worker's FILES list. Without
   this, a new shared file works online and is missing offline.

     node scripts/sync-sw-files.js          adds the missing entries to FILES
     node scripts/sync-sw-files.js --check  only reports them (exit 1 if any)

   The tools/<slug>/ files are not handled here: check.js verifies them. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const SHELL_DIRS = ['assets/css', 'assets/js', 'assets/img', 'assets/fonts'];

function filesFromSw(sw) {
  const match = sw.match(/var FILES = \[([\s\S]*?)\];/);
  if (!match) throw new Error('sw.js: no se ha encontrado el array FILES');
  const body = match[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  return new Set([...body.matchAll(/'([^']+)'/g)].map(m => m[1]));
}

function missingShellFiles(sw) {
  const listed = filesFromSw(sw);
  const missing = [];
  for (const dir of SHELL_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs).sort()) {
      if (!fs.statSync(path.join(abs, name)).isFile()) continue;
      const entry = './' + dir + '/' + name;
      if (!listed.has(entry)) missing.push(entry);
    }
  }
  return missing;
}

function main() {
  const check = process.argv.includes('--check');
  const sw = fs.readFileSync(SW, 'utf8');
  const missing = missingShellFiles(sw);
  if (!missing.length) {
    console.log('sw.js: todos los ficheros compartidos estan en FILES');
    return 0;
  }
  if (check) {
    console.log('sw.js: faltan en FILES: ' + missing.join(', '));
    return 1;
  }
  /* Insert before the closing bracket of FILES, one entry per line. */
  const close = sw.indexOf('];', sw.indexOf('var FILES = ['));
  const lines = missing.map(entry => "  '" + entry + "',").join('\n');
  const updated = sw.slice(0, close) + '  // shared shell files added by scripts/sync-sw-files.js\n' +
    lines + '\n' + sw.slice(close);
  fs.writeFileSync(SW, updated);
  console.log('sw.js: añadidos ' + missing.length + ' ficheros a FILES: ' + missing.join(', '));
  console.log('Recuerda subir VERSION en sw.js (scripts/check-version-bump.js).');
  return 0;
}

if (require.main === module) process.exitCode = main();
module.exports = { missingShellFiles };
