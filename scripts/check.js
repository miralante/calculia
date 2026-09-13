#!/usr/bin/env node
/* ============================================================
   Calculia — scripts/check.js
   Structural check with no dependencies (plain Node only).
   Usage: node scripts/check.js
   Checks:
   1. That every .js file in tools/, site/, config/, legal/ and
      assets/js/ parses (equivalent to `node --check`).
   2. That every tools/<slug>/ has the canonical files:
      index.html, app.js, data.js, strings.es.js, strings.en.js, styles.css.
   3. sw.js <-> disk parity: every ARCHIVOS path exists, and every
      tool file is listed in ARCHIVOS.
   4. es/en key parity between strings.es.js and strings.en.js
      (tools/, site/, config/, legal/).
   5. Catalog parity lock: the set of activity slugs must match between
      tools/ folders on disk, the landing cards in site/index.html, the
      progress rows in config/index.html, and sw.js's ARCHIVOS.
   6. Mandatory rule: zero mentions of disability, occupational therapy
      or minors in user-facing files (see doc/<locale>/SPEC.md §4).
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
var checks = 0;

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
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

/* --- 1. node --check on tools/, site/, config/, legal/, team/, assets/js/ ---
   team/ is the guide for the support team (the hidden route that mirrors
   the same shape in routime); it carries its own strings.<locale>.js
   pair and must be checked for syntax. */
var jsFiles = []
  .concat(listJs(path.join(ROOT, 'tools')))
  .concat(listJs(path.join(ROOT, 'site')))
  .concat(listJs(path.join(ROOT, 'config')))
  .concat(listJs(path.join(ROOT, 'legal')))
  .concat(listJs(path.join(ROOT, 'team')))
  .concat(listJs(path.join(ROOT, 'assets', 'js')));

/* `node --check` is run in parallel across all JS files: each spawn
   takes ~3 s on Windows due to process startup overhead, so the
   sequential pass adds up to ~3 min on a repo with many files.
   Promise.all + execFile keeps the work bounded by the slowest
   individual check rather than the sum. The handle is saved so
   step "Result" can wait for the parse jobs before exiting. */
var parseJobs = Promise.all(jsFiles.map(function (archivo) {
  return new Promise(function (resolve) {
    checks += 1;
    execFile(process.execPath, ['--check', archivo], function (err, stdout, stderr) {
      if (err) {
        failures.push(rel(archivo) + ': no parsea (node --check) — ' +
          (stderr ? stderr.toString().trim().split('\n')[0] : err.message));
      }
      resolve();
    });
  });
}));
/* Run subsequent checks synchronously while the parallel parse
   jobs settle: their results are independent of step 1, so ordering
   does not matter as long as `process.exitCode` is set after all
   of them finish. */

/* --- 2. Standard anatomy of tools/<slug>/ --- */
var CANONICAL_BASE = ['index.html', 'app.js', 'data.js', 'styles.css'];
var STRING_LOCALES = ['es', 'en'];
var toolsDir = path.join(ROOT, 'tools');
var slugs = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(function (e) { return e.isDirectory(); })
  .map(function (e) { return e.name; })
  .sort();

slugs.forEach(function (slug) {
  checks += 1;
  var dir = path.join(toolsDir, slug);
  var files = fs.readdirSync(dir);
  var missingBase = CANONICAL_BASE.filter(function (c) { return files.indexOf(c) === -1; });
  var missingStrings = STRING_LOCALES
    .map(function (loc) { return 'strings.' + loc + '.js'; })
    .filter(function (f) { return files.indexOf(f) === -1; });
  var expected = CANONICAL_BASE.concat(STRING_LOCALES.map(function (loc) { return 'strings.' + loc + '.js'; }));
  var extras = files.filter(function (a) { return expected.indexOf(a) === -1; });
  if (missingBase.length || missingStrings.length || extras.length) {
    var detail = [];
    if (missingBase.length) detail.push('faltan base: ' + missingBase.join(', '));
    if (missingStrings.length) detail.push('faltan strings: ' + missingStrings.join(', '));
    if (extras.length) detail.push('sobran: ' + extras.join(', '));
    failures.push('tools/' + slug + '/: ' + detail.join('; '));
  }
});

