#!/usr/bin/env node
/* Reports the text keys of an activity's strings files that nothing uses.

   A key counts as used when its name appears quoted in the activity's own
   files (index.html, app.js, data.js and any other .js in the folder) or in
   the shared scripts of assets/js. A dynamic key such as 'q.' + type is
   matched by its literal prefix ('q.'), so the check stays on the safe side:
   it can miss a dead key, but it does not report a live one.

     node scripts/dead-strings.js           report per activity
     node scripts/dead-strings.js --apply   remove the single-line keys that
                                            are unused in both locales

   The shared core dictionary (assets/js/i18n.js) is not checked here. */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');

function loadDict(file) {
  let captured = null;
  const sandbox = { App: { i18n: { register: (dict, loc) => { if (typeof loc === 'string') captured = dict; } } } };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return captured;
}

function flatKeys(obj, prefix) {
  let out = [];
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out = out.concat(flatKeys(v, key));
    else out.push(key);
  });
  return out;
}

function sourceText(dir) {
  const parts = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (/\.(html|js)$/.test(name) && !/^strings\./.test(name)) parts.push(fs.readFileSync(p, 'utf8'));
  }
  const shared = path.join(ROOT, 'assets', 'js');
  for (const name of fs.readdirSync(shared)) {
    if (name.endsWith('.js')) parts.push(fs.readFileSync(path.join(shared, name), 'utf8'));
  }
  return parts.join('\n');
}

/* The quoted strings of the source, and the prefixes of the dynamic ones. */
function usedMatcher(text) {
  const literals = new Set([...text.matchAll(/['"]([\w.\-]+)['"]/g)].map(m => m[1]));
  /* Any quoted literal with a dot that starts a key counts as a dynamic prefix:
     'month.m' + pad, 'level.' + id, 'concept.' + n + '.title' all qualify. */
  const prefixes = new Set([...text.matchAll(/['"]([\w\-]+\.[\w.\-]*)['"]/g)].map(m => m[1]));
  return function (key) {
    if (literals.has(key)) return true;
    for (const p of prefixes) if (key.indexOf(p) === 0) return true;
    return false;
  };
}

const report = [];
let totalDead = 0;
for (const slug of fs.readdirSync(path.join(ROOT, 'tools'))) {
  const dir = path.join(ROOT, 'tools', slug);
  const es = path.join(dir, 'strings.es.js');
  const en = path.join(dir, 'strings.en.js');
  if (!fs.existsSync(es) || !fs.existsSync(en)) continue;
  const dictEs = loadDict(es), dictEn = loadDict(en);
  if (!dictEs || !dictEn) continue;
  const used = usedMatcher(sourceText(dir));
  const keys = [...new Set(flatKeys(dictEs, '').concat(flatKeys(dictEn, '')))];
  const dead = keys.filter(k => !used(k));
  if (!dead.length) continue;
  totalDead += dead.length;
  report.push(slug + ': ' + dead.join(', '));

  if (APPLY) {
    /* A single-line leaf is removed only when its name is unique in the file, so no
       other key with the same name can be taken by mistake. */
    for (const file of [es, en]) {
      const text = fs.readFileSync(file, 'utf8');
      const lines = text.split('\n');
      const kept = lines.filter(line => {
        const m = line.match(/^\s*(\w+): (['"]).*\2,?\s*$/);
        if (!m || !dead.some(k => k === m[1] || k.endsWith('.' + m[1]))) return true;
        const occurrences = (text.match(new RegExp('\\b' + m[1] + ':', 'g')) || []).length;
        return occurrences !== 1;
      });
      if (kept.length !== lines.length) fs.writeFileSync(file, kept.join('\n'));
    }
  }
}
console.log(report.length ? report.join('\n') : 'Sin claves sin uso.');
console.log('Total de claves sin uso (ambos idiomas): ' + totalDead + (APPLY ? ' (se han retirado las de una línea)' : ''));
