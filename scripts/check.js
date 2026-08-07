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
   Output: list of failures with the exact file. Exit code 1 if there
   are any, "OK (N checks)" otherwise.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var execFileSync = require('child_process').execFileSync;

var RAIZ = path.join(__dirname, '..');
var fallos = [];
var checks = 0;

function rel(p) {
  return path.relative(RAIZ, p).split(path.sep).join('/');
}

function listarJs(dir) {
  var out = [];
  if (!fs.existsSync(dir)) return out;
  (function recorrer(actual) {
    var entradas = fs.readdirSync(actual, { withFileTypes: true });
    entradas.forEach(function (entrada) {
      var full = path.join(actual, entrada.name);
      if (entrada.isDirectory()) {
        recorrer(full);
      } else if (entrada.isFile() && entrada.name.endsWith('.js')) {
        out.push(full);
      }
    });
  })(dir);
  return out;
}

/* --- 1. node --check on tools/, site/, settings/, legal/, assets/js/ --- */
var archivosJs = []
  .concat(listarJs(path.join(RAIZ, 'tools')))
  .concat(listarJs(path.join(RAIZ, 'site')))
  .concat(listarJs(path.join(RAIZ, 'settings')))
  .concat(listarJs(path.join(RAIZ, 'legal')))
  .concat(listarJs(path.join(RAIZ, 'assets', 'js')));

archivosJs.forEach(function (archivo) {
  checks += 1;
  try {
    execFileSync(process.execPath, ['--check', archivo], { stdio: 'pipe' });
  } catch (e) {
    fallos.push(rel(archivo) + ': no parsea (node --check) — ' +
      (e.stderr ? e.stderr.toString().trim().split('\n')[0] : e.message));
  }
});

/* --- 2. Standard anatomy of tools/<slug>/ --- */
var CANONICOS_BASE = ['index.html', 'app.js', 'data.js', 'styles.css'];
var STRING_LOCALES = ['es', 'en'];
var toolsDir = path.join(RAIZ, 'tools');
var slugs = fs.readdirSync(toolsDir, { withFileTypes: true })
  .filter(function (e) { return e.isDirectory(); })
  .map(function (e) { return e.name; })
  .sort();

slugs.forEach(function (slug) {
  checks += 1;
  var dir = path.join(toolsDir, slug);
  var archivos = fs.readdirSync(dir);
  var faltanBase = CANONICOS_BASE.filter(function (c) { return archivos.indexOf(c) === -1; });
  var faltanStrings = STRING_LOCALES
    .map(function (loc) { return 'strings.' + loc + '.js'; })
    .filter(function (f) { return archivos.indexOf(f) === -1; });
  var esperados = CANONICOS_BASE.concat(STRING_LOCALES.map(function (loc) { return 'strings.' + loc + '.js'; }));
  var sobran = archivos.filter(function (a) { return esperados.indexOf(a) === -1; });
  if (faltanBase.length || faltanStrings.length || sobran.length) {
    var detalle = [];
    if (faltanBase.length) detalle.push('faltan base: ' + faltanBase.join(', '));
    if (faltanStrings.length) detalle.push('faltan strings: ' + faltanStrings.join(', '));
    if (sobran.length) detalle.push('sobran: ' + sobran.join(', '));
    fallos.push('tools/' + slug + '/: ' + detalle.join('; '));
  }
});

/* --- 3. sw.js <-> disk parity --- */
checks += 1;
var swContenido = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
var matchArchivos = swContenido.match(/var ARCHIVOS = \[([\s\S]*?)\];/);
var rutasSw = [];
if (matchArchivos) {
  var re = /'([^']+)'/g;
  var m;
  while ((m = re.exec(matchArchivos[1])) !== null) {
    rutasSw.push(m[1]);
  }
} else {
  fallos.push('sw.js: no se ha encontrado el array ARCHIVOS');
}

rutasSw.forEach(function (ruta) {
  var full = path.join(RAIZ, ruta.replace(/^\.\//, ''));
  if (!fs.existsSync(full)) {
    fallos.push('sw.js: ARCHIVOS incluye ' + ruta + ' pero no existe en disco');
  }
});

slugs.forEach(function (slug) {
  CANONICOS_BASE.concat(STRING_LOCALES.map(function (loc) { return 'strings.' + loc + '.js'; }))
    .forEach(function (archivo) {
      var ruta = './tools/' + slug + '/' + archivo;
      if (rutasSw.indexOf(ruta) === -1) {
        fallos.push('sw.js: falta ' + ruta + ' en ARCHIVOS');
      }
    });
});

/* --- 4. es/en key parity --- */
function extraerDictDeStrings(archivo) {
  var capturado = null;
  var sandbox = {
    App: { i18n: { register: function (dict, loc) { if (typeof loc === 'string') capturado = dict; } } },
    window: {}
  };
  sandbox.window = sandbox;
  try {
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(archivo, 'utf8'), sandbox, { filename: archivo });
  } catch (e) {
    return null;
  }
  return capturado;
}

function clavesPlanas(obj, prefijo) {
  var out = [];
  Object.keys(obj || {}).forEach(function (k) {
    var clave = prefijo ? prefijo + '.' + k : k;
    var valor = obj[k];
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      out = out.concat(clavesPlanas(valor, clave));
    } else {
      out.push(clave);
    }
  });
  return out;
}

