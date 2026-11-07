#!/usr/bin/env node
/* ============================================================
   Calculia — scripts/check.js
   Structural check with no dependencies (plain Node only).
   Usage: node scripts/check.js
   Checks:
   1. That every .js file in tools/, the landing at the site root, config/, legal/ and
      assets/js/ parses (equivalent to `node --check`).
   2. That every tools/<slug>/ has the canonical files:
      index.html, app.js, data.js, strings.es.js, strings.en.js, styles.css.
   3. sw.js <-> disk parity: every FILES path exists, and every
      tool file is listed in FILES.
   4. es/en key parity between strings.es.js and strings.en.js
      (tools/, the site root, config/, legal/).
   5. Public/private catalog split: the root index.html links only
      Roman Numerals, Shapes and Scale; dev/index.html links to the
      other activities plus the ones named in BOTH_SLUGS; together
      they cover all activity slugs in tools/, config/, and sw.js
      FILES.
   6. Mandatory rule: zero mentions of disability, occupational therapy
      or minors in user-facing files (see doc/<locale>/SPEC.md §4).
 6.1 Zero school-year / syllabus labels in anything served to the
      browser (same scope as 6, comments included). The curriculum
      decides the order activities are built and shown in, but the
      person must never meet it: telling an adult that a screen is
      "2º de Primaria" says they are doing a child's exercise. The
      reasoning belongs in TODO.md and doc/<locale>/spec.md, which are
      not served. See doc/es/spec.md §8.1.
   7. _headers: every quoted Content-Security-Policy source expression
      (e.g. 'self') has exactly one leading and one trailing quote —
      catches malformed quoting like ''self'' that browsers silently
      drop, turning a directive into "block everything" (this bit
      teclatlon in production; see the sibling repo's CLOUDFLARE.md).
   8. Usage vs registration: every data-i18n / data-i18n-aria /
      data-i18n-title key referenced in a unit's index.html, and every
      literal key passed to App.i18n.t() / App.i18n.pick() / a local
      t() alias in its app.js, must be registered in BOTH
      strings.es.js and strings.en.js. Point 4 only compares the two
      strings.<locale>.js files against each other, so a key that is
      used on the page but never registered in EITHER language would
      pass silently there; this point closes that gap.
   9. CSS class coverage in tools/<slug>/: every class token emitted
      from app.js (literal in class="…" / className='…', or
      concatenated prefix of the shape '<name>-' + …) must resolve
      to a selector that exists in some .css in the repo. Closes the
      gap that hid the elevator visual in tools/numbers/ on
      2026-08-20 (app.js was emitting `piso-row` / `piso-actual`
      while styles.css had long been renamed to `floor-row` /
      `current-floor`). Scope: tools/<slug>/{app.js} only — the
      core stylesheets in assets/css/ are pooled on the CSS side so
      legitimate shared classes do not trip the check.
  10. _redirects stays within Cloudflare's per-file limits
      (https://developers.cloudflare.com/pages/configuration/redirects/):
      a maximum of 2 000 static redirects and 100 dynamic
      (placeholder) redirects per file — 2 100 in total. If the file
      is absent (the common case for projects that have no redirects)
      the check is skipped: zero is valid.
  11. _headers stays within Cloudflare's per-file limit of 100
      header rules per file
      (https://developers.cloudflare.com/pages/configuration/headers/).
      A "rule" is one path-glob block (the glob line followed by
      indented header lines), so the wildcards of `/assets/*` plus
      its two Cache-Control lines count as one rule each, not three.
      If the file is absent the check is skipped.
  12. No shipped file exceeds Cloudflare Pages' 25 MB per-file
      limit. Recursively walks the repo, excluding `.git/`,
      `node_modules/`, `.claude/` (graphify skill + agent settings,
      never uploaded), and `graphify-out*` (build artifacts). Warns
      at 20 MB (still legal but worth a nudge) and fails at 25 MB
      (Cloudflare will reject the deploy). This is the load-bearing
      check of the three: the other two only bite if someone
      hand-curates a giant _redirects/_headers, but any single image
      or video edit can silently push a shipping asset past 25 MB.
   Output: list of failures with the exact file. Exit code 1 if there
   are any, "OK (N checks)" otherwise.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var execFileSync = require('child_process').execFileSync;
var execFile = require('child_process').execFile;

var ROOT = path.join(__dirname, '..');
var failures = [];
var largeFileWarnings = [];

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

/* The public landing lives at the site root: index.html plus app.js,
   styles.css and the strings.<locale>.js pair next to it, the same shape
   apptonomia uses, so https://calculia.apptonomia.uk/ serves the app
   directly instead of redirecting to /site/. `site/` now only holds a
   back-compat redirect stub, so every check that used to scan a `site/`
   directory targets these root files instead. */
var LANDING_FILES = ['index.html', 'app.js', 'styles.css', 'strings.es.js', 'strings.en.js'];
function landingFiles() {
  return LANDING_FILES
    .map(function (f) { return path.join(ROOT, f); })
    .filter(function (p) { return fs.existsSync(p); });
}
function landingFilesByExt(ext) {
  return landingFiles().filter(function (p) { return p.endsWith(ext); });
}

function listJs(dir) {
  var result = [];
  if (!fs.existsSync(dir)) return result;
  (function walk(current) {
    var entries = fs.readdirSync(current, { withFileTypes: true });
    entries.forEach(function (entry) {
      var filePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        result.push(filePath);
      }
    });
  })(dir);
  return result;
}

/* The sections live in scripts/checks/: structure, strings, catalog, content and assets.
   Each one adds to ctx.checks and ctx.failures; the report below prints the totals. */
var ctx = {
  fs: fs, path: path, vm: vm, ROOT: ROOT, failures: failures, largeFileWarnings: largeFileWarnings,
  checks: 0, rel: rel, listJs: listJs, landingFiles: landingFiles, landingFilesByExt: landingFilesByExt,
  LANDING_FILES: LANDING_FILES, execFileSync: execFileSync, execFile: execFile, shared: {}, parseJobs: null
};
['structure', 'strings', 'catalog', 'content', 'assets'].forEach(function (name) {
  require('./checks/' + name + '.js')(ctx);
});

/* --- Result --- */
ctx.parseJobs.then(function () {
  if (ctx.largeFileWarnings.length) {
    console.log('WARNINGS (' + ctx.largeFileWarnings.length + ') \u2014 non-blocking, ver https://developers.cloudflare.com/pages/limits/ (limite 25 MB por archivo):');
    ctx.largeFileWarnings.forEach(function (w) { console.log('  - ' + w); });
    console.log('');
  }
  if (ctx.failures.length) {
    console.log('FALLOS (' + ctx.failures.length + '):');
    ctx.failures.forEach(function (f) { console.log('  - ' + f); });
    process.exitCode = 1;
  } else {
    console.log('OK (' + ctx.checks + ' checks)');
  }
});
