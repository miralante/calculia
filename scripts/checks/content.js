'use strict';
/* Checks: forbidden wording, school labels, the footer marker, inline scripts and internal links. Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, vm = ctx.vm, ROOT = ctx.ROOT;
  var failures = ctx.failures, largeFileWarnings = ctx.largeFileWarnings;
  var rel = ctx.rel, listJs = ctx.listJs, landingFiles = ctx.landingFiles, landingFilesByExt = ctx.landingFilesByExt;
  var LANDING_FILES = ctx.LANDING_FILES, execFileSync = ctx.execFileSync, execFile = ctx.execFile;
  var slugs = ctx.shared.slugs, toolsDir = ctx.shared.toolsDir, slugCode = ctx.shared.slugCode, EXTRA_MODULES = ctx.shared.EXTRA_MODULES, CANONICAL_BASE = ctx.shared.CANONICAL_BASE, STRING_LOCALES = ctx.shared.STRING_LOCALES, swContent = ctx.shared.swContent;

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
  ctx.checks += 1;
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
    .concat(landingFilesByExt('.html'))
    .concat(landingFilesByExt('.js'))
    .concat(listDir(path.join(ROOT, 'site')))
    .concat(listDir(path.join(ROOT, 'dev')))
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

  /* --- 6.1 Zero school-year / syllabus labels in what ships ---
     The curriculum drives the order in which activities are built and
     arranged, but the person using the app must never meet it: labelling
     content by school year tells an adult that they are doing a child's
     exercise. The reasoning lives in TODO.md and doc/<locale>/spec.md,
     neither of which is served to the browser.
     Scope is the same shipped surface as check 6, and comments count: a
     served file is readable through "view source".
     "eso" is deliberately NOT in this list — it is an extremely common
     Spanish pronoun, so matching it would be all false positives. */
  ctx.checks += 1;
  var SCHOOL_TERMS = [
    { term: 'primaria', match: 'substring' },
    { term: 'secundaria', match: 'substring' },
    { term: 'bachillerato', match: 'substring' },
    { term: 'temario', match: 'substring' },
    { term: 'currículo', match: 'substring' },
    { term: 'curriculum', match: 'substring' },
    { term: '1º', match: 'substring' },
    { term: '2º', match: 'substring' },
    { term: '3º', match: 'substring' },
    { term: '4º', match: 'substring' },
    { term: '5º', match: 'substring' },
    { term: '6º', match: 'substring' },
    { term: 'school year', match: 'substring' },
    { term: 'grade level', match: 'substring' }
  ];
  userTargets.forEach(function (archivo) {
    var content = fs.readFileSync(archivo, 'utf8').toLowerCase();
    SCHOOL_TERMS.forEach(function (entry) {
      var term = entry.term.toLowerCase();
      var found = entry.match === 'word'
        ? new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(content)
        : content.indexOf(term) !== -1;
      if (found) {
        failures.push(rel(archivo) + ': contiene "' + entry.term +
          '" — lo que se sirve al navegador no puede etiquetar el contenido por curso ni nombrar el temario (ver doc/es/spec.md §8.1)');
      }
    });
  });

  /* --- 13. Shared footer marker: every tools/<slug>/index.html and
      the root index.html must declare the canonical shared footer
      <footer data-suite-footer> (no hand-written children). The shared
      component assets/js/suite-chrome.js fills it in at load time. --- */
  ctx.checks += 1;
  var CANONICAL_PIE_PATHS = ['index.html'].concat(
    slugs.map(function (s) { return path.join('tools', s, 'index.html'); })
  );
  CANONICAL_PIE_PATHS.forEach(function (relPath) {
    var absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) return;
    var html = fs.readFileSync(absPath, 'utf8');
    if (!/<footer\s+data-suite-footer[^>]*><\/footer>/.test(html)) {
      failures.push(relPath + ': falta el marcador <footer data-suite-footer> canónico.');
      return;
    }
    if (/<footer\s+class="pie-app/.test(html)) {
      failures.push(relPath + ': hay un <footer class="pie-app..."> manual además del marcador canónico; quítalo.');
    }
  });

  /* --- CSP: no executable inline <script> in any HTML page.

     The production CSP is `script-src 'self'` with no 'unsafe-inline' and
     no nonce/hash, so an inline <script> is dropped by the browser at
     runtime: no build error, no lint error, no failed test — the code
     simply does not run in production while working perfectly on a preview
     server that sends no CSP.

     That is not hypothetical. An inline `window.LocalePickerConfig` shipped
     that way: the shared locale picker fell back to its own defaults and
     rendered a second settings gear inside the app's own settings drawer.
     The same mistake disabled the service worker, the language buttons on
     the subpages, and (in one app) the whole 404 page.

     Non-executable data blocks (`<script type="application/ld+json">`, the
     JSON-LD in the landing page) are allowed: CSP does not apply to them. */
  var INLINE_DATA_TYPE = /^(application\/ld\+json|application\/json|text\/json|text\/template)\s*$/i;
  var inlineExcluded = ['.git', 'node_modules', '.claude', 'graphify-out', 'graphify-out-meta', 'test-results', 'doc'];
  var inlineScriptHits = [];
  (function walkForInlineScripts(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
      if (inlineExcluded.indexOf(entry.name) !== -1) return;
      var full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walkForInlineScripts(full);
      if (!entry.isFile() || !/\.html?$/.test(entry.name)) return;
      ctx.checks += 1;
      var src = fs.readFileSync(full, 'utf8');
      /* Blank out HTML comments (keeping the newlines, so offsets and line
         numbers stay exact). Prose in a comment is allowed to mention
         `<script>` — that is not a tag. */
      var scannable = src.replace(/<!--[\s\S]*?-->/g, function (comment) {
        return comment.replace(/[^\n]/g, ' ');
      });
      var tagRe = /<script\b([^>]*)>/gi;
      var m;
      while ((m = tagRe.exec(scannable)) !== null) {
        var attrs = m[1];
        if (/\ssrc\s*=/i.test(attrs)) continue;            // external: allowed
        var typeMatch = attrs.match(/\stype\s*=\s*["']?([^"'\s>]+)/i);
        var type = typeMatch ? typeMatch[1] : '';
        if (type && INLINE_DATA_TYPE.test(type)) continue; // data block: not executed
        var line = scannable.slice(0, m.index).split('\n').length;
        inlineScriptHits.push(rel(full) + ':' + line + '  <script>' + (type ? ' type="' + type + '"' : '') +
          " is inline and will not run in production (CSP script-src 'self') - move it to an external .js file");
      }
    });
  })(ROOT);
  inlineScriptHits.forEach(function (hit) { failures.push(hit); });

  /* --- 15. No internal link may point at a redirecting ".../index.html"
      URL, and sw.js must not precache one either.

      Cloudflare answers "/x/index.html" with a 307 to "/x/". The service
      worker's cache.addAll() follows that redirect and stores the final
      response under the ORIGINAL key with `redirected: true`, and the
      Fetch spec forbids handing a redirected response to a top-level
      navigation: Chrome kills the load with net::ERR_FAILED, which is what
      a real visitor sees as "No se puede acceder a este sitio" on every
      activity link. Safari happens to tolerate it, so this only ever
      showed up on Chrome (desktop and mobile alike).

      Reproduced against production with a one-off probe (removed; see git history): with the service worker
      enabled every ".../index.html" navigation failed and every trailing
      slash URL returned 200; with the service worker blocked all of them
      returned 200. Fixed by linking the canonical directory URL.

      The scan reads href/src VALUES, so an external URL (which contains
      "index.html" but never redirects) is not a hit. --- */
  ctx.checks += 1;
  (function () {
    var reRedirectingHref = /<[^>]*?\b(?:href|src)="([^"]*index\.html[^"]*)"/g;
    var dirsToSkip = /(?:^|[\\/])(?:node_modules|\.git|\.wrangler|\.dev|graphify-out|test-results|doc)(?:[\\/]|$)/;
    (function walk(dir) {
      var entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
      catch (e) { return; }
      entries.forEach(function (entry) {
        var full = path.join(dir, entry.name);
        var relPath = path.relative(ROOT, full);
        if (dirsToSkip.test(relPath)) return;
        if (entry.isDirectory()) return walk(full);
        if (!/\.(html|js)$/.test(entry.name)) return;
        var src = fs.readFileSync(full, 'utf8');
        var m;
        reRedirectingHref.lastIndex = 0;
        while ((m = reRedirectingHref.exec(src)) !== null) {
          var value = m[1];
          /* Same-origin only. A path that starts with a scheme or "//"
             is another host and cannot be our redirect. */
          if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.slice(0, 2) === '//') continue;
          failures.push(relPath + ': enlaza a "' + value + '" (redirige con 307; usa la ruta canónica sin index.html)');
        }
      });
    })(ROOT);

    /* sw.js: the same rule for the precache manifest. A redirected entry
       there re-breaks every navigation the moment a returning visitor's
       worker installs. */
    var swFilesBlock = (swContent.match(/var FILES = \[([\s\S]*?)\];/) || ['', ''])[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    var reSwEntry = /'([^']*index\.html)'/g;
    var swMatch;
    while ((swMatch = reSwEntry.exec(swFilesBlock)) !== null) {
      failures.push('sw.js: FILES incluye ' + swMatch[1] + ', que redirige con 307; usa la ruta canónica');
    }
  })();

};
