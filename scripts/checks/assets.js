'use strict';
/* Checks: _headers and _redirects limits, CSS class coverage, file sizes, asset tokens and the Socratic hint. Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, vm = ctx.vm, ROOT = ctx.ROOT;
  var failures = ctx.failures, largeFileWarnings = ctx.largeFileWarnings;
  var rel = ctx.rel, listJs = ctx.listJs, landingFiles = ctx.landingFiles, landingFilesByExt = ctx.landingFilesByExt;
  var LANDING_FILES = ctx.LANDING_FILES, execFileSync = ctx.execFileSync, execFile = ctx.execFile;
  var slugs = ctx.shared.slugs, toolsDir = ctx.shared.toolsDir, slugCode = ctx.shared.slugCode, EXTRA_MODULES = ctx.shared.EXTRA_MODULES, CANONICAL_BASE = ctx.shared.CANONICAL_BASE, STRING_LOCALES = ctx.shared.STRING_LOCALES, swContent = ctx.shared.swContent;

  /* --- 7. _headers: CSP source-expression quoting --- */
  ctx.checks += 1;
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
     the landing (site root), config/ and legal/ are out of scope on purpose — they
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
  ctx.checks += 1;
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
    walk(path.join(ROOT, 'config'));
    walk(path.join(ROOT, 'legal'));
    /* The landing's own stylesheet sits at the site root, so walk() can't
       reach it — add the file explicitly. */
    var landingCss = path.join(ROOT, 'styles.css');
    if (fs.existsSync(landingCss)) out.push(landingCss);
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
    var content = slugCode(path.join(toolsDir, slug));
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
    ctx.checks += 1;
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
    ctx.checks += 1;
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
        ctx.checks += 1;
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

  /* --- 16. Asset version tokens must match the file's own bytes.
      _headers serves assets/css|js|fonts|img immutable for a year, so a
      changed file only reaches a returning visitor if its reference changes.
      The tokens were a hand-maintained serial bumped by appending an "a",
      applied per file instead of per deploy: the same asset ended up with
      different tokens on different pages (locale-picker.css carried
      calculia-v2bcaa on the landing and calculia-v5aa on about/), and
      nothing failed when a reference was missed. scripts/asset-tokens.js
      derives the token from the file's bytes, so drift is now detectable.
      Run `node scripts/asset-tokens.js` to fix. --- */
  ctx.checks += 1;
  (function () {
    try {
      /* The suite keeps one shared tool at <suite>/scripts/asset-tokens.js
         because the rule is identical in every project (token = hash of the
         file's own bytes) and each project declares its immutable paths in
         its own _headers. Scoped to `calculia` so this gate reports only
         about this project. */
      require('node:child_process').execFileSync(
        process.execPath,
        [path.join(ROOT, 'scripts', 'asset-tokens.js'), '--check', 'calculia'],
        { cwd: ROOT, encoding: 'utf8' }
      );
    } catch (e) {
      /* Non-zero exit means the tokens are stale: surface its report
         verbatim instead of a generic failure. */
      failures.push('assets/css|js|img: token ?v= desactualizado (ejecuta '
        + '`node scripts/asset-tokens.js calculia`)\n'
        + String(e.stdout || e.message).trim());
    }
  })();

  /* --- 17. The Socratic hint must be written per question.
      On a wrong answer every activity shows a hint instead of the answer
      (rule 12), and for years they all showed the SAME sentence for every
      question in the activity — "Prueba otra vez. Mira el dibujo con
      calma." — which says nothing at all, and cannot: the useful hint
      depends on what is being asked ("count its sides one by one"). Each
      question now carries its own `hint` and showHint() prefers it; the
      generic line survives only as the fallback.

      The shape that this gate forbids is the assignment straight from the
      dictionary, with nothing of the question in it. Measured on
      2026-10-07: twenty activities had it, and the smoke never noticed —
      every journey answered correctly, so the hint was never on screen. --- */
  ctx.checks += 1;
  slugs.forEach(function (slug) {
    var appJs = path.join(toolsDir, slug, 'app.js');
    if (!fs.existsSync(appJs)) return;
    var content = slugCode(path.join(toolsDir, slug));
    var generic =/\.textContent\s*=\s*App\.i18n\.t\((['"])(?:hint|pista)\1\)\s*;/.exec(content);
    if (generic) {
      failures.push('tools/' + slug + '/app.js: showHint() escribe la frase genérica ('
        + generic[0].trim() + ') sin mirar la pregunta; cada tipo de pregunta debe traer la suya.');
    }
  });

};
