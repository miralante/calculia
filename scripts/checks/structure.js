'use strict';
/* Checks: every .js file parses, the tools/<slug>/ anatomy and the sw.js FILES parity. Exports the shared list (slugs, toolsDir, ...). Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, vm = ctx.vm, ROOT = ctx.ROOT;
  var failures = ctx.failures, largeFileWarnings = ctx.largeFileWarnings;
  var rel = ctx.rel, listJs = ctx.listJs, landingFiles = ctx.landingFiles, landingFilesByExt = ctx.landingFilesByExt;
  var LANDING_FILES = ctx.LANDING_FILES, execFileSync = ctx.execFileSync, execFile = ctx.execFile;

  /* --- 1. node --check on the landing at the site root, tools/, config/, legal/, team/, assets/js/ ---
     team/ is the guide for the support team (the hidden route that mirrors
     the same shape in routime); it carries its own strings.<locale>.js
     pair and must be checked for syntax. */
  var jsFiles = []
    .concat(listJs(path.join(ROOT, 'tools')))
    .concat(landingFilesByExt('.js'))
    .concat(listJs(path.join(ROOT, 'config')))
    .concat(listJs(path.join(ROOT, 'legal')))
    .concat(listJs(path.join(ROOT, 'team')))
    .concat(listJs(path.join(ROOT, 'assets', 'js')));

  /* Parse each JS file in-process with `new vm.Script(...)` instead of
     spawning `node --check` per file. The original approach (a
     Promise.all over child_process.execFile) was correct but slow on
     Windows: each spawn costs ~3 s of process startup overhead, and
     the repo now has ~140 JS files across the 27 activities — the
     full pass took ~7 min locally even though `vm.Script` itself
     finishes in tens of milliseconds per file. `new vm.Script` only
     parses (it does not run the script), so the semantics match
     `node --check` exactly: a syntax error throws SyntaxError, a
     clean file resolves the wrapper promise. The handle is saved so
     step "Result" can wait for the parse jobs before exiting. */
  var parseJobs = Promise.all(jsFiles.map(function (archivo) {
    return new Promise(function (resolve) {
      ctx.checks += 1;
      var content;
      try {
        content = fs.readFileSync(archivo, 'utf8');
      } catch (e) {
        failures.push(rel(archivo) + ': no parsea (node --check) — ' + e.message);
        return resolve();
      }
      try {
        /* Wrap in a function so top-level `return` / `await` (legal
           in modules and sloppy scripts alike) does not throw. The
           wrapper never runs because we never invoke the script. */
        new vm.Script('(function(){' + content + '\n});', { filename: archivo });
      } catch (e) {
        failures.push(rel(archivo) + ': no parsea (node --check) — ' +
          (e && e.message ? e.message.split('\n')[0] : String(e)));
      }
      resolve();
    });
  }));
  /* Run subsequent checks synchronously while the parallel parse
     jobs settle: their results are independent of step 1, so ordering
     does not matter as long as `process.exitCode` is set after all
     of them finish. */

  /* --- 2. Standard anatomy of tools/<slug>/ --- */
  var CANONICAL_BASE = ['index.html', 'app.js', 'data.js', 'styles.css'];
  var STRING_LOCALES = ['es', 'en'];

  /* Modules an activity may split its code into, next to app.js: model.js (what does not touch the page)
     and comma.js (an exercise with its own state, given what it needs by a host object). The checks that
     read what an activity does read them all, because a split moves the code, not the behaviour. */
  var EXTRA_MODULES = ['model.js', 'comma.js', 'screens.js', 'counter.js', 'art.js', 'figures.js', 'questions.js', 'groups.js', 'typing.js', 'drawing.js', 'faces.js', 'activities.js', 'decomposition.js', 'words.js', 'drawings.js', 'helpers.js', 'generators.js', 'intro.js'];

  function slugCode(dir) {
    var text = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
    EXTRA_MODULES.forEach(function (name) {
      var file = path.join(dir, name);
      if (fs.existsSync(file)) text += '\n' + fs.readFileSync(file, 'utf8');
    });
    return text;
  }
  var toolsDir = path.join(ROOT, 'tools');
  var slugs = fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter(function (e) { return e.isDirectory(); })
    .map(function (e) { return e.name; })
    .sort();

  slugs.forEach(function (slug) {
    ctx.checks += 1;
    var dir = path.join(toolsDir, slug);
    var files = fs.readdirSync(dir);
    var missingBase = CANONICAL_BASE.filter(function (c) { return files.indexOf(c) === -1; });
    var missingStrings = STRING_LOCALES
      .map(function (loc) { return 'strings.' + loc + '.js'; })
      .filter(function (f) { return files.indexOf(f) === -1; });
    var expected = CANONICAL_BASE.concat(STRING_LOCALES.map(function (loc) { return 'strings.' + loc + '.js'; }));
    /* the split modules of an activity (see EXTRA_MODULES below) are allowed next to app.js */
    var extras = files.filter(function (a) { return expected.indexOf(a) === -1 && EXTRA_MODULES.indexOf(a) === -1; });
    if (missingBase.length || missingStrings.length || extras.length) {
      var detail = [];
      if (missingBase.length) detail.push('faltan base: ' + missingBase.join(', '));
      if (missingStrings.length) detail.push('faltan strings: ' + missingStrings.join(', '));
      if (extras.length) detail.push('sobran: ' + extras.join(', '));
      failures.push('tools/' + slug + '/: ' + detail.join('; '));
    }
  });

  /* --- 3. sw.js <-> disk parity --- */
  ctx.checks += 1;
  var swContent = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  var archMatch = swContent.match(/var FILES = \[([\s\S]*?)\];/);
  var swPaths = [];
  if (archMatch) {
    var body = archMatch[1]
      /* Strip comments first: the array legitimately carries explanatory
         comments, and a quoted word inside one (e.g. the CSP's 'self') is
         not a path. Without this, a comment becomes a bogus
         "does not exist on disk" failure. */
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    var re = /'([^']+)'/g;
    var m;
    while ((m = re.exec(body)) !== null) {
      swPaths.push(m[1]);
    }
  } else {
    failures.push('sw.js: no se ha encontrado el array FILES');
  }

  swPaths.forEach(function (entry) {
    var filePath = path.join(ROOT, entry.replace(/^\.\//, ''));
    if (!fs.existsSync(filePath)) {
      failures.push('sw.js: FILES incluye ' + entry + ' pero no existe en disco');
    }
  });

  /* Every shared shell file (assets/css, js, img, fonts) must be in FILES. The
     same rule is enforced by scripts/sync-sw-files.js, which can add them. */
  ctx.checks += 1;
  require('../sync-sw-files.js').missingShellFiles(swContent).forEach(function (entry) {
    failures.push('sw.js: falta ' + entry + ' en FILES (ejecuta node scripts/sync-sw-files.js)');
  });

  /* The tools/ block of FILES is generated from the folders: a stale or missing entry is reported here. */
  ctx.checks += 1;
  var drift = require('../sync-sw-files.js').toolsDrift(swContent);
  drift.missing.forEach(function (entry) {
    failures.push('sw.js: falta ' + entry + ' en FILES (ejecuta node scripts/sync-sw-files.js)');
  });
  drift.stale.forEach(function (entry) {
    failures.push('sw.js: ' + entry + ' en FILES pero no existe en disco (ejecuta node scripts/sync-sw-files.js)');
  });

  slugs.forEach(function (slug) {
    CANONICAL_BASE.concat(STRING_LOCALES.map(function (loc) { return 'strings.' + loc + '.js'; }))
      .forEach(function (archivo) {
        /* index.html is precached under its canonical directory URL: the
           "./tools/<slug>/index.html" form is answered by Cloudflare with a
           307, and caching the followed redirect is what broke navigation
           (see check 15). Every other file keeps its real path. */
        var ruta = archivo === 'index.html'
          ? './tools/' + slug + '/'
          : './tools/' + slug + '/' + archivo;
        if (swPaths.indexOf(ruta) === -1) {
          failures.push('sw.js: falta ' + ruta + ' en FILES');
        }
      });
  });

  ctx.shared = ctx.shared || {};
  ctx.shared.slugs = slugs;
  ctx.shared.toolsDir = toolsDir;
  ctx.shared.slugCode = slugCode;
  ctx.shared.EXTRA_MODULES = EXTRA_MODULES;
  ctx.shared.CANONICAL_BASE = CANONICAL_BASE;
  ctx.shared.STRING_LOCALES = STRING_LOCALES;
  ctx.shared.swContent = swContent;
  ctx.parseJobs = parseJobs;
};
