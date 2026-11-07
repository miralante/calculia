#!/usr/bin/env node
/* Keeps the FILES list of sw.js in step with the disk.

   Every file under assets/css, assets/js, assets/img and assets/fonts is part
   of the app shell, and every tools/<slug>/ folder is an activity the app
   works offline. Both must be in the service worker's FILES list. Without
   this, a new file works online and is missing offline.

     node scripts/sync-sw-files.js          adds the missing entries, drops the
                                            stale tools/ entries, fixes commas
     node scripts/sync-sw-files.js --check  only reports them (exit 1 if any)

   The tools/<slug>/ block is generated from the folders on disk: the folder
   itself ('./tools/<slug>/', which serves index.html) and every other file in
   it. check.js still verifies the anatomy of each tool. The file is written
   only if it still parses as JavaScript: a missing comma between entries once
   left sw.js unparsable, so no service worker was ever installed. */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const SHELL_DIRS = ['assets/css', 'assets/js', 'assets/img', 'assets/fonts'];
const ENTRY = /^(\s*)'([^']+)'\s*,?\s*$/;

function filesFromSw(sw) {
  const match = sw.match(/var FILES = \[([\s\S]*?)\];/);
  if (!match) throw new Error('sw.js: no se ha encontrado el array FILES');
  const body = match[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  return new Set([...body.matchAll(/'([^']+)'/g)].map(m => m[1]));
}

/* Entries that tools/<slug>/ must list: the folder, then each file except index.html. */
function toolEntriesOnDisk() {
  const toolsDir = path.join(ROOT, 'tools');
  const out = [];
  for (const slug of fs.readdirSync(toolsDir).sort()) {
    const dir = path.join(toolsDir, slug);
    if (!fs.statSync(dir).isDirectory() || !fs.existsSync(path.join(dir, 'index.html'))) continue;
    out.push('./tools/' + slug + '/');
    for (const name of fs.readdirSync(dir).sort()) {
      if (name === 'index.html' || name.startsWith('.')) continue;
      if (fs.statSync(path.join(dir, name)).isFile()) out.push('./tools/' + slug + '/' + name);
    }
  }
  return out;
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

/* The tools/ entries of sw.js that are not on disk, and the ones on disk that are not listed. */
function toolsDrift(sw) {
  const listed = [...filesFromSw(sw)].filter(e => e.startsWith('./tools/'));
  const disk = toolEntriesOnDisk();
  return {
    missing: disk.filter(e => !listed.includes(e)),
    stale: listed.filter(e => !disk.includes(e))
  };
}

/* Rewrites the FILES block: drops stale tools entries, inserts missing ones next to
   their folder's block, adds missing shell files before the closing bracket, and gives
   every entry its comma. Returns the new text. */
function rewrite(sw) {
  const open = sw.indexOf('var FILES = [');
  const close = sw.indexOf('];', open);
  if (open < 0 || close < 0) throw new Error('sw.js: no se ha encontrado el array FILES');
  const head = sw.slice(0, open);
  const tail = sw.slice(close);
  let lines = sw.slice(open + 'var FILES = ['.length, close).split('\n');
  const drift = toolsDrift(sw);

  lines = lines.filter(line => {
    const m = ENTRY.exec(line);
    return !(m && drift.stale.includes(m[2]));
  });

  for (const entry of drift.missing) {
    const slugPrefix = entry.endsWith('/') ? entry : entry.slice(0, entry.lastIndexOf('/') + 1);
    let at = -1;
    lines.forEach((line, i) => {
      const m = ENTRY.exec(line);
      if (m && m[2].startsWith(slugPrefix)) at = i;
    });
    if (at < 0) {
      lines.forEach((line, i) => {
        const m = ENTRY.exec(line);
        if (m && m[2].startsWith('./tools/')) at = i;
      });
    }
    const indent = '  ';
    if (at < 0) lines.splice(lines.length - 1, 0, indent + "'" + entry + "',");
    else lines.splice(at + 1, 0, indent + "'" + entry + "',");
  }

  const shell = missingShellFiles(head + 'var FILES = [' + lines.join('\n') + '\n' + tail);
  if (shell.length) {
    const last = lines.length - 1;
    lines.splice(last, 0, '  // shared shell files added by scripts/sync-sw-files.js');
    shell.forEach(entry => lines.splice(last + 1, 0, "  '" + entry + "',"));
  }

  lines = lines.map(line => {
    const m = ENTRY.exec(line);
    return m ? m[1] + "'" + m[2] + "'," : line;
  });
  return head + 'var FILES = [' + lines.join('\n') + tail;
}

function parses(text) {
  try { new vm.Script(text); return true; } catch (e) { return false; }
}

function main() {
  const check = process.argv.includes('--check');
  const sw = fs.readFileSync(SW, 'utf8');
  const shell = missingShellFiles(sw);
  const drift = toolsDrift(sw);
  const block = sw.slice(sw.indexOf('var FILES = ['), sw.indexOf('];', sw.indexOf('var FILES = [')));
  const commas = block.split('\n').filter(l => ENTRY.test(l) && !/,\s*$/.test(l));
  if (!shell.length && !drift.missing.length && !drift.stale.length && !commas.length) {
    console.log('sw.js: FILES al día con el disco (shell y tools/)');
    return 0;
  }
  if (check) {
    if (shell.length) console.log('sw.js: faltan en FILES: ' + shell.join(', '));
    if (drift.missing.length) console.log('sw.js: faltan tools/ en FILES: ' + drift.missing.join(', '));
    if (drift.stale.length) console.log('sw.js: sobran en FILES (no están en el disco): ' + drift.stale.join(', '));
    if (commas.length) console.log('sw.js: entradas sin coma en FILES: ' + commas.length);
    return 1;
  }
  const updated = rewrite(sw);
  if (!parses(updated)) throw new Error('sw.js: la reescritura de FILES no es JavaScript válido; no se escribe nada');
  fs.writeFileSync(SW, updated);
  if (shell.length) console.log('sw.js: añadidos ' + shell.length + ' ficheros de assets/ a FILES: ' + shell.join(', '));
  if (drift.missing.length) console.log('sw.js: añadidos ' + drift.missing.length + ' entradas de tools/ a FILES');
  if (drift.stale.length) console.log('sw.js: quitadas ' + drift.stale.length + ' entradas de tools/ que ya no están en el disco');
  if (commas.length) console.log('sw.js: corregidas ' + commas.length + ' entradas sin coma');
  console.log('Recuerda subir VERSION en sw.js (scripts/check-version-bump.js).');
  return 0;
}

if (require.main === module) process.exitCode = main();
module.exports = { missingShellFiles, toolsDrift, rewrite, parses };