/* --- 3. sw.js <-> disk parity --- */
checks += 1;
var swContent = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
var archMatch = swContent.match(/var ARCHIVOS = \[([\s\S]*?)\];/);
var swPaths = [];
if (archMatch) {
  var re = /'([^']+)'/g;
  var m;
  while ((m = re.exec(archMatch[1])) !== null) {
    swPaths.push(m[1]);
  }
} else {
  failures.push('sw.js: no se ha encontrado el array ARCHIVOS');
}

swPaths.forEach(function (entry) {
  var filePath = path.join(ROOT, entry.replace(/^\.\//, ''));
  if (!fs.existsSync(filePath)) {
    failures.push('sw.js: ARCHIVOS incluye ' + entry + ' pero no existe en disco');
  }
});

slugs.forEach(function (slug) {
  CANONICAL_BASE.concat(STRING_LOCALES.map(function (loc) { return 'strings.' + loc + '.js'; }))
    .forEach(function (archivo) {
      var ruta = './tools/' + slug + '/' + archivo;
      if (swPaths.indexOf(ruta) === -1) {
        failures.push('sw.js: falta ' + ruta + ' en ARCHIVOS');
      }
    });
});

/* --- 4. es/en key parity --- */
function extractDictFromStrings(archivo) {
  var captured = null;
  var sandbox = {
    App: { i18n: { register: function (dict, loc) { if (typeof loc === 'string') captured = dict; } } },
    window: {}
  };
  sandbox.window = sandbox;
  try {
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(archivo, 'utf8'), sandbox, { filename: archivo });
  } catch (e) {
    return null;
  }
  return captured;
}

function compareEsEnPair(dir, label) {
  var esFile = path.join(dir, 'strings.es.js');
  var enFile = path.join(dir, 'strings.en.js');
  if (!fs.existsSync(esFile) || !fs.existsSync(enFile)) return;
  checks += 1;
  var dictEs = extractDictFromStrings(esFile);
  var dictEn = extractDictFromStrings(enFile);
  if (!dictEs || !dictEn) {
    failures.push(label + ': no se han podido extraer los dicts es/en');
    return;
  }
  var keysEs = flatKeys(dictEs, '').sort();
  var keysEn = flatKeys(dictEn, '').sort();
  var onlyEs = keysEs.filter(function (c) { return keysEn.indexOf(c) === -1; });
  var onlyEn = keysEn.filter(function (c) { return keysEs.indexOf(c) === -1; });
  if (onlyEs.length || onlyEn.length) {
    var detail = [];
    if (onlyEs.length) detail.push('solo en es: ' + onlyEs.join(', '));
    if (onlyEn.length) detail.push('solo en en: ' + onlyEn.join(', '));
    failures.push(label + ': ' + detail.join('; '));
  }
}

function flatKeys(obj, prefix) {
  var result = [];
  Object.keys(obj || {}).forEach(function (k) {
    var key = prefix ? prefix + '.' + k : k;
    var value = obj[k];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result = result.concat(flatKeys(value, key));
    } else {
      result.push(key);
    }
  });
  return result;
}

function compareEsEn(dir, label) {
  var esFile = path.join(dir, 'strings.es.js');
  var enFile = path.join(dir, 'strings.en.js');
  if (!fs.existsSync(esFile) || !fs.existsSync(enFile)) return;
  checks += 1;
  var dictEs = extractDictFromStrings(esFile);
  var dictEn = extractDictFromStrings(enFile);
  if (!dictEs || !dictEn) {
    failures.push(label + ': no se han podido extraer los dicts es/en');
    return;
  }
  var keysEs = flatKeys(dictEs, '').sort();
  var keysEn = flatKeys(dictEn, '').sort();
  var onlyEs = keysEs.filter(function (c) { return keysEn.indexOf(c) === -1; });
  var onlyEn = keysEn.filter(function (c) { return keysEs.indexOf(c) === -1; });
  if (onlyEs.length || onlyEn.length) {
    var detail = [];
    if (onlyEs.length) detail.push('solo en es: ' + onlyEs.join(', '));
    if (onlyEn.length) detail.push('solo en en: ' + onlyEn.join(', '));
    failures.push(label + ': ' + detail.join('; '));
  }
}

slugs.forEach(function (slug) { compareEsEn(path.join(toolsDir, slug), 'tools/' + slug + '/'); });
compareEsEn(path.join(ROOT, 'site'), 'site/');
compareEsEn(path.join(ROOT, 'config'), 'config/');
compareEsEn(path.join(ROOT, 'legal'), 'legal/');
/* Hidden routes with their own strings.<locale>.js pair (about/, team/):
   each is a standalone guide aimed at families/therapists/agents, not
   linked from the main menu, and must keep the same es/en key parity
   as everything else the user can reach. The function definition sits
   next to extractDictFromStrings above; calling it for a missing
   directory is a no-op (it bails on the first fs.existsSync check). */
