'use strict';
/* One-off migration: rewrite internal links that point at ".../index.html"
   to the canonical directory URL (".../").

   Why: Cloudflare Workers static assets answers "/x/index.html" with a 307
   to "/x/". The service worker's cache.addAll() stores the followed response
   under the ORIGINAL key with `redirected: true`, and a redirected response
   may not be handed to a top-level navigation, so Chrome kills the load with
   net::ERR_FAILED ("No se puede acceder a este sitio"). Confirmed by
   scripts/one-off/probe-redirect-isolated.js: with the SW enabled every
   ".../index.html" navigation fails while the trailing-slash URL returns 200.

   Only href/src VALUES ending in index.html are touched, and only inside the
   site itself. External URLs (https://...) are left alone.
   Run: node scripts/one-off/rewrite-index-links.js   (dry run by default) */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const APPLY = process.argv.includes('--apply');

const SKIP_DIRS = new Set(['node_modules', '.git', '.wrangler', '.dev', 'graphify-out', 'test-results', 'doc', '.github', '.claude']);

/* "tools/x/index.html" -> "tools/x/", "../../index.html" -> "../../".
   A bare "index.html" becomes "./" so the trailing slash still resolves to
   the same directory instead of jumping to the site root. */
function canonicalHref(value) {
  if (!value.endsWith('index.html')) return null;
  const base = value.slice(0, -'index.html'.length);
  if (base === '') return './';
  return base.endsWith('/') ? base : base + '/';
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (/\.html$/.test(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

let touchedFiles = 0;
let touchedLinks = 0;
const report = [];

for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, 'utf8');
  const perFile = [];

  const updated = original.replace(/\b(href|src)="([^"]*)"/g, (whole, attr, value) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//') || value.startsWith('#')) return whole;
    const canonical = canonicalHref(value);
    if (canonical === null) return whole;
    perFile.push({ attr, from: value, to: canonical });
    return `${attr}="${canonical}"`;
  });

  if (!perFile.length) continue;
  touchedFiles += 1;
  touchedLinks += perFile.length;
  report.push({ file: path.relative(ROOT, file), links: perFile });
  if (APPLY) fs.writeFileSync(file, updated, 'utf8');
}

console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'}: ${touchedLinks} link(s) across ${touchedFiles} file(s)`);
for (const r of report) {
  console.log(`\n  ${r.file}`);
  for (const l of r.links) console.log(`    ${l.attr}: ${l.from}  ->  ${l.to}`);
}
if (!APPLY) console.log('\nRe-run with --apply to write these changes.');