function compararEsEn(dir, etiqueta) {
  var archivoEs = path.join(dir, 'strings.es.js');
  var archivoEn = path.join(dir, 'strings.en.js');
  if (!fs.existsSync(archivoEs) || !fs.existsSync(archivoEn)) return;
  checks += 1;
  var dictEs = extraerDictDeStrings(archivoEs);
  var dictEn = extraerDictDeStrings(archivoEn);
  if (!dictEs || !dictEn) {
    fallos.push(etiqueta + ': no se han podido extraer los dicts es/en');
    return;
  }
  var clavesEs = clavesPlanas(dictEs, '').sort();
  var clavesEn = clavesPlanas(dictEn, '').sort();
  var soloEs = clavesEs.filter(function (c) { return clavesEn.indexOf(c) === -1; });
  var soloEn = clavesEn.filter(function (c) { return clavesEs.indexOf(c) === -1; });
  if (soloEs.length || soloEn.length) {
    var detalle = [];
    if (soloEs.length) detalle.push('solo en es: ' + soloEs.join(', '));
    if (soloEn.length) detalle.push('solo en en: ' + soloEn.join(', '));
    fallos.push(etiqueta + ': ' + detalle.join('; '));
  }
}

slugs.forEach(function (slug) { compararEsEn(path.join(toolsDir, slug), 'tools/' + slug + '/'); });
compararEsEn(path.join(RAIZ, 'site'), 'site/');
compararEsEn(path.join(RAIZ, 'settings'), 'settings/');
compararEsEn(path.join(RAIZ, 'legal'), 'legal/');

/* --- 5. Catalog parity lock ---
   The set of activity slugs must match between:
     - tools/ folders on disk (source of truth)
     - the landing cards (<a href="../tools/...">) in site/index.html
     - the progress rows (data-tool="<slug>") in settings/index.html
     - the assets listed for tools in sw.js ARCHIVOS
*/
checks += 1;
var siteHtml = fs.readFileSync(path.join(RAIZ, 'site', 'index.html'), 'utf8');
var slugsEnSite = [];
var reHref = /href="\.\.\/tools\/([^/]+)\/index\.html"/g;
var mh;
while ((mh = reHref.exec(siteHtml)) !== null) {
  slugsEnSite.push(mh[1]);
}

function parsearSlugsDeSw() {
  var matches = swContenido.match(/'\.\/tools\/([^/]+)\//g) || [];
  var set = new Set();
  matches.forEach(function (m) {
    var slug = m.replace(/'.\/tools\//, '').replace(/\//, '');
    set.add(slug);
  });
  return set;
}
function parsearDataToolInSettings() {
  var html = fs.readFileSync(path.join(RAIZ, 'settings', 'index.html'), 'utf8');
  var re = /data-tool="([^"]+)"/g;
  var set = new Set();
  var m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return set;
}
var slugsSet = new Set(slugs);
var destinos = { site: new Set(slugsEnSite), settings: parsearDataToolInSettings(), sw: parsearSlugsDeSw() };
Object.keys(destinos).forEach(function (f) {
  var targetSet = destinos[f];
  slugs.forEach(function (slug) {
    if (!targetSet.has(slug)) fallos.push('catálogo: ' + f + ' no contiene el slug "' + slug + '"');
  });
  targetSet.forEach(function (slug) {
    if (!slugsSet.has(slug)) fallos.push('catálogo: ' + f + ' contiene slug inexistente "' + slug + '"');
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
var TERMINOS_PROHIBIDOS = [
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
function esArchivoDeUsuario(archivo) {
  var nombre = path.basename(archivo).toLowerCase();
  return /\.html?$/.test(nombre) || /\.js$/.test(nombre);
}
function listar(dir) {
  var out = [];
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir).forEach(function (f) {
    var full = path.join(dir, f);
    if (fs.statSync(full).isFile() && esArchivoDeUsuario(full)) out.push(full);
  });
  return out;
}
var objetivosUsuario = []
  .concat(listar(path.join(RAIZ, 'site')))
  .concat(listar(path.join(RAIZ, 'settings')))
  .concat(listar(path.join(RAIZ, 'legal')));
slugs.forEach(function (slug) {
  objetivosUsuario = objetivosUsuario.concat(listar(path.join(toolsDir, slug)));
});
objetivosUsuario.forEach(function (archivo) {
  var contenido = fs.readFileSync(archivo, 'utf8').toLowerCase();
  TERMINOS_PROHIBIDOS.forEach(function (entrada) {
    var termino = entrada.term;
    var encontrado;
    if (entrada.match === 'word') {
      encontrado = new RegExp('\\b' + termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(contenido);
    } else {
      encontrado = contenido.indexOf(termino.toLowerCase()) !== -1;
    }
    if (encontrado) {
      fallos.push(rel(archivo) + ': contiene "' + termino + '" — ninguna página visible puede mencionar discapacidad, terapia ocupacional o menores (ver doc/es/SPEC.md §4)');
    }
  });
});

/* --- 7. _headers: CSP source-expression quoting --- */
checks += 1;
var contenidoHeaders = fs.readFileSync(path.join(RAIZ, '_headers'), 'utf8');
contenidoHeaders.split('\n').filter(function (linea) {
  return /^\s*Content-Security-Policy:/i.test(linea);
}).forEach(function (linea) {
  var valor = linea.replace(/^\s*Content-Security-Policy:/i, '');
  valor.split(';').forEach(function (directiva) {
    directiva.trim().split(/\s+/).filter(Boolean).forEach(function (token) {
      var numComillas = (token.match(/'/g) || []).length;
      if (numComillas === 0) return;
      var bienFormado = numComillas === 2 && token[0] === "'" && token[token.length - 1] === "'";
      if (!bienFormado) {
        fallos.push('_headers: malformed CSP source expression "' + token +
          '" — quotes should wrap the keyword exactly once (e.g. \'self\', not \'\'self\'\')');
      }
    });
  });
});

/* --- Result --- */
if (fallos.length) {
  console.log('FALLOS (' + fallos.length + '):');
  fallos.forEach(function (f) { console.log('  - ' + f); });
  process.exitCode = 1;
} else {
  console.log('OK (' + checks + ' checks)');
}