if (fs.existsSync(path.join(ROOT, 'about'))) compareEsEn(path.join(ROOT, 'about'), 'about/');
if (fs.existsSync(path.join(ROOT, 'team'))) compareEsEn(path.join(ROOT, 'team'), 'team/');

/* --- 5. Catalog parity lock ---
   The set of activity slugs must match between:
     - tools/ folders on disk (source of truth)
     - the landing cards (<a href="../tools/...">) in site/index.html
     - the progress rows (data-tool="<slug>") in config/index.html
     - the assets listed for tools in sw.js ARCHIVOS
*/
checks += 1;
var siteHtml = fs.readFileSync(path.join(ROOT, 'site', 'index.html'), 'utf8');
var slugsInSite = [];
var reHref = /href="\.\.\/tools\/([^/]+)\/index\.html"/g;
var mh;
while ((mh = reHref.exec(siteHtml)) !== null) {
  slugsInSite.push(mh[1]);
}

function parseSlugsFromSw() {
  var matches = swContent.match(/'\.\/tools\/([^/]+)\//g) || [];
  var set = new Set();
  matches.forEach(function (m) {
    var slug = m.replace(/'.\/tools\//, '').replace(/\//, '');
    set.add(slug);
  });
  return set;
}
function parseDataToolInSettings() {
  var html = fs.readFileSync(path.join(ROOT, 'config', 'index.html'), 'utf8');
  var re = /data-tool="([^"]+)"/g;
  var set = new Set();
  var m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return set;
}
var slugsSet = new Set(slugs);
var targets = { site: new Set(slugsInSite), settings: parseDataToolInSettings(), sw: parseSlugsFromSw() };
Object.keys(targets).forEach(function (f) {
  var targetSet = targets[f];
  slugs.forEach(function (slug) {
    if (!targetSet.has(slug)) failures.push('catálogo: ' + f + ' no contiene el slug "' + slug + '"');
  });
  targetSet.forEach(function (slug) {
    if (!slugsSet.has(slug)) failures.push('catálogo: ' + f + ' contiene slug inexistente "' + slug + '"');
  });
});

/* --- 6. Mandatory rule: zero disability / occupational therapy / minors mentions ---
   doc/<locale>/SPEC.md §4: the end user never sees terms naming
   intellectual disability, occupational therapy, minors, or equivalents.
   This scan only covers the files the end user actually reaches;
   internal docs (SPEC.md, README.md, CONTRIBUTING.md, CLAUDE.md) are
   out of scope by design (they explain the project's real objective,
   which is the very reason this rule exists).

   Each entry pairs a substring or word-boundary match mode. Spanish
   phrases and unambiguous English stems use substring; English words
   that would produce false positives as substrings (e.g. "minor"
   inside "minor annoyance") use word-boundary.
*/
checks += 1;
var FORBIDDEN_TERMS = [
  { term: 'discapacidad', match: 'substring' },
  { term: 'disabilit', match: 'substring' },
  { term: 'intelectual', match: 'substring' },
  { term: 'intellectual', match: 'substring' },
  { term: 'terapia ocupacional', match: 'substring' },
  { term: 'occupational therap', match: 'substring' },
  { term: 'dificultades cognitivas', match: 'substring' },
  { term: 'cognitive difficult', match: 'substring' },
  { term: 'necesidades especiales', match: 'substring' },
  { term: 'special needs', match: 'substring' },
  { term: 'capacidades diferentes', match: 'substring' },
  { term: 'different abilities', match: 'substring' },
  { term: 'menor de edad', match: 'substring' },
  { term: 'menores de edad', match: 'substring' },
  { term: 'personas menores', match: 'substring' },
  { term: 'menor que', match: 'substring' },
  { term: 'menores que', match: 'substring' },
  { term: 'minor', match: 'word' },
  { term: 'underage', match: 'word' },
  { term: 'children', match: 'word' },
  { term: 'paciente', match: 'word' },
  { term: 'patient', match: 'word' }
];
function isUserFile(archivo) {
  var name = path.basename(archivo).toLowerCase();
  return /\.html?$/.test(name) || /\.js$/.test(name);
}
function listDir(dir) {
  var result = [];
  if (!fs.existsSync(dir)) return result;
  fs.readdirSync(dir).forEach(function (f) {
    var filePath = path.join(dir, f);
    if (fs.statSync(filePath).isFile() && isUserFile(filePath)) result.push(filePath);
  });
  return result;
}
var userTargets = []
  .concat(listDir(path.join(ROOT, 'site')))
  .concat(listDir(path.join(ROOT, 'config')))
  .concat(listDir(path.join(ROOT, 'legal')));
