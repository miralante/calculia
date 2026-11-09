'use strict';
/* Checks: es/en key parity and usage vs registration of the strings. Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, vm = ctx.vm, ROOT = ctx.ROOT;
  var failures = ctx.failures, largeFileWarnings = ctx.largeFileWarnings;
  var rel = ctx.rel, listJs = ctx.listJs, landingFiles = ctx.landingFiles, landingFilesByExt = ctx.landingFilesByExt;
  var LANDING_FILES = ctx.LANDING_FILES, execFileSync = ctx.execFileSync, execFile = ctx.execFile;
  var slugs = ctx.shared.slugs, toolsDir = ctx.shared.toolsDir, slugCode = ctx.shared.slugCode, EXTRA_MODULES = ctx.shared.EXTRA_MODULES, CANONICAL_BASE = ctx.shared.CANONICAL_BASE, STRING_LOCALES = ctx.shared.STRING_LOCALES, swContent = ctx.shared.swContent;

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
    ctx.checks += 1;
    var dictEs = extractDictFromStrings(esFile);
    var dictEn = extractDictFromStrings(enFile);
    if (!dictEs || !dictEn) {
      failures.push(label + ': no se han podido extraer los dicts es/en');
      return;
    }
    var keysEs = flatKeys(dictEs, '').filter(notCoreUiKey).sort();
    var keysEn = flatKeys(dictEn, '').filter(notCoreUiKey).sort();
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
    ctx.checks += 1;
    var dictEs = extractDictFromStrings(esFile);
    var dictEn = extractDictFromStrings(enFile);
    if (!dictEs || !dictEn) {
      failures.push(label + ': no se han podido extraer los dicts es/en');
      return;
    }
    var keysEs = flatKeys(dictEs, '').filter(notCoreUiKey).sort();
    var keysEn = flatKeys(dictEn, '').filter(notCoreUiKey).sort();
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
  compareEsEn(ROOT, 'raíz/');
  compareEsEn(path.join(ROOT, 'config'), 'config/');
  compareEsEn(path.join(ROOT, 'legal'), 'legal/');
  /* Hidden routes with their own strings.<locale>.js pair (about/):
     each is a standalone guide aimed at families/therapists/agents, not
     linked from the main menu, and must keep the same es/en key parity
     as everything else the user can reach. The function definition sits
     next to extractDictFromStrings above; calling it for a missing
     directory is a no-op (it bails on the first fs.existsSync check). */
  if (fs.existsSync(path.join(ROOT, 'about'))) compareEsEn(path.join(ROOT, 'about'), 'about/');

  /* --- 8. Usage vs registration ---
     Point 4 only checks that strings.es.js and strings.en.js agree with
     EACH OTHER. It does not catch a key that is referenced from
     index.html (data-i18n*) or app.js (App.i18n.t()/App.i18n.pick(), or
     a local t() alias — e.g. tools/roman-numerals/app.js defines
     `function t(key) { return App.i18n.t(key); }`) but was never
     registered in either language file: browser fallback then renders
     the literal key name on the page. This section cross-references
     actual usage sites against the registered keys, per unit
     (tools/<slug>/, the site root, config/, legal/) and per language.
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

  /* The ui.* keys that the core dictionary (assets/js/i18n.js) gives every
     activity in both locales. An activity does not need to repeat them. */
  var CORE_UI_KEYS = null;
  function coreUiKeys() {
    /* Not `=== null`: the checks below run before this file reaches the declaration above. */
    if (!CORE_UI_KEYS) {
      var src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'i18n.js'), 'utf8');
      var start = src.indexOf('      ui: {');
      var end = src.indexOf('\n      }', start);
      CORE_UI_KEYS = (src.slice(start, end).match(/^\s+\w+: /gm) || []).map(function (line) {
        return 'ui.' + line.trim().replace(/:$/, '');
      });
    }
    return CORE_UI_KEYS;
  }
  function isCoreUiKey(key) { return coreUiKeys().indexOf(key) !== -1; }
  function notCoreUiKey(key) { return !isCoreUiKey(key); }

  var GLOBAL_KEY_PREFIXES = ['core.', 'feedback.'];
  function isGlobalKey(key) {
    return GLOBAL_KEY_PREFIXES.some(function (p) { return key.indexOf(p) === 0; });
  }

  function checkUsageVsRegistration(dir, label) {
    var esFile = path.join(dir, 'strings.es.js');
    var enFile = path.join(dir, 'strings.en.js');
    if (!fs.existsSync(esFile) || !fs.existsSync(enFile)) return;
    ctx.checks += 1;
    var dictEs = extractDictFromStrings(esFile);
    var dictEn = extractDictFromStrings(enFile);
    if (!dictEs || !dictEn) return; /* ya reportado en el punto 4 */
    var keysEs = flatKeys(dictEs, '');
    var keysEn = flatKeys(dictEn, '');
    var used = extractKeysFromHtml(path.join(dir, 'index.html'))
      .concat(extractKeysFromAppJs(path.join(dir, 'app.js')))
      .concat(EXTRA_MODULES.reduce(function (acc, name) {
        var file = path.join(dir, name);
        return fs.existsSync(file) ? acc.concat(extractKeysFromAppJs(file)) : acc;
      }, []));
    var seen = {};
    used = used.filter(function (u) {
      var id = (u.prefix ? 'prefijo:' : 'exacta:') + u.key;
      if (isGlobalKey(u.key) || isCoreUiKey(u.key) || seen[id]) return false;
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
  checkUsageVsRegistration(ROOT, 'raíz/');
  checkUsageVsRegistration(path.join(ROOT, 'config'), 'config/');
  checkUsageVsRegistration(path.join(ROOT, 'legal'), 'legal/');

};
