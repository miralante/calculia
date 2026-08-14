#!/usr/bin/env node
/* ============================================================
   Calculia — scripts/check.js
   Structural check with no dependencies (plain Node only).
   Usage: node scripts/check.js
   Checks:
   1. That every .js file in tools/, site/, settings/, legal/ and
      assets/js/ parses (equivalent to `node --check`).
   2. That every tools/<slug>/ has the canonical files:
      index.html, app.js, data.js, strings.es.js, strings.en.js, styles.css.
   3. sw.js <-> disk parity: every ARCHIVOS path exists, and every
      tool file is listed in ARCHIVOS.
   4. es/en key parity between strings.es.js and strings.en.js
      (tools/, site/, settings/, legal/).
   5. Catalog parity lock: the set of activity slugs must match between
      tools/ folders on disk, the landing cards in site/index.html, the
      progress rows in settings/index.html, and sw.js's ARCHIVOS.
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
   Output: list of failures with the exact file. Exit code 1 if there
   are any, "OK (N checks)" otherwise.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var execFileSync = require('child_process').execFileSync;

var RAIZ = path.join(__dirname, '..');
var failures = [];
var checks = 0;

function rel(p) {
  return path.relative(RAIZ, p).split(path.sep).join('/');
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

/* --- 1. node --check on tools/, site/, settings/, legal/, assets/js/ --- */
var jsFiles = []
  .concat(listJs(path.join(RAIZ, 'tools')))
  .concat(listJs(path.join(RAIZ, 'site')))
  .concat(listJs(path.join(RAIZ, 'settings')))
  .concat(listJs(path.join(RAIZ, 'legal')))
  .concat(listJs(path.join(RAIZ, 'assets', 'js')));

jsFiles.forEach(function (archivo) {
  checks += 1;
  try {
    execFileSync(process.execPath, ['--check', archivo], { stdio: 'pipe' });
  } catch (e) {
    failures.push(rel(archivo) + ': no parsea (node --check) — ' +
      (e.stderr ? e.stderr.toString().trim().split('\n')[0] : e.message));
  }
});

/* --- 2. Standard anatomy of tools/<slug>/ --- */
var CANONICAL_BASE = ['index.html', 'app.js', 'data.js', 'styles.css'];
var STRING_LOCALES = ['es', 'en'];
var toolsDir = path.join(RAIZ, 'tools');
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
var swContent = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
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
  var filePath = path.join(RAIZ, entry.replace(/^\.\//, ''));
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
compareEsEn(path.join(RAIZ, 'site'), 'site/');
compareEsEn(path.join(RAIZ, 'settings'), 'settings/');
compareEsEn(path.join(RAIZ, 'legal'), 'legal/');

/* --- 5. Catalog parity lock ---
   The set of activity slugs must match between:
     - tools/ folders on disk (source of truth)
     - the landing cards (<a href="../tools/...">) in site/index.html
     - the progress rows (data-tool="<slug>") in settings/index.html
     - the assets listed for tools in sw.js ARCHIVOS
*/
checks += 1;
var siteHtml = fs.readFileSync(path.join(RAIZ, 'site', 'index.html'), 'utf8');
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
  var html = fs.readFileSync(path.join(RAIZ, 'settings', 'index.html'), 'utf8');
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
  { term: 'minor', match: 'word' },
  { term: 'underage', match: 'word' },
  { term: 'children', match: 'word' }
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
  .concat(listDir(path.join(RAIZ, 'site')))
  .concat(listDir(path.join(RAIZ, 'settings')))
  .concat(listDir(path.join(RAIZ, 'legal')));
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
      failures.push(rel(archivo) + ': contiene "' + term + '" — ninguna página visible puede mencionar discapacidad, terapia ocupacional o menores (ver doc/es/SPEC.md §4)');
    }
  });
});

/* --- 7. _headers: CSP source-expression quoting --- */
checks += 1;
var headersContent = fs.readFileSync(path.join(RAIZ, '_headers'), 'utf8');
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
   (tools/<slug>/, site/, settings/, legal/) and per language.
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
checkUsageVsRegistration(path.join(RAIZ, 'site'), 'site/');
checkUsageVsRegistration(path.join(RAIZ, 'settings'), 'settings/');
checkUsageVsRegistration(path.join(RAIZ, 'legal'), 'legal/');

/* --- Result --- */
if (failures.length) {
  console.log('FALLOS (' + failures.length + '):');
  failures.forEach(function (f) { console.log('  - ' + f); });
  process.exitCode = 1;
} else {
  console.log('OK (' + checks + ' checks)');
}