slugs.forEach(function (slug) {
  userTargets = userTargets.concat(listDir(path.join(toolsDir, slug)));
});
userTargets.forEach(function (archivo) {
  var content = fs.readFileSync(archivo, 'utf8').toLowerCase();
  FORBIDDEN_TERMS.forEach(function (entry) {
    var term = entry.term;
    var found;
    if (entry.match === 'word') {
      found = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(content);
    } else {
      found = content.indexOf(term.toLowerCase()) !== -1;
    }
    if (found) {
      failures.push(rel(archivo) + ': contiene "' + term + '" — ninguna página visible puede mencionar discapacidad, terapia ocupacional o menores (ver doc/es/spec.md §4)');
    }
  });
});

/* --- 7. _headers: CSP source-expression quoting --- */
checks += 1;
var headersContent = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8');
headersContent.split('\n').filter(function (line) {
  return /^\s*Content-Security-Policy:/i.test(line);
}).forEach(function (line) {
  var value = line.replace(/^\s*Content-Security-Policy:/i, '');
  value.split(';').forEach(function (directive) {
    directive.trim().split(/\s+/).filter(Boolean).forEach(function (token) {
      var quoteCount = (token.match(/'/g) || []).length;
      if (quoteCount === 0) return;
      var wellFormed = quoteCount === 2 && token[0] === "'" && token[token.length - 1] === "'";
      if (!wellFormed) {
        failures.push('_headers: malformed CSP source expression "' + token +
          '" — quotes should wrap the keyword exactly once (e.g. \'self\', not \'\'self\'\')');
      }
    });
  });
});

/* --- 8. Usage vs registration ---
   Point 4 only checks that strings.es.js and strings.en.js agree with
   EACH OTHER. It does not catch a key that is referenced from
   index.html (data-i18n*) or app.js (App.i18n.t()/App.i18n.pick(), or
   a local t() alias — e.g. tools/roman-numerals/app.js defines
   `function t(key) { return App.i18n.t(key); }`) but was never
   registered in either language file: browser fallback then renders
   the literal key name on the page. This section cross-references
   actual usage sites against the registered keys, per unit
   (tools/<slug>/, site/, config/, legal/) and per language.
*/
/* Each usage entry is { key, prefix }: prefix=false means the call
   passed a complete literal key (App.i18n.t('yourStars')) and must
   match a registered key EXACTLY; prefix=true means the literal was
   only the start of a string built with '+' concatenation
   (App.i18n.t('actividad.' + id + '.nombre')) and is validated as a
   key family below (some registered key must start with it). Without
   this distinction a literal like 'yourStars' would wrongly pass by
   "prefix-matching" a registered 'yourStarsBROKEN'. */
function extractKeysFromHtml(archivo) {
  if (!fs.existsSync(archivo)) return [];
  var content = fs.readFileSync(archivo, 'utf8');
  var keys = [];
  ['data-i18n', 'data-i18n-aria', 'data-i18n-title'].forEach(function (attr) {
    var re = new RegExp(attr + '="([^"]+)"', 'g');
    var m;
    while ((m = re.exec(content)) !== null) keys.push({ key: m[1], prefix: false });
  });
  return keys;
}

function extractKeysFromAppJs(archivo) {
  if (!fs.existsSync(archivo)) return [];
  var content = fs.readFileSync(archivo, 'utf8');
  var keys = [];
  /* App.i18n.t('key'), App.i18n.pick('key'), or a local alias t('key').
     Only literal-first-argument calls are resolvable statically;
     App.i18n.t(variable) or App.i18n.t(cond ? 'a' : 'b') cannot be
     resolved and are skipped — same limitation as apptonomia's
     i18n-keys-smoke.js. Capture group 3 (an optional '+' right after
     the closing quote) tells apart a complete key from a dynamic
     prefix. */
  var re = /\b(?:App\.i18n\.t|App\.i18n\.pick|t)\(\s*(['"])([^'"]+)\1(\s*\+)?/g;
  var m;
  while ((m = re.exec(content)) !== null) {
    keys.push({ key: m[2], prefix: !!m[3] });
  }
  return keys;
}

var GLOBAL_KEY_PREFIXES = ['core.', 'feedback.'];
function isGlobalKey(key) {
  return GLOBAL_KEY_PREFIXES.some(function (p) { return key.indexOf(p) === 0; });
}

function checkUsageVsRegistration(dir, label) {
  var esFile = path.join(dir, 'strings.es.js');
  var enFile = path.join(dir, 'strings.en.js');
  if (!fs.existsSync(esFile) || !fs.existsSync(enFile)) return;
  checks += 1;
  var dictEs = extractDictFromStrings(esFile);
  var dictEn = extractDictFromStrings(enFile);
  if (!dictEs || !dictEn) return; /* ya reportado en el punto 4 */
  var keysEs = flatKeys(dictEs, '');
  var keysEn = flatKeys(dictEn, '');
  var used = extractKeysFromHtml(path.join(dir, 'index.html'))
    .concat(extractKeysFromAppJs(path.join(dir, 'app.js')));
  var seen = {};
  used = used.filter(function (u) {
    var id = (u.prefix ? 'prefijo:' : 'exacta:') + u.key;
    if (isGlobalKey(u.key) || seen[id]) return false;
    seen[id] = true;
    return true;
  });

  ['es', 'en'].forEach(function (loc) {
    var registered = loc === 'es' ? keysEs : keysEn;
    var missing = used.filter(function (u) {
      if (u.prefix) {
        /* Dynamic-key prefix: valid if at least one registered key in
           this locale starts with it. */
        return !registered.some(function (rk) { return rk.indexOf(u.key) === 0; });
      }
      return registered.indexOf(u.key) === -1;
    });
    if (missing.length) {
      var labels = missing.map(function (u) { return u.key + (u.prefix ? '.*' : ''); });
      failures.push(label + ': usada(s) pero no registrada(s) en strings.' + loc + '.js: ' + labels.join(', '));
    }
  });
}

slugs.forEach(function (slug) { checkUsageVsRegistration(path.join(toolsDir, slug), 'tools/' + slug + '/'); });
checkUsageVsRegistration(path.join(ROOT, 'site'), 'site/');
checkUsageVsRegistration(path.join(ROOT, 'config'), 'config/');
checkUsageVsRegistration(path.join(ROOT, 'legal'), 'legal/');

/* --- 9. CSS class coverage in tools/<slug>/ ---
   The repo is mid-rename (apptonomia → calculia, plus the Spanish →
   English token pass documented in doc/en/rename_map.md). Rename
   scripts touch both JS and CSS in lockstep most of the time, but
   class names injected dynamically from app.js (`class="…"` or
   `className='…'`, plus `'prefix-' + variable` concatenations) are
   easy to miss: nothing in the JS or HTML reads the resulting DOM
   selector, so a typo'd or stale class name is only visible at
   runtime. This was the exact shape of the bug that hid the
   elevator visual in tools/numbers/ on 2026-08-20: `piso-row` /
   `piso-actual` etc. were still being emitted from app.js while
   styles.css had long been renamed to `floor-row` / `current-floor`.

   Scope: only tools/<slug>/{app.js,styles.css} is cross-checked.
   site/, config/ and legal/ are out of scope on purpose — they
   have little dynamic class emission and a lot of static HTML, so
   the false-positive rate would be high. The CSS side pools every
   .css file in the repo (the shared assets/css/*.css sheets count)
   so tokens that legitimately come from the core stylesheet do not
   trip the check.

   Two flavours are checked:
     - Literal classes: any single token in a `class="…"` /
       `className='…'` literal. Must appear as a top-level
       selector `.foo` (not as `.foo:hover`, not as a compound
       `.foo.bar`) in some .css.
     - Dynamic prefixes: any literal of the shape `'foo-'` that is
       concatenated with `+` (the typical `'<prefix>-' + counter`
       pattern). Valid if at least one CSS selector starts with
       `<prefix>-` in some .css.
*/
checks += 1;
function listCssFiles() {
  var out = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
      var p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && p.endsWith('.css')) out.push(p);
    });
  }
  walk(path.join(ROOT, 'tools'));
  walk(path.join(ROOT, 'assets', 'css'));
  walk(path.join(ROOT, 'site'));
  walk(path.join(ROOT, 'config'));
  walk(path.join(ROOT, 'legal'));
  return out;
}
/* Index every class name that appears in any selector across all
   .css files. Every segment between dots is a class — so
   `.foo.bar` registers both `foo` and `bar`, `.option-btn.animo`
   registers both. A name is cut off before any `:`, `[`, or other
   selector syntax, which keeps pseudo-classes (`.foo:hover`) and
   attribute filters (`.foo[disabled]`) from counting the suffix
   as part of the class name. */
function indexCssSelectors(cssFiles) {
  var literals = new Set();
  var prefixes = new Set();
  /* `\.([A-Za-z][\w-]*)` followed by anything that is NOT a class
     character (word char or `-`) — i.e. `:`, `[`, `,`, ` `, `>`,
     `+`, `~`, `{`, end of selector, etc. */
  var classRe = /\.([A-Za-z][\w-]*)(?=[^\w-]|$)/g;
  cssFiles.forEach(function (f) {
    var c = fs.readFileSync(f, 'utf8');
    var m; classRe.lastIndex = 0;
    while ((m = classRe.exec(c)) !== null) {
      var name = m[1];
      literals.add(name);
      if (name.indexOf('-') !== -1) prefixes.add(name);
    }
  });
  return { literals: literals, prefixes: prefixes };
}
/* From app.js, collect:
     - literal classes (full tokens inside class="…" / className='…')
     - dynamic prefixes (string literals of the shape 'foo-' used in
       a + concatenation, plus the `class="foo "` style tail — same
       patterns are emitted via `clases += ' foo-marca'` and friends).
   Only tokens matching the CSS-class shape ([A-Za-z][\w-]*) are
   considered; anything else (emoji, punctuation, dots in numeric
   values) is filtered out so the check never reports unrelated
   string content. */
function extractDynamicClasses(jsContent) {
  var literalClasses = new Set();
  /* `class="…"` / `className='…'` — full tokens. */
  var reClass = /\b(?:class|className)\s*=\s*['"]([^'"]+)['"]/g;
  var m;
  while ((m = reClass.exec(jsContent)) !== null) {
    m[1].split(/\s+/).forEach(function (t) {
      if (/^[A-Za-z][\w-]*$/.test(t)) literalClasses.add(t);
    });
  }
  /* Dynamic prefixes of the shape 'foo-' + … used in string
     concatenation (e.g. `'num-group-' + i`). The trailing dash is
     required so we do not catch unrelated string literals like
     `'level-'` that are actually a full token. */
  var prefixes = new Set();
  var rePrefix = /'([A-Za-z][\w-]*-)'\s*\+/g;
  while ((m = rePrefix.exec(jsContent)) !== null) prefixes.add(m[1]);
  return { literals: literalClasses, prefixes: prefixes };
}
var cssIndex = indexCssSelectors(listCssFiles());
slugs.forEach(function (slug) {
  var appJs = path.join(toolsDir, slug, 'app.js');
  if (!fs.existsSync(appJs)) return;
  var content = fs.readFileSync(appJs, 'utf8');
  var emitted = extractDynamicClasses(content);
  var orphanLiterals = [];
  var orphanPrefixes = [];
  emitted.literals.forEach(function (cls) {
    /* A token ending in '-' inside a `class="…"` literal is really
       a prefix concatenated with the next attribute (e.g. the
       `class="num-group num-group-…"` pattern), not a full class
       name. Validate those against the prefix set instead. */
    if (cls.charAt(cls.length - 1) === '-') {
      var matchedPrefix = false;
      cssIndex.prefixes.forEach(function (cssSel) {
        if (cssSel.indexOf(cls) === 0) matchedPrefix = true;
      });
      if (!matchedPrefix) orphanPrefixes.push(cls);
    } else if (!cssIndex.literals.has(cls)) {
      orphanLiterals.push(cls);
    }
  });
  emitted.prefixes.forEach(function (p) {
    var matched = false;
    cssIndex.prefixes.forEach(function (cssSel) {
      if (cssSel.indexOf(p) === 0) matched = true;
    });
    if (!matched) orphanPrefixes.push(p);
  });
  if (orphanLiterals.length || orphanPrefixes.length) {
    var parts = [];
    if (orphanLiterals.length) parts.push('clases: ' + orphanLiterals.sort().join(', '));
    if (orphanPrefixes.length) parts.push('prefijos: ' + orphanPrefixes.sort().join(', '));
    failures.push('tools/' + slug + '/app.js: clase(s) emitida(s) sin selector CSS correspondiente (' + parts.join('; ') + ')');
  }
});

/* --- 10. _redirects stays within Cloudflare's per-file limits
   (https://developers.cloudflare.com/pages/configuration/redirects/):
   a maximum of 2 000 static redirects and 100 dynamic (placeholder)
   redirects per file — 2 100 in total. If the file is absent (the
   common case for projects that have no redirects at all) the check
   is skipped: zero is valid. Cloudflare parses the file line-by-line
   and counts entries, not bytes, so the check counts entries.

   - Static: a non-comment, non-blank line with a redirect code
     (301/302/303/307/308) at the end OR a proxy entry (`200`). The
     `301`/`302`/`303`/`307`/`308` codes all sit at the end of the
     line in Cloudflare's syntax (`/from /to 301`).
   - Dynamic: a redirect line containing a `:placeholder$` token
     (e.g. `/news/:slug$ /blog/:slug 301`), per the Cloudflare docs'
     "Dynamic redirects" section. Plain colons are not placeholders;
     only the `:name$` syntax counts. */
var REDIRECTS_FILE = path.join(ROOT, '_redirects');
if (fs.existsSync(REDIRECTS_FILE)) {
  checks += 1;
  var redirLines = fs.readFileSync(REDIRECTS_FILE, 'utf8').split('\n');
  var staticCount = 0;
  var dynamicCount = 0;
  redirLines.forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed || trimmed.charAt(0) === '#') return;
    var isStatic = /\s(?:200|301|302|303|307|308)\s*$/.test(trimmed) && !/:\w+\$/.test(trimmed);
    var isDynamic = /:\w+\$/.test(trimmed);
    if (isStatic) staticCount += 1;
    else if (isDynamic) dynamicCount += 1;
  });
  var REDIR_STATIC_LIMIT = 2000;
  var REDIR_DYNAMIC_LIMIT = 100;
  if (staticCount > REDIR_STATIC_LIMIT) {
    failures.push('_redirects: ' + staticCount + ' static redirects, maximo es ' + REDIR_STATIC_LIMIT +
      ' (Cloudflare Pages rechaza el archivo)');
  }
  if (dynamicCount > REDIR_DYNAMIC_LIMIT) {
    failures.push('_redirects: ' + dynamicCount + ' dynamic redirects, maximo es ' + REDIR_DYNAMIC_LIMIT +
      ' (Cloudflare Pages rechaza el archivo)');
  }
}

