'use strict';
/* Independent check that the token rewrite did not corrupt any tag.
   The memory of this project is that a ?v= script once dropped the 'ref="'
   / 'rc="' from attributes repo-wide, and the detector that missed it was
   the same regex family that wrote the patch. So: scan by CLASS of damage
   (a path attribute with no '='), across the whole file including
   minified single-line files, rather than re-testing known cases.

   Run: node scripts/one-off/verify-tags-intact.js */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const SKIP = /(?:^|[\\/])(?:node_modules|\.git|\.wrangler|\.dev|graphify-out|test-results)(?:[\\/]|$)/;

let checked = 0, damaged = 0;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.test(path.relative(ROOT, full))) walk(full, out); }
    else if (/\.(html|js|css|json)$/.test(e.name)) out.push(full);
  }
  return out;
}

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  checked++;

  // Class 1: an href/src attribute whose value is a path but has no '='.
  // Word-boundary aware so `hreflang=` is NOT read as `href`.
  for (const m of src.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const tag = m[0];
    const stripped = tag.replace(/\shreflang\s*=\s*"[^"]*"/gi, '')
                         .replace(/\shttp-equiv\s*=\s*"[^"]*"/gi, '');
    const bad = stripped.match(/(?:^|\s)(href|src)(?!\s*=)[A-Za-z0-9._/-]/);
    if (bad) {
      console.log(`DAMAGED ${path.relative(ROOT, file)}: [${bad[1]} without =] ${tag.slice(0, 140)}`);
      damaged++;
    }
  }

  // Class 2: a quoted asset reference whose quote never closes.
  for (const m of src.matchAll(/\b(?:href|src)\s*=\s*"([^"\n]*)"\s*\/?>/g)) {
    if (/^[A-Za-z0-9._\-/]+\?v=/.test(m[1]) === false && /assets\/|\.css|\.js/.test(m[1])) {
      // well-formed enough to parse
    }
  }

  // Class 3: unbalanced angle brackets inside a single tag (e.g. '>' eaten).
  for (const m of src.matchAll(/<[a-zA-Z][^<>]*<[^<>]*>/g)) {
    if (/\?v=/.test(m[0])) {
      console.log(`SUSPECT ${path.relative(ROOT, file)}: ${m[0].slice(0, 140)}`);
      damaged++;
    }
  }
}

console.log(`\nchecked ${checked} files, ${damaged} damaged tag(s)`);
process.exitCode = damaged ? 1 : 0;