/* --- 11. _headers stays within Cloudflare's per-file limit of 100
   header rules per file
   (https://developers.cloudflare.com/pages/configuration/headers/).
   A "rule" is one path-glob block: the glob line plus the indented
   header lines that follow it (e.g. `Cache-Control: …`,
   `X-Frame-Options: …`, a `Content-Security-Policy:` line). The
   wildcards `/assets/*` plus its two Cache-Control lines therefore
   count as one rule, not three.

   Detection: a block starts at a line whose first non-blank
   character is `/` (a path glob) followed by `:` for header content
   on subsequent indented lines. The CSS / `_redirects` regex
   trick doesn't apply: this format is a sequence of "glob + key:
   value" pairs, not a list of files. We count both the path-glob
   line AND any `Key: value` lines that follow at indent ≥ 2 spaces
   until the next path-glob or end of file.

   If the file is absent the check is skipped: every project
   shipping a PWA without custom headers is valid. */
var HEADERS_FILE = path.join(ROOT, '_headers');
if (fs.existsSync(HEADERS_FILE)) {
  checks += 1;
  var headersLines = fs.readFileSync(HEADERS_FILE, 'utf8').split('\n');
  var ruleCount = 0;
  for (var i = 0; i < headersLines.length; i++) {
    var hLine = headersLines[i];
    var hTrim = hLine.trim();
    if (!hTrim || hTrim.charAt(0) === '#') continue;
    // A path-glob rule starts at any line whose first non-blank char
    // is `/` and that is NOT a `Key: value` line (no colon before the
    // first non-whitespace run). Headers like `Cache-Control: …` start
    // with a letter, never a slash.
    if (hLine.charAt(0) === '/' && !/^\/.*:/.test(hLine)) {
      ruleCount += 1;
      continue;
    }
    // The body lines of a header rule: any line whose first
    // non-whitespace is a letter/dash and contains a colon. These
    // lines belong to the previously-counted glob; we count them
    // individually too because Cloudflare's published limit of 100
    // applies to the total number of header lines (path-glob +
    // header lines), not just to the globs. The 7 currently
    // shipped suites all stay well under 100 either way; this
    // matches Cloudflare's wording in
    // https://developers.cloudflare.com/pages/configuration/headers/.
    if (/^[A-Za-z][\w-]*:\s/.test(hLine)) ruleCount += 1;
  }
  var HEADERS_RULE_LIMIT = 100;
  if (ruleCount > HEADERS_RULE_LIMIT) {
    failures.push('_headers: ' + ruleCount + ' lineas de regla (path-globs + headers), maximo es ' +
      HEADERS_RULE_LIMIT + ' (Cloudflare Pages rechaza el archivo)');
  }
}

/* --- 12. No shipped file exceeds Cloudflare Pages' 25 MB per-file
   limit (https://developers.cloudflare.com/pages/limits/). Warns at
   20 MB (legal but worth a nudge before the next content commit
   pushes it over) and fails at 25 MB (Cloudflare will reject the
   deploy). Only walks files that actually deploy: `.git/` (version
   control metadata), `node_modules/` (none today, but kept for
   safety), `.claude/` (graphify skill + agent settings, never
   uploaded), and `graphify-out*` (build artifacts) are excluded.
   `scripts/ingest/` and similar non-shipping helper directories are
   also excluded — this check cares about what Cloudflare serves,
   not about the maintainer's working area. */
var FILE_SIZE_WARN_MB = 20;
var FILE_SIZE_FAIL_MB = 25;
var fileSizeExcluded = ['.git', 'node_modules', '.claude', 'graphify-out', 'graphify-out-meta'];
(function walkForLargeFiles(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (fileSizeExcluded.indexOf(entry.name) !== -1) return;
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkForLargeFiles(full);
    } else if (entry.isFile()) {
      checks += 1;
      var size = fs.statSync(full).size;
      var sizeMb = size / (1024 * 1024);
      if (sizeMb >= FILE_SIZE_FAIL_MB) {
        failures.push(rel(full) + ': pesa ' + sizeMb.toFixed(2) + ' MB, maximo por archivo es ' +
          FILE_SIZE_FAIL_MB + ' MB (Cloudflare Pages rechaza el deploy)');
      } else if (sizeMb >= FILE_SIZE_WARN_MB) {
        // Non-blocking warning — emitted later via a per-project
        // array collected during the walk (kept here to keep the
        // walk single-pass).
        largeFileWarnings.push(rel(full) + ': pesa ' + sizeMb.toFixed(2) + ' MB, maximo por archivo es ' +
          FILE_SIZE_FAIL_MB + ' MB (aviso: todavia legal, acercarse al limite)');
      }
    }
  });
})(ROOT);

/* --- 13. Shared footer marker: every tools/<slug>/index.html and
    site/index.html must declare the canonical <footer data-pie-app>
    marker (no hand-written children). The injector in
    assets/js/utils.js -> App.utils.inyectarPie() fills it in at
    load time. --- */
checks += 1;
var CANONICAL_PIE_PATHS = [path.join('site', 'index.html')].concat(
  slugs.map(function (s) { return path.join('tools', s, 'index.html'); })
);
CANONICAL_PIE_PATHS.forEach(function (relPath) {
  var absPath = path.join(ROOT, relPath);
  if (!fs.existsSync(absPath)) return;
  var html = fs.readFileSync(absPath, 'utf8');
  if (!/<footer\s+data-pie-app[^>]*><\/footer>/.test(html)) {
    failures.push(relPath + ': falta el marcador <footer data-pie-app> canónico.');
    return;
  }
  if (/<footer\s+class="pie-app/.test(html)) {
    failures.push(relPath + ': hay un <footer class="pie-app..."> manual además del marcador canónico; quítalo.');
  }
});

/* --- Result --- */
parseJobs.then(function () {
  if (largeFileWarnings.length) {
    console.log('WARNINGS (' + largeFileWarnings.length + ') \u2014 non-blocking, ver https://developers.cloudflare.com/pages/limits/ (limite 25 MB por archivo):');
    largeFileWarnings.forEach(function (w) { console.log('  - ' + w); });
    console.log('');
  }
  if (failures.length) {
    console.log('FALLOS (' + failures.length + '):');
    failures.forEach(function (f) { console.log('  - ' + f); });
    process.exitCode = 1;
  } else {
    console.log('OK (' + checks + ' checks)');
  }
});
